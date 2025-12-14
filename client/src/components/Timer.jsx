// client/src/components/Timer.jsx

import React, { useState, useEffect } from 'react';

const Timer = ({ isRunning, onTimeUpdate }) => {
    // State to store the elapsed time in seconds
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval = null;

        if (isRunning) {
            // Start the timer interval
            interval = setInterval(() => {
                // Update the state every second
                setSeconds(prevSeconds => {
                    const newSeconds = prevSeconds + 1;
                    // Pass the new time back to the parent component (SudokuGame)
                    onTimeUpdate(newSeconds);
                    return newSeconds;
                });
            }, 1000);
        } 
        
        // Cleanup function to clear the interval when the component unmounts or isRunning changes
        return () => clearInterval(interval);

    }, [isRunning, onTimeUpdate]); // Re-run effect if isRunning changes

    // Helper function to format seconds into MM:SS
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        const pad = (num) => num.toString().padStart(2, '0');

        return `${pad(minutes)}:${pad(remainingSeconds)}`;
    };

    return (
        <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
            Time: {formatTime(seconds)}
        </div>
    );
};

export default Timer;