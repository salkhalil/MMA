export interface Ballot {
  ranks: string[]; // nominee IDs in preference order
}

export interface IRVRound {
  roundNumber: number;
  tallies: Record<string, number>;
  totalActiveVotes: number;
  eliminated: string[];
  exhaustedThisRound: number;
  totalExhausted: number;
  winner?: string;
  isDraw: boolean;
  drawBetween: string[];
  potential?: Record<string, number>;
  tiebrokenBy?: "potential";
}

export interface IRVResult {
  rounds: IRVRound[];
  winner?: string;
  isDraw: boolean;
  drawBetween: string[];
}

export function runIRV(ballots: Ballot[]): IRVResult {
  const rounds: IRVRound[] = [];
  const eliminated = new Set<string>();
  let totalExhausted = 0;

  // Collect all unique nominees
  const allNominees = new Set<string>();
  for (const b of ballots) {
    for (const r of b.ranks) allNominees.add(r);
  }

  if (allNominees.size === 0) {
    return { rounds: [], isDraw: false, drawBetween: [] };
  }

  for (let round = 1; ; round++) {
    // Tally: each ballot contributes to first non-eliminated preference
    const tallies: Record<string, number> = {};
    for (const nominee of allNominees) {
      if (!eliminated.has(nominee)) tallies[nominee] = 0;
    }

    let exhaustedThisRound = 0;
    for (const ballot of ballots) {
      const pick = ballot.ranks.find((r) => !eliminated.has(r));
      if (pick) {
        tallies[pick]++;
      } else {
        exhaustedThisRound++;
      }
    }
    // exhaustedThisRound is cumulative count of exhausted ballots this round
    // but we want just the new ones
    const newExhausted = exhaustedThisRound - totalExhausted;
    totalExhausted = exhaustedThisRound;

    const active = Object.keys(tallies);
    const totalActiveVotes = active.reduce((s, k) => s + tallies[k], 0);

    // Check for winner (>50% of active votes)
    for (const nominee of active) {
      if (totalActiveVotes > 0 && tallies[nominee] > totalActiveVotes / 2) {
        const r: IRVRound = {
          roundNumber: round,
          tallies,
          totalActiveVotes,
          eliminated: [],
          exhaustedThisRound: newExhausted,
          totalExhausted,
          winner: nominee,
          isDraw: false,
          drawBetween: [],
        };
        rounds.push(r);
        return { rounds, winner: nominee, isDraw: false, drawBetween: [] };
      }
    }

    // Find minimum tally
    const values = Object.values(tallies);
    const minVotes = Math.min(...values);
    const bottomTied = active.filter((n) => tallies[n] === minVotes);

    // If eliminating all bottom-tied leaves 0 remaining → draw between them
    let remaining = active.filter((n) => !bottomTied.includes(n));
    if (remaining.length === 0) {
      // Last resort: try potential tiebreak even when all are tied
      if (bottomTied.length > 1) {
        const potentialMap: Record<string, number> = {};
        for (const nom of bottomTied) {
          potentialMap[nom] = ballots.filter((b) =>
            b.ranks.includes(nom),
          ).length;
        }
        const minPotential = Math.min(...Object.values(potentialMap));
        const toElim = bottomTied.filter(
          (n) => potentialMap[n] === minPotential,
        );
        if (toElim.length < bottomTied.length) {
          remaining = bottomTied.filter((n) => !toElim.includes(n));
          for (const n of toElim) eliminated.add(n);
          const roundData: IRVRound = {
            roundNumber: round,
            tallies,
            totalActiveVotes,
            eliminated: [...toElim],
            exhaustedThisRound: newExhausted,
            totalExhausted,
            isDraw: false,
            drawBetween: [],
            potential: potentialMap,
            tiebrokenBy: "potential",
          };
          if (remaining.length === 1) {
            roundData.winner = remaining[0];
            rounds.push(roundData);
            return {
              rounds,
              winner: remaining[0],
              isDraw: false,
              drawBetween: [],
            };
          }
          rounds.push(roundData);
          continue;
        }
      }
      const r: IRVRound = {
        roundNumber: round,
        tallies,
        totalActiveVotes,
        eliminated: [],
        exhaustedThisRound: newExhausted,
        totalExhausted,
        isDraw: true,
        drawBetween: [...bottomTied],
      };
      rounds.push(r);
      return { rounds, isDraw: true, drawBetween: [...bottomTied] };
    }

    let toEliminate = bottomTied;
    let potentialData: Record<string, number> | undefined;
    let tiebrokenBy: "potential" | undefined;

    if (bottomTied.length > 1) {
      // Step A: Batch elimination — if combined bottom votes < next-lowest, safe to eliminate all
      const combinedBottomVotes = bottomTied.reduce(
        (s, n) => s + tallies[n],
        0,
      );
      const nonBottomVotes = remaining.map((n) => tallies[n]);
      const nextLowest = Math.min(...nonBottomVotes);

      if (combinedBottomVotes >= nextLowest) {
        // Step B: Potential tiebreak
        const potentialMap: Record<string, number> = {};
        for (const nom of bottomTied) {
          potentialMap[nom] = ballots.filter((b) =>
            b.ranks.includes(nom),
          ).length;
        }
        const minPotential = Math.min(...Object.values(potentialMap));
        const toElim = bottomTied.filter(
          (n) => potentialMap[n] === minPotential,
        );
        if (toElim.length < bottomTied.length) {
          toEliminate = toElim;
          remaining = active.filter((n) => !toElim.includes(n));
          potentialData = potentialMap;
          tiebrokenBy = "potential";
        }
      }
    }

    for (const n of toEliminate) eliminated.add(n);

    const roundData: IRVRound = {
      roundNumber: round,
      tallies,
      totalActiveVotes,
      eliminated: [...toEliminate],
      exhaustedThisRound: newExhausted,
      totalExhausted,
      isDraw: false,
      drawBetween: [],
      ...(potentialData && { potential: potentialData }),
      ...(tiebrokenBy && { tiebrokenBy }),
    };

    // If only 1 remains after elimination → winner
    if (remaining.length === 1) {
      roundData.winner = remaining[0];
      rounds.push(roundData);
      return { rounds, winner: remaining[0], isDraw: false, drawBetween: [] };
    }

    rounds.push(roundData);
  }
}
