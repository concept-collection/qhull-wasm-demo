// Point-set generators used by the demos and benchmarks.

/** Deterministic PRNG so demos are reproducible across reloads. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Dist2D = 'uniform' | 'disk' | 'gaussian' | 'grid'
export type Dist3D = 'uniform' | 'sphere' | 'gaussian'

/** N 2D points in roughly the unit square, by distribution. */
export function points2D(n: number, dist: Dist2D, seed = 1): number[][] {
  const r = mulberry32(seed)
  const pts: number[][] = []
  if (dist === 'grid') {
    const side = Math.ceil(Math.sqrt(n))
    for (let i = 0; i < n; i++) {
      const gx = (i % side) / (side - 1 || 1)
      const gy = Math.floor(i / side) / (side - 1 || 1)
      const j = 0.15 / side
      pts.push([gx + (r() - 0.5) * j, gy + (r() - 0.5) * j])
    }
    return pts
  }
  for (let i = 0; i < n; i++) {
    if (dist === 'uniform') {
      pts.push([r(), r()])
    } else if (dist === 'disk') {
      const a = r() * 2 * Math.PI
      const rad = Math.sqrt(r()) * 0.5
      pts.push([0.5 + rad * Math.cos(a), 0.5 + rad * Math.sin(a)])
    } else {
      pts.push([0.5 + gaussian(r) * 0.15, 0.5 + gaussian(r) * 0.15])
    }
  }
  return pts
}

/** N 3D points, by distribution. */
export function points3D(n: number, dist: Dist3D, seed = 1): number[][] {
  const r = mulberry32(seed)
  const pts: number[][] = []
  for (let i = 0; i < n; i++) {
    if (dist === 'uniform') {
      pts.push([r() - 0.5, r() - 0.5, r() - 0.5])
    } else if (dist === 'sphere') {
      // uniform on the unit sphere surface
      const u = r() * 2 - 1
      const phi = r() * 2 * Math.PI
      const s = Math.sqrt(1 - u * u)
      pts.push([s * Math.cos(phi) * 0.5, s * Math.sin(phi) * 0.5, u * 0.5])
    } else {
      pts.push([gaussian(r) * 0.2, gaussian(r) * 0.2, gaussian(r) * 0.2])
    }
  }
  return pts
}

function gaussian(r: () => number): number {
  // Box-Muller
  const u = Math.max(r(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}
