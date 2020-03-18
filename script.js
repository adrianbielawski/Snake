class Field {
  constructor(fieldSize, snakeSize, offsetX, offsetY, border) {
    this.fieldSize = fieldSize;
    this.snakeSize = snakeSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.border = border;
    this.div = this.render();
  }

  render() {
    const div = document.createElement('div');
    div.className = 'field';

    div.style.left = this.offsetX - this.border + 'px';
    div.style.top = this.offsetY - this.border + 'px';
    div.style.width = this.snakeSize * this.fieldSize +'px';
    div.style.height = this.snakeSize * this.fieldSize + 'px';
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

  constructor(field, length, snakeSize, offsetX, offsetY) {
    this.field = field;
    this.length = length;
    this.snakeSize = snakeSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.direction = Snake.RIGHT;
    this.elements = [];
    this.createElement(
      Math.floor(field.fieldSize / 2),
      Math.floor(field.fieldSize / 2),
      snakeSize, offsetX, offsetY
    );
  }
  createElement = (x, y, snakeSize, offsetX, offsetY) => {
    const div = document.createElement('div');
    div.className = 'snake-element';  

    div.style.left = offsetX + snakeSize * x + 'px';
    div.style.top = offsetY + snakeSize * y + 'px';
    div.style.width = snakeSize + 'px';
    div.style.height = snakeSize + 'px';

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

  move = (x, y, snakeSize, offsetX, offsetY) => {
    this.createElement(x, y, snakeSize, offsetX, offsetY);

    if (this.elements.length > this.length) {
      const last = this.elements.pop();
      last.div.remove();
    }
  }
}

class Stats {
  constructor(fieldSize, snakeSize, offsetX, offsetY, border, statsHeight) {
    this.fieldSize = fieldSize;
    this.snakeSize = snakeSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.border = border;
    this.statsHeight = statsHeight;
    this.stats = this.createStats();
  }

  createStats() {
    const statsWidth = this.fieldSize * this.snakeSize;
    const statsTop = this.fieldSize * this.snakeSize + this.offsetY;

    this.statsDiv = document.createElement('div');
    this.statsDiv.className = 'stats';
    this.statsDiv.style.width = `${statsWidth}px`;
    this.statsDiv.style.top = `${statsTop}px`;
    this.statsDiv.style.left = this.offsetX - this.border + 'px';
    this.statsDiv.style.border = `${this.border}px solid #000`;
    this.statsDiv.style.height = `${this.statsHeight}px`;

    this.scores = document.createElement('div');
    this.scores.className = 'scores';
  
    this.pPoints = document.createElement('p');
    this.pPoints.className = 'points';
    this.pPoints.innerHTML = `Current score: 0`;
  
    this.pBestScore = document.createElement('p');
    this.pBestScore.className = 'best-score';
    this.pBestScore.innerHTML = 'Best score: 0';

    this.button = document.createElement('button');
    this.button.className = 'button';
    this.button.innerHTML = 'Start new game';
    
    this.gameOverMessage = document.createElement('p');
    this.gameOverMessage.className = 'game-over-message';
    this.gameOverMessage.style.display = 'none';
    
    this.arrowButtonsDiv = document.createElement('div');
    this.arrowButtonsDiv.className = 'arrow-buttons';

    this.upButton = document.createElement('div');
    this.upButton.className = 'up-button';
    this.upButton.innerHTML = `<i class="fas fa-arrow-up"></i>`;

    this.downButton = document.createElement('div');
    this.downButton.className = 'down-button';
    this.downButton.innerHTML = `<i class="fas fa-arrow-down"></i>`;

    this.leftButton = document.createElement('div');
    this.leftButton.className = 'left-button';
    this.leftButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;

    this.rightButton = document.createElement('div');
    this.rightButton.className = 'right-button';
    this.rightButton.innerHTML = `<i class="fas fa-arrow-right"></i>`;
    
    this.field = document.body.getElementsByClassName('field')[0];
    
    this.field.appendChild(this.gameOverMessage);
    this.scores.appendChild(this.pPoints);
    this.scores.appendChild(this.pBestScore);
    this.arrowButtonsDiv.appendChild(this.upButton);
    this.arrowButtonsDiv.appendChild(this.downButton);
    this.arrowButtonsDiv.appendChild(this.leftButton);
    this.arrowButtonsDiv.appendChild(this.rightButton);
    this.statsDiv.appendChild(this.scores);
    this.statsDiv.appendChild(this.button);
    this.statsDiv.appendChild(this.arrowButtonsDiv);
    document.body.append(this.statsDiv);
  }
}

class Game {
  constructor(userName) {
    this.level = document.getElementById('level').value;
    this.fieldSize = document.getElementById('field-size').value;
    this.userName = userName;
    this.margin = 10;
    this.border = 1
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.snakeSize = this.getSnakeSize();
    this.offsetX = (this.screenWidth - this.fieldSize * this.snakeSize) / 2;
    this.offsetY = 2;
    this.statsHeight = this.getStatsHeight();
    this.settings = document.getElementById('settings');
    this.removeSettings = settings.remove();
    this.keys = [];
    this.slides = [];
    this.fruits = [];
    this.obstacles = [];
    this.points = 0;
    this.bestScore = 0;
    this.oldBestScore = 0;
    this.removedFruits = 0;
    this.startLength = this.startLength();
    this.length = this.startLength;
    this.startSpeed = this.startSpeed();
    this.currentSpeed = this.startSpeed;
    this.field = new Field(this.fieldSize, this.snakeSize, this.offsetX, this.offsetY, this.border);
    this.snake = new Snake(this.field, this.length, this.snakeSize, this.offsetX, this.offsetY);
    this.stats = new Stats(this.fieldSize, this.snakeSize, this.offsetX, this.offsetY, this.border, this.statsHeight);
    this.listenResize = window.addEventListener('resize', this.calculateStatsHeight);
  }

  calculateStatsHeight = () => {
    this.screenHeight = window.innerHeight;
    this.newHeight = this.getStatsHeight();
    this.stats.statsDiv.style.height = `${this.newHeight}px`;
  }

  getSnakeSize() {
    if (this.screenWidth < 800) {
      return (this.screenWidth - this.margin) / this.fieldSize;
    } else {
      return 25;
    }
  }  

  getStatsHeight() {
    if (this.screenWidth < 800) {
      return this.screenHeight - (this.fieldSize * this.snakeSize) - (this.offsetY * 2);
    } else {
      return 250;
    }
  }

  startSpeed() {
    switch (this.level) {
      case 'easy':
        return 300;
      case 'medium':
        return 225;
      case 'hard':
        return 200;
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
    if (x >= this.field.fieldSize || y >= this.field.fieldSize || x < 0 || y < 0) {
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
      this.snake.move(x, y, this.snakeSize, this.offsetX, this.offsetY);
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
      const randomX = Math.floor(Math.random() * this.fieldSize);
      const randomY = Math.floor(Math.random() * this.fieldSize);

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

    div.style.left = this.offsetX + this.snakeSize * x + 'px';
    div.style.top = this.offsetY + this.snakeSize * y + 'px';
    div.style.width = this.snakeSize + 'px';
    div.style.height = this.snakeSize + 'px';

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
      const randomX = Math.floor(Math.random() * this.fieldSize);
      const randomY = Math.floor(Math.random() * this.fieldSize);

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
    apple.div.style.left = this.offsetX + this.snakeSize * apple.x + 'px';
    apple.div.style.top = this.offsetY + this.snakeSize * apple.y + 'px';
    apple.div.style.width = this.snakeSize + 'px';
    apple.div.style.height = this.snakeSize + 'px';

    apple.name = 'apple';
    apple.points = 1;

    this.fruits.push(apple);
  }

  createStrawberry() {
    let strawberry = this.createFruit();

    strawberry.div.className = 'strawberry';
    strawberry.div.style.left = this.offsetX + this.snakeSize * strawberry.x + 'px';
    strawberry.div.style.top = this.offsetY + this.snakeSize * strawberry.y + 'px';
    strawberry.div.style.width = this.snakeSize + 'px';
    strawberry.div.style.height = this.snakeSize + 'px';

    strawberry.name = 'strawberry';
    strawberry.points = 3;

    this.fruits.push(strawberry);

    this.strawberryTimeout = setTimeout(this.removeSpecialFruit, 5000)
  }

  createBanana() {
    let banana = this.createFruit();

    banana.div.className = 'banana';
    banana.div.style.left = this.offsetX + this.snakeSize * banana.x + 'px';
    banana.div.style.top = this.offsetY + this.snakeSize * banana.y + 'px';
    banana.div.style.width = this.snakeSize + 'px';
    banana.div.style.height = this.snakeSize + 'px';

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

  handleSlides() {
    if (this.keys.length >= 2) {
      return
    }

    let slideDirection;
    let x = this.slideDistance.x;
    let y = this.slideDistance.y;
    let absX = Math.abs(x);
    let absY = Math.abs(y);

    if (x <= -20 && absY <= 50 ) {
      slideDirection = 'ArrowRight';
    } else if (x >= 20 && absY <= 50 ) {
      slideDirection = 'ArrowLeft';
    } else if (y <= -20 && absX <= 50 ) {
      slideDirection = 'ArrowDown';
    } else if (y >= 20 && absX <= 50 ) {
      slideDirection = 'ArrowUp';
    }
    this.keys.push(slideDirection);
  }

  upButton = () => {
    this.handleArrowButtons('up')
  }
  
  downButton = () => {
    this.handleArrowButtons('down')
  }
  
  leftButton = () => {
    this.handleArrowButtons('left')
  }
  
  rightButton = () => {
    this.handleArrowButtons('right')
  }

  handleArrowButtons = (b) => {
    if (this.keys.length >= 2) {
      return
    }

    let buttonDirection;
    if (b == 'up') {
      buttonDirection = 'ArrowUp';
    } else if (b == 'down') {
      buttonDirection = 'ArrowDown';
    } else if (b == 'left') {
      buttonDirection = 'ArrowLeft';
    } else if (b == 'right') {
      buttonDirection = 'ArrowRight';
    }
    
    this.keys.push(buttonDirection);
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
    const fieldHeight = this.height * this.snakeSize;
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
    this.listenField.removeEventListener('touchstart', this.touchStart);
    this.listenField.removeEventListener('touchend', this.touchEnd);
    this.listenField.removeEventListener('touchmove', this.preventDefaultSlide);
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
    button.innerHTML = `Good luck, ${this.userName}!`;
  }

  touchScreenSteering() {
    this.listenField = document.getElementsByClassName('field')[0];
    this.listenField.addEventListener('touchstart', this.touchStart);
    this.listenField.addEventListener('touchmove', this.preventDefaultSlide)
    this.listenField.addEventListener('touchend', this.touchEnd);
  }

  touchStart = (e) => {
    let touch = e.changedTouches[0];
    this.startX = touch.pageX;
    this.startY = touch.pageY;
  }

  preventDefaultSlide = (e) => {
    e.preventDefault()
  }

  touchEnd = (e) => {
    let touch = e.changedTouches[0];
    this.slideDistance = {};
    this.slideDistance.x = this.startX - touch.pageX;
    this.slideDistance.y = this.startY - touch.pageY;
    this.handleSlides();
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
    this.snake = new Snake(this.field, this.length, this.snakeSize, this.offsetX, this.offsetY);
    this.points = 0;
    this.keys = [];
    this.obstacles = [];
    this.fruits = [];
    this.removedFruits = 0;
    this.stats.pPoints.innerHTML = `Current score: ${this.points}`;
    this.currentSpeed = this.startSpeed;
    this.interval = setInterval(this.gameLoop, this.startSpeed);
    this.disablePlayButton();
    this.createApple();
    this.createObstacle();
    document.getElementsByClassName('game-over-message')[0].style = 'none';
    document.addEventListener('keydown', this.handleKeyPress);
    this.stats.upButton.addEventListener('click', this.upButton);
    this.stats.downButton.addEventListener('click', this.downButton);
    this.stats.leftButton.addEventListener('click', this.leftButton);
    this.stats.rightButton.addEventListener('click', this.rightButton);
    this.touchScreenSteering();
  }
}

const formValidation = () => {  
  const userName = document.getElementById('user-name').value;
  
  if (userName.length < 3) {
    return
  }
  const game = new Game(userName);
  game.stats.button.addEventListener('click', game.start);
}

const submit = document.getElementById('submit');
const listenSubmit = submit.addEventListener('click', formValidation);
