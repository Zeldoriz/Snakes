/* eslint-disable react/prop-types */
import { useMemo } from "react";
import styles from "./PauseOverlay.module.css";

const PauseOverlay = ({ gameStatus, setGameStatus }) => {
  const overlayDisplay = useMemo(() => {
    return gameStatus === "paused" ? styles.overlayVisible : styles.overlayHidden;
  }, [gameStatus]);

  const handleResume = () => {
    setGameStatus("running");
  };

  return (
    <>
      <div className={`${styles.overlayContainer} ${overlayDisplay}`} onClick={handleResume}>
        <div className={styles.pauseOverlay}>
          <span>Game Paused</span>
          <span>Click anywhere to continue</span>
        </div>
      </div>
    </>
  );
};

export default PauseOverlay;
