import { useEffect, useState } from 'react'
import PuzzleGallery from './components/PuzzleGallery'
import PuzzleFrame from './components/PuzzleFrame'
import { findPuzzle } from './puzzles/registry'

/**
 * Routing, in full. Hash based on purpose: it needs no server rewrites, so the
 * same build works on a preview channel, on a subpath, or from a file.
 *
 *   #/                  the gallery
 *   #/puzzel/<id>       one puzzle
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash.replace(/^#/, '')
}

export default function App() {
  const route = useHashRoute()
  const match = route.match(/^\/puzzel\/([\w-]+)$/)
  const puzzle = match ? findPuzzle(match[1]) : undefined

  useEffect(() => {
    document.title = puzzle ? `${puzzle.title} — Puzzellab` : 'Puzzellab'
  }, [puzzle])

  if (match && !puzzle) {
    return (
      <div className="notFound">
        <p>Die puzzel bestaat niet (meer).</p>
        <a className="button" href="#/">
          Terug naar de puzzels
        </a>
      </div>
    )
  }

  return puzzle ? <PuzzleFrame key={puzzle.id} puzzle={puzzle} /> : <PuzzleGallery />
}
