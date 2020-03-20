/* eslint-disable import/extensions */
import SheetElement from './SheetElement.mjs';

export default class SpriteSheet {
  constructor(rows, cols) {
    this.items = document.getElementById('items');
    const sprites = new Image();
    sprites.src = './sprites.png';
    sprites.onload = () => {
      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const sprite = new SheetElement(i, j, sprites);
          this.items.appendChild(sprite.canvas);
        }
      }
      for (let i = 0; i < cols; i += 1) {
        for (let j = 0; j < rows; j += 1) {
          const sprite = new SheetElement(i, 16 + j, sprites);
          this.items.appendChild(sprite.canvas);
        }
      }
    };
  }
}
