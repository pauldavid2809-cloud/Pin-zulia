import { LaneGameState, PlayerGame, BowlingFrame } from "./types";
import { BowlingScoringEngine } from "./scoringEngine";

declare global {
  var __PINZULIA_LANE_GAMES__: Map<number, LaneGameState> | undefined;
}

function initMockLaneGame(laneNumber: number): LaneGameState {
  const p1Frames = BowlingScoringEngine.createEmptyFrames();
  p1Frames[0] = { frameNumber: 1, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: 19 };
  p1Frames[1] = { frameNumber: 2, roll1: 6, roll2: 3, isStrike: false, isSpare: false, frameScore: 28 };
  p1Frames[2] = { frameNumber: 3, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: 48 };
  p1Frames[3] = { frameNumber: 4, roll1: 7, roll2: 3, isStrike: false, isSpare: true, frameScore: 68 };
  p1Frames[4] = { frameNumber: 5, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: 88 };
  p1Frames[5] = { frameNumber: 6, roll1: 8, roll2: 1, isStrike: false, isSpare: false, frameScore: 97 };
  p1Frames[6] = { frameNumber: 7, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: null };

  const p2Frames = BowlingScoringEngine.createEmptyFrames();
  p2Frames[0] = { frameNumber: 1, roll1: 8, roll2: 2, isStrike: false, isSpare: true, frameScore: 17 };
  p2Frames[1] = { frameNumber: 2, roll1: 7, roll2: 2, isStrike: false, isSpare: false, frameScore: 26 };
  p2Frames[2] = { frameNumber: 3, roll1: 9, roll2: 0, isStrike: false, isSpare: false, frameScore: 35 };
  p2Frames[3] = { frameNumber: 4, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: 55 };
  p2Frames[4] = { frameNumber: 5, roll1: 10, roll2: null, isStrike: true, isSpare: false, frameScore: 75 };
  p2Frames[5] = { frameNumber: 6, roll1: 7, roll2: 2, isStrike: false, isSpare: false, frameScore: 84 };

  const p1: PlayerGame = {
    id: "p-101",
    name: "Alejandro (Strike Master)",
    handicap: 0,
    frames: p1Frames,
    totalScore: 117,
    strikesCount: 4,
    sparesCount: 1,
    currentFrameIndex: 6,
    isFinished: false,
  };

  const p2: PlayerGame = {
    id: "p-102",
    name: "Mariana (Glow Queen)",
    handicap: 10,
    frames: p2Frames,
    totalScore: 94,
    strikesCount: 2,
    sparesCount: 1,
    currentFrameIndex: 6,
    isFinished: false,
  };

  return {
    laneNumber,
    gameId: `GAME-L${laneNumber}-${Date.now().toString().slice(-4)}`,
    gameStatus: "in_progress",
    players: [p1, p2],
    activePlayerIndex: 0,
    currentFrame: 7,
    pinsStanding: [false, true, true, false, false, false, false, false, false, false],
    lastBallSpeedKmh: 28.4,
    startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

if (!globalThis.__PINZULIA_LANE_GAMES__) {
  globalThis.__PINZULIA_LANE_GAMES__ = new Map<number, LaneGameState>();
  for (let i = 1; i <= 14; i++) {
    globalThis.__PINZULIA_LANE_GAMES__.set(i, initMockLaneGame(i));
  }
}

export class LaneBridgeStore {
  static getLaneGame(laneNumber: number): LaneGameState {
    let game = globalThis.__PINZULIA_LANE_GAMES__!.get(laneNumber);
    if (!game) {
      game = initMockLaneGame(laneNumber);
      globalThis.__PINZULIA_LANE_GAMES__!.set(laneNumber, game);
    }
    return game;
  }

  static getAllLanes(): LaneGameState[] {
    return Array.from(globalThis.__PINZULIA_LANE_GAMES__!.values());
  }

  static recordPinFall(
    laneNumber: number,
    pinsKnocked: number,
    ballSpeedKmh: number = 26.5
  ): LaneGameState {
    const game = this.getLaneGame(laneNumber);
    const activePlayer = game.players[game.activePlayerIndex];

    if (activePlayer && !activePlayer.isFinished) {
      game.players[game.activePlayerIndex] = BowlingScoringEngine.recordRoll(
        activePlayer,
        pinsKnocked
      );
    }

    game.lastBallSpeedKmh = ballSpeedKmh;
    game.updatedAt = new Date().toISOString();

    return game;
  }

  static resetLaneGame(laneNumber: number, playerNames: string[] = ["Jugador 1", "Jugador 2"]): LaneGameState {
    const players: PlayerGame[] = playerNames.map((name, idx) => ({
      id: `p-${laneNumber}-${idx + 1}`,
      name,
      handicap: 0,
      frames: BowlingScoringEngine.createEmptyFrames(),
      totalScore: 0,
      strikesCount: 0,
      sparesCount: 0,
      currentFrameIndex: 0,
      isFinished: false,
    }));

    const newGame: LaneGameState = {
      laneNumber,
      gameId: `GAME-L${laneNumber}-${Date.now().toString().slice(-4)}`,
      gameStatus: "in_progress",
      players,
      activePlayerIndex: 0,
      currentFrame: 1,
      pinsStanding: Array(10).fill(true),
      lastBallSpeedKmh: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.__PINZULIA_LANE_GAMES__!.set(laneNumber, newGame);
    return newGame;
  }
}
