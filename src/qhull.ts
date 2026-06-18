// Single shared instance of the qhull-wasm module.
//
// In a Vite bundle the .wasm cannot be located next to the glue at runtime, so
// we resolve its URL via Vite's `?url` import and feed it to Emscripten's
// `locateFile`.
import { loadQhull, type Qhull } from 'qhull-wasm'
import wasmUrl from 'qhull-wasm/dist/qhull.wasm?url'

let qhullPromise: Promise<Qhull> | null = null

export function getQhull(): Promise<Qhull> {
  if (!qhullPromise) {
    qhullPromise = loadQhull({ locateFile: () => wasmUrl })
  }
  return qhullPromise
}

export type { Qhull }
