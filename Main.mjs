/* eslint-disable import/extensions */
import { mapWidth, mapHeight } from './config.mjs';
import SpriteSheet from './modules/SpriteSheet.mjs';
import Map from './modules/Map.mjs';

window.addEventListener('DOMContentLoaded', () => {
  window.mapElement = new Map(mapWidth, mapHeight);
  const sheet = new SpriteSheet(16, 20);
});
