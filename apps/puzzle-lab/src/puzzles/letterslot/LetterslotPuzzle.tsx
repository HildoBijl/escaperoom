import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { PuzzleProps } from '../types'
import './letterslot.css'

/**
 * Letterslot — a lock with five wheels, five letters on each.
 *
 * Three letters of every wheel sit in the window at once, so there are three
 * rows of five. Turn the wheels until all three rows read a word.
 *
 * The two letters that are not in the window are hidden behind the wheel. The
 * window fades them out at the edges, which shows that the wheel continues
 * without giving the letters away.
 */

// ── The lock ─────────────────────────────────────────────────────────────

/**
 * One array per wheel, in wheel order. Index 0, 1 and 2 are the letters that
 * sit in the window at the start.
 *
 * Aangeleverd door het puzzelteam:
 *
 *   >LRINS<
 *   >NUITT<
 *   >FFOTG<
 *    BJENS
 *    DRARS
 */
const WHEELS: string[][] = [
  ['L', 'N', 'F', 'B', 'D'],
  ['R', 'U', 'F', 'J', 'R'],
  ['I', 'I', 'O', 'E', 'A'],
  ['N', 'T', 'T', 'N', 'R'],
  ['S', 'T', 'G', 'S', 'S'],
]

const WHEEL_SIZE = 5 // letters per wheel
const WINDOW_ROWS = 3 // letters visible at once

/** Positive modulo — the built-in % returns negatives for negative input. */
function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

// ── The puzzle ───────────────────────────────────────────────────────────

/**
 * The three words, top row first. The lock opens only when all three are in
 * the window at once.
 *
 * Note for when this goes into a room: this list sits in the shipped
 * JavaScript, so a curious player can read it from the browser's devtools. For
 * a group 6-8 escape room that is almost certainly fine, but if it ever
 * matters, the check has to move to the server.
 */
const SOLUTION = ['FRANS', 'BRITS', 'DUITS']

export default function LetterslotPuzzle({ onSolved }: PuzzleProps) {
  // How far each wheel has been turned. All zero is the starting state exactly
  // as the puzzle team handed it over.
  // Deliberately not wrapped into 0..4: a wheel needs to know whether it went
  // from 4 to 5 or from 4 back to 0, otherwise it cannot slide the right way.
  const [positions, setPositions] = useState<number[]>(() => WHEELS.map(() => 0))

  const wheelRefs = useRef<(HTMLDivElement | null)[]>([])

  function turn(wheel: number, direction: 1 | -1) {
    setPositions((prev) => prev.map((p, i) => (i === wheel ? p + direction : p)))
  }

  function focusWheel(index: number) {
    wheelRefs.current[mod(index, WHEELS.length)]?.focus()
  }

  /** The letters currently in row `r` of the window, left to right. */
  function visibleRow(r: number): string {
    return WHEELS.map((letters, w) => letters[mod(positions[w] + r, WHEEL_SIZE)]).join('')
  }

  // ── Controle op de oplossing ─────────────────────────────────────────
  // Alles of niets: pas als alle drie de rijen kloppen gaat het slot open.
  //
  // Bewust géén melding per rij, en bewust geen onProgress (die zou de
  // voortgangsbalk vullen en daarmee hetzelfde verraden). Letters komen op
  // meerdere wielen dubbel voor, dus een rij kan bij verschillende
  // wielstanden hetzelfde woord vormen. "Deze rij klopt" zou dan lezen als
  // "van deze wielen moet je afblijven", terwijl je ze juist nog nodig kunt
  // hebben om de andere rijen rond te krijgen.
  const solved = SOLUTION.every((word, r) => visibleRow(r) === word)

  // Once open, it stays open: turning further should not undo a puzzle the
  // player has already finished, and onSolved() is a one-off announcement
  // anyway. "Opnieuw" mounts a fresh lock, so this needs no reset.
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (!solved || opened) return
    setOpened(true)
    onSolved()
  }, [solved, opened, onSolved])

  return (
    <div className="letterslot">
      <p className="letterslot__intro">
        De vertaalmachine moet opnieuw worden afgesteld. Draai aan de wielen
        totdat je 3 woorden van 5 letters hebt.
      </p>

      <div className={`letterslot__plate ${opened ? 'letterslot__plate--open' : ''}`}>
        {WHEELS.map((letters, w) => (
          <Wheel
            key={w}
            index={w}
            letters={letters}
            position={positions[w]}
            windowRef={(el) => {
              wheelRefs.current[w] = el
            }}
            onTurn={(direction) => turn(w, direction)}
            onMoveFocus={(step) => focusWheel(w + step)}
          />
        ))}
      </div>

      {/* Screen readers get the rows as text; sighted players read the wheels. */}
      <p className="letterslot__srOnly" aria-live="polite">
        {[0, 1, 2]
          .map((r) => `Rij ${r + 1}: ${visibleRow(r).split('').join(' ')}.`)
          .join(' ')}
      </p>
    </div>
  )
}

// ── One wheel ────────────────────────────────────────────────────────────

const CELL_HEIGHT = 64 // px, must match --cell-height in letterslot.css
const TURN_MS = 260

/**
 * The strip holds the three letters in the window plus one spare above and one
 * below, which is all the room a one-cell slide needs.
 *
 * Which letters those cells hold is derived from `position`, so the strip's
 * resting place never changes — cell SPARE always sits at the top of the
 * window. That is what keeps the turning honest: there is no second counter
 * that can drift away from the wheel's real state, and nothing ever has to be
 * snapped back into place.
 */
const SPARE = 1
const STRIP_CELLS = WINDOW_ROWS + SPARE * 2
const RESTING_Y = -SPARE * CELL_HEIGHT

function Wheel({
  index,
  letters,
  position,
  windowRef,
  onTurn,
  onMoveFocus,
}: {
  index: number
  letters: string[]
  position: number
  windowRef: (el: HTMLDivElement | null) => void
  onTurn: (direction: 1 | -1) => void
  onMoveFocus: (step: number) => void
}) {
  const lastPosition = useRef(position)
  const stripRef = useRef<HTMLDivElement | null>(null)

  /**
   * Slide the strip by one cell after a turn.
   *
   * React has already put the new letters in place at the resting spot, so the
   * animation runs backwards from where the strip appeared to be a moment ago
   * to where it now is. It is purely cosmetic: it never touches the element's
   * own transform, so an interrupted or skipped animation can leave the wheel
   * looking wrong for a frame but never leaves it in the wrong state.
   */
  useLayoutEffect(() => {
    const step = position - lastPosition.current
    lastPosition.current = position
    if (step === 0) return

    const strip = stripRef.current
    if (!strip) return

    // Turning down means the letters travel upwards, so the strip starts one
    // cell lower than it ends — and the other way around for turning up.
    const from = RESTING_Y + Math.sign(step) * CELL_HEIGHT

    strip.getAnimations().forEach((a) => a.cancel())

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    strip.animate(
      [
        { transform: `translateY(${from}px)` },
        { transform: `translateY(${RESTING_Y}px)` },
      ],
      { duration: TURN_MS, easing: 'cubic-bezier(0.22, 0.9, 0.3, 1)' },
    )
  }, [position])

  const visible = Array.from(
    { length: WINDOW_ROWS },
    (_, r) => letters[mod(position + r, WHEEL_SIZE)],
  )

  function onKeyDown(e: KeyboardEvent) {
    const actions: Record<string, () => void> = {
      ArrowUp: () => onTurn(-1),
      ArrowDown: () => onTurn(1),
      ArrowLeft: () => onMoveFocus(-1),
      ArrowRight: () => onMoveFocus(1),
    }
    const action = actions[e.key]
    if (!action) return
    e.preventDefault()
    action()
  }

  return (
    <div className="wheel">
      <button
        className="wheel__button"
        tabIndex={-1}
        onClick={() => onTurn(-1)}
        aria-label={`wiel ${index + 1} omhoog draaien`}
      >
        <Chevron up />
      </button>

      <div
        ref={windowRef}
        className="wheel__window"
        tabIndex={0}
        role="group"
        aria-label={`Wiel ${index + 1}, letters ${visible.join(' ')}. Draai met de pijltjestoetsen.`}
        onKeyDown={onKeyDown}
      >
        <div
          ref={stripRef}
          className="wheel__strip"
          style={{ transform: `translateY(${RESTING_Y}px)` }}
        >
          {/*
            The letters come from `position` — the same value the solution
            check will read. Cell SPARE is the top of the window, so it always
            holds letters[position]. Screen and state cannot drift apart.
          */}
          {Array.from({ length: STRIP_CELLS }, (_, i) => (
            <span key={i} className="wheel__letter" aria-hidden="true">
              {letters[mod(position + i - SPARE, WHEEL_SIZE)]}
            </span>
          ))}
        </div>
      </div>

      <button
        className="wheel__button"
        tabIndex={-1}
        onClick={() => onTurn(1)}
        aria-label={`wiel ${index + 1} omlaag draaien`}
      >
        <Chevron />
      </button>
    </div>
  )
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={up ? 'M 5 15 L 12 8 L 19 15' : 'M 5 9 L 12 16 L 19 9'}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
