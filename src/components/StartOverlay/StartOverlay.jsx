/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import styles from "./StartOverlay.module.css";

const StartOverlay = ({ setGameStatus }) => {
  const handleStart = () => {
    setGameStatus("running");
  };

  return (
    <>
      <div id={styles.startContainer} onClick={handleStart}>
        <span>Click Anywhere to Start!</span>
      </div>
    </>
  );
};

export default StartOverlay;
