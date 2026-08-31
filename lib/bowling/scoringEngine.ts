import { BowlingFrame, PlayerGame } from "./types";

export class BowlingScoringEngine {
  /**
   * Initializes 10 empty frames for a player
   */
  static createEmptyFrames(): BowlingFrame[] {
    return Array.from({ length: 10 }, (_, i) => ({
      frameNumber: i + 1,
      roll1: null,
      roll2: null,
      roll3: i === 9 ? null : undefined,
      isStrike: false,
      isSpare: false,
      isSplit: false,
      frameScore: null,
    }));
  }

  /**
   * Calculates running scores across all 10 frames according to USBC / World Bowling official rules
   */
  static calculateScore(frames: BowlingFrame[]): { frames: BowlingFrame[]; totalScore: number } {
    const updated = frames.map((f) => ({ ...f }));
    let runningTotal = 0;

    // Collect all rolls in a flat sequence for lookahead calculation
    const allRolls: (number | null)[] = [];
    for (let i = 0; i < 10; i++) {
      const f = updated[i];
      if (i < 9) {
        if (f.isStrike) {
          allRolls.push(10);
        } else {
          allRolls.push(f.roll1);
          allRolls.push(f.roll2);
        }
      } else {
        // 10th Frame
        allRolls.push(f.roll1);
        allRolls.push(f.roll2);
        allRolls.push(f.roll3 ?? null);
      }
    }

    let rollIdx = 0;

    for (let i = 0; i < 10; i++) {
      const f = updated[i];

      if (i < 9) {
        // Frames 1 to 9
        if (f.isStrike) {
          const next1 = allRolls[rollIdx + 1];
          const next2 = allRolls[rollIdx + 2];

          if (next1 !== null && next1 !== undefined && next2 !== null && next2 !== undefined) {
            runningTotal += 10 + next1 + next2;
            f.frameScore = runningTotal;
          } else {
            f.frameScore = null;
          }
          rollIdx += 1;
        } else if (f.isSpare) {
          const next1 = allRolls[rollIdx + 2];
          if (next1 !== null && next1 !== undefined) {
            runningTotal += 10 + next1;
            f.frameScore = runningTotal;
          } else {
            f.frameScore = null;
          }
          rollIdx += 2;
        } else {
          // Open frame
          if (f.roll1 !== null && f.roll2 !== null) {
            runningTotal += (f.roll1 || 0) + (f.roll2 || 0);
            f.frameScore = runningTotal;
          } else {
            f.frameScore = null;
          }
          rollIdx += 2;
        }
      } else {
        // 10th Frame
        if (f.roll1 !== null) {
          let tenthSum = f.roll1;
          if (f.roll2 !== null) tenthSum += f.roll2;
          if (f.roll3 !== null && f.roll3 !== undefined) tenthSum += f.roll3;

          // Check if 10th frame is complete
          const isStrikeOrSpare = (f.roll1 === 10) || ((f.roll1 + (f.roll2 || 0)) === 10);
          if (isStrikeOrSpare) {
            if (f.roll3 !== null && f.roll3 !== undefined) {
              runningTotal += tenthSum;
              f.frameScore = runningTotal;
            }
          } else {
            if (f.roll2 !== null) {
              runningTotal += tenthSum;
              f.frameScore = runningTotal;
            }
          }
        }
      }
    }

    // Find the latest valid running total
    let finalScore = 0;
    for (let i = 9; i >= 0; i--) {
      if (updated[i].frameScore !== null) {
        finalScore = updated[i].frameScore as number;
        break;
      }
    }

    // If game has rolls but not complete frames yet, sum what's bowled
    if (finalScore === 0) {
      finalScore = updated.reduce((sum, fr) => sum + (fr.roll1 || 0) + (fr.roll2 || 0) + (fr.roll3 || 0), 0);
    }

    return { frames: updated, totalScore: finalScore };
  }

  /**
   * Registers a roll into a player's game and updates frames
   */
  static recordRoll(player: PlayerGame, pinsKnocked: number): PlayerGame {
    const updated = { ...player, frames: [...player.frames] };
    const currentFrame = updated.frames[updated.currentFrameIndex];

    if (!currentFrame) return updated;

    if (updated.currentFrameIndex < 9) {
      // Frames 1-9
      if (currentFrame.roll1 === null) {
        currentFrame.roll1 = pinsKnocked;
        if (pinsKnocked === 10) {
          currentFrame.isStrike = true;
          updated.strikesCount += 1;
          updated.currentFrameIndex += 1;
        }
      } else if (currentFrame.roll2 === null) {
        currentFrame.roll2 = pinsKnocked;
        if ((currentFrame.roll1 + pinsKnocked) === 10) {
          currentFrame.isSpare = true;
          updated.sparesCount += 1;
        }
        updated.currentFrameIndex += 1;
      }
    } else {
      // 10th Frame
      if (currentFrame.roll1 === null) {
        currentFrame.roll1 = pinsKnocked;
        if (pinsKnocked === 10) {
          currentFrame.isStrike = true;
          updated.strikesCount += 1;
        }
      } else if (currentFrame.roll2 === null) {
        currentFrame.roll2 = pinsKnocked;
        if (!currentFrame.isStrike && (currentFrame.roll1 + pinsKnocked) === 10) {
          currentFrame.isSpare = true;
          updated.sparesCount += 1;
        }
        // If not a strike or spare in 10th frame, game ends
        if (!currentFrame.isStrike && !currentFrame.isSpare) {
          updated.isFinished = true;
        }
      } else if (currentFrame.roll3 === null) {
        currentFrame.roll3 = pinsKnocked;
        updated.isFinished = true;
      }
    }

    const { frames, totalScore } = this.calculateScore(updated.frames);
    updated.frames = frames;
    updated.totalScore = totalScore;

    return updated;
  }
}
