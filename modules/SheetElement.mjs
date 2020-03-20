/* eslint-disable import/extensions */
import { spriteSize, mapWidth, mapHeight } from '../config.mjs';
import Sprite from './Sprite.mjs';

export default class SheetElement extends Sprite {
  constructor(row, col, sprites) {
    super(row, col, sprites);

    if (this.sheetCol >= 16) {
      this.canvas.style.left = `${(this.sheetCol - 16) * 53}px`;
    } else {
      this.canvas.style.left = `${this.sheetCol * 53}px`;
    }
    if (this.sheetCol >= 16) {
      this.canvas.style.top = `${20 * 53 + 22 + this.sheetRow * 53}px`;
    } else {
      this.canvas.style.top = `${22 + this.sheetRow * 53}px`;
    }
    this.canvas.onmousedown = () => this.setSprite(sprites);
  }

  setSprite(sprites) {
    const selected = window.mapElement.children.filter((el) => el.selected);
    const automat = document.getElementById('automat').checked;

    if (selected.length > 0 && automat) {
      let lowestRow = 0;
      let lowestCol = 0;
      for (let i = 0; i < selected.length; i += 1) {
        const row = selected[i].mapRow;
        const col = selected[i].mapCol;
        if (row > lowestRow || (row === lowestRow && col > lowestCol)) {
          lowestRow = row;
          lowestCol = col;
        }
      }

      selected.forEach((element) => element.deselect());
      if (lowestCol < mapWidth - 1) {
        const element = window.mapElement.children.find(
          (el) => el.mapRow === lowestRow && el.mapCol === lowestCol + 1,
        );
        element.select();
      } else if (lowestRow < mapHeight - 1) {
        const element = window.mapElement.children.find(
          (el) => el.mapRow === lowestRow + 1 && el.mapCol === 0,
        );
        element.select();
      }
    }

    selected.forEach((element) => {
      element.setSheetCol(this.sheetCol);
      element.setSheetRow(this.sheetRow);

      element.canvas.getContext('2d').drawImage(
        sprites,
        this.sheetCol * (spriteSize + 1) + 1, this.sheetRow * spriteSize + (this.sheetRow + 1),
        this.canvas.width, this.canvas.height, 0, 0,
        this.canvas.width, this.canvas.height,
      );
    });

    window.mapElement.addCurrentToHistory();
  }
}
