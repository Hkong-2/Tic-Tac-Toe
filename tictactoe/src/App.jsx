import { useState, useEffect } from 'react';
import './App.css';

function Square({ value, onSquareClick, isWinning }) {
  const className = 'square' + (isWinning ? ' winning' : '');
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, boardSize }) {
  const winnerInfo = calculateWinner(squares, boardSize);
  const winner = winnerInfo ? winnerInfo.winner : null;

  function handleClick(i) {
    if (winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares, i);
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winnerInfo.winner;
  } else if (squares.every(Boolean)) {
    status = 'Draw';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  const renderBoard = () => {
    const board = [];
    for (let i = 0; i < boardSize; i++) {
      const row = [];
      for (let j = 0; j < boardSize; j++) {
        const squareIndex = i * boardSize + j;
        row.push(
          <Square
            key={squareIndex}
            value={squares[squareIndex]}
            isWinning={winnerInfo?.line.includes(squareIndex)}
            onSquareClick={() => handleClick(squareIndex)}
          />
        );
      }
      board.push(<div key={i} className="board-row">{row}</div>);
    }
    return board;
  };

  return (
    <>
      <div className="status">{status}</div>
      {renderBoard()}
    </>
  );
}

export default function Game() {
  const [boardSize, setBoardSize] = useState(3);
  const [history, setHistory] = useState([{ squares: Array(boardSize * boardSize).fill(null), location: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  useEffect(() => {
    resetGame(boardSize);
  }, [boardSize]);

  function handlePlay(nextSquares, i) {
    const location = { row: Math.floor(i / boardSize) + 1, col: (i % boardSize) + 1 };
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location }];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((step, move) => {
    let description;
    const location = step.location ? `(${step.location.row}, ${step.location.col})` : '';

    if (move > 0) {
      description = 'Go to move #' + move + ` ${location}`;
    } else {
      description = 'Go to game start';
    }

    if (move === currentMove) {
      return (
        <li key={move}>
          <div>You are at move #{move} {location}</div>
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  function handleSizeChange(event) {
    const newSize = parseInt(event.target.value, 10);
    if (!isNaN(newSize) && newSize > 2) {
      setBoardSize(newSize);
    }
  }

  function resetGame(size) {
    setHistory([{ squares: Array(size * size).fill(null), location: null }]);
    setCurrentMove(0);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} boardSize={boardSize} />
      </div>
      <div className="game-info">
        <div>
          <label>
            Board Size (min 3):
            <input
              type="number"
              min="3"
              value={boardSize}
              onChange={handleSizeChange}
              style={{ marginLeft: '10px', width: '50px' }}
            />
          </label>
        </div>
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort by: {isAscending ? 'Ascending' : 'Descending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares, boardSize) {
  const winLength = boardSize > 5 ? 5 : boardSize;

  // Duyệt qua tất cả các ô
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const player = squares[i * boardSize + j];
      if (!player) continue;

      // Kiểm tra hàng ngang
      if (j + winLength <= boardSize) {
        let k = 1;
        const line = [i * boardSize + j];
        while (k < winLength && squares[i * boardSize + (j + k)] === player) {
          line.push(i * boardSize + (j + k));
          k++;
        }
        if (k === winLength) return { winner: player, line };
      }

      // Kiểm tra hàng dọc
      if (i + winLength <= boardSize) {
        let k = 1;
        const line = [i * boardSize + j];
        while (k < winLength && squares[(i + k) * boardSize + j] === player) {
          line.push((i + k) * boardSize + j);
          k++;
        }
        if (k === winLength) return { winner: player, line };
      }

      // Kiểm tra đường chéo chính (xuống dưới, sang phải)
      if (i + winLength <= boardSize && j + winLength <= boardSize) {
        let k = 1;
        const line = [i * boardSize + j];
        while (k < winLength && squares[(i + k) * boardSize + (j + k)] === player) {
          line.push((i + k) * boardSize + (j + k));
          k++;
        }
        if (k === winLength) return { winner: player, line };
      }

      // Kiểm tra đường chéo phụ (xuống dưới, sang trái)
      if (i + winLength <= boardSize && j - winLength + 1 >= 0) {
        let k = 1;
        const line = [i * boardSize + j];
        while (k < winLength && squares[(i + k) * boardSize + (j - k)] === player) {
          line.push((i + k) * boardSize + (j - k));
          k++;
        }
        if (k === winLength) return { winner: player, line };
      }
    }
  }

  return null;
}
