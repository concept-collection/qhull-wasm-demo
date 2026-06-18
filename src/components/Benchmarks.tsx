import { useState } from 'react'
import {
  Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, LinearProgress, Link,
} from '@mui/material'
import { getQhull } from '../qhull'
import { points2D, points3D } from '../points'
import benchScript from '../../scripts/qhull_benchmark.m?raw'

const SIZES = [1000, 5000, 20000, 50000]

interface Row { n: number; ms2: number; ms3: number; simp2: number; simp3: number }

const yield_ = () => new Promise((r) => setTimeout(r, 0))

export function Benchmarks() {
  const [rows, setRows] = useState<Row[]>([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const run = async () => {
    setRunning(true); setRows([]); setProgress(0)
    const q = await getQhull()
    const out: Row[] = []
    for (let i = 0; i < SIZES.length; i++) {
      const n = SIZES[i]
      await yield_()
      const p2 = points2D(n, 'uniform', 12345 + i)
      let t = performance.now()
      const r2 = q.delaunay(p2, 2)
      const ms2 = performance.now() - t

      const p3 = points3D(n, 'uniform', 54321 + i)
      t = performance.now()
      const r3 = q.delaunay(p3, 3)
      const ms3 = performance.now() - t

      out.push({ n, ms2, ms3, simp2: r2.facets.length, simp3: r3.facets.length })
      setRows([...out]); setProgress(((i + 1) / SIZES.length) * 100)
    }
    setRunning(false)
  }

  const download = () => {
    const blob = new Blob([benchScript], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'qhull_benchmark.m'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Delaunay triangulation of uniform random points, timed in your browser via qhull-wasm.
        Run the matching <code>.m</code> script below in MATLAB, Octave, or{' '}
        <Link href="https://numbl.org" target="_blank" rel="noreferrer">numbl</Link> for an
        apples-to-apples comparison (all three triangulate via Qhull).
      </Typography>

      <Box>
        <Button variant="contained" onClick={run} disabled={running}>
          {running ? 'Running…' : 'Run benchmark'}
        </Button>
      </Box>
      {running && <LinearProgress variant="determinate" value={progress} />}

      {rows.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 640 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>N</TableCell>
                <TableCell align="right">2D (ms)</TableCell>
                <TableCell align="right">2D simplices</TableCell>
                <TableCell align="right">3D (ms)</TableCell>
                <TableCell align="right">3D simplices</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.n}>
                  <TableCell>{r.n.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.ms2.toFixed(1)}</TableCell>
                  <TableCell align="right">{r.simp2.toLocaleString()}</TableCell>
                  <TableCell align="right">{r.ms3.toFixed(1)}</TableCell>
                  <TableCell align="right">{r.simp3.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">Comparison script (MATLAB / Octave / numbl)</Typography>
        <Button size="small" onClick={() => navigator.clipboard?.writeText(benchScript)}>Copy</Button>
        <Button size="small" onClick={download}>Download .m</Button>
      </Stack>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: '#0f1722', overflow: 'auto' }}>
        <pre style={{ margin: 0, color: '#e0e0e0', fontSize: 13, lineHeight: 1.45 }}>{benchScript}</pre>
      </Paper>
    </Stack>
  )
}
