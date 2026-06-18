import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel,
  MenuItem, Select, Slider, Stack, Typography,
} from '@mui/material'
import { getQhull } from '../qhull'
import { points2D, type Dist2D } from '../points'

const SIZE = 520
const PAD = 24

export function Delaunay2D() {
  const [dist, setDist] = useState<Dist2D>('uniform')
  const [n, setN] = useState(60)
  const [seed, setSeed] = useState(1)
  const [extra, setExtra] = useState<number[][]>([])
  const [showTri, setShowTri] = useState(true)
  const [showHull, setShowHull] = useState(true)
  const [showCircles, setShowCircles] = useState(false)

  const pts = useMemo(
    () => [...points2D(n, dist, seed), ...extra],
    [n, dist, seed, extra],
  )

  const [tris, setTris] = useState<number[][]>([])
  const [hull, setHull] = useState<number[][]>([])

  useEffect(() => {
    let cancelled = false
    getQhull().then((q) => {
      if (cancelled || pts.length < 3) {
        setTris([]); setHull([]); return
      }
      try {
        setTris(q.delaunay(pts, 2).facets)
        setHull(q.convexHull(pts, 2).facets)
      } catch {
        setTris([]); setHull([])
      }
    })
    return () => { cancelled = true }
  }, [pts])

  // Map data coords (roughly [0,1]) to screen.
  const toScreen = useCallback((p: number[]) => [
    PAD + p[0] * (SIZE - 2 * PAD),
    SIZE - (PAD + p[1] * (SIZE - 2 * PAD)),
  ], [])

  const svgRef = useRef<SVGSVGElement>(null)
  const addPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * SIZE
    const sy = ((e.clientY - r.top) / r.height) * SIZE
    const x = (sx - PAD) / (SIZE - 2 * PAD)
    const y = (SIZE - sy - PAD) / (SIZE - 2 * PAD)
    setExtra((cur) => [...cur, [x, y]])
  }

  const circles = useMemo(
    () => (showCircles ? tris.map((t) => circumcircle(pts[t[0]], pts[t[1]], pts[t[2]])) : []),
    [showCircles, tris, pts],
  )

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Delaunay triangulation (blue) and convex hull (orange) computed by qhull-wasm.
        Click the canvas to add points.
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Distribution</InputLabel>
          <Select label="Distribution" value={dist} onChange={(e) => { setDist(e.target.value as Dist2D); setExtra([]) }}>
            <MenuItem value="uniform">Uniform</MenuItem>
            <MenuItem value="disk">Disk</MenuItem>
            <MenuItem value="gaussian">Gaussian</MenuItem>
            <MenuItem value="grid">Jittered grid</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ width: 180 }}>
          <Typography variant="caption">Points: {n}</Typography>
          <Slider size="small" min={4} max={400} value={n} onChange={(_, v) => setN(v as number)} />
        </Box>
        <Button size="small" variant="outlined" onClick={() => { setSeed((s) => s + 1); setExtra([]) }}>
          Regenerate
        </Button>
        <FormControlLabel control={<Checkbox size="small" checked={showTri} onChange={(e) => setShowTri(e.target.checked)} />} label="Triangulation" />
        <FormControlLabel control={<Checkbox size="small" checked={showHull} onChange={(e) => setShowHull(e.target.checked)} />} label="Hull" />
        <FormControlLabel control={<Checkbox size="small" checked={showCircles} onChange={(e) => setShowCircles(e.target.checked)} />} label="Circumcircles" />
      </Stack>

      <Box sx={{ border: '1px solid #ddd', borderRadius: 1, width: 'fit-content', maxWidth: '100%' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ width: SIZE, maxWidth: '100%', height: 'auto', display: 'block', cursor: 'crosshair', background: '#fafafa' }}
          onClick={addPoint}
        >
          {showCircles && circles.map((c, i) => c && (
            <circle key={`c${i}`} cx={toScreen([c.x, c.y])[0]} cy={toScreen([c.x, c.y])[1]}
              r={c.r * (SIZE - 2 * PAD)} fill="none" stroke="#26a69a" strokeWidth={0.5} opacity={0.4} />
          ))}
          {showTri && tris.map((t, i) => {
            const a = toScreen(pts[t[0]]), b = toScreen(pts[t[1]]), c = toScreen(pts[t[2]])
            return <polygon key={`t${i}`} points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}`}
              fill="#1976d2" fillOpacity={0.07} stroke="#1976d2" strokeWidth={0.8} />
          })}
          {showHull && hull.map((e, i) => {
            const a = toScreen(pts[e[0]]), b = toScreen(pts[e[1]])
            return <line key={`h${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#f57c00" strokeWidth={2.2} />
          })}
          {pts.map((p, i) => {
            const s = toScreen(p)
            return <circle key={`p${i}`} cx={s[0]} cy={s[1]} r={2.4} fill="#222" />
          })}
        </svg>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {pts.length} points → {tris.length} triangles, {hull.length} hull edges.
      </Typography>
    </Stack>
  )
}

function circumcircle(a: number[], b: number[], c: number[]) {
  const ax = a[0], ay = a[1], bx = b[0], by = b[1], cx = c[0], cy = c[1]
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
  if (Math.abs(d) < 1e-12) return null
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d
  return { x: ux, y: uy, r: Math.hypot(ax - ux, ay - uy) }
}
