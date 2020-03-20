/* eslint-disable import/extensions */
import MapElement from './MapElement.mjs';

export default class Map {
  constructor(width, height) {
    this.selecting = false;
    this.pasting = false;
    this.selectionBoxStartX = null;
    this.selectionBoxStartY = null;
    this.selectionBoxHeight = null;
    this.selectionBoxWidth = null;

    this.mouseX = undefined;
    this.mouseY = undefined;

    this.width = width;
    this.height = height;
    this.element = document.getElementById('map');
    this.history = [];
    this.historyFlag = -1;
    this.children = [];
    this.multiple = false;
    this.copied = undefined;
    this.lastHovered = { row: undefined, col: undefined };

    this.sprites = new Image();
    this.sprites.src = './sprites.png';
    this.sprites.onload = () => {
      for (let i = 0; i < this.width; i += 1) {
        for (let j = 0; j < this.height; j += 1) {
          const element = new MapElement(j, i, this.sprites);
          this.children.push(element);
          this.element.appendChild(element.canvas);
        }
      }
      this.history.push(JSON.stringify(this.children));
      this.historyFlag += 1;
    };

    document.body.onkeydown = (e) => {
      if (e.keyCode === 27) { // escape
        const [menu] = document.getElementsByClassName('menu');
        if (menu) menu.remove();
        const [overlay] = document.getElementsByClassName('overlay');
        if (overlay) overlay.remove();
        if (this.pasting) this.cancelPasting();
      }

      if (e.which === 17) this.multiple = true; // ctrl
      if (e.which === 90 && e.ctrlKey) this.undo(); // ctrl + z
      if (e.which === 89 && e.ctrlKey) this.redo(); // ctrl + y
      if (e.which === 67 && e.ctrlKey) this.copy(); // ctrl + c
      if (e.which === 88 && e.ctrlKey) this.cut(); // ctrl + x
      if (e.which === 86 && e.ctrlKey) this.startPasting(); // ctrl + v
      if (e.which === 83 && e.ctrlKey) { e.preventDefault(); this.save(); } // ctrl + s
      if (e.which === 76 && e.ctrlKey) this.load(); // ctrl + l

      if (e.which === 46) this.delete(); // del
    };

    document.body.onkeyup = (e) => {
      if (e.which === 17) this.multiple = false;
    };

    this.element.onmousedown = () => {
      this.selecting = true;
      if (!this.multiple) {
        this.children.filter((e) => e.selected).forEach((el) => el.deselect());
      }
      if (this.pasting) this.paste();
    };

    document.body.onmouseup = () => {
      this.children.filter((e) => e.insideBox).forEach((el) => {
        el.deselectBox();
        el.select();
      });

      this.selecting = false;
      const box = document.getElementById('selectionBox');
      if (box) {
        box.remove();
      }
    };

    this.element.onmousemove = (e) => {
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
      this.drawSelectionRect(e);
      this.updateCopied();
    };

    this.element.oncontextmenu = (e) => {
      e.preventDefault();
      const menu = document.createElement('div');
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.oncontextmenu = (x) => x.preventDefault();
      menu.className = 'menu';

      const appendOption = (name, shortcut, onclick) => {
        const option = document.createElement('div');
        option.className = 'menuOption';
        option.innerHTML = `<div>${name}</div><div>${shortcut}</div>`;
        option.onclick = onclick;
        menu.appendChild(option);
      };

      appendOption('Undo', 'Ctrl+Z', () => this.undo());
      appendOption('Redo', 'Ctrl+Y', () => this.redo());
      appendOption('Copy', 'Ctrl+C', () => this.copy());
      appendOption('Cut', 'Ctrl+X', () => this.cut());
      appendOption('Paste', 'Ctrl+V', () => this.startPasting());
      appendOption('Save', 'Ctrl+S', () => this.save());
      appendOption('Load', 'Ctrl+L', () => this.load());
      appendOption('Delete', 'Del', () => this.delete());

      menu.onclick = () => {
        document.getElementsByClassName('menu')[0].remove();
        document.getElementsByClassName('overlay')[0].remove();
      };

      document.body.appendChild(overlay);
      document.body.appendChild(menu);
    };
  }

  addCurrentToHistory() {
    this.history = this.history.slice(0, this.historyFlag + 1);
    this.history.push(JSON.stringify(window.mapElement.children));
    this.historyFlag += 1;
  }

  getFromJSON(data) {
    this.element.innerHTML = '';
    this.children = [];
    data.forEach((element) => {
      const newElement = new MapElement(
        element.mapRow, element.mapCol, this.sprites, element.sheetRow, element.sheetCol,
      );
      this.children.push(newElement);
      this.element.appendChild(newElement.canvas);
    });
  }

  getFromHistory(flag) {
    this.getFromJSON(JSON.parse(this.history[flag]));
  }

  undo() {
    if (this.historyFlag === 0) return;
    this.historyFlag -= 1;
    this.getFromHistory(this.historyFlag);
  }

  redo() {
    if (this.historyFlag === this.history.length - 1) return;
    this.historyFlag += 1;
    this.element.innerHTML = '';
    this.children = [];
    this.getFromHistory(this.historyFlag);
  }

  delete() {
    this.children.filter((e) => e.selected).forEach((el) => el.delete());
    this.addCurrentToHistory();
  }

  copy() {
    const selected = this.children.filter((e) => e.selected);
    const lowestRow = Math.min(...selected.map((e) => e.mapRow));
    const lowestCol = Math.min(...selected.map((e) => e.mapCol));
    const copy = selected.map((element) => {
      const newElement = new MapElement(
        element.mapRow - lowestRow,
        element.mapCol - lowestCol, this.sprites, element.sheetRow, element.sheetCol,
      );
      return newElement;
    });
    this.copied = JSON.stringify(copy);
  }

  cut() {
    this.copy();
    this.delete();
  }

  startPasting() {
    if (!this.copied) return;

    this.pasting = true;
    this.showCopied();
  }

  cancelPasting() {
    this.pasting = false;
    const lastPasted = this.children.filter((el) => el.pasting);
    lastPasted.forEach((el) => el.hideCopied());
  }

  showCopied() {
    const col = Math.floor((this.mouseX - (16 * 53 + 16)) / 53);
    const row = Math.floor((this.mouseY - 22) / 53);

    JSON.parse(this.copied).forEach((el) => {
      const replace = this.children.find(
        (element) => element.mapRow === row + el.mapRow && element.mapCol === col + el.mapCol,
      );
      if (replace) {
        replace.showCopied(el);
      }
    });
  }

  updateCopied() {
    const col = Math.floor((this.mouseX - (16 * 53 + 16)) / 53);
    const row = Math.floor((this.mouseY - 22) / 53);
    if (this.lastHovered.row !== row || this.lastHovered.col !== col) {
      this.lastHovered = { row, col };
      const lastPasted = this.children.filter((el) => el.pasting);
      lastPasted.forEach((el) => el.hideCopied());
      if (this.pasting) {
        this.showCopied();
      }
    }
  }

  paste() {
    this.pasting = false;
    const lastPasted = this.children.filter((el) => el.pasting);
    lastPasted.forEach((el) => el.paste());
    this.addCurrentToHistory();
  }

  save() {
    const data = JSON.stringify(this.children);
    const uriContent = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    const downloadNode = document.createElement('a');
    downloadNode.href = uriContent;
    downloadNode.download = 'map.json';
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
  }

  load() {
    const uploadNode = document.createElement('input');
    uploadNode.type = 'file';
    uploadNode.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        this.getFromJSON(data);
        this.addCurrentToHistory();
      };
      reader.readAsText(file);
      uploadNode.remove();
    };
    uploadNode.click();
  }

  drawSelectionRect(e) {
    if (this.selecting) {
      let box;
      if (!document.getElementById('selectionBox')) {
        box = document.createElement('div');
        box.id = 'selectionBox';
        box.style.left = `${e.pageX}px`;
        box.style.top = `${e.pageY}px`;
        this.selectionBoxStartX = e.pageX;
        this.selectionBoxStartY = e.pageY;
        document.body.appendChild(box);
      }
      box = document.getElementById('selectionBox');

      const xDiff = e.pageX - this.selectionBoxStartX;
      box.style.width = `${Math.abs(xDiff)}px`;
      this.selectionBoxWidth = Math.abs(xDiff);
      if (xDiff < 0) {
        box.style.left = `${e.pageX}px`;
      }

      const yDiff = e.pageY - this.selectionBoxStartY;
      box.style.height = `${Math.abs(yDiff)}px`;
      this.selectionBoxHeight = Math.abs(yDiff);
      if (yDiff < 0) {
        box.style.top = `${e.pageY}px`;
      }

      const startX = this.selectionBoxStartX - (16 * 53 + 16);
      const endX = this.selectionBoxStartX + this.selectionBoxWidth - (16 * 53 + 16);
      const startCol = Math.floor(Math.min(startX, endX) / 53);
      const endCol = Math.floor(Math.max(startX, endX) / 53);

      const startY = this.selectionBoxStartY - 22;
      const endY = this.selectionBoxStartY + this.selectionBoxHeight - 22;
      const startRow = Math.floor(Math.min(startY, endY) / 53);
      const endRow = Math.floor(Math.max(startY, endY) / 53);

      this.children.filter((el) => el.insideBox).forEach((el) => el.deselectBox());

      for (let i = 0; i <= Math.abs(endRow - startRow); i += 1) {
        for (let j = 0; j <= Math.abs(endCol - startCol); j += 1) {
          const row = yDiff > 0 ? startRow + i : startRow - i;
          const col = xDiff > 0 ? startCol + j : startCol - j;
          const element = this.children.find((el) => el.mapRow === row && el.mapCol === col);
          if (!element.selected) {
            element.selectBox();
          }
        }
      }
    }
  }
}
