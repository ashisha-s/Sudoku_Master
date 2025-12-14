// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// FIX: Add the .jsx extension to the import paths
import HomePage from "./pages/HomePage.jsx";
import SudokuGame from "./pages/SudokuGame.jsx"; 

import "./App.css";
function App() {
  return (
    <Router>
      <div className="app-container">
        {/*
          The Routes component holds all the possible paths (pages)
        */}
        <Routes>
          {/* Path 1: The Landing/Home Page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Path 2: The Game Page. 
            The :difficulty parameter allows us to capture Easy, Medium, or Difficult.
          */}
          <Route path="/play/:difficulty" element={<SudokuGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;