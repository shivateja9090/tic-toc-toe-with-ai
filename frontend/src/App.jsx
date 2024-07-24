import React, { useEffect, useReducer } from "react";
import axios from 'axios';
import "./App.css";

const API_URL = 'http://localhost:3000';

const App = () => {
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
        return {
          ...state,
          gameConfig: action.payload.board,
          currentUser: state.currentUser === 'O' ? 'X' : 'O',
          winner: action.payload.winner,
          winningCells: action.payload.winningCells,
          isDraw: action.payload.isDraw
        };
      case 'reset':
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchGameState = async () => {
    try {
      const response = await axios.get(`${API_URL}/game`);
      dispatch({ type: 'set', payload: response.data });
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  };

  const makeMove = async (row, col) => {
    try {
      const response = await axios.post(`${API_URL}/move`, { row, col });
      dispatch({ type: 'set', payload: response.data });
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  const handleClick = (row, col) => {
    if (!state.winner && !state.isDraw && state.gameConfig[row][col] === "") {
      makeMove(row, col);
    }
  };

  useEffect(() => {
    fetchGameState();
  }, []);

  const handleRetry = () => {
    dispatch({ type: 'reset' });
    fetchGameState();
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

export default App;
