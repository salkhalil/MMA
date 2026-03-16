import confetti from "canvas-confetti";

export function fireWinnerConfetti() {
  const defaults = {
    particleCount: 80,
    spread: 70,
    colors: ["#f59e0b", "#ec4899", "#fbbf24", "#f472b6", "#a78bfa"],
  };

  confetti({ ...defaults, angle: 60, origin: { x: 0, y: 1 } });
  confetti({ ...defaults, angle: 120, origin: { x: 1, y: 1 } });
}

export function fireBestPictureConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.7 },
      colors: ["#f59e0b", "#ec4899", "#fbbf24", "#a78bfa"],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.7 },
      colors: ["#f59e0b", "#ec4899", "#fbbf24", "#a78bfa"],
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}
