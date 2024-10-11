/* eslint-disable react/prop-types */
import { useMemo } from "react";
import styles from "./GameoverOverlay.module.css";

const GameoverOverlay = ({ gameStatus, setGameStatus, displayGameoverScore }) => {
  const overlayDisplay = useMemo(() => {
    return gameStatus === "gameover" ? styles.overlayVisible : styles.overlayHidden;
  }, [gameStatus]);

  const handleRestart = () => {
    setGameStatus("starting");
  };

  return (
    <>
      <div className={`${styles.overlayContainer} ${overlayDisplay}`} onClick={handleRestart}>
        <div className={styles.pauseOverlay}>
          <span>Game Over!</span>
          <span>
            Your Final Score: <span className={styles.displayScore}>{displayGameoverScore}</span>
          </span>
          <span>Click anywhere to restart</span>
        </div>
      </div>
    </>
  );
};

export default GameoverOverlay;
