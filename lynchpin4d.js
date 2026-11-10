// Geometry of the Lynchpin in four dimensions. Pure math with no rendering,
// so the same code drives the page (index.html) and the tests (tests/*.test.mjs).
//
// Four rays leave one point. Six regular pentagons each fill the wedge between
// two of the rays. In three dimensions the rays meet at arccos(-1/3) = 109.47 deg,
// which leaves a 1.47 deg mismatch against the 108 deg pentagon corner. Tilting
// every ray by TILT_MAX = 7.76 deg into the fourth dimension brings the ray
// angle to exactly 108 deg, and the figure becomes one vertex of the 120-cell.

export const PHI = (1 + Math.sqrt(5)) / 2;
export const TETRA_ANGLE = Math.acos(-1 / 3);
export const PENTAGON_ANGLE = (3 * Math.PI) / 5;
// sin(TILT_MAX)^2 = (1 + 3 cos 108deg) / 4 = 1 / (8 PHI^4)
export const TILT_MAX = Math.asin(1 / (2 * Math.SQRT2 * PHI * PHI));

const S3 = 1 / Math.sqrt(3);
export const TETRA_DIRS = [
  [S3, S3, S3],
  [S3, -S3, -S3],
  [-S3, S3, -S3],
  [-S3, -S3, S3],
];
export const PAIRS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
];

export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const add = (a, b) => a.map((x, i) => x + b[i]);
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const scale = (a, k) => a.map((x) => x * k);
export const norm = (a) => Math.sqrt(dot(a, a));
export const unit = (a) => scale(a, 1 / norm(a));
export const dist = (a, b) => norm(sub(a, b));

// The four unit rays in R^4 for a given tilt out of the xyz hyperplane.
export function rays(tilt) {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return TETRA_DIRS.map((d) => [c * d[0], c * d[1], c * d[2], s]);
}

// Angle between any two of the rays. It falls from 109.47 deg to 108 deg.
export function rayAngle(tilt) {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return Math.acos(-(c * c) / 3 + s * s);
}

// Regular pentagon with one corner at the origin, lying in the plane of the
// rays u and v and centred on their bisector. Corners in order O, A, C, D, B,
// where A is the corner next to ray u and B the corner next to ray v.
export function pentagon(u, v, side = 1) {
  const m = unit(add(u, v));
  const n = unit(sub(u, v));
  const h = PENTAGON_ANGLE / 2;
  const a = add(scale(m, side * Math.cos(h)), scale(n, side * Math.sin(h)));
  const b = sub(scale(m, side * Math.cos(h)), scale(n, side * Math.sin(h)));
  const O = u.map(() => 0);
  return [O, a, add(b, scale(a, PHI)), add(a, scale(b, PHI)), b];
}

// The whole figure for a tilt. Rays and pentagon corners are points of R^4.
export function lynchpin(tilt, side = 1) {
  const r = rays(tilt);
  return {
    rays: r.map((u) => scale(u, side)),
    pentagons: PAIRS.map(([i, j]) => pentagon(r[i], r[j], side)),
  };
}

// Distance between the corners of two neighbouring pentagons that should meet
// at the tip of the same ray, for side length 1.
export function cornerGap(tilt) {
  const r = rays(tilt);
  return dist(pentagon(r[0], r[1])[1], pentagon(r[0], r[2])[1]);
}

// Distance from a pentagon corner to the tip of the ray it should lie on,
// for side length 1.
export function sideGap(tilt) {
  const r = rays(tilt);
  return dist(pentagon(r[0], r[1])[1], r[0]);
}

// Rotation of a point of R^4 in the xw, yw and zw planes, applied in that order.
export function rotate4(p, axw, ayw, azw) {
  let [x, y, z, w] = p;
  let c = Math.cos(axw);
  let s = Math.sin(axw);
  [x, w] = [c * x - s * w, s * x + c * w];
  c = Math.cos(ayw);
  s = Math.sin(ayw);
  [y, w] = [c * y - s * w, s * y + c * w];
  c = Math.cos(azw);
  s = Math.sin(azw);
  [z, w] = [c * z - s * w, s * z + c * w];
  return [x, y, z, w];
}

// Projection from R^4 to R^3. Without an eye distance the w coordinate is
// dropped (the shadow). With one, the point is seen from w = -eye.
export function project(p, eye = 0) {
  const f = eye > 0 ? eye / (eye + p[3]) : 1;
  return [p[0] * f, p[1] * f, p[2] * f];
}

function permutations(a) {
  if (a.length <= 1) return [a];
  const out = [];
  a.forEach((x, i) => {
    const rest = [...a.slice(0, i), ...a.slice(i + 1)];
    for (const p of permutations(rest)) out.push([x, ...p]);
  });
  return out;
}

function isEven(perm) {
  let inv = 0;
  for (let i = 0; i < perm.length; i++)
    for (let j = i + 1; j < perm.length; j++) if (perm[i] > perm[j]) inv++;
  return inv % 2 === 0;
}

function signed(v) {
  let out = [[]];
  for (const x of v) {
    const next = [];
    for (const o of out) {
      next.push([...o, x]);
      if (x !== 0) next.push([...o, -x]);
    }
    out = next;
  }
  return out;
}

// The 600 vertices of the 120-cell centred at the origin with circumradius
// sqrt(8) and edge length 3 - sqrt(5), with its 1200 edges as index pairs.
export function cell120() {
  const f = PHI;
  const r5 = Math.sqrt(5);
  const all = [
    [0, 0, 2, 2],
    [1, 1, 1, r5],
    [1 / (f * f), f, f, f],
    [1 / f, 1 / f, 1 / f, f * f],
  ];
  const even = [
    [0, 1 / (f * f), 1, f * f],
    [0, 1 / f, f, r5],
    [1 / f, 1, f, 2],
  ];
  const seen = new Map();
  const put = (v) => seen.set(v.map((x) => x.toFixed(6)).join(","), v);
  const idx = permutations([0, 1, 2, 3]);
  for (const base of all)
    for (const p of idx) for (const v of signed(p.map((i) => base[i]))) put(v);
  for (const base of even)
    for (const p of idx.filter(isEven))
      for (const v of signed(p.map((i) => base[i]))) put(v);
  const vertices = [...seen.values()];
  const e2 = (3 - r5) ** 2;
  const edges = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++) {
      const d = sub(vertices[i], vertices[j]);
      if (Math.abs(dot(d, d) - e2) < 1e-6) edges.push([i, j]);
    }
  return { vertices, edges, edge: 3 - r5, radius: Math.sqrt(8) };
}

// The 120-cell moved into the frame of the Lynchpin. One vertex sits at the
// origin, the edge length is 1 and the four edges at the origin are exactly
// rays(TILT_MAX). Edges are sorted by shell, the number of edge steps from the
// origin to their farther end, and shellEnd[k] counts the edges within k steps.
export function cell120AtVertex() {
  const { vertices, edges, edge, radius } = cell120();
  const v0 = vertices[0];
  const w = scale(v0, -1 / radius);
  const nb = Array.from({ length: vertices.length }, () => []);
  for (const [i, j] of edges) {
    nb[i].push(j);
    nb[j].push(i);
  }
  // Tetrahedral directions of the four edges at v0 inside the hyperplane.
  const h = nb[0].map((j) => {
    const d = scale(sub(vertices[j], v0), 1 / edge);
    return unit(sub(d, scale(w, dot(d, w))));
  });
  const points = vertices.map((p) => {
    const q = scale(sub(p, v0), 1 / edge);
    const out = [0, 0, 0, dot(q, w)];
    h.forEach((hi, i) => {
      const k = 0.75 * dot(q, hi);
      for (let a = 0; a < 3; a++) out[a] += k * TETRA_DIRS[i][a];
    });
    return out;
  });
  const steps = new Array(vertices.length).fill(-1);
  steps[0] = 0;
  let queue = [0];
  while (queue.length) {
    const next = [];
    for (const i of queue)
      for (const j of nb[i])
        if (steps[j] < 0) {
          steps[j] = steps[i] + 1;
          next.push(j);
        }
    queue = next;
  }
  const shell = ([i, j]) => Math.max(steps[i], steps[j]);
  const sorted = [...edges].sort((a, b) => shell(a) - shell(b));
  const maxShell = shell(sorted[sorted.length - 1]);
  const shellEnd = [];
  for (let k = 0, n = 0; k <= maxShell; k++) {
    while (n < sorted.length && shell(sorted[n]) <= k) n++;
    shellEnd.push(n);
  }
  return { points, edges: sorted, steps, shellEnd, neighbours: nb[0] };
}
