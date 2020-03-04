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
    div.style.width = this.gridSize * w + 'px';
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

    this.createElement = this.createElement.bind(this);
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
    const delta = Snake.DELTAS[this.direction];
    const x = this.elements[0].x + delta.x;
    const y = this.elements[0].y + delta.y;

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
  pPoints.innerHTML = 'Current score: 0';

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
    stats: statsDiv
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
    this.field = new Field(this.width, this.height, this.gridSize, this.offsetX, this.offsetY);
    this.snake = new Snake(this.field, this.length);
    this.stats = stats(width, height, gridSize, offsetX, offsetY);
    this.playButton = document.getElementsByClassName('play-button')[0];

    this.start = this.start.bind(this);
  }

  inactivePlayButton() {
    game.playButton.removeEventListener('click', game.start);
    this.playButton.style.color = '#f00';
    this.playButton.innerHTML = 'Good luck!';
    this.playButton.style.cursor = 'default';
  }

  start() {
    this.interval = setInterval(this.snake.move, 200);
    this.inactivePlayButton();
  }
}

const game = new Game(15, 15, 30, 50, 50, 3);
game.playButton.addEventListener('click', game.start);