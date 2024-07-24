const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let gameState = {
  board: [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ],
  currentPlayer: 'O',
  winner: null,
  winningCells: [],
  isDraw: false
};

app.get('/game', (req, res) => {
  res.json(gameState);
});

app.post('/move', async (req, res) => {
  const { row, col } = req.body;

  if (gameState.winner || gameState.isDraw || gameState.board[row][col] !== "") {
    return res.status(400).json({ error: 'Invalid move' });
  }

  gameState.board[row][col] = gameState.currentPlayer;

  const [winner, winningCells] = checkWinner(gameState.board);
  if (winner) {
    gameState.winner = winner;
    gameState.winningCells = winningCells;
  } else if (gameState.board.flat().every(cell => cell !== "")) {
    gameState.isDraw = true;
  } else {
    gameState.currentPlayer = 'X';

    try {
      const aiMove = await getAIMove(gameState.board);
      gameState.board[aiMove.row][aiMove.col] = gameState.currentPlayer;
      const [aiWinner, aiWinningCells] = checkWinner(gameState.board);
      if (aiWinner) {
        gameState.winner = aiWinner;
        gameState.winningCells = aiWinningCells;
      } else if (gameState.board.flat().every(cell => cell !== "")) {
        gameState.isDraw = true;
      }
      gameState.currentPlayer = 'O';
    } catch (error) {
      console.error('Error getting AI move:', error);
      return res.status(500).json({ error: 'Failed to get AI move' });
    }
  }

  res.json(gameState);
});

const getAIMove = async (board) => {
  const prompt = `The current board state is: ${JSON.stringify(board)}.\nAs player X, make the next move in this Tic-Tac-Toe game. Provide the move as row and column numbers (e.g., {row: 1, col: 2}).`;
  
  try {
    const response = await axios.post('https://api.openai.com/v1/completions', {
      model: "text-davinci-003", // Ensure this is the correct model
      prompt,
      max_tokens: 50,
      temperature: 0.5
    }, {
      headers: {
        'Authorization': `Bearer api-key`,
        'Content-Type': 'application/json'
      }
    });

    const move = response.data.choices[0].text.trim();
    const [row, col] = move.match(/\d+/g).map(Number);
    
    return { row, col };
  } catch (error) {
    throw new Error('Failed to get AI move');
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
