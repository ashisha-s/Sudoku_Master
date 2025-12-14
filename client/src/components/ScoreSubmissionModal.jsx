// client/src/components/ScoreSubmissionModal.jsx

import React, { useState } from 'react';

const ScoreSubmissionModal = ({ timeSeconds, difficulty, onSubmit, onCancel }) => {
    const [playerName, setPlayerName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playerName.trim()) {
            // Pass the data up to the parent component (SudokuGame)
            onSubmit(playerName.trim(), timeSeconds, difficulty);
        }
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    };

    const formattedTime = `${Math.floor(timeSeconds / 60)}m ${timeSeconds % 60}s`;

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <h3>🏆 Puzzle Solved!</h3>
                <p>Time Taken: **{formattedTime}**</p>
                <p>Difficulty: **{difficulty.toUpperCase()}**</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter your name or initials"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength="15"
                        required
                        style={{ padding: '10px', margin: '15px 0', width: '80%' }}
                    />
                    <div>
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer' }}>
                            Submit Score
                        </button>
                        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Skip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScoreSubmissionModal;