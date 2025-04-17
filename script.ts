let sizeScale: number = 6;
let size: number = 2 ** sizeScale + 1;
const minHeight: number = 0;
const maxHeight: number = 100;
let roughness: number = 8;
let smoothness: number = 4;
let seed: number = randInt(0, 999999999999999);

const waterLevel: number = 20;
const beachLevel: number = waterLevel + 5;
const forestLevel: number = beachLevel + 10;
const mountainLevel: number = forestLevel;

let map: number[][] = new Array(size);

//Заполнение карты высот нулями
for (let i = 0; i < size; i++) {
  map[i] = new Array(size).fill(0);
}

function createNewMap(): void {
  seededRandom = new SeededRandom(seed);
  size = 2 ** sizeScale + 1;
  areaSize = 520 / size;
  map = new Array(size);

  for (let i = 0; i < size; i++) {
    map[i] = new Array(size).fill(0);
  }

  map[0][0] = seededRandom.random(minHeight, maxHeight);
  map[0][size - 1] = seededRandom.random(minHeight, maxHeight);
  map[size - 1][0] = seededRandom.random(minHeight, maxHeight);
  map[size - 1][size - 1] = seededRandom.random(minHeight, maxHeight);
}

function randInt(limit1: number, limit2: number): number {
  if (arguments.length === 1) {
    return Math.trunc(Math.random() * limit1);
  } else if (arguments.length === 2) {
    return Math.trunc(Math.random() * (limit2 - limit1) + limit1);
  } else {
    return 0;
  }
}

class SeededRandom {
  public seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  // Линейный конгруэнтный генератор
  public next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 4294967296; // Нормализация к диапазону [0, 1)
  }
  // Генерация случайного числа в диапазоне [min, max)
  random(min: number = 0, max: number = 1): number {
    return min + (max - min) * this.next();
  }
}
let seededRandom: SeededRandom = new SeededRandom(seed);

//вывод всего массива в консоль
function logArray(): void {
  for (let i = 0; i < size; i++) {
    let res: string = "";
    for (let j = 0; j < size; j++) {
      res += map[i][j] + " ";
    }
    console.log(i + ": " + res);
  }
}

//стартовые высоты
map[0][0] = seededRandom.random(minHeight, maxHeight);
map[0][size - 1] = seededRandom.random(minHeight, maxHeight);
map[size - 1][0] = seededRandom.random(minHeight, maxHeight);
map[size - 1][size - 1] = seededRandom.random(minHeight, maxHeight);

//размер svg клетки
let areaSize: number = 520 / size;

let svgZone: HTMLElement = document.getElementById("svg-zone");

function drawMap(): void {
  svgZone.innerHTML = "";
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let area: SVGRectElement = getArea(map[i][j]);
      area.setAttributeNS(null, "x", `${j * areaSize}`);
      area.setAttributeNS(null, "y", `${i * areaSize}`);
      svgZone.appendChild(area);
    }
  }
}

//ограничивает число
function setValueBorder(value: number, min: number, max: number): number {
  if (value < min) {
    value = min;
  }
  if (value > max) {
    value = max;
  }
  return value;
}

// возвращает объект клетки карты с цветом
// x - диапазон значений высоты области
// minBr - минимальн возможная яркость
// hsl имеет 50 едениц яркости цвета
// k = (50 - minBr) / x
// умножаем высоту области на n
// искомое занчение = x * k + minBr
function getArea(height): SVGRectElement {
  let area: SVGRectElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  area.setAttributeNS(null, "width", `${areaSize}`);
  area.setAttributeNS(null, "height", `${areaSize}`);
  if (height <= waterLevel) {
    const minBrightness: number = 20; //чем больше это значение тем ярче будет цвет
    const colors: number = (50 - minBrightness) / waterLevel;
    area.setAttributeNS(
      null,
      "fill",
      `hsl(200, 100%, ${height * colors + minBrightness}%)`
    );
    return area;
  }

  if (height <= beachLevel) {
    const minBrightness: number = 45;
    const colors: number = (50 - minBrightness) / (beachLevel - waterLevel);

    area.setAttributeNS(
      null,
      "fill",
      `hsl(55, 100%, ${
        (beachLevel - waterLevel - (height - waterLevel)) * colors +
        minBrightness
      }%)` //beachLevel - waterLevel для инвертации цвета
    );
    console.log(height - waterLevel);

    return area;
  }

  if (height <= forestLevel) {
    const minBrightness: number = 30;
    const colors: number = (50 - minBrightness) / (forestLevel - beachLevel);
    area.setAttributeNS(
      null,
      "fill",
      `hsl(110, 100%, ${
        (forestLevel - beachLevel - (height - beachLevel)) * colors +
        minBrightness
      }%)`
    );
    return area;
  }

  if (height > mountainLevel) {
    const minBrightness: number = 35;
    const colors: number = (100 - minBrightness) / (maxHeight - mountainLevel);
    area.setAttributeNS(
      null,
      "fill",
      `hsl(0, 0%, ${
        (maxHeight - forestLevel - (maxHeight - height)) * colors +
        minBrightness
      }%)`
    );
    return area;
  } else {
    area.setAttributeNS(null, "fill", "black");
    return area;
  }
}

//находит точку вне массива
function getMapPoint(cur: number, offset: number): number {
  if (cur + offset >= size) {
    return cur + offset - size;
  } else if (cur + offset < 0) {
    return size + (cur + offset);
  } else {
    return cur + offset;
  }
}

function square(x: number, y: number, blockSize: number) {
  const x0y0: number = map[y][x];
  const x0y1: number = map[getMapPoint(y, blockSize)][x];
  const x1y0: number = map[y][getMapPoint(x, blockSize)];
  const x1y1: number =
    map[getMapPoint(y, blockSize)][getMapPoint(x, blockSize)];
  let midPoint: number = Math.trunc(
    (x0y0 + x0y1 + x1y0 + x1y1) / 4 +
      seededRandom.random(-roughness * blockSize, roughness * blockSize)
  );
  midPoint = setValueBorder(midPoint, minHeight, maxHeight);
  map[Math.round(y + blockSize / 2) - 1][Math.round(x + blockSize / 2) - 1] =
    midPoint;
}

function diamond(x: number, y: number, blockSize: number): void {
  const halfBlockSize: number = (blockSize - 1) / 2;
  const above: number = map[getMapPoint(y, -halfBlockSize)][x];
  const bottom: number = map[getMapPoint(y, halfBlockSize)][x];
  const left: number = map[y][getMapPoint(x, -halfBlockSize)];
  const right: number = map[y][getMapPoint(x, halfBlockSize)];
  let midPoint: number = Math.trunc(
    (above + bottom + left + right) / 4 +
      seededRandom.random(-roughness * blockSize, roughness * blockSize)
  );
  midPoint = setValueBorder(midPoint, minHeight, maxHeight);
  map[y][x] = midPoint;
}

function diamondSquare(): void {
  let blockSize: number = size;
  while (blockSize >= 3) {
    for (let y = 0; y < Math.trunc(size / (blockSize - 1)); y++) {
      for (let x = 0; x < Math.trunc(size / (blockSize - 1)); x++) {
        square(x * (blockSize - 1), y * (blockSize - 1), blockSize);
        diamond(
          x * (blockSize - 1) + (blockSize - 1) / 2,
          y * (blockSize - 1),
          blockSize
        );
        diamond(
          x * (blockSize - 1) + (blockSize - 1) / 2,
          y * (blockSize - 1) + (blockSize - 1),
          blockSize
        );
        diamond(
          x * (blockSize - 1),
          y * (blockSize - 1) + (blockSize - 1) / 2,
          blockSize
        );
        diamond(
          x * (blockSize - 1) + (blockSize - 1),
          y * (blockSize - 1) + (blockSize - 1) / 2,
          blockSize
        );
      }
    }
    blockSize = Math.round(blockSize / 2);
  }
}

//сглаживает карту высот n раз
function smoothMap(n: number): void {
  if (n <= 0) {
    return;
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const above: number = map[getMapPoint(y, -1)][x];
      const bottom: number = map[getMapPoint(y, 1)][x];
      const left: number = map[y][getMapPoint(x, -1)];
      const right: number = map[y][getMapPoint(x, 1)];
      const leftAbove: number = map[getMapPoint(y, -1)][getMapPoint(x, -1)];
      const rightAbove: number = map[getMapPoint(y, -1)][getMapPoint(x, 1)];
      const leftBottom: number = map[getMapPoint(y, 1)][getMapPoint(x, -1)];
      const rightBottom: number = map[getMapPoint(y, 1)][getMapPoint(x, 1)];

      const midPoint: number = Math.trunc(
        (above +
          bottom +
          left +
          right +
          leftAbove +
          rightAbove +
          leftBottom +
          rightBottom) /
          8
      );
      map[y][x] = midPoint;
    }
  }
  smoothMap(--n);
}

function reGenerateMap(): void {
  createNewMap();
  diamondSquare();
  smoothMap(smoothness);
  drawMap();
}

let sizeRange: HTMLInputElement = document.getElementById(
  "size-range"
) as HTMLInputElement;
let sizeText: HTMLInputElement = document.getElementById(
  "size-text"
) as HTMLInputElement;
sizeRange.addEventListener("input", function () {
  sizeText.value = sizeRange.value;
  sizeScale = Number(sizeRange.value);
  reGenerateMap();
});
sizeText.addEventListener("input", function () {
  sizeRange.value = sizeText.value;
  sizeScale = Number(sizeRange.value);
  reGenerateMap();
});

let roughnessRange: HTMLInputElement = document.getElementById(
  "roughness-range"
) as HTMLInputElement;
let roughnessText: HTMLInputElement = document.getElementById(
  "roughness-text"
) as HTMLInputElement;
roughnessRange.addEventListener("input", function () {
  roughnessText.value = roughnessRange.value;
  if (typeof roughnessRange.value === "number") {
    roughness = roughnessRange.value;
  }
  reGenerateMap();
});
roughnessText.addEventListener("input", function () {
  roughnessRange.value = roughnessText.value;
  if (typeof roughnessText.value === "number") {
    roughness = roughnessText.value;
  }
  reGenerateMap();
});

let smoothnessRange: HTMLInputElement = document.getElementById(
  "smoothness-range"
) as HTMLInputElement;
let smoothnessText: HTMLInputElement = document.getElementById(
  "smoothness-text"
) as HTMLInputElement;
smoothnessRange.addEventListener("input", function () {
  smoothnessText.value = smoothnessRange.value;
  if (typeof smoothnessRange.value === "number") {
    smoothness = smoothnessRange.value;
  }
  reGenerateMap();
});
smoothnessText.addEventListener("input", function () {
  smoothnessRange.value = smoothnessText.value;
  if (typeof smoothnessText.value === "number") {
    smoothness = smoothnessText.value;
  }
  reGenerateMap();
});

const randomSeedButton = document.getElementById("random-seed-b");
let seedText: HTMLInputElement = document.getElementById(
  "seed-text"
) as HTMLInputElement;
randomSeedButton.addEventListener("click", function () {
  seed = randInt(0, 999999999999999);
  seedText.value = String(seed);
  reGenerateMap();
});

seedText.addEventListener("input", function () {
  if (typeof seedText.value === "number") {
    seed = seedText.value;
  }
  reGenerateMap();
});

seedText.value = String(seed);
sizeRange.value = String(sizeScale);
sizeText.value = String(sizeScale);
roughnessRange.value = String(roughness);
roughnessText.value = String(roughness);
smoothnessRange.value = String(smoothness);
smoothnessText.value = String(smoothness);

diamondSquare();
smoothMap(smoothness);
drawMap();
