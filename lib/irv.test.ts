import { describe, it, expect } from "vitest";
import { runIRV, Ballot } from "./irv";

describe("runIRV", () => {
  it("clear first-round winner (>50%)", () => {
    const ballots: Ballot[] = [
      { ranks: ["A", "B"] },
      { ranks: ["A", "C"] },
      { ranks: ["A", "B"] },
      { ranks: ["B", "A"] },
      { ranks: ["C", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.isDraw).toBe(false);
    expect(result.rounds).toHaveLength(1);
  });

  it("winner after 1 elimination", () => {
    const ballots: Ballot[] = [
      { ranks: ["A", "B"] },
      { ranks: ["A", "B"] },
      { ranks: ["B", "A"] },
      { ranks: ["B", "A"] },
      { ranks: ["C", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.rounds.length).toBeGreaterThan(1);
    expect(result.rounds[0].eliminated).toContain("C");
  });

  it("winner after multiple eliminations", () => {
    // A=2, B=2, C=2, D=1 → D eliminated
    // A=2, B=2, C=3 → A,B tied at bottom, both eliminated
    // C wins
    const ballots: Ballot[] = [
      { ranks: ["A", "B", "C"] },
      { ranks: ["A", "C", "B"] },
      { ranks: ["B", "A", "C"] },
      { ranks: ["B", "C", "A"] },
      { ranks: ["C", "A", "B"] },
      { ranks: ["C", "B", "A"] },
      { ranks: ["D", "C", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("C");
    expect(result.isDraw).toBe(false);
    expect(result.rounds.length).toBeGreaterThanOrEqual(2);
  });

  it("bottom tie → eliminate both → winner emerges", () => {
    // A=2, B=1, C=1 → B,C tied at bottom, both eliminated → A wins (only one left)
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["B", "A"] },
      { ranks: ["C", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.rounds[0].eliminated).toContain("B");
    expect(result.rounds[0].eliminated).toContain("C");
  });

  it("bottom tie where eliminating all leaves 0 → draw", () => {
    // All tied at same count with no transfers possible
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["B"] },
      { ranks: ["C"] },
    ];
    const result = runIRV(ballots);
    expect(result.isDraw).toBe(true);
    expect(result.drawBetween.sort()).toEqual(["A", "B", "C"]);
  });

  it("top tie (50/50) → draw", () => {
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["B"] },
    ];
    const result = runIRV(ballots);
    expect(result.isDraw).toBe(true);
    expect(result.drawBetween.sort()).toEqual(["A", "B"]);
  });

  it("unanimous (all votes one nominee)", () => {
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.rounds).toHaveLength(1);
  });

  it("single voter", () => {
    const ballots: Ballot[] = [{ ranks: ["A", "B", "C"] }];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
  });

  it("exhausted ballots (voter prefs all eliminated)", () => {
    // A=2, B=2, C=1 → C eliminated → C voter exhausted → A=2 B=2 → draw
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["B"] },
      { ranks: ["B"] },
      { ranks: ["C"] }, // no second preference, will exhaust
    ];
    const result = runIRV(ballots);
    expect(result.isDraw).toBe(true);
    expect(result.drawBetween.sort()).toEqual(["A", "B"]);
    const lastRound = result.rounds[result.rounds.length - 1];
    expect(lastRound.totalExhausted).toBe(1);
  });

  it("empty ballots", () => {
    const result = runIRV([]);
    expect(result.rounds).toHaveLength(0);
    expect(result.isDraw).toBe(false);
    expect(result.winner).toBeUndefined();
  });

  it("batch elimination: combined bottom < next-lowest", () => {
    // A=4, B=3, C=1, D=1 → C+D combined (2) < B (3) → both eliminated, no potential needed
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["B"] },
      { ranks: ["B"] },
      { ranks: ["B"] },
      { ranks: ["C"] },
      { ranks: ["D"] },
    ];
    const result = runIRV(ballots);
    expect(result.rounds[0].eliminated).toContain("C");
    expect(result.rounds[0].eliminated).toContain("D");
    expect(result.rounds[0].tiebrokenBy).toBeUndefined();
  });

  it("potential breaks bottom tie", () => {
    // A=3, B=1, C=1 → B+C (2) < A (3) → batch elim applies, no potential needed
    // Need a case where batch elim doesn't apply:
    // A=2, B=1, C=1 → B+C combined (2) >= A (2) → potential tiebreak
    // B appears on 3 ballots total, C appears on 1 → C has lower potential → only C eliminated
    const ballots: Ballot[] = [
      { ranks: ["A", "B"] },
      { ranks: ["A", "B"] },
      { ranks: ["B", "A"] },
      { ranks: ["C"] },
    ];
    const result = runIRV(ballots);
    const r0 = result.rounds[0];
    expect(r0.tiebrokenBy).toBe("potential");
    expect(r0.potential).toBeDefined();
    expect(r0.eliminated).toEqual(["C"]);
    expect(r0.eliminated).not.toContain("B");
  });

  it("potential tied → falls back to eliminating all", () => {
    // A=2, B=1, C=1 where B and C each appear on exactly 1 ballot → same potential
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["B"] },
      { ranks: ["C"] },
    ];
    const result = runIRV(ballots);
    // B and C have same potential (1 each), batch elim: combined=2 >= A=2, potential tied → eliminate both
    expect(result.winner).toBe("A");
    expect(result.rounds[0].eliminated).toContain("B");
    expect(result.rounds[0].eliminated).toContain("C");
    expect(result.rounds[0].tiebrokenBy).toBeUndefined();
  });

  it("potential tiebreak leads to winner next round", () => {
    // Round 1: A=2, B=2, C=1, D=1 → C,D tied at bottom
    // C+D combined (2) >= B (2) → potential tiebreak
    // C on 2 ballots, D on 1 → D eliminated
    // Round 2: A=2, B=2, C=1 → C eliminated → Round 3: A=3, B=2 → A wins
    const ballots: Ballot[] = [
      { ranks: ["A", "C"] },
      { ranks: ["A", "B"] },
      { ranks: ["B", "A"] },
      { ranks: ["B", "A"] },
      { ranks: ["C", "A"] },
      { ranks: ["D", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.rounds[0].tiebrokenBy).toBe("potential");
    expect(result.rounds[0].eliminated).toEqual(["D"]);
    expect(result.winner).toBe("A");
  });

  it("potential tiebreak when all candidates tied (draw scenario)", () => {
    // A=1, B=1 → all tied. A on 2 ballots (potential=2), B on 1 (potential=1) → B eliminated → A wins
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["B", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.rounds[0].tiebrokenBy).toBe("potential");
    expect(result.rounds[0].eliminated).toEqual(["B"]);
  });

  it("transfers correctly after elimination", () => {
    // A=2, B=2, C=1 → C eliminated → C's vote goes to A → A=3 wins
    const ballots: Ballot[] = [
      { ranks: ["A"] },
      { ranks: ["A"] },
      { ranks: ["B"] },
      { ranks: ["B"] },
      { ranks: ["C", "A"] },
    ];
    const result = runIRV(ballots);
    expect(result.winner).toBe("A");
    expect(result.rounds).toHaveLength(2);
  });
});
