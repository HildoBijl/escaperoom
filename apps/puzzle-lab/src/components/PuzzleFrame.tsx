import { useCallback, useState } from 'react'
import type { PuzzleMeta } from '../puzzles/types'

/**
 * Everything around a puzzle: title, back, restart, progress and the solved
 * message. Keeping this out of the puzzles means a puzzle only has to worry
 * about itself — and that a room can put its own chrome around the same
 * puzzle later.
 */
export default function PuzzleFrame({ puzzle }: { puzzle: PuzzleMeta }) {
  const Puzzle = puzzle.component

  // Bumping this key throws the puzzle away and mounts a fresh one, so a
  // puzzle never needs reset logic of its own.
  const [attempt, setAttempt] = useState(0)
  const [solved, setSolved] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleSolved = useCallback(() => setSolved(true), [])
  const handleProgress = useCallback((f: number) => setProgress(f), [])

  function restart() {
    setSolved(false)
    setProgress(0)
    setAttempt((n) => n + 1)
  }

  return (
    <div className="frame">
      <header className="frame__bar">
        <a className="button button--ghost" href="#/">
          ← Alle puzzels
        </a>
        <h1 className="frame__title">{puzzle.title}</h1>
        <button className="button button--ghost" onClick={restart}>
          Opnieuw
        </button>
      </header>

      <div className="frame__progress" aria-hidden="true">
        <div className="frame__progressBar" style={{ width: `${progress * 100}%` }} />
      </div>

      <main className="frame__stage">
        <Puzzle
          key={attempt}
          onSolved={handleSolved}
          onProgress={handleProgress}
        />
      </main>

      {solved && (
        <div className="frame__solved" role="status">
          <strong>Opgelost!</strong>
          <button className="button" onClick={restart}>
            Nog een keer
          </button>
        </div>
      )}
    </div>
  )
}
