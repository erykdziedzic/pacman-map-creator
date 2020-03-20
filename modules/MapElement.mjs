/* eslint-disable import/extensions */
import Sprite from './Sprite.mjs';

export default class MapElement extends Sprite {
  constructor(mapRow, mapCol, sprites, sheetRow = 12, sheetCol = 29) {
    super(sheetRow, sheetCol, sprites);
    this.mapRow = mapRow;
    this.mapCol = mapCol;
    this.canvas.style.left = `${mapCol * 53}px`;
    this.canvas.style.top = `${22 + mapRow * 53}px`;
    this.canvas.id = `element_${mapRow}_${mapCol}`;
    this.selected = false;
    this.insideBox = false;
    this.pasting = false;
    this.copiedRow = undefined;
    this.copiedCol = undefined;

    this.canvas.onclick = () => this.toggleSelection();
  }

  toggleSelection() {
    if (this.selected) {
      this.deselect();
    } else {
      this.select();
    }
  }

  selectBox() {
    this.insideBox = true;
    this.canvas.classList.add('selected');
  }

  deselectBox() {
    this.insideBox = false;
    this.canvas.classList.remove('selected');
  }

  select() {
    this.selected = true;
    this.canvas.classList.add('selected');
  }

  deselect() {
    this.selected = false;
    this.canvas.classList.remove('selected');
  }

  delete() {
    this.sheetRow = 12;
    this.sheetCol = 29;
    this.draw(this.sheetRow, this.sheetCol, this.sprites);
  }

  showCopied(element) {
    this.pasting = true;
    this.canvas.classList.add('pasting');
    this.copiedRow = element.sheetRow;
    this.copiedCol = element.sheetCol;
    this.draw(this.copiedRow, this.copiedCol, this.sprites);
  }

  hideCopied() {
    this.pasting = false;
    this.canvas.classList.remove('pasting');
    this.copiedRow = undefined;
    this.copiedCol = undefined;
    this.draw(this.sheetRow, this.sheetCol, this.sprites);
  }

  paste() {
    this.pasting = false;
    this.canvas.classList.remove('pasting');
    this.sheetRow = this.copiedRow;
    this.sheetCol = this.copiedCol;
    this.copiedRow = undefined;
    this.copiedCol = undefined;
  }
}
