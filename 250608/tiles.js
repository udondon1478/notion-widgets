function stagger({ total, steps, each, ease, start = 0 }) {
    let space = total - each
    let vals = []

    for (let i = 0; i < steps; i++) {
        let dec = i / (steps - 1)
        if (ease) dec = ease[ease](dec)

        let startVal = space * dec + start
        vals.push({ start: startVal, duration: each, end: startVal + each })
    }

    return vals
}

function rotateAround(x, y, angle) {
    translate(x, y)
    rotate(angle)
    translate(-x, -y)
}

function flipXOver(x) {
    translate(x, 0)
    scale(-1, 1)
    translate(-x, 0)
}

function flipYOver(y) {
    translate(0, y)
    scale(1, -1)
    translate(0, -y)
}

class Tile {
    constructor({ x, y, sz, clr, unit, rotate = 0, delay = 0 }) {
        this.time = 0
        this.dur = 2000
        this.pr = 0
        this.stage = 'delay'
        this.x = x
        this.y = y
        this.sz = sz
        this.unit = unit
        this.prevSizes = null
        this.delay = delay
        this.delayTime = 0
        this.clr = clr
        this.flipped = false
        this.rotate = rotate
    }

    get sizes() {
        if (this.prevSizes && this.prevSizes.unit === this.unit) return this.prevSizes
        let x = this.x * this.unit
        let y = this.y * this.unit
        let sz = this.sz * this.unit
        return {
            x,
            y,
            sz,
            top: y - sz / 2,
            bottom: y + sz / 2,
            left: x - sz / 2,
            right: x + sz / 2,
            unit: this.unit,
        }
    }

    update(delta) {
        if (this.stage === 'delay') {
            this.delayTime += delta
            if (this.delayTime >= this.delay) {
                this.enter()
            }
            return
        }

        if (this.stage === 'in') {
            this.time += delta
            this.pr = map(this.time, 0, this.dur, 0, 1)
            if (this.time >= this.dur) {
                this.show()
            }
            return
        }

        if (this.stage === 'out') {
            this.time += delta
            this.pr = map(this.time, 0, this.dur, 0, 1)
            if (this.time >= this.dur) {
                this.stage = 'hide'
                this.pr = 1
            }
            return
        }

        if (this.stage === 'flip') {
            this.time += delta
            this.pr = map(this.time, 0, this.dur, 0, 1)
            if (this.time >= this.dur) {
                this.stage = 'show'
                this.pr = 1
                this.flipped = !this.flipped
            }
        }
    }

    transform(flip) {
        let { x, y, sz } = this.sizes
        if (flip) {
            if (this.rotate === 0 || this.rotate === 2) {
                flipYOver(y + (this.rotate === 0 ? -sz / 2 : sz / 2))
            } else {
                flipXOver(x + (this.rotate === 1 ? sz / 2 : -sz / 2))
            }
        }
        rotateAround(x, y, this.rotate * (PI / 2))
    }

    draw() {
        if (this.stage === 'hide' || this.stage === 'delay') return

        stroke(this.clr).noFill().strokeWeight(2)

        push()
        this.transform(this.flipped)
        this.tDraw(
            this.stage === 'flip' || this.stage === 'out' ? 1 - this.pr : this.pr,
            this.stage === 'in' ? 1 : -1
        )
        pop()

        if (this.stage === 'flip') {
            push()
            this.transform(!this.flipped)
            this.tDraw(this.pr, 1)
            pop()
        }
    }

    show() {
        this.stage = 'show'
        this.pr = 1
    }

    leave() {
        this.stage = 'out'
        this.time = 0
        this.pr = 0
    }

    enter() {
        this.stage = 'in'
        this.time = 0
        this.pr = 0
    }

    flip() {
        this.stage = 'flip'
        this.time = 0
        this.pr = 0
    }
}

class TileTris extends Tile {
    constructor(...args) {
        super(...args)
        let steps = 2
        this.stagger = stagger({ total: 1, steps, each: 0.75 })
    }

    drawTri(progress) {
        let { sz } = this.sizes
        let y = (sz / this.stagger.length) * progress
        let x = (sz / 2) * progress
        beginShape()
        vertex(0, 0)
        vertex(-x, y)
        vertex(x, y)
        endShape(CLOSE)
    }

    tDraw(pr) {
        let { x, y, sz } = this.sizes
        push()
        translate(x, y)

        let translateStep = sz / this.stagger.length

        pr = ease.inOutCubic(pr)

        translate(0, -sz / 2)
        this.stagger.forEach((s) => {
            let tripr = constrain(norm(pr, s.start, s.end), 0, 1)
            if (tripr > 0) this.drawTri(tripr)
            translate(0, translateStep)
        })
        pop()
    }
}

class TileTriSquare extends Tile {
    constructor(...args) {
        super(...args)
    }

    tDraw(pr) {
        stroke(this.clr).fill(`${this.clr}20`)
        let { sz, left, right, top, bottom } = this.sizes

        let prease = ease.inOutCubic(pr)
        let curSize = sz * constrain(norm(prease, 0, 0.45), 0, 1)

        let x = lerp(left, right, prease)
        let y = lerp(top, bottom, prease)
        beginShape()
        vertex(left, top + curSize)
        vertex(left, top)
        vertex(left + curSize, top)
        vertex(x, y)
        endShape(CLOSE)
    }
}

class TileLines extends Tile {
    constructor(...args) {
        super(...args)
        this.lineCount = random([9, 5])
        this.lineStagger = stagger({
            total: 1,
            steps: this.lineCount,
            each: 0.5,
        })

        this.lineSpacing = this.sz / (this.lineCount - 1)
    }

    updateLineVals() {
        this.lineSpacing = this.sz / (this.lineCount - 1)
        this.lineStagger = stagger({ total: 1, steps: this.lineCount, each: 0.5 })
    }

    tDraw(pr) {
        let { sz, top, left } = this.sizes
        let space = sz / (this.lineCount - 1)
        let y1 = top

        this.lineStagger.forEach((lineInst, i) => {
            if (pr < lineInst.start) return
            let lp = constrain(norm(pr, lineInst.start, lineInst.end), 0, 1)
            lp = ease.inOutCubic(lp)

            let linex = left + space * i
            let y2 = y1 + sz * lp
            line(linex, y1, linex, y2)
        })
    }
}

class TileArc extends Tile {
    constructor(...args) {
        super(...args)

        this.arcSizeMin = 0.25
        this.stagger = stagger({ total: 1, steps: 4, each: 0.5 })
    }

    tDraw(pr) {
        let { top, left, x, y, sz } = this.sizes
        let sizeStep = (1 - this.arcSizeMin) / (this.stagger.length - 1)

        this.stagger.forEach((s, i) => {
            if (pr <= s.start) return
            let r = sz - sz * sizeStep * i
            let pri = constrain(norm(pr, s.start, s.end), 0, 1)
            pri = ease.inOutQuart(pri)
            let angle = (Math.PI / 2) * pri

            if (angle < 0.00001) angle = 0

            arc(left, top, r * 2, r * 2, 0, angle)
        })
    }
}
