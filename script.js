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
  constructor(width, height, gridSize, offsetX, offsetY, border, level) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.border = border;
    this.keys = [];
    this.fruits = [];
    this.obstacles = [];
    this.points = 0;
    this.bestScore = 0;
    this.oldBestScore = 0;
    this.removedFruits = 0;
    this.level = level.toLowerCase();
    this.startLength = this.startLength();
    this.length = this.startLength;
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
  
  startLength() {
    switch (this.level) {
      case 'easy':
        return 3;
      case 'medium':
        return 5;
      case 'hard':
        return 10;
    }
  }

  isValidMove(x, y) {
    console.log(this.currentSpeed);
    console.log(this.startLength);
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
    
    for (let i = 0; i < this.fruits.length; i++) {
      if (x == this.fruits[i].x && y == this.fruits[i].y) {
        this.removeFruit(i);
      }
    }
  }

  removeFruit(i) {
    this.removedFruits++;
    this.fruits[i].div.remove();
    let removedFruit = this.fruits.splice([i], 1);

    if (removedFruit[0].name == 'strawberry') {
      clearTimeout(this.strawberryTimeout);
    }

    if (removedFruit[0].name == 'banana') {
      clearTimeout(this.bananaTimeout);
    }

    let value = removedFruit[0].points;    

    if (this.removedFruits % 4 == 0) {
      this.createStrawberry();
    } else if (this.removedFruits % 7 == 0) {
      this.createBanana();
    } else {
      this.createApple();
    }
    this.createObstacle();
    this.updateStats(value);
    this.snake.length++;

    if (this.removedFruits % 2 == 0) {
      this.accelerateSnake();
    }
  }

  accelerateSnake() {
    clearInterval(this.interval);

    if (this.level == 'easy') {
      this.currentSpeed -= 2;
    } else if (this.level == 'medium') {
      this.currentSpeed -= 4;
    } else if (this.level == 'hard') {
      this.currentSpeed -= 6;
    }
    
    this.interval = setInterval(this.gameLoop, this.currentSpeed);
  }

  updateStats(value) {
    this.points += value;
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
      
      for (let i = 0; i < this.fruits.length; i++){
        if (randomX === this.fruits[i].x && randomY === this.fruits[i].y) {
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

  createFruit() {    
    let x = 0;
    let y = 0;
    
    let valid = [];
    let isValid = true;

    do {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);

      for (let i = 0; i < this.fruits.length; i++) {
        if (randomX == this.fruits[i].x && randomY == this.fruits[i].y) {
          valid.push(false);
          break;
        } else {
          valid.push(true);
        }
      }

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
    document.body.append(div);

    const fruit = {
      div: div,
      x: x,
      y: y,
    };
    
    return fruit;
  }

  createApple() {
    let apple = this.createFruit();

    apple.div.className = 'apple';
    apple.div.style.left = this.offsetX + this.gridSize * apple.x + 'px';
    apple.div.style.top = this.offsetY + this.gridSize * apple.y + 'px';
    apple.div.style.width = this.gridSize + 'px';
    apple.div.style.height = this.gridSize + 'px';

    apple.name = 'apple';
    apple.points = 1;

    this.fruits.push(apple);
  }

  createStrawberry() {
    let strawberry = this.createFruit();

    strawberry.div.className = 'strawberry';
    strawberry.div.style.left = this.offsetX + this.gridSize * strawberry.x + 'px';
    strawberry.div.style.top = this.offsetY + this.gridSize * strawberry.y + 'px';
    strawberry.div.style.width = this.gridSize + 'px';
    strawberry.div.style.height = this.gridSize + 'px';

    strawberry.name = 'strawberry';
    strawberry.points = 3;

    this.fruits.push(strawberry);

    this.strawberryTimeout = setTimeout(this.removeSpecialFruit, 5000)
  }

  createBanana() {
    let banana = this.createFruit();

    banana.div.className = 'banana';
    banana.div.style.left = this.offsetX + this.gridSize * banana.x + 'px';
    banana.div.style.top = this.offsetY + this.gridSize * banana.y + 'px';
    banana.div.style.width = this.gridSize + 'px';
    banana.div.style.height = this.gridSize + 'px';

    banana.name = 'banana';
    banana.points = 5;

    this.fruits.push(banana);

    this.bananaTimeout = setTimeout(this.removeSpecialFruit, 3000)
  }

  removeSpecialFruit = () => {
    this.createApple();
    for (let i = 0; i < this.fruits.length; i++) {
      if (this.fruits[i].name == 'strawberry') {
        this.fruits[i].div.remove();
        this.fruits.splice([i], 1);
      }
      if (this.fruits[i].name == 'banana') {
        this.fruits[i].div.remove();
        this.fruits.splice([i], 1);
      }
    }
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
    clearTimeout(this.bananaTimeout);
    clearTimeout(this.strawberryTimeout);
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

    for (let i = 0; i < this.fruits.length; i++) {
      this.fruits[i].div.remove();
    }

    for (let i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].div.remove();
    }
    this.length = this.startLength;
    this.snake = new Snake(this.field, this.length, this.gridSize, this.offsetX, this.offsetY);
    this.points = 0;
    this.keys = [];
    this.obstacles = [];
    this.fruits = [];
    this.removedFruits = 0;
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

const game = new Game(20, 20, 35, 50, 50, 1, 'hard');
game.stats.button.addEventListener('click', game.start);