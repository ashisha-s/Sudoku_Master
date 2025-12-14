// client/src/components/Grid.jsx - Grid Size 50px

import React from 'react';

// The Grid component now accepts solution and activeCell state
const Grid = ({ board, onCellChange, initialBoard, setActiveCell, solution, activeCell }) => {
    
    // --- Helper function to check for related cells ---
    const isRelated = (r1, c1, r2, c2) => {
        if (r1 === r2 || c1 === c2) return true;
        
        const blockRow1 = Math.floor(r1 / 3);
        const blockCol1 = Math.floor(c1 / 3);
        const blockRow2 = Math.floor(r2 / 3);
        const blockCol2 = Math.floor(c2 / 3);
        
        return blockRow1 === blockRow2 && blockCol1 === blockCol2;
    };


    // Helper function to render the 9 rows
    const renderRows = () => {
        const rows = [];
        for (let r = 0; r < 9; r++) {
            const cells = [];
            for (let c = 0; c < 9; c++) {
                
                const isInitial = initialBoard[r][c] !== 0;
                const value = board[r][c] === 0 ? '' : board[r][c];
                
                // --- Styling Logic ---
                const isCurrentActive = activeCell.r === r && activeCell.c === c;
                const isCellRelated = activeCell.r !== null && isRelated(r, c, activeCell.r, activeCell.c);
                const isConflict = !isInitial && board[r][c] !== 0 && board[r][c] !== solution[r][c];

                // Determine border thickness and color for the 3x3 blocks
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '3px solid #333' : '1px solid #ddd';
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '3px solid #333' : '1px solid #ddd';
                
                // Base style for the input cell
                const cellStyle = {
                    // --- SIZE INCREASED HERE ---
                    width: '50px',   
                    height: '50px',
                    lineHeight: '50px', 
                    textAlign: 'center',
                    fontSize: '1.8em', // Bigger font
                    
                    // Base border for internal alignment
                    borderTop: '1px solid #ddd',
                    borderLeft: '1px solid #ddd',
                    
                    // Conditional thick borders (Right and Bottom)
                    borderRight: borderRight,
                    borderBottom: borderBottom,

                    boxSizing: 'border-box', 
                    fontWeight: isInitial ? 'bold' : 'normal',
                    outline: 'none', 
                    
                    // --- Conditional Colors ---
                    backgroundColor: isCurrentActive ? '#ADD8E6' : 
                                     isCellRelated ? '#E6F0F8' :   
                                     isInitial ? '#EAEAEA' :       
                                     'white',
                    
                    color: isConflict ? '#FF0000' : 
                           isInitial ? '#333' :       
                           '#006400',                 
                    
                    cursor: isInitial ? 'default' : 'pointer',
                };

                cells.push(
                    <input
                        key={`cell-${r}-${c}`}
                        type="text"
                        readOnly={isInitial}
                        value={value}
                        maxLength="1"
                        style={cellStyle}
                        className="sudoku-cell"
                        
                        onClick={() => {
                            if (!isInitial) setActiveCell({ r, c });
                        }}
                        
                        onChange={(e) => {
                            const newValue = e.target.value.replace(/[^1-9]/g, '');
                            if (!isInitial) {
                                onCellChange(r, c, newValue === '' ? 0 : parseInt(newValue, 10));
                            }
                        }}
                    />
                );
            }
            rows.push(
                <div 
                    key={`row-${r}`} 
                    style={{ 
                        display: 'flex', 
                        lineHeight: '0', // Fixes vertical alignment gaps
                    }}
                >
                    {cells}
                </div>
            );
        }
        return rows;
    };

    return (
        <div 
            style={{ 
                display: 'inline-block', 
                lineHeight: '0' 
            }}
        >
            {renderRows()}
        </div>
    );
};

export default Grid;