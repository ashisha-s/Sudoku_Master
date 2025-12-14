// server/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const sudoku = require('sudoku'); 

// Load environment variables (like DB details) from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection Setup
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- Sudoku Generation Helper Function ---

const generatePuzzle = (difficulty) => {
    // 1. Generate the initial puzzle board (with nulls for blanks)
    const puzzle = sudoku.makepuzzle(); 
    
    // 2. Generate the solution for that specific puzzle
    const solution = sudoku.solvepuzzle(puzzle); 

    // 3. Replace nulls with 0 for React/database compatibility
    const initialBoard = puzzle.map(val => val === null ? 0 : val);
    const solutionBoard = solution.map(val => val === null ? 0 : val);

    return {
        initial: initialBoard, 
        solution: solutionBoard,
    };
};


// --- ROUTES (API Endpoints) ---

app.get('/', (req, res) => {
    res.send('Sudoku API is running!');
});

// 2. Puzzle Route: Fetches a new Sudoku board
app.get('/api/puzzle/:difficulty', (req, res) => {
    const { difficulty } = req.params;
    
    try {
        const puzzle = generatePuzzle(difficulty);
        console.log(`Successfully generated a ${difficulty} puzzle.`);
        res.json(puzzle);
    } catch (error) {
        console.error('Error generating puzzle:', error);
        res.status(500).json({ error: 'Failed to generate Sudoku puzzle.' });
    }
});

// 3. Score Submission Route: Saves a finished game score
app.post('/api/score', async (req, res) => {
    const { playerName, timeSeconds, difficulty } = req.body;
    
    if (!playerName || !timeSeconds || !difficulty) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        const query = `
            INSERT INTO high_scores (player_name, time_seconds, difficulty)
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.execute(query, [playerName, timeSeconds, difficulty]);
        
        res.status(201).json({ 
            message: 'Score submitted successfully!', 
            scoreId: result.insertId 
        });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to submit score to the database.' });
    }
});


// 4. Get High Scores Route: Fetches the leaderboard for a specific difficulty
app.get('/api/scores/:difficulty', async (req, res) => {
    const { difficulty } = req.params;
    
    const validDifficulties = ['easy', 'medium', 'difficult'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid difficulty parameter.' });
    }

    try {
        const query = `
            SELECT player_name, time_seconds, difficulty
            FROM high_scores
            WHERE difficulty = ?
            ORDER BY time_seconds ASC
            LIMIT 10
        `;
        // Capitalize the difficulty for the database lookup (e.g., 'easy' -> 'Easy')
        const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        const [scores] = await pool.execute(query, [capitalizedDifficulty]);
        
        res.json(scores);
    } catch (error) {
        console.error('Database Error in /api/scores:', error);
        res.status(500).json({ error: 'Failed to retrieve high scores.' }); 
    }
});


// --- Final Connection Test and Server Startup ---

// Function to test the database connection and start the server
async function testDbConnection() {
    let connection;
    try {
        console.log("Attempting to connect to the database...");
        connection = await pool.getConnection();
        console.log("✅ Database connection successful!");
        connection.release(); // Release the connection back to the pool

        // Start the Express Server ONLY if the DB connection is successful
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ FATAL DATABASE ERROR ON STARTUP:");
        console.error(error.message); 
        console.log("\nServer failed to start due to database error. Please check your .env file and ensure MySQL is running.");
    }
}

// Execute the connection test and start the server
testDbConnection();