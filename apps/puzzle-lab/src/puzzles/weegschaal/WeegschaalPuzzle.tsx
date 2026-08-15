import { useEffect, useMemo, useState } from 'react'
import type { PuzzleProps } from '../types'
import './weegschaal.css'

/**
 * Weegschaal — the reference puzzle for the lab.
 *
 * The player sees a few balance scales that are stated as facts: they are in
 * balance. Each scale holds shapes, and every shape has a hidden value. By
 * filling in a value for each shape the player reconstructs those values.
 *
 * The feedback loop is the point: a scale re-weighs itself using the player's
 * own numbers. Wrong numbers make it tip, so the picture tells the player
 * where the mistake is without a single line of "fout!" text.
 *
 * This file is deliberately self-contained. It imports nothing from the lab
 * except the contract in ../types, so it can move into a room as-is.
 */

// ── Shapes ───────────────────────────────────────────────────────────────

type ShapeId = 'driehoek' | 'cirkel' | 'ster'

const SHAPES: Record<ShapeId, { label: string; color: string }> = {
  driehoek: { label: 'driehoek', color: '#f0a733' },
  cirkel: { label: 'cirkel', color: '#2fae9b' },
  ster: { label: 'ster', color: '#9b7bd8' },
}

const SHAPE_ORDER: ShapeId[] = ['driehoek', 'cirkel', 'ster']

// ── Puzzle data ──────────────────────────────────────────────────────────

/** One side of a scale: either a handful of shapes or a plain weight. */
type Side = { shapes: ShapeId[] } | { weight: number }

type Balance = { left: Side; right: Side }

type Level = {
  /** The hidden answer. Only used to check, never shown. */
  answer: Record<ShapeId, number>
  balances: Balance[]
}

/**
 * Each level is solvable step by step: there is always one scale you can read
 * straight away, which unlocks the next.
 */
const LEVELS: Record<'makkelijk' | 'normaal' | 'moeilijk', Level> = {
  makkelijk: {
    answer: { driehoek: 2, cirkel: 5, ster: 7 },
    balances: [
      { left: { shapes: ['driehoek', 'driehoek'] }, right: { weight: 4 } },
      { left: { shapes: ['driehoek', 'cirkel'] }, right: { weight: 7 } },
      { left: { shapes: ['cirkel', 'driehoek'] }, right: { shapes: ['ster'] } },
    ],
  },
  normaal: {
    answer: { driehoek: 4, cirkel: 5, ster: 9 },
    balances: [
      { left: { shapes: ['driehoek', 'driehoek'] }, right: { weight: 8 } },
      { left: { shapes: ['ster'] }, right: { shapes: ['cirkel', 'driehoek'] } },
      { left: { shapes: ['cirkel', 'ster'] }, right: { weight: 14 } },
    ],
  },
  moeilijk: {
    answer: { driehoek: 4, cirkel: 6, ster: 9 },
    balances: [
      { left: { shapes: ['driehoek', 'driehoek', 'cirkel'] }, right: { weight: 14 } },
      { left: { shapes: ['cirkel', 'ster'] }, right: { weight: 15 } },
      { left: { shapes: ['driehoek', 'ster'] }, right: { weight: 13 } },
    ],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────

function shapesOf(side: Side): ShapeId[] {
  return 'shapes' in side ? side.shapes : []
}

/** Weight of one side using the player's guesses. */
function weigh(side: Side, guesses: Partial<Record<ShapeId, number>>): number {
  if ('weight' in side) return side.weight
  return side.shapes.reduce((sum, s) => sum + (guesses[s] ?? 0), 0)
}

/** A scale can only be weighed once every shape on it has a number. */
function isReadable(balance: Balance, guesses: Partial<Record<ShapeId, number>>): boolean {
  return [...shapesOf(balance.left), ...shapesOf(balance.right)].every(
    (s) => guesses[s] !== undefined,
  )
}

// ── The puzzle ───────────────────────────────────────────────────────────

export default function WeegschaalPuzzle({
  onSolved,
  onProgress,
  difficulty = 'normaal',
}: PuzzleProps) {
  const level = LEVELS[difficulty]

  // undefined = not filled in yet, which is different from 0.
  const [guesses, setGuesses] = useState<Partial<Record<ShapeId, number>>>({})

  const balanced = useMemo(
    () =>
      level.balances.map(
        (b) =>
          isReadable(b, guesses) && weigh(b.left, guesses) === weigh(b.right, guesses),
      ),
    [level, guesses],
  )

  const solved = balanced.every(Boolean)

  useEffect(() => {
    onProgress?.(balanced.filter(Boolean).length / balanced.length)
  }, [balanced, onProgress])

  useEffect(() => {
    if (solved) onSolved()
  }, [solved, onSolved])

  function setGuess(shape: ShapeId, raw: string) {
    setGuesses((prev) => {
      const next = { ...prev }
      if (raw === '') delete next[shape]
      else next[shape] = Math.max(0, Math.min(99, Number(raw)))
      return next
    })
  }

  return (
    <div className="weegschaal">
      <p className="weegschaal__intro">
        Alle weegschalen hieronder zijn <strong>in evenwicht</strong>. Elke vorm heeft een
        eigen gewicht. Zoek uit hoeveel elke vorm weegt en vul het in.
      </p>

      <div className="weegschaal__scales">
        {level.balances.map((balance, i) => (
          <Scale
            key={i}
            balance={balance}
            guesses={guesses}
            readable={isReadable(balance, guesses)}
            level={balanced[i]}
          />
        ))}
      </div>

      <div className="weegschaal__inputs">
        {SHAPE_ORDER.map((shape) => (
          <label key={shape} className="weegschaal__input">
            <svg viewBox="-18 -18 36 36" className="weegschaal__inputIcon" aria-hidden="true">
              <Shape shape={shape} />
            </svg>
            <span className="weegschaal__inputLabel">{SHAPES[shape].label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={99}
              value={guesses[shape] ?? ''}
              onChange={(e) => setGuess(shape, e.target.value)}
              aria-label={`gewicht van de ${SHAPES[shape].label}`}
            />
          </label>
        ))}
      </div>

      {/* Handy while the team is reviewing. Drop this before the puzzle ships. */}
      <details className="weegschaal__answer">
        <summary>Antwoord (voor de puzzelmakers)</summary>
        {SHAPE_ORDER.map((s) => `${SHAPES[s].label} = ${level.answer[s]}`).join(', ')}
      </details>
    </div>
  )
}

// ── One scale ────────────────────────────────────────────────────────────

const BEAM_HALF = 110 // half the beam length
const PIVOT_X = 160
const PIVOT_Y = 72

function Scale({
  balance,
  guesses,
  readable,
  level,
}: {
  balance: Balance
  guesses: Partial<Record<ShapeId, number>>
  readable: boolean
  level: boolean
}) {
  const left = weigh(balance.left, guesses)
  const right = weigh(balance.right, guesses)

  // Positive angle rotates clockwise in SVG, which lifts the left end, so the
  // heavier side goes down when angle follows the sign of (right - left).
  //
  // The tilt starts at 6° rather than scaling from zero: being one off should
  // already look obviously wrong, otherwise a small mistake reads as "almost
  // right" when it is simply wrong.
  const diff = right - left
  const angle = readable && diff !== 0
    ? Math.sign(diff) * Math.min(11, 6 + Math.abs(diff) * 1.5)
    : 0
  const rad = (angle * Math.PI) / 180

  const endX = BEAM_HALF * Math.cos(rad)
  const endY = BEAM_HALF * Math.sin(rad)

  return (
    <svg
      viewBox="0 0 320 200"
      className={`scale ${readable ? '' : 'scale--unknown'} ${level ? 'scale--level' : ''}`}
      role="img"
    >
      {/* stand */}
      <path d={`M ${PIVOT_X} ${PIVOT_Y} L 147 176 L 173 176 Z`} className="scale__stand" />
      <rect x={112} y={176} width={96} height={7} rx={3.5} className="scale__stand" />

      {/* beam — rotates around the pivot */}
      <g
        className="scale__beam"
        style={{
          transformBox: 'view-box',
          transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
          transform: `rotate(${angle}deg)`,
        }}
      >
        <rect
          x={PIVOT_X - BEAM_HALF}
          y={PIVOT_Y - 4}
          width={BEAM_HALF * 2}
          height={8}
          rx={4}
        />
      </g>
      <circle cx={PIVOT_X} cy={PIVOT_Y} r={7} className="scale__pivot" />

      {/* pans — they hang, so they stay upright while the beam tilts */}
      <Pan x={PIVOT_X - endX} y={PIVOT_Y - endY} side={balance.left} />
      <Pan x={PIVOT_X + endX} y={PIVOT_Y + endY} side={balance.right} />
    </svg>
  )
}

function Pan({ x, y, side }: { x: number; y: number; side: Side }) {
  const items = shapesOf(side)

  return (
    <g
      className="scale__pan"
      style={{
        transformBox: 'view-box',
        transformOrigin: '0 0',
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Two ropes in a V, so the middle of the pan stays clear for its
          contents — a single rope down the centre would cut through them. */}
      <path d="M 0 0 L -34 56 M 0 0 L 34 56" className="scale__rope" />
      <path d="M -38 56 L 38 56 L 29 69 L -29 69 Z" className="scale__bowl" />

      {'weight' in side ? (
        <g className="scale__weight">
          <rect x={-20} y={22} width={40} height={34} rx={6} />
          <text x={0} y={45}>
            {side.weight}
          </text>
        </g>
      ) : (
        items.map((shape, i) => (
          <g
            key={i}
            transform={`translate(${(i - (items.length - 1) / 2) * 26}, ${41})`}
          >
            <Shape shape={shape} />
          </g>
        ))
      )}
    </g>
  )
}

// ── Shape drawings ───────────────────────────────────────────────────────

/** Draws a shape centred on (0,0), roughly 26px across. */
function Shape({ shape }: { shape: ShapeId }) {
  const fill = SHAPES[shape].color

  if (shape === 'cirkel') {
    return <circle r={12} fill={fill} />
  }
  if (shape === 'driehoek') {
    return <path d="M 0 -13 L 12 9 L -12 9 Z" fill={fill} />
  }
  return <path d={starPath(13, 5.5, 5)} fill={fill} />
}

/** A star centred on (0,0) with `points` spikes. */
function starPath(outer: number, inner: number, points: number): string {
  const coords: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i * Math.PI) / points - Math.PI / 2
    coords.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`)
  }
  return `M ${coords.join(' L ')} Z`
}
