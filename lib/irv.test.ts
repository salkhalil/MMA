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
