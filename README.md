# qhull-wasm-demo

Interactive demos and benchmarks for
[qhull-wasm](https://github.com/magland/qhull-wasm) — [Qhull](http://www.qhull.org)
compiled to WebAssembly for computing convex hulls and Delaunay triangulations
in the browser.

**Live:** https://concept-collection.github.io/qhull-wasm-demo/

- **2D Triangulation** — Delaunay triangulation + convex hull of a point set;
  click to add points, switch distributions, toggle circumcircles.
- **3D Convex Hull** — triangulated hull of a 3D point cloud, rendered with
  three.js (drag to rotate).
- **Benchmarks** — times Delaunay triangulation in the browser, alongside a
  `.m` script that runs identically in MATLAB, Octave, and
  [numbl](https://numbl.org) (all triangulate via Qhull) for an apples-to-apples
  desktop-vs-browser comparison. See [scripts/qhull_benchmark.m](scripts/qhull_benchmark.m).

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

Deployed to GitHub Pages by [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
on push to `main`.
