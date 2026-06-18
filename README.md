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
  desktop-vs-browser comparison. See [scripts/qhull_benchmark.m](scripts/qhull_benchmark.m):

  ```
  matlab -batch qhull_benchmark      # MATLAB
  octave qhull_benchmark.m           # Octave
  numbl run qhull_benchmark.m        # numbl
  ```

  Reference desktop timings, Delaunay in ms (one Linux laptop — hardware-dependent):

  | N      | numbl 2D | numbl 3D | Octave 2D | Octave 3D | MATLAB 2D | MATLAB 3D |
  |--------|---------:|---------:|----------:|----------:|----------:|----------:|
  | 1,000  |      4.1 |     16.5 |       4.5 |      10.1 |      21.1 |      21.3 |
  | 5,000  |     18.6 |     54.3 |      12.2 |      61.3 |      28.6 |     185.5 |
  | 20,000 |     65.5 |    287.3 |      55.6 |     336.3 |     179.9 |     624.2 |
  | 50,000 |    154.7 |    757.0 |     174.9 |     973.9 |     373.8 |    1703.9 |

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
```

Deployed to GitHub Pages by [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
on push to `main`.
