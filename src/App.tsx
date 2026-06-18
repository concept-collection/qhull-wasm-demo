import { useState } from 'react'
import {
  AppBar, Box, Container, createTheme, CssBaseline, Link, Paper, Tab, Tabs,
  ThemeProvider, Toolbar, Typography,
} from '@mui/material'
import { Delaunay2D } from './components/Delaunay2D'
import { Hull3D } from './components/Hull3D'
import { Benchmarks } from './components/Benchmarks'

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1565c0' } },
})

function App() {
  const [tab, setTab] = useState(0)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box component="img" src="/qhull-wasm-demo/qhull-logo.svg" alt="" sx={{ width: 32, height: 32, mr: 1.5 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>qhull-wasm</Typography>
          <Link href="https://github.com/magland/qhull-wasm" target="_blank" rel="noreferrer" color="inherit" underline="hover">
            GitHub
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <Link href="https://github.com/magland/qhull-wasm" target="_blank" rel="noreferrer">qhull-wasm</Link>{' '}
          is <Link href="http://www.qhull.org" target="_blank" rel="noreferrer">Qhull</Link> (the reentrant
          {' '}<code>libqhull_r</code>) compiled to WebAssembly, with a small JS API for convex hulls and
          Delaunay triangulations — the same engine MATLAB and Octave use, now running in the browser.
        </Typography>

        <Paper variant="outlined" sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="2D Triangulation" />
            <Tab label="3D Convex Hull" />
            <Tab label="Benchmarks" />
          </Tabs>
        </Paper>

        <Box sx={{ pb: 4 }}>
          {tab === 0 && <Delaunay2D />}
          {tab === 1 && <Hull3D />}
          {tab === 2 && <Benchmarks />}
        </Box>

        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 4 }}>
          qhull-wasm is MIT-licensed; it bundles Qhull (Qhull license). Part of the{' '}
          <Link href="https://github.com/concept-collection" target="_blank" rel="noreferrer">concept-collection</Link>.
        </Typography>
      </Container>
    </ThemeProvider>
  )
}

export default App
