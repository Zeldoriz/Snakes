/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef, useContext } from "react";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";
import GameContext from "../../contexts/GameContext";

const Board = () => {
  // useContext to access GameContext which stores global game values
  const gameContext = useContext(GameContext);
  const { gameScore, setGameScore } = gameContext;

  //Board size settings
  const boardSizeY = useRef(20),
    boardSizeX = useRef(20);

  //Initiallize board
  const boardInit = [];
  for (let y = 0; y < boardSizeY.current; y++) {
    for (let x = 0; x < boardSizeX.current; x++) {
      boardInit.push(<Tile key={`${x}-${y}`} x={x} y={y} isActive={false} isFood={false} />);
    }
  }

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
    setTiles(boardInit);
    gameSpeed.current = 100;
    setGameStatus("running");
    setActiveHeadTile({ x: 0, y: 0 });
    setSnakeLength(1);
    currentDirection.current = "right";
    currentHeadTile.current = null;
    snakeTiles.current = [];
    snakeTail.current = [];
    foodTile.current = { x: -1, y: -1 };
    setFoodExists(false);
    setGameScore(0);
  };

  // Directional movement functions
  const move = () => {
    const right = () => {
      setActiveHeadTile({ x: (activeHeadTile.x + 1) % boardSizeX.current, y: activeHeadTile.y });
    };

    const left = () => {
      setActiveHeadTile(() => {
        if (activeHeadTile.x <= 0) return { x: boardSizeX.current - 1, y: activeHeadTile.y };
        return { x: (activeHeadTile.x - 1) % boardSizeX.current, y: activeHeadTile.y };
      });
    };

    const down = () => {
      setActiveHeadTile(() => {
        setActiveHeadTile({ x: activeHeadTile.x, y: (activeHeadTile.y + 1) % boardSizeY.current });
      });
    };

    const up = () => {
      setActiveHeadTile(() => {
        if (activeHeadTile.y <= 0) return { x: activeHeadTile.x, y: boardSizeY.current - 1 };
        return { x: activeHeadTile.x, y: (activeHeadTile.y - 1) % boardSizeY.current };
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
      let foodX = Math.floor(getRandomNumber(0, 10)),
        foodY = Math.floor(getRandomNumber(0, 10));
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

  //Board update function
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
          alert("Gameover");
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
  const handleClick = () => {
    console.log(gameStatus);
    restartGame();
    console.log(gameStatus);
  };

  return (
    <>
      <div className={styles.gameScore}>Score: {gameScore}</div>
      <div id={styles.boardContainer}>
        <div id={styles.board} onClick={handleClick}>
          {gameStatus === "gameover" ? <h1>Game Over</h1> /*Replace h1 element with a gameover prompt*/ : tiles}
        </div>
      </div>
    </>
  );
};

export default Board;
