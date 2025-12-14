// client/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const difficulties = ['Easy', 'Medium', 'Difficult'];
    
    const [selectedDifficulty, setSelectedDifficulty] = useState('Easy'); 
    const [highScores, setHighScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- High Score Fetching Logic ---
    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            setError(null);
            
            const apiUrl = `http://localhost:5000/api/scores/${selectedDifficulty.toLowerCase()}`;

            try {
                const response = await axios.get(apiUrl);
                setHighScores(response.data);
            } catch (err) {
                console.error("Error fetching high scores:", err);
                setError("Failed to load scores. Check Node.js server and database connection."); 
                setHighScores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [selectedDifficulty]); 

    // Helper function to format seconds into MM:SS
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        return `${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    // --- Render High Score Table ---
    const renderScoreTable = () => {
        if (loading) return <p>Loading high scores...</p>;
        if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

        if (highScores.length === 0) {
            return <p>No scores yet for **{selectedDifficulty}** difficulty. Be the first!</p>;
        }

        return (
            <table style={{ margin: '20px auto', borderCollapse: 'collapse', width: '90%', maxWidth: '500px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={tableHeaderStyle}>Rank</th>
                        <th style={tableHeaderStyle}>Player</th>
                        <th style={tableHeaderStyle}>Time</th>
                    </tr>
                </thead>
                <tbody>
                    {highScores.map((score, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={tableCellStyle}>**{index + 1}**</td>
                            <td style={tableCellStyle}>{score.player_name}</td>
                            <td style={tableCellStyle}>{formatTime(score.time_seconds)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const tableHeaderStyle = { padding: '10px', border: '1px solid #ddd', textAlign: 'left' };
    const tableCellStyle = { padding: '10px', border: '1px solid #ddd', textAlign: 'left' };


    // --- Main Render ---
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>🧩 Sudoku Master</h1>
            <p>Select a difficulty and start playing!</p>
            
            {/* --- Difficulty Buttons for Starting Game --- */}
            <div style={{ margin: '20px 0' }}>
                {difficulties.map(level => (
                    <Link 
                        key={level}
                        to={`/play/${level.toLowerCase()}`} 
                        style={{ 
                            margin: '0 10px', 
                            padding: '10px 20px', 
                            textDecoration: 'none',
                            backgroundColor: level === 'Easy' ? '#4CAF50' : 
                                             level === 'Medium' ? '#FFC107' : '#F44336',
                            color: 'white',
                            borderRadius: '5px',
                            fontWeight: 'bold'
                        }}
                    >
                        {level}
                    </Link>
                ))}
            </div>
            
            {/* --- High Score Display --- */}
            <div style={{ marginTop: '60px' }}>
                <h2>🏆 High Scores ({selectedDifficulty})</h2>
                
                {/* Difficulty tabs for High Scores */}
                <div style={{ margin: '15px 0' }}>
                    {difficulties.map(level => (
                        <button
                            key={`score-tab-${level}`}
                            onClick={() => setSelectedDifficulty(level)}
                            style={{
                                padding: '8px 15px',
                                margin: '0 5px',
                                cursor: 'pointer',
                                backgroundColor: selectedDifficulty === level ? '#333' : '#ddd',
                                color: selectedDifficulty === level ? 'white' : 'black',
                                border: '1px solid #ccc',
                                borderRadius: '5px'
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Render the actual score table */}
                {renderScoreTable()}
            </div>
        </div>
    );
};

export default HomePage;