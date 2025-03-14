const canvas = document.getElementById("canvas");
const pen = canvas.getContext("2d");

canvas.width = window.innerWidth > 600 ? 1200 : window.innerWidth - 20;  
canvas.height = window.innerHeight > 600 ? 735 : window.innerHeight - 20;

const W = canvas.width;
const H = canvas.height;
const cs = 67;

let food = null;
let score = 0;
let speed = 100;
let id;
let isPaused = false;
let isGameOver = false;

const snake = {
  init_len: 5,
  direction: "right",
  cells: [],

  createSnake: function () {
    this.cells = [];
    for (let i = 0; i < this.init_len; i++) {
      this.cells.push({ x: i, y: 0 });
    }
  },

  drawSnake: function () {
    for (let cell of this.cells) {
      pen.fillRect(cell.x * cs, cell.y * cs, cs - 1, cs - 1);
    }
  },

  updateSnake: function () {
    if (isPaused || isGameOver) return;

    const headX = this.cells[this.cells.length - 1].x;
    const headY = this.cells[this.cells.length - 1].y;

    if (headX === food.x && headY === food.y) {
      score += food.isSpecial ? 3 : 1;
      food = getRandomFood();
      increaseSpeed();
    } else {
      this.cells.shift();
    }

    let nextX = headX;
    let nextY = headY;

    if (this.direction === "down") nextY++;
    else if (this.direction === "up") nextY--;
    else if (this.direction === "left") nextX--;
    else if (this.direction === "right") nextX++;

    if (nextX * cs >= W || nextX < 0 || nextY * cs >= H || nextY < 0) {
      gameOver();
      return;
    }

    for (let cell of this.cells) {
      if (cell.x === nextX && cell.y === nextY) {
        gameOver();
        return;
      }
    }

    this.cells.push({ x: nextX, y: nextY });
  },
};

function init() {
  snake.createSnake();
  food = getRandomFood();
  document.addEventListener("keydown", keyPressed);
  addSwipeControls();
}

function keyPressed(e) {
  if (e.key === "ArrowDown" && snake.direction !== "up") {
    snake.direction = "down";
  } else if (e.key === "ArrowLeft" && snake.direction !== "right") {
    snake.direction = "left";
  } else if (e.key === "ArrowUp" && snake.direction !== "down") {
    snake.direction = "up";
  } else if (e.key === "ArrowRight" && snake.direction !== "left") {
    snake.direction = "right";
  } else if (e.key === " " && !isGameOver) {
    togglePause();
  } else if (e.key === "Enter") {
    restartGame();
  }
}

function togglePause() {
  if (isGameOver) return;

  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(id);
    pen.fillStyle = "red";
    pen.font = "50px sans-serif";
    pen.fillText("Paused", W / 2 - 100, H / 2);
  } else {
    id = setInterval(gameLoop, speed);
  }
}

function addSwipeControls() {
  let touchStartX = 0, touchStartY = 0;
  let touchEndX = 0, touchEndY = 0;

  canvas.addEventListener("touchstart", function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  canvas.addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  });

  function handleSwipe() {
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && snake.direction !== "left") {
        snake.direction = "right";
      } else if (dx < 0 && snake.direction !== "right") {
        snake.direction = "left";
      }
    } else {
      if (dy > 0 && snake.direction !== "up") {
        snake.direction = "down";
      } else if (dy < 0 && snake.direction !== "down") {
        snake.direction = "up";
      }
    }
  }
}

function update() {
  snake.updateSnake();
}

function draw() {
  pen.clearRect(0, 0, W, H);
  pen.font = "40px sans-serif";
  pen.fillText(`Score: ${score}`, 100, 50);
  pen.fillText(`High Score: ${highScore}`, 100, 100);
  pen.fillStyle = food.isSpecial ? "green" : "blue";
  pen.fillRect(food.x * cs, food.y * cs, cs, cs);
  pen.fillStyle = "yellow";
  snake.drawSnake();
}

function gameLoop() {
  draw();
  update();
}

function getRandomFood() {
  const foodX = Math.floor(Math.random() * (W / cs));
  const foodY = Math.floor(Math.random() * (H / cs));
  const isSpecial = Math.random() < 0.2;

  return { x: foodX, y: foodY, isSpecial: isSpecial };
}

function increaseSpeed() {
  clearInterval(id);
  speed = Math.max(50, speed * 0.95);
  id = setInterval(gameLoop, speed);
}

function gameOver() {
  pen.fillStyle = "red";
  pen.fillText(`Game Over! Press "Enter" to Restart`, W / 3, H / 2);
  clearInterval(id);
  updateHighScore();
  isGameOver = true;
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

function restartGame() {
  isGameOver = false;
  score = 0;
  speed = 100;
  isPaused = false;
  snake.direction = "right";
  snake.createSnake();
  food = getRandomFood();
  pen.clearRect(0, 0, W, H);

  clearInterval(id);
  id = setInterval(gameLoop, speed);
}

let highScore = localStorage.getItem("highScore") || 0;

init();
id = setInterval(gameLoop, speed);
