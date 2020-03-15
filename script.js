class Field {
  constructor(width, height, gridSize, offsetX, offsetY, border) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.border = border;

    const div = this.render('field', width, height, border);
  }

  render(className, w, h) {
    const div = document.createElement('div');
    div.className = className;

    div.style.left = this.offsetX - this.border + 'px';
    div.style.top = this.offsetY - this.border + 'px';
    div.style.width = this.gridSize * w +'px';
    div.style.height = this.gridSize * h + 'px';
    div.style.border = `${this.border}px solid #000`;

    document.body.append(div);
    return div;
  }
}

class Snake {
  static LEFT = 'left';
  static RIGHT = 'right';
  static UP = 'up';
  static DOWN = 'down';

  static DELTAS = {
    [Snake.LEFT]: {x: -1, y: 0},
    [Snake.RIGHT]: {x: 1, y: 0},
    [Snake.UP]: {x: 0, y: -1},
    [Snake.DOWN]: {x: 0, y: 1},
  };

  constructor(field, length, gridSize, offsetX, offsetY) {
    this.field = field;
    this.length = length;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.direction = Snake.RIGHT;
    this.elements = [];
    this.createElement(
      Math.floor(field.width / 2),
      Math.floor(field.height / 2),
      gridSize, offsetX, offsetY
    );
  }
  createElement = (x, y, gridSize, offsetX, offsetY) => {
    const div = document.createElement('div');
    div.className = 'snake-element';
  

    div.style.left = offsetX + gridSize * x + 'px';
    div.style.top = offsetY + gridSize * y + 'px';
    div.style.width = gridSize + 'px';
    div.style.height = gridSize + 'px';

    document.body.append(div);

    this.elements.unshift({
      x: x,
      y: y,
      div: div,
    });
  }

  getNextPosition = () => {
    const delta = Snake.DELTAS[this.direction];
    const x = this.elements[0].x + delta.x;
    const y = this.elements[0].y + delta.y;
    return [x, y];
  }

  move = (x, y, gridSize, offsetX, offsetY) => {
    this.createElement(x, y, gridSize, offsetX, offsetY);

    if (this.elements.length > this.length) {
      const last = this.elements.pop();
      last.div.remove();
    }
  }
}

const stats = (width, height, gridSize, offsetX, offsetY, border) => {
  const statsDiv = document.createElement('div');
  const statsWidth = width * gridSize;
  const statsTop = height * gridSize + offsetY;
  statsDiv.className = 'stats';
  statsDiv.style.width = `${statsWidth}px`;
  statsDiv.style.top = `${statsTop}px`;
  statsDiv.style.left = offsetX - border + 'px';
  statsDiv.style.border = `${border}px solid #000`;

  const pPoints = document.createElement('p');
  pPoints.className = 'points';
  pPoints.innerHTML = `Current score: 0`;

  const pBestScore = document.createElement('p');
  pBestScore.className = 'best-score';
  pBestScore.innerHTML = 'Best score: 0';

  const button = document.createElement('button');
  button.className = 'button';
  button.innerHTML = 'Start new game';
  
  const gameOverMessage = document.createElement('p');
  const field = document.body.getElementsByClassName('field')[0];
  gameOverMessage.className = 'game-over-message';
  gameOverMessage.style.display = 'none';
  
  const fieldWidth = width * gridSize;

  if (fieldWidth <= 150) {
    pPoints.style.fontSize = '14px';
    pBestScore.style.fontSize = '14px';
    button.style.fontSize = '14px';
    button.style.minWidth = '90%';
    button.style.maxHeight = '45px';
  }
  
  field.appendChild(gameOverMessage);
  statsDiv.appendChild(pPoints);
  statsDiv.appendChild(pBestScore);
  statsDiv.appendChild(button);

  document.body.append(statsDiv);

  const stats = {
    stats: statsDiv,
    pPoints: pPoints,
    pBestScore: pBestScore,
    button: button,
    gameOverMessage: gameOverMessage
  }
  return stats;
}

class Game {
  constructor(width, height, gridSize, offsetX, offsetY, snakeLength, border, level) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.border = border;
    this.startLength = snakeLength;
    this.length = snakeLength;
    this.keys = [];
    this.apples = [];
    this.obstacles = [];
    this.points = 0;
    this.bestScore = 0;
    this.oldBestScore = 0;
    this.level = level.toLowerCase();
    this.startSpeed = this.startSpeed();
    this.currentSpeed = this.startSpeed;
    this.field = new Field(this.width, this.height, this.gridSize, this.offsetX, this.offsetY, this.border);
    this.snake = new Snake(this.field, this.length, this.gridSize, this.offsetX, this.offsetY);
    this.stats = stats(width, height, gridSize, offsetX, offsetY, border);
  }

  startSpeed() {
    switch (this.level) {
      case 'easy':
        return 225;
      case 'medium':
        return 200;
      case 'hard':
        return 175;
    }
  }

  isValidMove(x, y) {
    if (x >= this.field.width || y >= this.field.height || x < 0 || y < 0) {
      return false
    }

    for (let i = 1; i < this.snake.elements.length; i++) {
      if (x == this.snake.elements[i].x && y == this.snake.elements[i].y) {
        return false
      }
    }

    for (let i = 0; i < this.obstacles.length; i++) {
      if (x == this.obstacles[i].x && y == this.obstacles[i].y) {
        return false
      }
    }
    return true
  }

  gameLoop = () => {
    this.checkKeys();
    const nextPosition = this.snake.getNextPosition();
    const x = nextPosition[0];
    const y = nextPosition[1];

    if (this.isValidMove(x, y)) {
      this.snake.move(x, y, this.gridSize, this.offsetX, this.offsetY);
    } else {
      this.gameOver();
      return
    }
    
    if (this.snake.elements[0].x == this.apples[0].x && this.snake.elements[0].y == this.apples[0].y) {
      this.removeApple();
    }
  }

  removeApple() {
    this.apples.shift().div.remove();
    this.createApple();
    this.createObstacle();
    this.updateStats();
    this.snake.length++;

    if (this.points % 2 == 0) {
      this.accelerateSnake();
    }
  }

  accelerateSnake() {
    clearInterval(this.interval);

    if (this.level == 'easy') {
      this.currentSpeed -= 3;
    } else if (this.level == 'medium') {
      this.currentSpeed -= 5;
    } else if (this.level == 'hard') {
      this.currentSpeed -= 7;
    }
    
    this.interval = setInterval(this.gameLoop, this.currentSpeed);
  }

  updateStats() {
    this.points++;
    this.stats.pPoints.innerHTML = `Current score: ${this.points}`;

    if (this.points > this.bestScore) {
      this.bestScore = this.points;
      this.stats.pBestScore.innerHTML = `Best score: ${this.bestScore}`
    }
  }

  createObstacle() {
    let x = 0;
    let y = 0;
    
    let valid = [];
    let isValid = true;

    do {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);

      let snakeHead = this.snake.elements[0]

      let xDifference = randomX - this.snake.elements[0].x;
      let yDifference = randomY - this.snake.elements[0].y;
      
      for (let i = 0; i < this.snake.elements.length; i++) {
        if (randomX === this.snake.elements[i].x && randomY === this.snake.elements[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }
      
      if (xDifference > -3 && xDifference < 3 && yDifference > -3 && yDifference < 3) {
        valid.push(false);
      } else {
        valid.push(true);
      }
      
      for (let i = 0; i < this.apples.length; i++){
        if (randomX === this.apples[i].x && randomY === this.apples[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }

      for (let i = 0; i < this.obstacles.length; i++) {
        if (randomX === this.obstacles[i].x && randomY === this.obstacles[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }

      for (let i = 0; i < valid.length; i++) {
        if (valid[i] == false) {
          valid.length = 0;
          isValid = false;
          break;
        } else {
          isValid = true;
        }
      }
      
      x = randomX;
      y = randomY;
    } while (isValid === false)
    
    valid.length = 0;

    const div = document.createElement('div');
    div.className = 'obstacle';  

    div.style.left = this.offsetX + this.gridSize * x + 'px';
    div.style.top = this.offsetY + this.gridSize * y + 'px';
    div.style.width = this.gridSize + 'px';
    div.style.height = this.gridSize + 'px';

    document.body.append(div);

    const obstacle = {
      div: div,
      x: x,
      y: y,
    };

    this.obstacles.push(obstacle);
  }

  createApple() {    
    let x = 0;
    let y = 0;
    
    let valid = [];
    let isValid = true;

    do {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);

      for (let i = 0; i < this.snake.elements.length; i++) {
        if (randomX == this.snake.elements[i].x && randomY == this.snake.elements[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }

      for (let i = 0; i < this.obstacles.length; i++) {
        if (randomX == this.obstacles[i].x && randomY == this.obstacles[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }

      for (let i = 0; i < valid.length; i++) {
        if (valid[i] == false) {
          valid.length = 0;
          isValid = false;
          break;
        } else {
          isValid = true;
        }
      }

      x = randomX;
      y = randomY;
    } while (isValid == false)

    valid.length = 0;
    
    const div = document.createElement('div');
    div.className = 'apple';  

    div.style.left = this.offsetX + this.gridSize * x + 'px';
    div.style.top = this.offsetY + this.gridSize * y + 'px';
    div.style.width = this.gridSize + 'px';
    div.style.height = this.gridSize + 'px';

    document.body.append(div);

    const apple = {
      div: div,
      x: x,
      y: y,
    };

    this.apples.push(apple);
  }
  
  handleKeyPress = (e) => {
    if (this.keys.length >= 2) {
      return
    }

    if (this.snake.direction == Snake.UP && this.keys[0] == 'ArrowUp' ||
    this.snake.direction == Snake.DOWN && this.keys[0] == 'ArrowDown' ||
    this.snake.direction == Snake.LEFT && this.keys[0] == 'ArrowLeft' ||
    this.snake.direction == Snake.RIGHT && this.keys[0] == 'ArrowRight') {
      this.keys.shift();
    }
    
    this.keys.push(e.key);
  }

  checkKeys() {
    if (this.keys.length === 0) {
      return
    }
    const key = this.keys.shift();
    const direction = this.snake.direction;
    if (key == 'ArrowUp' && direction != Snake.DOWN) {
      this.snake.direction = Snake.UP;
    } else if (key == 'ArrowDown' && direction != Snake.UP) {
      this.snake.direction = Snake.DOWN;
    } else if (key == 'ArrowLeft' && direction != Snake.RIGHT) {
      this.snake.direction = Snake.LEFT;
    } else if (key == 'ArrowRight' && direction != Snake.LEFT) {
      this.snake.direction = Snake.RIGHT;
    }
  }

  gameOver() {
    const fieldHeight = this.height * this.gridSize;
    if (fieldHeight <= 170) {
      this.stats.gameOverMessage.style.fontSize = '26px';
    }

    if (this.points > this.oldBestScore) {
      this.oldBestScore = this.points;
      this.newRecord();
    } else {
      this.youLoose();
    }

    for (let i = 0; i < this.snake.elements.length; i++) {
      this.snake.elements[i].div.style.background = '#7db87d';
    }
   
    clearInterval(this.interval);
    this.enablePlayButton();
  }

  youLoose = () => {
    this.stats.gameOverMessage.innerHTML = `You lose <br> :(`;
    this.stats.gameOverMessage.style.display = 'flex';
  }

  newRecord() {
    this.stats.gameOverMessage.innerHTML = `New record ${this.points} points`;
    if (this.points == 1) {
      this.stats.gameOverMessage.innerHTML = `New record ${this.points} point`;
    }
    this.stats.gameOverMessage.style.display = 'flex';
  }

  enablePlayButton() {
    const button = this.stats.button;
    button.addEventListener('click', this.start);
    button.disabled = false;
    button.innerHTML = 'Play again';
  }

  disablePlayButton() {
    const button = this.stats.button;
    button.removeEventListener('click', this.start);
    button.disabled = true;
    button.innerHTML = 'Good luck!';
  }

  start = () => {
    for (let i = 0; i < this.snake.elements.length; i++) {
      this.snake.elements[i].div.remove();
    }
    if (this.apples.length > 0) {
      this.apples.shift().div.remove();
    }
    for (let i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].div.remove();
    }
    this.length = this.startLength;
    this.snake = new Snake(this.field, this.length, this.gridSize, this.offsetX, this.offsetY);
    this.points = 0;
    this.keys = [];
    this.obstacles = [];
    this.stats.pPoints.innerHTML = `Current score: ${this.points}`;
    document.getElementsByClassName('game-over-message')[0].style = 'none';
    this.currentSpeed = this.startSpeed;
    this.interval = setInterval(this.gameLoop, this.startSpeed);
    this.disablePlayButton();
    document.addEventListener('keydown', this.handleKeyPress);
    this.createApple();
    this.createObstacle();
  }
}

const game = new Game(20, 20, 20, 50, 50, 5, 1, 'medium');
game.stats.button.addEventListener('click', game.start);