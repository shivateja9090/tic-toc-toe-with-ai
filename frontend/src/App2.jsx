import React, { useReducer } from "react";
import "./App.css";

const App2 = () => {
  const initialState = {
    gameConfig: [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""]
    ],
    currentUser: 'O',
    winner: null,
    winningCells: [],
    isDraw: false 
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'set':
        const newGameConfig = state.gameConfig.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (rowIndex === action.payload.row && colIndex === action.payload.col) {
              return state.currentUser;
            }
            return cell;
          })
        );

        const [winner, winningCells] = checkWinner(newGameConfig);
        const draw = !winner && newGameConfig.flat().every(cell => cell !== "");

        return {
          ...state,
          gameConfig: newGameConfig,
          currentUser: state.currentUser === 'O' ? 'X' : 'O',
          winner: winner,
          winningCells: winningCells,
          isDraw: draw
        };

      case 'reset':
        return initialState;

      default:
        return state;
    }
  };

  const checkWinner = (board) => {
    const winningCombinations = [
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]]
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a[0]][a[1]] && board[a[0]][a[1]] === board[b[0]][b[1]] && board[a[0]][a[1]] === board[c[0]][c[1]]) {
        return [board[a[0]][a[1]], combination];
      }
    }
    return [null, []]; 
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleClick = (row, col) => {
    if (!state.winner && !state.isDraw && state.gameConfig[row][col] === "") {
      dispatch({ type: 'set', payload: { row, col } });
    }
  };

  const handleRetry = () => {
    dispatch({ type: 'reset' });
  };

  return (
    <div className="container">
      <div className="main-container">
        {state.gameConfig.map((rows, rowIndex) => (
          <div className="rows" key={rowIndex}>
            {rows.map((cols, colIndex) => {
              const isWinningCell = state.winningCells.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );

              return (
                <div
                  className={`col ${isWinningCell ? 'winning' : ''}`}
                  key={colIndex}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  <h5>{cols}</h5>
                </div>
              );
            })}
          </div>
        ))}
        {state.winner && <div className="winner">Winner: {state.winner}</div>}
        {state.isDraw && !state.winner && <div className="winner">It's a Draw!</div>}
        {(state.winner || state.isDraw) && (
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default App2;
