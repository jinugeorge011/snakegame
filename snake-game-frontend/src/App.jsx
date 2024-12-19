import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(DIRECTIONS.ArrowRight);
  const [food, setFood] = useState(generateFood());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [name, setName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [speed, setSpeed] = useState(200);

  const handleKeyPress = useCallback((event) => {
    if (DIRECTIONS[event.key]) {
      const newDirection = DIRECTIONS[event.key];
      if (direction.x + newDirection.x !== 0 || direction.y + newDirection.y !== 0) {
        setDirection(newDirection);
      }
    }
  }, [direction]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameOver) {
      fetchLeaderboard();
      return;
    }

    const interval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(interval);
  }, [snake, direction, gameOver, speed]);

  useEffect(() => {
    const updateSpeed = () => {
      const newSpeed = Math.max(100, 150 - Math.floor(window.innerWidth / 100)); 
      setSpeed(newSpeed); // Smoother transition by controlling speed
    };

    updateSpeed();
    window.addEventListener("resize", updateSpeed);
    return () => window.removeEventListener("resize", updateSpeed);
  }, []);

  function generateFood() {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  }

  function moveSnake() {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x < 0 || head.y < 0 || head.x >= BOARD_SIZE || head.y >= BOARD_SIZE) {
      setGameOver(true);
      return;
    }

    for (const segment of newSnake) {
      if (head.x === segment.x && head.y === segment.y) {
        setGameOver(true);
        return;
      }
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setFood(generateFood());
      setScore((prev) => prev + 1);
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function resetGame() {
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS.ArrowRight);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
  }

  async function submitScore() {
    if (!name.trim()) return alert("Please enter your name.");
    try {
      await axios.post("http://localhost:5000/api/leaderboard", { name, score });
      fetchLeaderboard();
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }

  async function fetchLeaderboard() {
    try {
      const response = await axios.get("http://localhost:5000/api/leaderboard");
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      <div className="theme-switch">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <h1>Snake Game</h1>
      {gameOver ? (
        <div>
          <h2>Game Over! Your score: {score}</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="btn" onClick={submitScore}>Submit Score</button>
          <button onClick={resetGame}>Start</button>
          <h3>Leaderboard:</h3>
          <ul>
            {leaderboard.map((entry, index) => (
              <li key={index}>
                {entry.name}: {entry.score}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="board">
          {Array.from({ length: BOARD_SIZE }).map((_, row) => (
            <div key={row} className="row">
              {Array.from({ length: BOARD_SIZE }).map((_, col) => {
                const isSnake = snake.some((segment) => segment.x === col && segment.y === row);
                const isFood = food.x === col && food.y === row;
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`cell ${isSnake ? "snake" : ""} ${isFood ? "food" : ""}`}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
