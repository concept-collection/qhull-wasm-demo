import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel,
  MenuItem, Select, Slider, Stack, Typography,
} from '@mui/material'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { getQhull } from '../qhull'
import { points3D, type Dist3D } from '../points'

export function Hull3D() {
  const [dist, setDist] = useState<Dist3D>('gaussian')
  const [n, setN] = useState(120)
  const [seed, setSeed] = useState(1)
  const [showPoints, setShowPoints] = useState(true)
  const [wireframe, setWireframe] = useState(true)
  const [spin, setSpin] = useState(true)

  const pts = useMemo(() => points3D(n, dist, seed), [n, dist, seed])
  const [hull, setHull] = useState<number[][]>([])

  useEffect(() => {
    let cancelled = false
    getQhull().then((q) => {
      if (cancelled) return
      try { setHull(q.convexHull(pts, 3).facets) } catch { setHull([]) }
    })
    return () => { cancelled = true }
  }, [pts])

  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    group: THREE.Group
  } | null>(null)
  const spinRef = useRef(spin)
  spinRef.current = spin

  // One-time scene setup.
  useEffect(() => {
    const mount = mountRef.current!
    const w = mount.clientWidth, h = 480
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(w, h)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0f1722')
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 100)
    camera.position.set(1.6, 1.2, 1.8)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(2, 3, 4)
    scene.add(dir)

    const group = new THREE.Group()
    scene.add(group)

    sceneRef.current = { renderer, scene, camera, controls, group }

    let raf = 0
    const animate = () => {
      raf = requestAnimationFrame(animate)
      if (spinRef.current) group.rotation.y += 0.004
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nw = mount.clientWidth
      camera.aspect = nw / h
      camera.updateProjectionMatrix()
      renderer.setSize(nw, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  // Rebuild geometry when points / hull / toggles change.
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const { group } = s
    group.traverse((o) => {
      const any = o as Partial<THREE.Mesh>
      any.geometry?.dispose()
      const mat = any.material
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    group.clear()

    // center & scale points to fit a unit-ish box
    const flat = pts.flat()
    const c = [0, 1, 2].map((k) => mean(pts.map((p) => p[k])))
    const span = Math.max(1e-6, ...flat.map((v, i) => Math.abs(v - c[i % 3]))) * 2
    const scale = 1.4 / span
    const xf = (p: number[]) => new THREE.Vector3(
      (p[0] - c[0]) * scale, (p[1] - c[1]) * scale, (p[2] - c[2]) * scale,
    )

    if (hull.length) {
      const geo = new THREE.BufferGeometry()
      const verts: number[] = []
      for (const f of hull) for (const idx of f) {
        const v = xf(pts[idx]); verts.push(v.x, v.y, v.z)
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      geo.computeVertexNormals()
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0x42a5f5, transparent: true, opacity: 0.55,
        side: THREE.DoubleSide, flatShading: true,
      }))
      group.add(mesh)
      if (wireframe) {
        group.add(new THREE.LineSegments(
          new THREE.WireframeGeometry(geo),
          new THREE.LineBasicMaterial({ color: 0x90caf9, transparent: true, opacity: 0.5 }),
        ))
      }
    }

    if (showPoints) {
      const pg = new THREE.BufferGeometry()
      pg.setAttribute('position', new THREE.Float32BufferAttribute(
        pts.flatMap((p) => { const v = xf(p); return [v.x, v.y, v.z] }), 3))
      group.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd54f, size: 0.04 })))
    }
  }, [pts, hull, showPoints, wireframe])

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Convex hull of a 3D point cloud, triangulated by qhull-wasm and rendered with three.js. Drag to rotate.
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" useFlexGap>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Distribution</InputLabel>
          <Select label="Distribution" value={dist} onChange={(e) => setDist(e.target.value as Dist3D)}>
            <MenuItem value="gaussian">Gaussian blob</MenuItem>
            <MenuItem value="uniform">Uniform cube</MenuItem>
            <MenuItem value="sphere">Sphere surface</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ width: 180 }}>
          <Typography variant="caption">Points: {n}</Typography>
          <Slider size="small" min={8} max={2000} value={n} onChange={(_, v) => setN(v as number)} />
        </Box>
        <Button size="small" variant="outlined" onClick={() => setSeed((x) => x + 1)}>Regenerate</Button>
        <FormControlLabel control={<Checkbox size="small" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} />} label="Points" />
        <FormControlLabel control={<Checkbox size="small" checked={wireframe} onChange={(e) => setWireframe(e.target.checked)} />} label="Wireframe" />
        <FormControlLabel control={<Checkbox size="small" checked={spin} onChange={(e) => setSpin(e.target.checked)} />} label="Spin" />
      </Stack>
      <Box ref={mountRef} sx={{ width: '100%', borderRadius: 1, overflow: 'hidden', lineHeight: 0 }} />
      <Typography variant="body2" color="text.secondary">
        {pts.length} points → hull with {hull.length} triangular facets.
      </Typography>
    </Stack>
  )
}

function mean(a: number[]) { return a.reduce((s, x) => s + x, 0) / (a.length || 1) }
