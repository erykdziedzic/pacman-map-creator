/* eslint-disable import/extensions */
import { spriteSize } from '../config.mjs';

export default class Sprite {
  constructor(row, col, sprites) {
    this.sheetRow = row;
    this.sheetCol = col;
    this.sprites = sprites;
    this.canvas = document.createElement('canvas');
    this.canvas.width = spriteSize;
    this.canvas.height = spriteSize;
    this.canvas.className = 'sprite';
    this.canvas.style.position = 'absolute';
    this.draw(row, col, sprites);
  }

  draw(row, col, sprites) {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(
      sprites,
      col * (spriteSize + 1) + 1, row * spriteSize + (row + 1),
      this.canvas.width, this.canvas.height, 0, 0,
      this.canvas.width, this.canvas.height,
    );
  }

  setSheetRow(row) {
    this.sheetRow = row;
  }

  setSheetCol(col) {
    this.sheetCol = col;
  }
}
