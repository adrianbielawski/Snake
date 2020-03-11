class Field {
  constructor(width, height, gridSize, offsetX, offsetY) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    const div = this.render('field', 0, 0, width, height);
  }

  render(className, x, y, w = 1, h = 1) {
    const div = document.createElement('div');
    div.className = className;

    div.style.left = this.offsetX + this.gridSize * x + 'px';
    div.style.top = this.offsetY + this.gridSize * y + 'px';
    div.style.width = this.gridSize * w +'px';
    div.style.height = this.gridSize * h + 'px';

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

  constructor(field, length) {
    this.field = field;
    this.length = length;
    this.direction = Snake.RIGHT;
    this.elements = [];
    this.createElement(
      Math.floor(field.width / 2),
      Math.floor(field.height / 2),
    );

    this.move = this.move.bind(this);
  }

  createElement(x, y) {
    const div = this.field.render('snake-element', x, y);

    this.elements.unshift({
      x: x,
      y: y,
      div: div,
    });
  }

  move() {
    game.checkKeys();

    const delta = Snake.DELTAS[this.direction];
    const x = this.elements[0].x + delta.x;
    const y = this.elements[0].y + delta.y;
    
    if (game.snake.elements[0].x == game.apples[0].x && game.snake.elements[0].y == game.apples[0].y) {
      game.removeApple();
      game.removeObstacle();

    }
    
    if (x >= game.field.width || y == game.field.height || x < 0 || y < 0) {
      game.gameOver();
      return
    }

    this.createElement(x, y);

    if (this.elements.length > this.length) {
      const last = this.elements.pop();
      last.div.remove();
    }
  }
}

const stats = (width, height, gridSize, offsetX, offsetY) => {

  const statsDiv = document.createElement('div');
  const statsWidth = width * gridSize;
  const statsTop = height * gridSize + offsetY;
  statsDiv.className = 'stats';
  statsDiv.style.width = `${statsWidth}px`;
  statsDiv.style.top = `${statsTop}px`;
  statsDiv.style.left = `${offsetX}px`;

  const pPoints = document.createElement('p');
  pPoints.className = 'points';
  pPoints.innerHTML = `Current score: 0`;

  const pBestScore = document.createElement('p');
  pBestScore.className = 'best-score';
  pBestScore.innerHTML = 'Best score: 0';

  const playButton = document.createElement('div');
  playButton.className = 'play-button';
  playButton.innerHTML = 'Start new game';
 
  statsDiv.appendChild(pPoints);
  statsDiv.appendChild(pBestScore);
  statsDiv.appendChild(playButton);

  document.body.append(statsDiv);

  const stats = {
    stats: statsDiv,
    pPoints: pPoints,
    pBestScore: pBestScore,
    playButton: playButton
  }
  return stats;
}

class Game {
  constructor(width, height, gridSize, offsetX, offsetY, snakeLength) {
    this.width = width;
    this.height = height;
    this.gridSize = gridSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.length = snakeLength;
    this.keys = [];
    this.apples = [];
    this.obstacles = [];
    this.points = 0;
    this.bestScore = 0;
    this.field = new Field(this.width, this.height, this.gridSize, this.offsetX, this.offsetY);
    this.snake = new Snake(this.field, this.length);
    this.stats = stats(width, height, gridSize, offsetX, offsetY);

    this.start = this.start.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  removeApple() {
    this.apples.shift().div.remove();
    this.createApple();
    this.updateStats();
  }

  removeObstacle() {
    this.obstacles.shift().div.remove();
    this.createObstruction();
    this.updateStats();
  }

  updateStats() {
    this.points++;
    this.stats.pPoints.innerHTML = `Current score: ${this.points}`;

    if (this.points > this.bestScore) {
      this.bestScore = this.points;
      this.stats.pBestScore.innerHTML = `Best score: ${this.bestScore}`
    }
  }

  createApple() {
    let x = 0;
    let y = 0;
    
    let isValid = true;

    do {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);
      for (let i = 0; i < this.snake.elements.length; i++) {
        if (randomX === this.snake.elements[i].x && randomY === this.snake.elements[i].y) {
          isValid = false;
          break;
        } else {
          isValid = true;
        }
      }
      x = randomX;
      y = randomY;
    } while (isValid === false)

    const div = this.field.render('apple', x, y);
    document.body.append(div);

    const apple = {
      div: div,
      x: x,
      y: y,
    };

    this.apples.push(apple);
  }

  createObstruction() {
    let x = 0;
    let y = 0;
    
    let isValid = true;

    do {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);
      for (let i = 0; i < this.snake.elements.length; i++) {
        if (randomX === this.snake.elements[i].x && randomY === this.snake.elements[i].y) {
          isValid = false;
          break;
        } else {
          isValid = true;
        }
      }
      x = randomX;
      y = randomY;
    } while (isValid === false)

    const div = this.field.render('obstacle', x, y);
    document.body.append(div);

    const obstacle = {
      div: div,
      x: x,
      y: y,
    };

    this.obstacles.push(obstacle);
  }
  
  handleKeyPress(e) {
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
    clearInterval(this.interval);
  }

  inactivePlayButton() {
    const button = this.stats.playButton;
    button.removeEventListener('click', game.start);
    button.style.color = '#f00';
    button.innerHTML = 'Good luck!';
    button.style.cursor = 'default';
  }

  start() {
    this.interval = setInterval(this.snake.move, 200);
    this.inactivePlayButton();
    document.addEventListener('keydown', this.handleKeyPress);
    this.createApple();
    this.createObstruction();
  }
}

const game = new Game(15, 15, 30, 50, 50, 3);
game.stats.playButton.addEventListener('click', game.start);