const ease = {
    inSine: (x) => 1 - Math.cos((x * Math.PI) / 2),
    outSine: (x) => Math.sin((x * Math.PI) / 2),
    inOutSine: (x) => -0.5 * (Math.cos(Math.PI * x) - 1),
    inQuad: (x) => x * x,
    outQuad: (x) => x * (2 - x),
    inOutQuad: (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x),
    inCubic: (x) => x * x * x,
    outCubic: (x) => 1 - Math.pow(1 - x, 3),
    inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    inQuart: (x) => x * x * x * x,
    outQuart: (x) => 1 - Math.pow(1 - x, 4),
    inOutQuart: (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2),
    inQuint: (x) => x * x * x * x * x,
    outQuint: (x) => 1 - Math.pow(1 - x, 5),
    inOutQuint: (x) => (x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2),
    inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
    outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inCirc: (x) => 1 - Math.sqrt(1 - x * x),
    outCirc: (x) => Math.sqrt(1 - Math.pow(x - 1, 2)),
    inOutCirc: (x) =>
        x < 0.5
            ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
            : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2,
    outSquareRoot: (x) => Math.sqrt(x),
    inSquareRoot: (x) => 1 - Math.sqrt(1 - x),
    linear: (x) => x,
}