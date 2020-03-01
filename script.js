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

const field = new Field(10, 20, 30, 40, 50);
const snake = new Snake(field, 3);
console.log(snake.elements);
snake.move();
console.log(snake.elements);
snake.direction = Snake.UP;
snake.move();
console.log(snake.elements);
snake.move();
snake.move();