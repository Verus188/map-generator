var sizeScale = 6;
var size = Math.pow(2, sizeScale) + 1;
var minHeight = 0;
var maxHeight = 100;
var roughness = 8;
var smoothness = 4;
var seed = randInt(0, 999999999999999);
var waterLevel = 20;
var beachLevel = waterLevel + 5;
var forestLevel = beachLevel + 10;
var mountainLevel = forestLevel;
var map = new Array(size);
// interface MapOptions {
//   seed: number;
//   sizeScale: number;
//   size: number;
//   minHeight: number;
//   maxHeight: number;
//   roughness: number;
//   smoothness: number;
//   map: number[][];
// }
//Заполнение карты высот нулями
for (var i = 0; i < size; i++) {
    map[i] = new Array(size).fill(0);
}
function createNewMap() {
    seededRandom = new SeededRandom(seed);
    size = Math.pow(2, sizeScale) + 1;
    areaSize = 520 / size;
    map = new Array(size);
    for (var i = 0; i < size; i++) {
        map[i] = new Array(size).fill(0);
    }
    map[0][0] = seededRandom.random(minHeight, maxHeight);
    map[0][size - 1] = seededRandom.random(minHeight, maxHeight);
    map[size - 1][0] = seededRandom.random(minHeight, maxHeight);
    map[size - 1][size - 1] = seededRandom.random(minHeight, maxHeight);
}
function randInt(limit1, limit2) {
    if (arguments.length === 1) {
        return Math.trunc(Math.random() * limit1);
    }
    else if (arguments.length === 2) {
        return Math.trunc(Math.random() * (limit2 - limit1) + limit1);
    }
    else {
        return 0;
    }
}
var SeededRandom = /** @class */ (function () {
    function SeededRandom(seed) {
        this.seed = seed;
    }
    // Линейный конгруэнтный генератор
    SeededRandom.prototype.next = function () {
        this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
        return (this.seed >>> 0) / 4294967296; // Нормализация к диапазону [0, 1)
    };
    // Генерация случайного числа в диапазоне [min, max)
    SeededRandom.prototype.random = function (min, max) {
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 1; }
        return min + (max - min) * this.next();
    };
    return SeededRandom;
}());
var seededRandom = new SeededRandom(seed);
//вывод всего массива в консоль
function logArray() {
    for (var i = 0; i < size; i++) {
        var res = "";
        for (var j = 0; j < size; j++) {
            res += map[i][j] + " ";
        }
    }
}
//стартовые высоты
map[0][0] = seededRandom.random(minHeight, maxHeight);
map[0][size - 1] = seededRandom.random(minHeight, maxHeight);
map[size - 1][0] = seededRandom.random(minHeight, maxHeight);
map[size - 1][size - 1] = seededRandom.random(minHeight, maxHeight);
//размер svg клетки
var areaSize = 520 / size;
var canvasZone = document.getElementById("canvas-zone");
var canvasCtx = canvasZone.getContext("2d");
function drawMap() {
    //возможно нужно добавить очистку для всего поля перед рисованием -------------------------------------------------------------------------------------
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            canvasCtx.fillStyle = getAreaColor(map[i][j]);
            canvasCtx.fillRect(j * areaSize, i * areaSize, areaSize, areaSize);
        }
    }
}
//ограничивает число
function setValueBorder(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return value;
}
// возвращает цвет клетки
// x - диапазон значений высоты области
// minBr - минимальн возможная яркость
// hsl имеет 50 едениц яркости цвета
// k = (50 - minBr) / x
// умножаем высоту области на n
// искомое занчение = x * k + minBr
function getAreaColor(height) {
    if (height <= waterLevel) {
        var minBrightness = 20; //чем больше это значение тем ярче будет цвет
        var colors = (50 - minBrightness) / waterLevel;
        var resColor = "hsl(200, 100%, ".concat(height * colors + minBrightness, "%)");
        return resColor;
    }
    if (height <= beachLevel) {
        var minBrightness = 45;
        var colors = (50 - minBrightness) / (beachLevel - waterLevel);
        var resColor = "hsl(55, 100%, ".concat((beachLevel - waterLevel - (height - waterLevel)) * colors + minBrightness, "%)"); //beachLevel - waterLevel для инвертации цвета
        return resColor;
    }
    if (height <= forestLevel) {
        var minBrightness = 30;
        var colors = (50 - minBrightness) / (forestLevel - beachLevel);
        var resColor = "hsl(110, 100%, ".concat((forestLevel - beachLevel - (height - beachLevel)) * colors +
            minBrightness, "%)");
        return resColor;
    }
    if (height > mountainLevel) {
        var minBrightness = 35;
        var colors = (100 - minBrightness) / (maxHeight - mountainLevel);
        var resColor = "hsl(0, 0%, ".concat((maxHeight - forestLevel - (maxHeight - height)) * colors + minBrightness, "%)");
        return resColor;
    }
    else {
        var resColor = "black";
        return resColor;
    }
}
//находит точку вне массива
function getMapPoint(cur, offset) {
    if (cur + offset >= size) {
        return cur + offset - size;
    }
    else if (cur + offset < 0) {
        return size + (cur + offset);
    }
    else {
        return cur + offset;
    }
}
function square(x, y, blockSize) {
    var x0y0 = map[y][x];
    var x0y1 = map[getMapPoint(y, blockSize)][x];
    var x1y0 = map[y][getMapPoint(x, blockSize)];
    var x1y1 = map[getMapPoint(y, blockSize)][getMapPoint(x, blockSize)];
    var midPoint = Math.trunc((x0y0 + x0y1 + x1y0 + x1y1) / 4 +
        seededRandom.random(-roughness * blockSize, roughness * blockSize));
    midPoint = setValueBorder(midPoint, minHeight, maxHeight);
    map[Math.round(y + blockSize / 2) - 1][Math.round(x + blockSize / 2) - 1] =
        midPoint;
}
function diamond(x, y, blockSize) {
    var halfBlockSize = (blockSize - 1) / 2;
    var above = map[getMapPoint(y, -halfBlockSize)][x];
    var bottom = map[getMapPoint(y, halfBlockSize)][x];
    var left = map[y][getMapPoint(x, -halfBlockSize)];
    var right = map[y][getMapPoint(x, halfBlockSize)];
    var midPoint = Math.trunc((above + bottom + left + right) / 4 +
        seededRandom.random(-roughness * blockSize, roughness * blockSize));
    midPoint = setValueBorder(midPoint, minHeight, maxHeight);
    map[y][x] = midPoint;
}
function diamondSquare() {
    var blockSize = size;
    while (blockSize >= 3) {
        for (var y = 0; y < Math.trunc(size / (blockSize - 1)); y++) {
            for (var x = 0; x < Math.trunc(size / (blockSize - 1)); x++) {
                square(x * (blockSize - 1), y * (blockSize - 1), blockSize);
                diamond(x * (blockSize - 1) + (blockSize - 1) / 2, y * (blockSize - 1), blockSize);
                diamond(x * (blockSize - 1) + (blockSize - 1) / 2, y * (blockSize - 1) + (blockSize - 1), blockSize);
                diamond(x * (blockSize - 1), y * (blockSize - 1) + (blockSize - 1) / 2, blockSize);
                diamond(x * (blockSize - 1) + (blockSize - 1), y * (blockSize - 1) + (blockSize - 1) / 2, blockSize);
            }
        }
        blockSize = Math.round(blockSize / 2);
    }
}
//сглаживает карту высот n раз
function smoothMap(n) {
    if (n <= 0) {
        return;
    }
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            var above = map[getMapPoint(y, -1)][x];
            var bottom = map[getMapPoint(y, 1)][x];
            var left = map[y][getMapPoint(x, -1)];
            var right = map[y][getMapPoint(x, 1)];
            var leftAbove = map[getMapPoint(y, -1)][getMapPoint(x, -1)];
            var rightAbove = map[getMapPoint(y, -1)][getMapPoint(x, 1)];
            var leftBottom = map[getMapPoint(y, 1)][getMapPoint(x, -1)];
            var rightBottom = map[getMapPoint(y, 1)][getMapPoint(x, 1)];
            var midPoint = Math.trunc((above +
                bottom +
                left +
                right +
                leftAbove +
                rightAbove +
                leftBottom +
                rightBottom) /
                8);
            map[y][x] = midPoint;
        }
    }
    smoothMap(--n);
}
function reGenerateMap() {
    createNewMap();
    diamondSquare();
    smoothMap(smoothness);
    drawMap();
}
var sizeRange = document.getElementById("size-range");
var sizeText = document.getElementById("size-text");
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
var roughnessRange = document.getElementById("roughness-range");
var roughnessText = document.getElementById("roughness-text");
roughnessRange.addEventListener("input", function () {
    roughnessText.value = roughnessRange.value;
    roughness = Number(roughnessRange.value);
    reGenerateMap();
});
roughnessText.addEventListener("input", function () {
    roughnessRange.value = roughnessText.value;
    roughness = Number(roughnessRange.value);
    reGenerateMap();
});
var smoothnessRange = document.getElementById("smoothness-range");
var smoothnessText = document.getElementById("smoothness-text");
smoothnessRange.addEventListener("input", function () {
    smoothnessText.value = smoothnessRange.value;
    smoothness = Number(smoothnessRange.value);
    reGenerateMap();
});
smoothnessText.addEventListener("input", function () {
    smoothnessRange.value = smoothnessText.value;
    smoothness = Number(smoothnessRange.value);
    reGenerateMap();
});
var randomSeedButton = document.getElementById("random-seed-b");
var seedText = document.getElementById("seed-text");
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
