/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import Tile from "../Tile/Tile";
import styles from "./Board.module.css";

const Board = () => {
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

  //Board settings
  const [activeHeadTile, setActiveHeadTile] = useState({ x: 0, y: 0 });
  const [tiles, setTiles] = useState(boardInit);
  const gameSpeed = useRef(100);

  //Snake settings
  const [snakeLength, setSnakeLength] = useState(1);
  const currentDirection = useRef("right");
  const currentHeadTile = useRef();
  const snakeTiles = useRef([]);
  const snakeTail = useRef([]);

  //Food settings
  const foodTile = useRef({ x: -1, y: -1 });
  const [foodExists, setFoodExists] = useState(false);

  // Directional movement functions
  const moveActiveRight = () => {
    setActiveHeadTile({ x: (activeHeadTile.x + 1) % boardSizeX.current, y: activeHeadTile.y });
  };

  const moveActiveLeft = () => {
    setActiveHeadTile(() => {
      if (activeHeadTile.x <= 0) return { x: boardSizeX.current - 1, y: activeHeadTile.y };
      return { x: (activeHeadTile.x - 1) % boardSizeX.current, y: activeHeadTile.y };
    });
  };

  const moveActiveDown = () => {
    setActiveHeadTile(() => {
      setActiveHeadTile({ x: activeHeadTile.x, y: (activeHeadTile.y + 1) % boardSizeY.current });
    });
  };

  const moveActiveUp = () => {
    setActiveHeadTile(() => {
      if (activeHeadTile.y <= 0) return { x: activeHeadTile.x, y: boardSizeY.current - 1 };
      return { x: activeHeadTile.x, y: (activeHeadTile.y - 1) % boardSizeY.current };
    });
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

  //Generates a random x and y coordinate for the food tile
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
      const x = parseInt(tile.key.split("-")[0]),
        y = parseInt(tile.key.split("-")[1]);

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
    }
  };

  //Board update function
  useEffect(() => {
    const interval = setInterval(() => {
      let newTiles = tiles.map((tile) => {
        const x = parseInt(tile.key.split("-")[0]),
          y = parseInt(tile.key.split("-")[1]);

        if (x === activeHeadTile.x && y === activeHeadTile.y) {
          currentHeadTile.current = { x, y };
          //Log snake traversal tiles throughout the board
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
      if (isOverlapping(currentHeadTile.current.x, currentHeadTile.current.y, "snake")) alert("Game Over");

      //Move the snake in the current direction
      switch (currentDirection.current) {
        case "right":
          moveActiveRight();
          break;
        case "left":
          moveActiveLeft();
          break;
        case "down":
          moveActiveDown();
          break;
        case "up":
          moveActiveUp();
          break;
        default:
          break;
      }
    }, gameSpeed.current);
    return () => {
      clearInterval(interval);
    };
  }, [activeHeadTile, tiles]);

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
    console.log(snakeTiles.current);
  };

  return (
    <>
      <div id={styles.boardContainer}>
        <div id={styles.board} onClick={handleClick}>
          {tiles}
        </div>
      </div>
    </>
  );
};

export default Board;
