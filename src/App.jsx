import styles from "./App.module.css";
import Board from "./components/Board/Board";
import GameContext from "./contexts/GameContext";
import { useState } from "react";

function App() {
  const [gameScore, setGameScore] = useState(0);

  return (
    <>
      <div className={styles.appContainer}>
        <GameContext.Provider value={{ gameScore: gameScore, setGameScore: setGameScore }}>
          <Board />
        </GameContext.Provider>
      </div>
    </>
  );
}

export default App;
