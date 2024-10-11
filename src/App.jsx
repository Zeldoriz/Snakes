import "./App.css";
import Board from "./components/Board/Board";
import GameContext from "./contexts/GameContext";
import { useState } from "react";

function App() {
  const [gameScore, setGameScore] = useState(0);

  return (
    <>
      <GameContext.Provider value={{ gameScore: gameScore, setGameScore: setGameScore }}>
        <Board />
      </GameContext.Provider>
    </>
  );
}

export default App;
