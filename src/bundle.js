/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/front_end/dom/cyclicButtonManager.ts":
/*!**************************************************!*\
  !*** ./src/front_end/dom/cyclicButtonManager.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CyclicButtonManager = void 0;\nconst elements_1 = __webpack_require__(/*! ./elements */ \"./src/front_end/dom/elements.ts\");\nconst localStorage_1 = __webpack_require__(/*! ./localStorage */ \"./src/front_end/dom/localStorage.ts\");\n// TODO: add back reset local storage callback\nconst CyclicButtonManager = (values, defaultValue, name, onChangeCallback) => {\n    const element = elements_1.elements[name]; // also display element\n    const storageKey = name;\n    const Initialise = () => {\n        const value = (0, localStorage_1.GetLocalStorageItem)(storageKey, defaultValue);\n        element.textContent = value;\n        onChangeCallback(value);\n    };\n    Initialise();\n    const CycleCounter = () => {\n        let value = element.textContent;\n        const index = values.findIndex(other => other === value);\n        const nextIndex = (index + 1) % values.length;\n        value = values[nextIndex];\n        element.textContent = value;\n        localStorage.setItem(storageKey, value);\n        onChangeCallback(value);\n    };\n    element.onclick = () => CycleCounter();\n};\nexports.CyclicButtonManager = CyclicButtonManager;\n\n\n//# sourceURL=webpack:///./src/front_end/dom/cyclicButtonManager.ts?");

/***/ }),

/***/ "./src/front_end/dom/elements.ts":
/*!***************************************!*\
  !*** ./src/front_end/dom/elements.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.elements = void 0;\nconst elementIds = ['canvas', 'toggleGrid'];\nconst GetElements = () => {\n    const elements = Object.fromEntries(elementIds.map(id => [id, document.getElementById(id)]));\n    const nullElements = Object.keys(elements).filter(id => elements[id] === null);\n    if (nullElements.length > 0) {\n        throw new Error(`Failed to find all elements by id ${nullElements}`);\n    }\n    return elements;\n};\nexports.elements = GetElements();\n\n\n//# sourceURL=webpack:///./src/front_end/dom/elements.ts?");

/***/ }),

/***/ "./src/front_end/dom/localStorage.ts":
/*!*******************************************!*\
  !*** ./src/front_end/dom/localStorage.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.GetLocalStorageItem = void 0;\nconst GetLocalStorageItem = (key, defaultValue) => {\n    const value = localStorage.getItem(key);\n    if (value === null) {\n        localStorage.setItem(key, defaultValue);\n        return defaultValue;\n    }\n    else {\n        return value;\n    }\n};\nexports.GetLocalStorageItem = GetLocalStorageItem;\n\n\n//# sourceURL=webpack:///./src/front_end/dom/localStorage.ts?");

/***/ }),

/***/ "./src/front_end/dom/main.ts":
/*!***********************************!*\
  !*** ./src/front_end/dom/main.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.InitialiseDom = void 0;\nconst cursor_1 = __webpack_require__(/*! ../game/cursor */ \"./src/front_end/game/cursor.ts\");\nconst cyclicButtonManager_1 = __webpack_require__(/*! ./cyclicButtonManager */ \"./src/front_end/dom/cyclicButtonManager.ts\");\nconst elements_1 = __webpack_require__(/*! ./elements */ \"./src/front_end/dom/elements.ts\");\nconst InitialiseDom = (world, renderer, game) => {\n    (0, cyclicButtonManager_1.CyclicButtonManager)(['Grid On', 'Grid Off'], 'Grid On', 'toggleGrid', (value) => {\n        const showGrid = value === 'Grid On';\n        game.showGrid = showGrid;\n    });\n    elements_1.elements.canvas.addEventListener('mousemove', (event) => {\n        const canvasPosition = { x: event.offsetX, y: event.offsetY };\n        const worldPosition = (0, cursor_1.CalculateCursorWorldPosition)(renderer, world, canvasPosition);\n        world.SetCursorWorldPosition(worldPosition);\n    });\n};\nexports.InitialiseDom = InitialiseDom;\n\n\n//# sourceURL=webpack:///./src/front_end/dom/main.ts?");

/***/ }),

/***/ "./src/front_end/game/cursor.ts":
/*!**************************************!*\
  !*** ./src/front_end/game/cursor.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CalculateCursorWorldPosition = void 0;\nconst CalculateCursorWorldPosition = (renderer, world, canvasPosition) => {\n    for (let wz = 2; wz >= 0; wz--) {\n        const fw = renderer.CanvasToWorldPosition({\n            canvasPosition,\n            wz\n        }); // floating point world position\n        const w = {\n            x: Math.round(fw.x),\n            y: Math.round(fw.y),\n            z: Math.round(fw.z)\n        };\n        const tile = world.GetTile(w);\n        if (tile !== undefined) {\n            return w;\n        }\n    }\n    return null;\n};\nexports.CalculateCursorWorldPosition = CalculateCursorWorldPosition;\n\n\n//# sourceURL=webpack:///./src/front_end/game/cursor.ts?");

/***/ }),

/***/ "./src/front_end/game/main.ts":
/*!************************************!*\
  !*** ./src/front_end/game/main.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Render = void 0;\nconst types_1 = __webpack_require__(/*! ../renderer/types */ \"./src/front_end/renderer/types.ts\");\nconst Render = (time, renderer, world, tiles, game) => {\n    renderer.ClearCanvas();\n    // draw tiles\n    for (const t of tiles) {\n        renderer.DrawIsometricTile(t);\n    }\n    // draw cusor\n    const cursorWorldPosition = world.GetCursorWorldPosition();\n    if (cursorWorldPosition !== null) {\n        renderer.DrawIsometricTile({\n            worldPosition: cursorWorldPosition,\n            tileIndex: { x: 0, y: 0 },\n            tileset: types_1.TileSet.mapIndicators\n        });\n    }\n    // draw player\n    renderer.DrawIsometricTile({\n        worldPosition: game.playerPosition,\n        tileIndex: { x: time % 1000 < 500 ? 0 : 1, y: 0 },\n        tileset: types_1.TileSet.entities\n    });\n    // draw grid\n    if (game.showGrid) {\n        renderer.DrawIsometricGrid();\n    }\n};\nexports.Render = Render;\n\n\n//# sourceURL=webpack:///./src/front_end/game/main.ts?");

/***/ }),

/***/ "./src/front_end/game/tilesets.ts":
/*!****************************************!*\
  !*** ./src/front_end/game/tilesets.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.GenerateRenderTiles = void 0;\nconst types_1 = __webpack_require__(/*! ../renderer/types */ \"./src/front_end/renderer/types.ts\");\nconst types_2 = __webpack_require__(/*! ../world/types */ \"./src/front_end/world/types.ts\");\nconst tileMap = new Map([\n    [types_2.TileType.dirt, { x: 0, y: 0 }],\n    [types_2.TileType.grass, { x: 1, y: 0 }],\n    [types_2.TileType.stone, { x: 2, y: 0 }],\n    [types_2.TileType.sand, { x: 3, y: 0 }],\n    [types_2.TileType.water, { x: 7, y: 0 }],\n    [types_2.TileType.plant, { x: 10, y: 0 }],\n    [types_2.TileType.cactus, { x: 8, y: 1 }],\n    [types_2.TileType.log, { x: 8, y: 3 }],\n    [types_2.TileType.canopy, { x: 7, y: 3 }],\n    [types_2.TileType.dryGrass, { x: 3, y: 2 }],\n    [types_2.TileType.smallStones, { x: 8, y: 0 }],\n    [types_2.TileType.largeStones, { x: 9, y: 0 }],\n    [types_2.TileType.lava, { x: 2, y: 3 }]\n]);\nconst GenerateRenderTiles = (tileData) => {\n    // TODO move sorting into renderer\n    tileData.sort((a, b) => {\n        const aw = a.p.x + a.p.y;\n        const bw = b.p.x + b.p.y;\n        if (aw === bw) {\n            // if tiles on same x,y, render from bottom to top\n            return a.p.z - b.p.z;\n        }\n        // render from back to front (negative to positive x, y)\n        return aw - bw;\n    });\n    const tiles = []; // render tiles\n    for (const td of tileData) {\n        const t = tileMap.get(td.tileType);\n        tiles.push({\n            worldPosition: td.p,\n            tileIndex: t,\n            tileset: types_1.TileSet.tiles\n        });\n    }\n    return tiles;\n};\nexports.GenerateRenderTiles = GenerateRenderTiles;\n\n\n//# sourceURL=webpack:///./src/front_end/game/tilesets.ts?");

/***/ }),

/***/ "./src/front_end/main.ts":
/*!*******************************!*\
  !*** ./src/front_end/main.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst elements_1 = __webpack_require__(/*! ./dom/elements */ \"./src/front_end/dom/elements.ts\");\nconst main_1 = __webpack_require__(/*! ./dom/main */ \"./src/front_end/dom/main.ts\");\nconst main_2 = __webpack_require__(/*! ./game/main */ \"./src/front_end/game/main.ts\");\nconst tilesets_1 = __webpack_require__(/*! ./game/tilesets */ \"./src/front_end/game/tilesets.ts\");\nconst main_3 = __webpack_require__(/*! ./renderer/main */ \"./src/front_end/renderer/main.ts\");\nconst main_4 = __webpack_require__(/*! ./world/main */ \"./src/front_end/world/main.ts\");\nconst types_1 = __webpack_require__(/*! ./world/types */ \"./src/front_end/world/types.ts\");\nconsole.log('Isometric');\nconst main = async () => {\n    const canvas = elements_1.elements.canvas;\n    canvas.width = 512;\n    canvas.height = 512;\n    const world = (0, main_4.CreateWorld)();\n    world.GenerateTiles({ landAxialRadius: 6, worldAxialRadius: 12 });\n    let playerPosition = { x: 0, y: 0, z: 0 };\n    for (let i = 0; i < 100; i++) {\n        const p = {\n            x: Math.floor(Math.random() * 6) - 3,\n            y: Math.floor(Math.random() * 6) - 3\n        };\n        const tile = world.GetSurfaceTile(p);\n        if (tile !== undefined && tile.tileType !== types_1.TileType.water) {\n            playerPosition = { x: tile.p.x, y: tile.p.y, z: tile.p.z + 1 };\n            console.log(playerPosition);\n            break;\n        }\n    }\n    const renderer = await (0, main_3.CreateRenderer)();\n    const game = { showGrid: false, playerPosition };\n    const rTiles = (0, tilesets_1.GenerateRenderTiles)(world.GetTiles());\n    (0, main_1.InitialiseDom)(world, renderer, game);\n    const RenderLoop = () => {\n        requestAnimationFrame((time) => {\n            (0, main_2.Render)(time, renderer, world, rTiles, game);\n            RenderLoop();\n        });\n    };\n    RenderLoop();\n};\nmain();\n\n\n//# sourceURL=webpack:///./src/front_end/main.ts?");

/***/ }),

/***/ "./src/front_end/miscellaneous/perlin_noise.ts":
/*!*****************************************************!*\
  !*** ./src/front_end/miscellaneous/perlin_noise.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CreatePerlinNoise = void 0;\nconst CreatePerlinNoise = () => {\n    const _p = [];\n    const _permutation = [];\n    const initialise = () => {\n        // Initialize the permutation table\n        for (let i = 0; i < 256; i++) {\n            _p[i] = Math.floor(Math.random() * 256);\n        }\n        // Duplicate the permutation table\n        for (let i = 0; i < 256; i++) {\n            _permutation[i] = _p[i % 256];\n        }\n    };\n    // Fade function to smooth the interpolation\n    const fade = (t) => {\n        return t * t * t * (t * (t * 6 - 15) + 10);\n    };\n    // Dot product of the gradient and the distance vector\n    const grad = (hash, x, y) => {\n        const h = hash & 15; // Determine which gradient to use\n        const u = h < 8 ? x : y;\n        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;\n        return (h & 1 ? -u : u) + (h & 2 ? -v : v);\n    };\n    const lerp = (a, b, t) => {\n        return a + t * (b - a);\n    };\n    const noise = (x, y) => {\n        const X = Math.floor(x) & 255; // Calculate grid cell coordinates\n        const Y = Math.floor(y) & 255;\n        x -= Math.floor(x); // Relative position in grid cell\n        y -= Math.floor(y);\n        const u = fade(x); // Fade the x coordinate\n        const v = fade(y); // Fade the y coordinate\n        // Hash coordinates of the 4 corners\n        const a = _permutation[X] + Y;\n        const aa = _permutation[a];\n        const ab = _permutation[a + 1];\n        const b = _permutation[X + 1] + Y;\n        const ba = _permutation[b];\n        const bb = _permutation[b + 1];\n        // Interpolate between gradients at the four corners\n        const x1 = lerp(grad(aa, x, y), grad(ba, x - 1, y), u);\n        const x2 = lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u);\n        return lerp(x1, x2, v); // Final interpolation\n    };\n    const layeredNoise = ({ x, y, octaves = 1 }) => {\n        let total = 0;\n        let frequency = 1;\n        let amplitude = 1;\n        for (let i = 0; i < octaves; i++) {\n            total += noise(x * frequency, y * frequency) * amplitude;\n            frequency *= 2;\n            amplitude *= 0.5;\n        }\n        return total;\n    };\n    initialise();\n    return {\n        noise: layeredNoise\n    };\n};\nexports.CreatePerlinNoise = CreatePerlinNoise;\n\n\n//# sourceURL=webpack:///./src/front_end/miscellaneous/perlin_noise.ts?");

/***/ }),

/***/ "./src/front_end/renderer/main.ts":
/*!****************************************!*\
  !*** ./src/front_end/renderer/main.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CreateRenderer = exports.LoadImage = void 0;\nconst elements_1 = __webpack_require__(/*! ../dom/elements */ \"./src/front_end/dom/elements.ts\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./src/front_end/renderer/types.ts\");\nconst LoadImage = async (src) => {\n    const image = new Image();\n    image.src = src;\n    return new Promise((resolve, reject) => {\n        image.onload = () => resolve(image);\n        image.onerror = err => reject(new Error(`Failed to load image at ${src}`));\n    });\n};\nexports.LoadImage = LoadImage;\nconst CreateRenderer = async () => {\n    const canvas = elements_1.elements.canvas;\n    // Initialise\n    const ctx = canvas.getContext('2d');\n    if (!ctx) {\n        throw new Error('Failed to get 2D context');\n    }\n    const [width, height] = [canvas.width, canvas.height];\n    ctx.imageSmoothingEnabled = false;\n    const scale = 4;\n    const sts = 16; // source tile size\n    const dts = sts * scale; // destination tile size\n    const heightOverflow = 1; // pixel\n    const tileSets = new Map([\n        [\n            types_1.TileSet.tiles,\n            await (0, exports.LoadImage)('assets/Isometric_MedievalFantasy_Tiles.png')\n        ],\n        [\n            types_1.TileSet.entities,\n            await (0, exports.LoadImage)('assets/IsometricTRPGAssetPack_OutlinedEntities.png')\n        ],\n        [\n            types_1.TileSet.mapIndicators,\n            await (0, exports.LoadImage)('assets/IsometricTRPGAssetPack_MapIndicators2.png')\n        ]\n    ]);\n    // Member Functions\n    const DrawLine = (x0, y0, x1, y1) => {\n        ctx.beginPath();\n        ctx.moveTo(x0, y0);\n        ctx.lineTo(x1, y1);\n        ctx.stroke();\n    };\n    const DrawIsometricGrid = () => {\n        ctx.lineWidth = 1;\n        ctx.strokeStyle = 'hsla(0, 0%, 50%, 0.5)';\n        for (let x = 0; x < width; x += dts) {\n            DrawLine(x, 0, x, height);\n        }\n        for (let y = 0; y < height; y += dts) {\n            DrawLine(0, y, width, y);\n        }\n        ctx.strokeStyle = 'hsl(0, 0%, 100%, 0.5)';\n        for (let x = dts / 2; x < width; x += dts) {\n            DrawLine(x, 0, x, height);\n        }\n        for (let y = dts / 2; y < height; y += dts) {\n            DrawLine(0, y, width, y);\n        }\n        for (let y = -dts; y < height; y += dts) {\n            for (let x = -dts; x < width; x += dts) {\n                ctx.strokeStyle = 'hsla(200, 100%, 80%, 0.5)';\n                DrawLine(x, y, x + 2 * dts, y + dts);\n                ctx.strokeStyle = 'hsla(100, 100%, 80%, 0.5)';\n                DrawLine(x, y + dts, x + 2 * dts, y);\n            }\n        }\n    };\n    const WorldToCanvasPosition = ({ x, y, z }) => {\n        const p0 = {\n            // destination x & y origin (centre)\n            x: (width - dts) / 2,\n            y: (height - dts) / 2 - heightOverflow * scale\n        };\n        const p = {\n            x: p0.x - (x * dts) / 2 + (y * dts) / 2,\n            y: p0.y + (x * dts) / 4 + (y * dts) / 4 - (z * dts) / 2\n        };\n        return p;\n    };\n    const DrawIsometricTile = (tile) => {\n        //  /  \\\n        // x    y\n        // w = world x, y & z\n        // ti, tj = tile index in x & y\n        const [sw, sh] = [sts, sts + heightOverflow]; // source width & height (+1 = tile overflow)\n        const [sx, sy] = [tile.tileIndex.x * sw, tile.tileIndex.y * sh]; // source x & y\n        const [dw, dh] = [sw * scale, sh * scale]; // destination width & height\n        const [dx0, dy0] = [\n            // destination x & y origin (centre)\n            (width - dts) / 2,\n            (height - dts) / 2 - heightOverflow * scale\n        ];\n        const [dx, dy] = [\n            // destination x & y\n            dx0 - (tile.worldPosition.x * dts) / 2 + (tile.worldPosition.y * dts) / 2,\n            dy0 +\n                (tile.worldPosition.x * dts) / 4 +\n                (tile.worldPosition.y * dts) / 4 -\n                (tile.worldPosition.z * dts) / 2\n        ];\n        const d = WorldToCanvasPosition(tile.worldPosition);\n        const image = tileSets.get(tile.tileset);\n        ctx.drawImage(image, sx, sy, sw, sh, d.x, d.y, dw, dh);\n    };\n    const CanvasToWorldPosition = ({ canvasPosition, wz }) => {\n        // EQ.1\n        // _x =  p0.x - (x * dts) / 2 + (y * dts) / 2,\n        // 2/dts * (_x - p0.x)  = - x + y\n        // EQ.2\n        // _y = p0.y + (x * dts) / 4 + (y * dts) / 4 - (z * dts) / 2\n        // 4/dts * (_y - p0.y) + 2*z = x + y\n        // 2*y = EQ.1 + EQ.2\n        // 2*y = 2/dts * (_x - p0.x) + 4/dts * (_y - p0.y) + 2*z\n        // y =  1/dts * (_x - p0.x) + 2/dts * (_y - p0.y) + z\n        // y = 1/dts * (_x - p0.x + 2 * (_y - p0.y)) + z\n        // 2*x = - EQ.1 + EQ.2\n        // 2*x = - 2/dts * (_x - p0.x) + 4/dts * (_y - p0.y) + 2*z\n        // x = - 1/dts * (_x - p0.x) + 2/dts * (_y - p0.y) + z\n        // x = 1/dts * (p0.x - _x + 2 * (_y - p0.y)) + z\n        const [sw, sh] = [sts, sts + heightOverflow];\n        canvasPosition.x = canvasPosition.x - dts / 2;\n        canvasPosition.y = canvasPosition.y - dts / 2;\n        const p0 = {\n            // destination x & y origin (centre)\n            x: (width - dts) / 2,\n            y: (height - dts) / 2 - heightOverflow * scale\n        };\n        const p = {\n            x: (1 / dts) * (p0.x - canvasPosition.x + 2 * (canvasPosition.y - p0.y)) +\n                wz +\n                0.5,\n            y: (1 / dts) * (canvasPosition.x - p0.x + 2 * (canvasPosition.y - p0.y)) +\n                wz +\n                0.5,\n            z: wz\n        };\n        return p;\n    };\n    const ClearCanvas = () => {\n        ctx.clearRect(0, 0, width, height);\n    };\n    return {\n        CanvasToWorldPosition,\n        ClearCanvas,\n        DrawIsometricTile,\n        DrawIsometricGrid\n    };\n};\nexports.CreateRenderer = CreateRenderer;\n\n\n//# sourceURL=webpack:///./src/front_end/renderer/main.ts?");

/***/ }),

/***/ "./src/front_end/renderer/types.ts":
/*!*****************************************!*\
  !*** ./src/front_end/renderer/types.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TileSet = void 0;\nvar TileSet;\n(function (TileSet) {\n    TileSet[\"tiles\"] = \"tiles\";\n    TileSet[\"entities\"] = \"entities\";\n    TileSet[\"mapIndicators\"] = \"mapIndicators\";\n})(TileSet || (exports.TileSet = TileSet = {}));\n\n\n//# sourceURL=webpack:///./src/front_end/renderer/types.ts?");

/***/ }),

/***/ "./src/front_end/world/main.ts":
/*!*************************************!*\
  !*** ./src/front_end/world/main.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.CreateWorld = void 0;\nconst perlin_noise_1 = __webpack_require__(/*! ../miscellaneous/perlin_noise */ \"./src/front_end/miscellaneous/perlin_noise.ts\");\nconst types_1 = __webpack_require__(/*! ./types */ \"./src/front_end/world/types.ts\");\nconst CreateWorld = () => {\n    let _cursorWorldPosition = null;\n    let _tiles = [];\n    const SetCursorWorldPosition = (cursorWorldPosition) => {\n        _cursorWorldPosition = null;\n    };\n    const GetCursorWorldPosition = () => {\n        return _cursorWorldPosition;\n    };\n    const GetTile = (position) => {\n        const tile = _tiles.find(tile => tile.p.x === position.x &&\n            tile.p.y === position.y &&\n            tile.p.z === position.z);\n        return tile;\n    };\n    const GetSurfaceTile = (position) => {\n        for (let z = 4; z >= 0; z--) {\n            const tile = _tiles.find(tile => tile.p.x === position.x && tile.p.y === position.y && tile.p.z === z);\n            if (tile !== undefined) {\n                return tile;\n            }\n        }\n        return undefined;\n    };\n    const GetTiles = () => {\n        return _tiles;\n    };\n    const GenerateTiles = ({ landAxialRadius = 1, worldAxialRadius = 12 } = {}) => {\n        let tiles = [];\n        const perlin1 = (0, perlin_noise_1.CreatePerlinNoise)();\n        const perlin2 = (0, perlin_noise_1.CreatePerlinNoise)();\n        const positions = [];\n        for (let y = -worldAxialRadius; y <= worldAxialRadius; y += 1) {\n            for (let x = -worldAxialRadius; x <= worldAxialRadius; x += 1) {\n                positions.push({ x, y });\n            }\n        }\n        const offset = worldAxialRadius; // Perlin noise does not like negative numbers\n        const octaves = 4;\n        for (const p of positions) {\n            let frequency = 16;\n            const n1 = perlin1.noise({\n                x: (p.x + offset) / frequency,\n                y: (p.y + offset) / frequency,\n                octaves\n            });\n            frequency = 8;\n            const n2 = perlin2.noise({\n                x: (p.x + offset) / frequency,\n                y: (p.y + offset) / frequency,\n                octaves\n            });\n            let tileType = types_1.TileType.grass;\n            const borderDistance = landAxialRadius + n2;\n            if (Math.abs(p.x) > borderDistance || Math.abs(p.y) > borderDistance) {\n                tileType = types_1.TileType.water;\n            }\n            else if (n1 < -0.2) {\n                tileType = types_1.TileType.water;\n            }\n            else if (n1 < -0.1) {\n                tileType = types_1.TileType.sand;\n            }\n            else if (n1 < 0) {\n                tileType = types_1.TileType.dirt;\n            }\n            else if (n1 < 0.2) {\n                tileType = types_1.TileType.dryGrass;\n            }\n            else if (n1 < 0.4) {\n                tileType = types_1.TileType.grass;\n            }\n            else if (n1 < 0.7) {\n                tileType = types_1.TileType.stone;\n            }\n            else if (n1 < 1.0) {\n                tileType = types_1.TileType.lava;\n            }\n            let wz = 0;\n            if (tileType === types_1.TileType.water) {\n                wz = 0;\n            }\n            else if (n1 < 0.2) {\n                wz = 0;\n            }\n            else if (n1 < 0.4) {\n                wz = 1;\n            }\n            else if (n1 < 1.0) {\n                wz = 2;\n            }\n            for (let zz = 0; zz <= wz; zz++) {\n                tiles.push({ p: { x: p.x, y: p.y, z: zz }, tileType });\n            }\n            const AddDecorativeTile = (tileType, z = 1) => {\n                tiles.push({\n                    p: { x: p.x, y: p.y, z: wz + z },\n                    tileType\n                });\n            };\n            const r = Math.random();\n            if (tileType === types_1.TileType.grass) {\n                if (r < 0.1) {\n                    AddDecorativeTile(types_1.TileType.plant);\n                }\n                else if (r < 0.15) {\n                    AddDecorativeTile(types_1.TileType.log);\n                    AddDecorativeTile(types_1.TileType.canopy, 2);\n                }\n                else if (r < 0.2) {\n                    AddDecorativeTile(types_1.TileType.smallStones);\n                }\n            }\n            else if (tileType === types_1.TileType.sand && r > 0.9) {\n                AddDecorativeTile(types_1.TileType.cactus);\n            }\n            else if (tileType === types_1.TileType.stone && r > 0.95) {\n                AddDecorativeTile(types_1.TileType.largeStones);\n            }\n        }\n        _tiles = tiles;\n        const allowedLavaNeighbours = [types_1.TileType.stone, types_1.TileType.lava];\n        // only allow lava tiles which are surrounded by stone\n        for (let tile of _tiles) {\n            if (tile.tileType === types_1.TileType.lava) {\n                const neighbours = [\n                    { p: { x: 0, y: 0, z: 1 }, tileTypes: [undefined] },\n                    {\n                        p: { x: 1, y: 0, z: 0 },\n                        tileTypes: allowedLavaNeighbours\n                    },\n                    {\n                        p: { x: 0, y: 1, z: 0 },\n                        tileTypes: allowedLavaNeighbours\n                    },\n                    {\n                        p: { x: -1, y: 0, z: 0 },\n                        tileTypes: allowedLavaNeighbours\n                    },\n                    {\n                        p: { x: 0, y: -1, z: 0 },\n                        tileTypes: allowedLavaNeighbours\n                    }\n                ];\n                for (let neighbour of neighbours) {\n                    const other = GetTile({\n                        x: tile.p.x + neighbour.p.x,\n                        y: tile.p.y + neighbour.p.y,\n                        z: tile.p.z + neighbour.p.z\n                    });\n                    if (!neighbour.tileTypes.includes(other?.tileType)) {\n                        tile.tileType = types_1.TileType.stone;\n                        break;\n                    }\n                }\n            }\n        }\n    };\n    return {\n        SetCursorWorldPosition,\n        GetCursorWorldPosition,\n        GetTile,\n        GetTiles,\n        GenerateTiles,\n        GetSurfaceTile\n    };\n};\nexports.CreateWorld = CreateWorld;\n\n\n//# sourceURL=webpack:///./src/front_end/world/main.ts?");

/***/ }),

/***/ "./src/front_end/world/types.ts":
/*!**************************************!*\
  !*** ./src/front_end/world/types.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.TileType = void 0;\nvar TileType;\n(function (TileType) {\n    TileType[\"dirt\"] = \"dirt\";\n    TileType[\"grass\"] = \"grass\";\n    TileType[\"stone\"] = \"stone\";\n    TileType[\"sand\"] = \"sand\";\n    TileType[\"water\"] = \"water\";\n    TileType[\"plant\"] = \"plant\";\n    TileType[\"cactus\"] = \"cactus\";\n    TileType[\"log\"] = \"log\";\n    TileType[\"canopy\"] = \"canopy\";\n    TileType[\"dryGrass\"] = \"dryGrass\";\n    TileType[\"smallStones\"] = \"smallStones\";\n    TileType[\"largeStones\"] = \"largeStones\";\n    TileType[\"lava\"] = \"lava\";\n})(TileType || (exports.TileType = TileType = {}));\n\n\n//# sourceURL=webpack:///./src/front_end/world/types.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/front_end/main.ts");
/******/ 	
/******/ })()
;