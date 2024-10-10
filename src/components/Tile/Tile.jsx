/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import styles from "./Tile.module.css";
const Tile = ({ x, y, isActive, isFood }) => {
  return (
    <>
      {isActive ? (
        <div className={`${styles.tile} ${styles.active}`} />
      ) : isFood ? (
        <div className={`${styles.tile} ${styles.food}`} />
      ) : (
        <div className={styles.tile} />
      )}
    </>
  );
};

export default Tile;
