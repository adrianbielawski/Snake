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
  }

  createElement(x, y) {
    const div = this.field.render('snake-element', x, y);

    this.elements.unshift({
      x: x,
      y: y,
      div: div,
    });
  }

  move = () => {
    game.checkKeys();

    const delta = Snake.DELTAS[this.direction];
    const x = this.elements[0].x + delta.x;
    const y = this.elements[0].y + delta.y;
    
    if (game.snake.elements[0].x == game.apples[0].x && game.snake.elements[0].y == game.apples[0].y) {
      game.removeApple();
    }
    
    if (x >= game.field.width || y == game.field.height || x < 0 || y < 0) {
      game.gameOver();
      return
    }

    for (let i = 1; i < game.snake.elements.length; i++) {
      if (x  === game.snake.elements[i].x && y  === game.snake.elements[i].y) {
        game.gameOver();
        return
      }
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
  
  const gameOverMessage = document.createElement('p');
  const field = document.body.getElementsByClassName('field')[0];
  gameOverMessage.className = 'game-over-message';
  gameOverMessage.style.display = 'none';
  
  field.appendChild(gameOverMessage);
  statsDiv.appendChild(pPoints);
  statsDiv.appendChild(pBestScore);
  statsDiv.appendChild(playButton);

  document.body.append(statsDiv);

  const stats = {
    stats: statsDiv,
    pPoints: pPoints,
    pBestScore: pBestScore,
    playButton: playButton,
    gameOverMessage: gameOverMessage
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
    this.startLength = snakeLength;
    this.length = snakeLength;
    this.keys = [];
    this.apples = [];
    this.points = 0;
    this.bestScore = 0;
    this.oldBestScore = 0;
    this.field = new Field(this.width, this.height, this.gridSize, this.offsetX, this.offsetY);
    this.snake = new Snake(this.field, this.length);
    this.stats = stats(width, height, gridSize, offsetX, offsetY);
  }

  removeApple() {
    this.apples.shift().div.remove();
    this.createApple();
    this.updateStats();
    this.snake.length++;
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
  
  handleKeyPress = (e) => {
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
    this.activePlayButton();
  }

  youLoose() {
    this.stats.gameOverMessage.innerHTML = 'You lose :(';
    this.stats.gameOverMessage.style.display = 'flex';
  }

  newRecord() {
    this.stats.gameOverMessage.innerHTML = `New record ${this.points} points`;
    this.stats.gameOverMessage.style.display = 'flex';
  }

  activePlayButton() {
    const button = this.stats.playButton;
    button.addEventListener('click', this.start);
    button.style.color = '#000';
    button.innerHTML = 'Play again';
    button.style.cursor = 'pointer';
  }

  inactivePlayButton() {
    const button = this.stats.playButton;
    button.removeEventListener('click', this.start);
    button.style.color = '#f00';
    button.innerHTML = 'Good luck!';
    button.style.cursor = 'default';
  }

  start = () => {
    for (let i = 0; i < this.snake.elements.length; i++) {
      this.snake.elements[i].div.remove();
    }
    if (this.apples.length > 0) {
      this.apples.shift().div.remove();
    }
    this.length = this.startLength;
    this.snake = new Snake(this.field, this.length);
    this.points = 0;
    this.stats.pPoints.innerHTML = `Current score: ${this.points}`;
    document.getElementsByClassName('game-over-message')[0].style = 'none';
    this.interval = setInterval(this.snake.move, 200);
    this.inactivePlayButton();
    document.addEventListener('keydown', this.handleKeyPress);
    this.createApple();
  }
}

const game = new Game(15, 15, 30, 50, 50, 15);
game.stats.playButton.addEventListener('click', game.start);