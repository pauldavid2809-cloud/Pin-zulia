export type PinState = boolean; // true = standing, false = knocked down

export type BowlingFrame = {
  frameNumber: number; // 1 to 10
  roll1: number | null; // 0-10 or null
  roll2: number | null; // 0-10 or null
  roll3?: number | null; // 10th frame only (0-10)
  isStrike: boolean;
  isSpare: boolean;
  isSplit?: boolean;
  frameScore: number | null; // running total after frame
};

export type PlayerGame = {
  id: string;
  name: string;
  handicap?: number;
  frames: BowlingFrame[];
  totalScore: number;
  strikesCount: number;
  sparesCount: number;
  currentFrameIndex: number; // 0 to 9
  isFinished: boolean;
};

export type LaneGameState = {
  laneNumber: number;
  gameId: string;
  gameStatus: "in_progress" | "completed" | "idle";
  players: PlayerGame[];
  activePlayerIndex: number;
  currentFrame: number; // 1 to 10
  pinsStanding: boolean[]; // Array of 10 booleans (index 0 = Pin 1, index 9 = Pin 10)
  lastBallSpeedKmh?: number;
  startedAt: string;
  updatedAt: string;
};

export type PinFallEvent = {
  laneNumber: number;
  playerId?: string;
  pinsKnocked: number[]; // e.g. [1, 2, 4, 7]
  ballSpeedKmh?: number;
  isFoul?: boolean;
};
