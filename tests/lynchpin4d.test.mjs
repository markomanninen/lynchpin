// Tests of the geometry module that drives the interactive model.
// Run with   node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import * as L from "../lynchpin4d.js";

const deg = (r) => (r * 180) / Math.PI;
const close = (a, b, eps = 1e-9) =>
  assert.ok(Math.abs(a - b) < eps, `${a} differs from ${b}`);

test("flat rays meet at the tetrahedral angle", () => {
  close(deg(L.rayAngle(0)), 109.47122063449069);
  const r = L.rays(0);
  for (const [i, j] of L.PAIRS) close(L.dot(r[i], r[j]), -1 / 3);
});

test("tilted rays meet at exactly 108 degrees", () => {
  close(deg(L.TILT_MAX), 7.761243907035052);
  close(deg(L.rayAngle(L.TILT_MAX)), 108);
  const r = L.rays(L.TILT_MAX);
  for (const [i, j] of L.PAIRS) close(L.dot(r[i], r[j]), Math.cos(L.PENTAGON_ANGLE));
});

test("every pentagon is regular at every tilt", () => {
  for (const tilt of [0, L.TILT_MAX / 3, L.TILT_MAX]) {
    for (const p of L.lynchpin(tilt, 2).pentagons) {
      for (let k = 0; k < 5; k++) {
        close(L.dist(p[k], p[(k + 1) % 5]), 2);
        close(L.dist(p[k], p[(k + 2) % 5]), 2 * L.PHI);
      }
    }
  }
});

test("gaps of the flat figure match the paper", () => {
  const delta = L.TETRA_ANGLE - L.PENTAGON_ANGLE;
  close(L.sideGap(0), 2 * Math.sin(delta / 4));
  close(L.cornerGap(0), Math.sqrt(3) * Math.sin(delta / 2));
  // Millimetres for a 5 cm side.
  close(50 * L.sideGap(0), 0.6419366934, 1e-9);
  close(50 * L.cornerGap(0), 1.111844059, 1e-9);
  close(50 * 2 * Math.sin(delta / 2), 1.2838469335, 1e-9);
});

test("the figure closes in four dimensions", () => {
  close(L.sideGap(L.TILT_MAX), 0);
  close(L.cornerGap(L.TILT_MAX), 0);
  let last = Infinity;
  for (let k = 0; k <= 10; k++) {
    const g = L.cornerGap((k / 10) * L.TILT_MAX);
    assert.ok(g < last, "the gap shrinks all the way");
    last = g;
  }
});

test("the shadow of the closed figure is the tetrahedral frame", () => {
  const shadow = L.rays(L.TILT_MAX).map((u) => L.project(u));
  for (const [i, j] of L.PAIRS)
    close(L.dot(L.unit(shadow[i]), L.unit(shadow[j])), -1 / 3);
  close(L.norm(shadow[0]), Math.cos(L.TILT_MAX));
});

test("four-dimensional rotation keeps lengths", () => {
  const p = [0.3, -1.2, 0.7, 2.1];
  close(L.norm(L.rotate4(p, 0.4, -1.1, 2.3)), L.norm(p));
  const q = L.rotate4([1, 0, 0, 0], Math.PI / 2, 0, 0);
  close(q[0], 0);
  close(q[3], 1);
});

test("perspective projection scales with depth", () => {
  assert.deepEqual(L.project([1, 2, 3, 5]), [1, 2, 3]);
  const p = L.project([1, 2, 3, 4], 12);
  close(p[0], 0.75);
  close(p[2], 2.25);
});

test("the 120-cell has 600 vertices and 1200 edges", () => {
  const { vertices, edges, radius, edge } = L.cell120();
  assert.equal(vertices.length, 600);
  assert.equal(edges.length, 1200);
  for (const v of vertices) close(L.norm(v), radius);
  const degree = new Array(600).fill(0);
  for (const [i, j] of edges) {
    degree[i]++;
    degree[j]++;
    close(L.dist(vertices[i], vertices[j]), edge);
  }
  assert.ok(degree.every((d) => d === 4));
});

test("every vertex of the 120-cell is a Lynchpin", () => {
  const { vertices, edges } = L.cell120();
  const nb = vertices.map(() => []);
  for (const [i, j] of edges) {
    nb[i].push(j);
    nb[j].push(i);
  }
  const c = Math.cos(L.PENTAGON_ANGLE);
  vertices.forEach((v, i) => {
    const d = nb[i].map((j) => L.unit(L.sub(vertices[j], v)));
    for (const [a, b] of L.PAIRS) close(L.dot(d[a], d[b]), c);
  });
});

test("the 120-cell has 720 pentagons, six at every vertex", () => {
  const { vertices, edges } = L.cell120();
  const nb = vertices.map(() => []);
  for (const [i, j] of edges) {
    nb[i].push(j);
    nb[j].push(i);
  }
  const faces = new Set();
  const perVertex = new Array(600).fill(0);
  vertices.forEach((v, i) => {
    for (const [a, b] of L.PAIRS) {
      const A = L.sub(vertices[nb[i][a]], v);
      const B = L.sub(vertices[nb[i][b]], v);
      // The other two corners of the regular pentagon on the edges A and B.
      const C = L.add(v, L.add(B, L.scale(A, L.PHI)));
      const D = L.add(v, L.add(A, L.scale(B, L.PHI)));
      const find = (p) => vertices.findIndex((q) => L.dist(p, q) < 1e-6);
      const ring = [i, nb[i][a], find(C), find(D), nb[i][b]];
      assert.ok(ring.every((k) => k >= 0), "pentagon corners are vertices");
      faces.add([...ring].sort((x, y) => x - y).join(","));
      perVertex[i]++;
    }
  });
  assert.equal(faces.size, 720);
  assert.ok(perVertex.every((n) => n === 6));
});

test("the 120-cell frame puts the Lynchpin at the origin", () => {
  const cell = L.cell120AtVertex();
  close(L.norm(cell.points[0]), 0);
  const want = L.rays(L.TILT_MAX);
  const got = cell.neighbours.map((j) => cell.points[j]);
  got.forEach((p, i) => close(L.dist(p, want[i]), 0, 1e-9));
  // The frame change is a rigid motion, so every edge still has length 1.
  for (const [i, j] of cell.edges) close(L.dist(cell.points[i], cell.points[j]), 1, 1e-9);
  // The centre of the cell lies on the w axis at distance 1 / (2 sin tilt).
  const n = cell.points.length;
  const centre = cell.points.reduce((s, p) => L.add(s, p), [0, 0, 0, 0]).map((x) => x / n);
  close(L.norm(centre.slice(0, 3)), 0, 1e-9);
  close(centre[3], 1 / (2 * Math.sin(L.TILT_MAX)), 1e-9);
});

test("shells grow from the Lynchpin to the whole 120-cell", () => {
  const cell = L.cell120AtVertex();
  assert.equal(cell.shellEnd[0], 0);
  assert.equal(cell.shellEnd[1], 4);
  assert.equal(cell.shellEnd.length - 1, 15);
  assert.equal(cell.shellEnd[15], 1200);
  assert.equal(Math.max(...cell.steps), 15);
});
