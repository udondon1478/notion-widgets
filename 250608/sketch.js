// https://openprocessing.org/sketch/2671282
// michelle enos

function weightedRandom(array, weights) {
	const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)
	const randomNum = random() * totalWeight
	let weightSum = 0

	for (let i = 0; i < array.length; i++) {
		weightSum += weights[i]
		if (randomNum <= weightSum) {
			return array[i]
		}
	}

	return array[array.length - 1]
}

class Drawing {
	constructor(palette) {
		this.tiles = []
		this.tileWeights = {
			arc: 0,
			lines: 4,
			tris: 5,
			triSquare: 2
		}
		this.colors = palette.colors
		this.bg = palette.bg

		this.n = 10
		this.changeInterval = 30
		this.lastTime = null
		this.lastChangeTime = null
		this.idealLength = 50
		this.noiseFreq = 0.4
		this.noiseChance = 0.6
		this.flipChance = 0.01
		this.duration = 1500

		this.m = min(width, height) * 0.75
		this.unit = this.m / this.n

		this.tiles = this.makeTiles(this.idealLength)
	}

	makeTiles(count) {
		let tiles = []
		let tries = 0

		while (tiles.length < count && tries < 100) {
			let spot = this.findSpot(tiles)
			if (spot) {
				let maybeTile = this.maybeMakeTile(spot.x, spot.y, spot.sz)
				if (maybeTile) {
					tiles.push(maybeTile)
					tries = 0
				} else {
					tries++
				}
			} else {
				tries++
			}
		}

		return tiles
	}

	findSpot(addTiles = []) {
		let x, y, sz
		let tries = 0

		while (tries < this.n * this.n) {
			x = floor(random(0, this.n))
			y = floor(random(0, this.n))
			sz = floor(random(1, 3))
			if (sz === 2 && x > 0 && y > 0) {
				x -= 0.5
				y -= 0.5
			} else {
				sz = 1
			}

			if (![...addTiles, ...this.tiles].find((t) => t.x === x && t.y === y)) {
				return { x, y, sz }
			}

			tries++
		}

		return null
	}

	maybeMakeTile(x, y, sz) {
		if (noise(x * sz * this.noiseFreq, y * sz * this.noiseFreq) < 1 - this.noiseChance)
			return null

		return this.makeTile(x, y, sz)
	}

	makeTile(x, y, sz) {
		let Opt = weightedRandom(
			[TileTris, TileTriSquare, TileLines, TileArc],
			[
				this.tileWeights.tris,
				this.tileWeights.triSquare,
				this.tileWeights.lines,
				this.tileWeights.arc,
			]
		)
		let rotateOpts = []
		if (x + sz <= this.n - 1) rotateOpts.push(1)
		if (x - sz >= 0) rotateOpts.push(3)
		if (y + sz <= this.n - 1) rotateOpts.push(2)
		if (y - sz >= 0) rotateOpts.push(0)

		let tile = new Opt({
			x,
			y,
			sz,
			rotate: random(rotateOpts),
			unit: this.unit,
			clr: random(this.colors),
		})
		tile.dur = this.duration
		tile.show()
		return tile
	}

	draw(ms) {
		if (this.lastTime === null) this.lastTime = ms
		let delta = ms - (this.lastTime || 0)
		this.lastTime = ms

		background(this.bg)

		let maybeChangeStuff = false
		if (!this.lastChangeTime) this.lastChangeTime = ms
		if (ms - this.lastChangeTime > this.changeInterval) {
			this.lastChangeTime = ms
			maybeChangeStuff = true
		}

		push()
		translate((width - this.m) / 2, (height - this.m) / 2)

		translate(this.unit / 2, this.unit / 2)

		this.tiles.forEach((tile) => {
			tile.update(delta)
			tile.draw()

			if (maybeChangeStuff && tile.stage === 'show') {
				if (random() < this.flipChance) {
					tile.flip()
				}
			}
		})

		pop()

		this.tiles = this.tiles.filter((tile) => tile.stage !== 'hide')
	}
}

let drawing

function setup() {
	createCanvas(window.innerWidth, window.innerHeight)
	strokeCap(SQUARE)
	strokeJoin(MITER)

	const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	let initialPalette = prefersDark ? palettes.find(p => p.isDark) : palettes.find(p => p.isLight);

	// デフォルトのパレットが見つからない場合は、既存のランダム選択を使用
	if (!initialPalette) {
		initialPalette = random(palettes);
	}
	
	drawing = new Drawing(initialPalette);

	// システムのテーマ変更を監視
	if (window.matchMedia) {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addListener((e) => {
			const newPalette = e.matches ? palettes.find(p => p.isDark) : palettes.find(p => p.isLight);
			if (newPalette) {
				drawing = new Drawing(newPalette);
			} else {
				drawing = new Drawing(random(palettes)); // フォールバック
			}
		});
	}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawing.m = min(width, height) * 0.75;
  drawing.unit = drawing.m / drawing.n;
  drawing.tiles = drawing.makeTiles(drawing.idealLength);
}

function draw() {
	drawing.draw(millis())
}

// function mouseClicked() {
// 	drawing = new Drawing(random(palettes))
// }