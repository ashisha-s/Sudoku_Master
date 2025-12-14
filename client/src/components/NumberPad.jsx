// client/src/components/NumberPad.jsx

import React from 'react';

const NumberPad = ({ onNumberClick }) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const buttonStyle = {
        padding: '15px 15px',
        margin: '5px',
        fontSize: '1.2em',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '60px',
        height: '60px',
        backgroundColor: '#f9f9f9'
    };
    
    const controlButtonStyle = {
        ...buttonStyle,
        width: 'auto',
        backgroundColor: '#e0e0e0',
        fontSize: '1em'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
                {numbers.map(num => (
                    <button 
                        key={num} 
                        style={buttonStyle} 
                        onClick={() => onNumberClick(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                <button 
                    style={controlButtonStyle} 
                    onClick={() => onNumberClick(0)} // 0 represents clearing the cell
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default NumberPad;