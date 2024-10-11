/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useContext, useMemo } from "react";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";
import GameContext from "../../contexts/GameContext";
import PauseOverlay from "../PauseOverlay/PauseOverlay";
import StartOverlay from "../StartOverlay/StartOverlay";
import GameoverOverlay from "./../GameoverOverlay/GameoverOverlay";

const Board = () => {
  // useContext to access GameContext which stores global game values
  const gameContext = useContext(GameContext);
  const { gameScore, setGameScore } = gameContext;

  //Board size settings
  const boardSizeY = 20,
    boardSizeX = 20;

  //Initiallize board
  const boardInit = useMemo(() => {
    let board = [];
    for (let y = 0; y < boardSizeY; y++) {
      for (let x = 0; x < boardSizeX; x++) {
        board.push(<Tile key={`${x}-${y}`} x={x} y={y} isActive={false} isFood={false} />);
      }
    }
    return board;
  }, [boardSizeX, boardSizeY]);

  const displayGameoverScore = useRef();

  //Default values for all variables
  const defaultValue = () => {
    return {
      //Default board settings
      tiles: boardInit,
      gameSpeed: 100,
      gameStatus: "starting",

      //Default snake settings
      activeHeadTile: { x: 0, y: 0 },
      snakeLength: 1,
      currentDirection: "right",
      currentHeadTile: null,
      snakeTiles: [],
      snakeTail: [],

      //Default food settings
      foodTile: { x: -1, y: -1 },
      foodExists: false
    };
  };

  //Board settings
  const [tiles, setTiles] = useState(defaultValue().tiles);
  const gameSpeed = useRef(defaultValue().gameSpeed);
  const [gameStatus, setGameStatus] = useState(defaultValue().gameStatus);

  //Snake settings
  const [activeHeadTile, setActiveHeadTile] = useState(defaultValue().activeHeadTile);
  const [snakeLength, setSnakeLength] = useState(defaultValue().snakeLength);
  const currentDirection = useRef(defaultValue().currentDirection);
  const currentHeadTile = useRef(defaultValue().currentHeadTile);
  const snakeTiles = useRef(defaultValue().snakeTiles);
  const snakeTail = useRef(defaultValue().snakeTail);

  //Food settings
  const foodTile = useRef(defaultValue().foodTile);
  const [foodExists, setFoodExists] = useState(defaultValue().foodExists);

  //Reverts all the game settings into its default values
  const restartGame = () => {
    const defaults = defaultValue();

    // Reset board settings
    setTiles(defaults.tiles);
    gameSpeed.current = defaults.gameSpeed;
    setGameStatus(defaults.gameStatus);

    // Reset snake settings
    setActiveHeadTile(defaults.activeHeadTile);
    setSnakeLength(defaults.snakeLength);
    currentDirection.current = defaults.currentDirection;
    currentHeadTile.current = defaults.currentHeadTile;
    snakeTiles.current = defaults.snakeTiles;
    snakeTail.current = defaults.snakeTail;

    // Reset food settings
    foodTile.current = defaults.foodTile;
    setFoodExists(defaults.foodExists);

    // Reset game score
    setGameScore(0);
  };

  // Directional movement functions
  const move = () => {
    const right = () => {
      setActiveHeadTile({ x: (activeHeadTile.x + 1) % boardSizeX, y: activeHeadTile.y });
    };

    const left = () => {
      setActiveHeadTile(() => {
        if (activeHeadTile.x <= 0) return { x: boardSizeX - 1, y: activeHeadTile.y };
        return { x: (activeHeadTile.x - 1) % boardSizeX, y: activeHeadTile.y };
      });
    };

    const down = () => {
      setActiveHeadTile(() => {
        setActiveHeadTile({ x: activeHeadTile.x, y: (activeHeadTile.y + 1) % boardSizeY });
      });
    };

    const up = () => {
      setActiveHeadTile(() => {
        if (activeHeadTile.y <= 0) return { x: activeHeadTile.x, y: boardSizeY - 1 };
        return { x: activeHeadTile.x, y: (activeHeadTile.y - 1) % boardSizeY };
      });
    };
    return { right, left, down, up };
  };

  //Snake movement function based on current direction
  const moveSnake = () => {
    switch (currentDirection.current) {
      case "right":
        move().right();
        break;
      case "left":
        move().left();
        break;
      case "down":
        move().down();
        break;
      case "up":
        move().up();
        break;
      default:
        break;
    }
  };

  //Delete tail when snake is moving "Right" or "Down"
  const updateTiles = (tiles) => {
    if (snakeTail.current.length == 2) {
      const lastTail = snakeTail.current[0]; //snakeTail.current[0] marks the previous tail of the snake while [1] marks the current tail
      const updatedTiles = tiles.map((tile) => {
        if (tile.key === `${lastTail.x}-${lastTail.y}`) {
          return <Tile key={tile.key} x={lastTail.x} y={lastTail.y} isActive={false} isFood={false} />;
        }
        return tile;
      });
      setTiles(updatedTiles);
    } else setTiles(tiles);
  };

  //Returns a random number to generate a new food tile
  const getRandomNumber = (min, max) => {
    const rand = Math.random() * (max - min) + min;
    return rand;
  };

  //Check if a particular tile is overlapping with the snake
  const isOverlapping = (x, y, type) => {
    if (type == "snake") {
      let tempSnakeTrail = snakeTiles.current.slice(0, snakeTiles.current.length - 1);
      if (tempSnakeTrail.some((tile) => tile.x === x && tile.y === y)) return true;
      return false;
    }

    if (snakeTiles.current.some((tile) => tile.x === x && tile.y === y)) return true;
    return false;
  };

  //Generates a random x and y coordinate for the food tile, checks if it overlaps with the snake with isOverlapping()
  const getRandomFoodTile = () => {
    let found = false;
    while (!found) {
      let foodX = Math.floor(getRandomNumber(0, boardSizeX)),
        foodY = Math.floor(getRandomNumber(0, boardSizeY));
      if (!isOverlapping(foodX, foodY)) {
        foodTile.current = { x: foodX, y: foodY };
        found = true;
      }
    }
  };

  //Generates a new food tile on the board
  const generateFoodTile = (tiles) => {
    getRandomFoodTile();
    const food = foodTile.current;
    const newTiles = tiles.map((tile) => {
      const { x, y } = getTileKey(tile);

      if (x === food.x && y === food.y) return <Tile key={`${x}-${y}`} x={x} y={y} isActive={false} isFood={true} />;
      else return tile;
    });

    setFoodExists(true);
    return newTiles;
  };

  //Check if the snake has eaten the food
  const checkIfEatenFood = () => {
    if (currentHeadTile.current.x === foodTile.current.x && currentHeadTile.current.y === foodTile.current.y) {
      setSnakeLength(snakeLength + 1);
      setFoodExists(false);
      setGameScore(gameScore + 1);
    }
  };

  //Get the x and y coordinates of a tile from a tiles map
  const getTileKey = (tile) => {
    let tileX = parseInt(tile.key.split("-")[0]),
      tileY = parseInt(tile.key.split("-")[1]);
    return { x: tileX, y: tileY };
  };

  //Main game runner / engine
  useEffect(() => {
    if (gameStatus === "running") {
      const interval = setInterval(() => {
        let newTiles = tiles.map((tile) => {
          const { x, y } = getTileKey(tile);
          if (x === activeHeadTile.x && y === activeHeadTile.y) {
            currentHeadTile.current = { x, y };
            //Log all the tiles occupied by the snake throughout the board
            snakeTiles.current.push({ x, y });
            if (snakeTiles.current.length > snakeLength) snakeTiles.current.shift();

            return <Tile key={`${x}-${y}`} x={x} y={y} isActive={true} isFood={false} />;
          } else if (snakeTiles.current.some((tile) => tile.x === x && tile.y === y)) {
            return <Tile key={`${x}-${y}`} x={x} y={y} isActive={true} isFood={false} />;
          } else {
            return tile;
          }
        });

        //Store the current and previous snake "tails" to debug extra tails when moving "Right" or "Down"
        snakeTail.current.push(snakeTiles.current[0]);
        if (snakeTail.current.length > 2) snakeTail.current.shift();

        //Check if food exists on the board, if not, generate a new food tile
        if (!foodExists) newTiles = generateFoodTile(newTiles); //Calls function to get the new food tile

        //Updates the board with the new tiles
        updateTiles(newTiles);

        //Check if the snake has eaten the food
        checkIfEatenFood();

        //Check if the snake has collided with itself
        if (isOverlapping(currentHeadTile.current.x, currentHeadTile.current.y, "snake")) {
          displayGameoverScore.current = gameScore;
          restartGame();
          setGameStatus("gameover");
        }

        //Move the snake in the current direction
        moveSnake();
      }, gameSpeed.current);
      return () => clearInterval(interval);
    }
  }, [activeHeadTile, tiles, gameStatus]);

  //Event listener for arrow keys, runs on component mount only, changes current direction based on keydown event
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
          if (currentDirection.current !== "left") currentDirection.current = "right";
          break;
        case "ArrowLeft":
          if (currentDirection.current !== "right") currentDirection.current = "left";
          break;
        case "ArrowDown":
          if (currentDirection.current !== "up") currentDirection.current = "down";
          break;
        case "ArrowUp":
          if (currentDirection.current !== "down") currentDirection.current = "up";
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //Debugging function to log the current state of the board
  const handlePause = () => {
    console.log(gameStatus);
    // restartGame();
    setGameStatus("paused");
    console.log(gameStatus);
  };

  return (
    <>
      <PauseOverlay setGameStatus={setGameStatus} gameStatus={gameStatus} />
      <GameoverOverlay
        setGameStatus={setGameStatus}
        gameStatus={gameStatus}
        displayGameoverScore={displayGameoverScore.current}
      />
      <div id={styles.boardContainer}>
        {gameStatus === "starting" ? (
          <StartOverlay setGameStatus={setGameStatus} />
        ) : (
          <div className={styles.board}>
            <div className={styles.menu}>
              <div className={styles.gameScore}>Score: {gameScore}</div>
              <span>Click board to pause</span>
            </div>
            <div className={styles.tiles} onClick={handlePause}>
              {tiles}
            </div>
            <p id={styles.link}>
              Created by{" "}
              <a href="https://github.com/Zeldoriz" target="blank">
                Andrew Tian
              </a>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Board;
