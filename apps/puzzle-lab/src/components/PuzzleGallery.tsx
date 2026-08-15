import type { PuzzleMeta } from '../puzzles/types'
import { puzzles } from '../puzzles/registry'

/**
 * The overview the team lands on. Written for the puzzle makers, not for the
 * players: it shows how far along each puzzle is and what it practises.
 */
export default function PuzzleGallery() {
  return (
    <div className="gallery">
      <header className="gallery__header">
        <h1>Puzzellab</h1>
        <p>
          Werkomgeving voor de escape rooms van kamp A en kamp C (2027). Klik een puzzel
          aan om hem te spelen. Deze pagina is niet openbaar — deel de link alleen binnen
          het team.
        </p>
      </header>

      {puzzles.length === 0 ? (
        <p className="gallery__empty">Nog geen puzzels. Voeg er een toe in <code>src/puzzles/registry.ts</code>.</p>
      ) : (
        <ul className="gallery__grid">
          {puzzles.map((puzzle) => (
            <li key={puzzle.id}>
              <Card puzzle={puzzle} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Card({ puzzle }: { puzzle: PuzzleMeta }) {
  return (
    <a className="card" href={`#/puzzel/${puzzle.id}`}>
      <div className="card__top">
        <h2 className="card__title">{puzzle.title}</h2>
        <span className={`badge badge--${puzzle.status}`}>{puzzle.status}</span>
      </div>

      <p className="card__summary">{puzzle.summary}</p>

      <dl className="card__meta">
        <div>
          <dt>Groep</dt>
          <dd>{puzzle.groep.join(', ')}</dd>
        </div>
        <div>
          <dt>Oefent</dt>
          <dd>{puzzle.skills.join(' · ')}</dd>
        </div>
      </dl>

      {puzzle.notes && <p className="card__notes">{puzzle.notes}</p>}
    </a>
  )
}
