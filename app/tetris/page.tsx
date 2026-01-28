'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// テトリミノの形状定義
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#00f0f0'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f0a000'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#00f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a000f0'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#f00000'
  }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

type TetrominoType = keyof typeof TETROMINOS;
type Board = (string | null)[][];

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export default function TetrisPage() {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // ランダムなテトリミノを生成
  const createPiece = useCallback((): Piece => {
    const types = Object.keys(TETROMINOS) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    const tetromino = TETROMINOS[type];
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    };
  }, []);

  // 衝突判定
  const checkCollision = useCallback((piece: Piece, board: Board, offsetX = 0, offsetY = 0): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          if (newY >= 0 && board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // ピースをボードに固定
  const mergePieceToBoard = useCallback((piece: Piece, board: Board): Board => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y;
          const boardX = piece.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    return newBoard;
  }, []);

  // ライン消去
  const clearLines = useCallback((board: Board): { newBoard: Board; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { newBoard, linesCleared };
  }, []);

  // ピースを回転
  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return rotated;
  }, []);

  // ゲーム初期化
  const initGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
    setBoard(newBoard);
    setCurrentPiece(createPiece());
    setNextPiece(createPiece());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  }, [createPiece]);

  // ピースを下に移動
  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    if (!checkCollision(currentPiece, board, 0, 1)) {
      setCurrentPiece({ ...currentPiece, y: currentPiece.y + 1 });
    } else {
      // ピースを固定
      const newBoard = mergePieceToBoard(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);

      // 次のピースを配置
      if (nextPiece) {
        if (checkCollision(nextPiece, clearedBoard)) {
          setGameOver(true);
          if (gameLoopRef.current) {
            clearInterval(gameLoopRef.current);
          }
        } else {
          setCurrentPiece(nextPiece);
          setNextPiece(createPiece());
        }
      }
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePieceToBoard, clearLines, nextPiece, createPiece]);

  // ハードドロップ
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let dropDistance = 0;
    while (!checkCollision(currentPiece, board, 0, dropDistance + 1)) {
      dropDistance++;
    }

    const droppedPiece = { ...currentPiece, y: currentPiece.y + dropDistance };
    const newBoard = mergePieceToBoard(droppedPiece, board);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + dropDistance * 2);

    if (nextPiece) {
      if (checkCollision(nextPiece, clearedBoard)) {
        setGameOver(true);
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      } else {
        setCurrentPiece(nextPiece);
        setNextPiece(createPiece());
      }
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, mergePieceToBoard, clearLines, nextPiece, createPiece]);

  // キーボード操作
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!currentPiece || gameOver) return;

    if (e.key === 'p' || e.key === 'P') {
      setIsPaused(prev => !prev);
      return;
    }

    if (isPaused) return;

    switch (e.key) {
      case 'ArrowLeft':
        if (!checkCollision(currentPiece, board, -1, 0)) {
          setCurrentPiece({ ...currentPiece, x: currentPiece.x - 1 });
        }
        break;
      case 'ArrowRight':
        if (!checkCollision(currentPiece, board, 1, 0)) {
          setCurrentPiece({ ...currentPiece, x: currentPiece.x + 1 });
        }
        break;
      case 'ArrowDown':
        moveDown();
        break;
      case 'ArrowUp':
        const rotated = rotatePiece(currentPiece);
        const rotatedPiece = { ...currentPiece, shape: rotated };
        if (!checkCollision(rotatedPiece, board)) {
          setCurrentPiece(rotatedPiece);
        }
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
    }
  }, [currentPiece, board, gameOver, isPaused, checkCollision, moveDown, rotatePiece, hardDrop]);

  // ゲームループ
  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(() => {
        moveDown();
      }, 1000);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [moveDown, gameOver, isPaused]);

  // キーボードイベント
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 初期化
  useEffect(() => {
    initGame();
  }, [initGame]);

  // ボードの描画
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    // 現在のピースを描画
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y;
            const boardX = currentPiece.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="flex gap-8">
        {/* メインゲームエリア */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-center">TETRIS</h1>

          {/* ゲームボード */}
          <div
            className="bg-gray-800 p-2 rounded-lg shadow-2xl"
            style={{
              width: BOARD_WIDTH * BLOCK_SIZE + 16,
              height: BOARD_HEIGHT * BLOCK_SIZE + 16
            }}
          >
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${BLOCK_SIZE}px)`,
                gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${BLOCK_SIZE}px)`
              }}
            >
              {displayBoard.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="border border-gray-700"
                    style={{
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                      backgroundColor: cell || '#1a1a1a'
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* 操作説明 */}
          <div className="bg-gray-800 p-4 rounded-lg text-sm">
            <h3 className="font-bold mb-2">操作方法</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-300">
              <div>← →: 移動</div>
              <div>↓: ソフトドロップ</div>
              <div>↑: 回転</div>
              <div>Space: ハードドロップ</div>
              <div>P: 一時停止</div>
            </div>
          </div>
        </div>

        {/* サイドパネル */}
        <div className="flex flex-col gap-4">
          {/* スコア */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">スコア</h2>
            <div className="text-3xl font-bold text-yellow-400">{score}</div>
          </div>

          {/* Next */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Next</h2>
            {nextPiece && (
              <div
                className="grid gap-0 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, ${BLOCK_SIZE}px)`,
                  gridTemplateRows: `repeat(${nextPiece.shape.length}, ${BLOCK_SIZE}px)`,
                  width: 'fit-content'
                }}
              >
                {nextPiece.shape.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`next-${y}-${x}`}
                      className="border border-gray-700"
                      style={{
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: cell ? nextPiece.color : '#1a1a1a'
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          {/* ゲームオーバー/一時停止 */}
          {(gameOver || isPaused) && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-red-400">
                {gameOver ? 'GAME OVER' : 'PAUSE'}
              </h2>
              <button
                onClick={initGame}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
              >
                {gameOver ? 'リトライ' : '再開'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
