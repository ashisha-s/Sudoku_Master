// client/src/pages/SudokuGame.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import all necessary components
import Grid from '../components/Grid.jsx';
import Timer from '../components/Timer.jsx';
import NumberPad from '../components/NumberPad.jsx';
import ScoreSubmissionModal from '../components/ScoreSubmissionModal.jsx'; 


// --- Helper Functions ---

// 1. Helper to convert a flat 81-element array into a 9x9 2D array
const flatTo2D = (flatArray) => {
    const arr2D = [];
    for (let i = 0; i < 9; i++) {
        arr2D.push(flatArray.slice(i * 9, (i + 1) * 9)); 
    }
    return arr2D;
};

// 2. Function to check if the board is solved (all cells filled)
const isBoardFilled = (board) => {
    return board.every(row => row.every(cell => cell !== 0));
};

// --- Main Component ---

const SudokuGame = () => {
    const { difficulty } = useParams();
    const navigate = useNavigate();

    // Game state
    const [board, setBoard] = useState(null); 
    const [initialBoard, setInitialBoard] = useState(null); 
    const [solution, setSolution] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeInSeconds, setTimeInSeconds] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [activeCell, setActiveCell] = useState({ r: null, c: null }); 
    const [mistakes, setMistakes] = useState(0);

    // Score submission state
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);


    // --- Score Submission Logic ---
    const handleScoreSubmit = (playerName, timeSeconds, difficulty) => {
        const API_URL = 'http://localhost:5000/api/score';
    
        // The difficulty passed to the API must be capitalized to match the DB
        const capitalizedDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

        axios.post(API_URL, { playerName, timeSeconds, difficulty: capitalizedDifficulty })
            .then(response => {
                console.log(`Score saved! ID: ${response.data.scoreId}`);
                setScoreSubmitted(true);
                setShowScoreModal(false);
                navigate('/'); 
            })
            .catch(error => {
                console.error("Error submitting score:", error);
                alert("Failed to submit score. Check server connection and DB.");
            });
    };
    

    // --- Consolidated Fetching and Initialization Logic (Used by useEffect and Restart) ---
    const startNewGame = useCallback(() => {
        const API_URL = `http://localhost:5000/api/puzzle/${difficulty}`;
        
        // Reset all states before fetching a new puzzle
        setLoading(true);
        setTimerRunning(false); 
        setTimeInSeconds(0);
        setIsGameOver(false);
        setActiveCell({ r: null, c: null });
        setMistakes(0);
        setShowScoreModal(false);
        setScoreSubmitted(false);

        axios.get(API_URL)
            .then(response => {
                const flatBoard = response.data.initial.map(val => val || 0); 
                const flatSolution = response.data.solution.map(val => val || 0);

                const initial2D = flatTo2D(flatBoard);
                const solution2D = flatTo2D(flatSolution);
                
                setBoard(initial2D.map(row => [...row])); 
                setInitialBoard(initial2D);
                setSolution(solution2D); 
                
                setLoading(false);
                setTimerRunning(true); // Start the timer when the puzzle loads
            })
            .catch(error => {
                console.error("Error fetching puzzle:", error);
                setLoading(false);
            });
    }, [difficulty]); 

    // Initial load/Difficulty change
    useEffect(() => {
        startNewGame();
    }, [startNewGame]);

    // Restart Handler
    const handleRestart = () => {
        if (window.confirm("Are you sure you want to restart this puzzle? Your time will be reset.")) {
            startNewGame();
        }
    };

    // --- Board Update Handler (Core Game Logic) ---
    const updateBoardValue = (r, c, value) => {
        if (isGameOver || initialBoard[r][c] !== 0) return; 

        const newBoard = board.map(row => [...row]); 
        newBoard[r][c] = value;
        
        // Mistake check for the 3-strike rule
        if (value !== 0 && value !== solution[r][c]) {
            setMistakes(prev => prev + 1);

            if (mistakes + 1 >= 3) {
                setTimerRunning(false);
                setIsGameOver(true);
            }
        }
        
        setBoard(newBoard);
        
        // Check for Game Completion
        if (isBoardFilled(newBoard)) {
             if (newBoard.every((row, r) => row.every((cell, c) => cell === solution[r][c]))) {
                setTimerRunning(false);
                setIsGameOver(true);
                
                if (!scoreSubmitted) { 
                    setShowScoreModal(true);
                }
             } else {
                 alert("The board is filled, but the solution is incorrect. Check your numbers!");
             }
        }
    };

    // Handler for the Grid component (keyboard input)
    const handleCellChange = (r, c, value) => {
        updateBoardValue(r, c, value);
    };

    // Handler for the Number Pad component (click input)
    const handleNumberPadClick = (number) => {
        const { r, c } = activeCell;
        if (r !== null && c !== null) {
            updateBoardValue(r, c, number);
        }
    };
    
    // Handler to receive time updates from the Timer component
    const handleTimeUpdate = useCallback((newTime) => {
        setTimeInSeconds(newTime);
    }, []);
    
    // --- Render Logic ---

    if (loading) {
        return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Loading {difficulty.toUpperCase()} Puzzle...</h1>;
    }

    if (!board) {
        return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Failed to load puzzle.</h1>;
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <button 
                onClick={() => navigate('/')} 
                style={{ float: 'left', padding: '8px 15px', cursor: 'pointer' }}
            >
                ← Back to Home
            </button>
            
            <button 
                onClick={handleRestart} 
                style={{ float: 'right', padding: '8px 15px', cursor: 'pointer', backgroundColor: '#FF5733', color: 'white' }}
                disabled={loading}
            >
                Restart Puzzle
            </button>
            
            <h2>Difficulty: {difficulty.toUpperCase()}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px' }}>
                
                {/* --- 1. The Sudoku Grid --- */}
                <Grid 
                    board={board} 
                    onCellChange={handleCellChange} 
                    initialBoard={initialBoard} 
                    setActiveCell={setActiveCell}
                    solution={solution}
                    activeCell={activeCell}
                />
                
                {/* --- 2. Controls and Timer --- */}
                <div className="controls-area" style={{ width: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Timer 
                        isRunning={timerRunning} 
                        onTimeUpdate={handleTimeUpdate} 
                    />
                    <p style={{ fontSize: '1.2em', color: mistakes >= 3 ? 'red' : 'inherit' }}>
                        Mistakes: **{mistakes}** / 3
                    </p>

                    {/* --- 3. Number Pad --- */}
                    <div style={{ marginTop: '20px', padding: '10px' }}>
                        <NumberPad onNumberPadClick={handleNumberPadClick} />
                    </div>
                </div>
            </div>
            
            {isGameOver && (
                <div style={{ marginTop: '30px', color: mistakes >= 3 ? 'red' : 'green', fontSize: '1.5em', fontWeight: 'bold' }}>
                    {mistakes >= 3 ? "GAME OVER! Too many mistakes." : `CONGRATULATIONS! Solved in ${Math.floor(timeInSeconds / 60)}m ${timeInSeconds % 60}s.`}
                </div>
            )}
            
            {/* --- High Score Modal --- */}
            {showScoreModal && (
                <ScoreSubmissionModal
                    timeSeconds={timeInSeconds}
                    difficulty={difficulty.toUpperCase()}
                    onSubmit={handleScoreSubmit}
                    onCancel={() => { 
                        setScoreSubmitted(true); 
                        setShowScoreModal(false);
                        navigate('/'); 
                    }}
                />
            )}
        </div>
    );
};

export default SudokuGame;