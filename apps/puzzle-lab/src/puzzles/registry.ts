import type { PuzzleMeta } from './types'
import WeegschaalPuzzle from './weegschaal/WeegschaalPuzzle'

/**
 * Every puzzle in the lab. Adding one is a single entry here — the gallery and
 * the routing pick it up automatically.
 */
export const puzzles: PuzzleMeta[] = [
  {
    id: 'weegschaal',
    title: 'Weegschaal',
    summary:
      'Weegschalen in evenwicht verraden het gewicht van elke vorm. Zoek uit hoeveel elke vorm weegt.',
    groep: [6, 7, 8],
    skills: ['optellen', 'logisch redeneren', 'voorbereiding algebra'],
    status: 'prototype',
    notes:
      'Voorbeeldpuzzel — bedoeld als sjabloon voor de andere puzzels. Drie moeilijkheden zitten erin; de lab toont "normaal".',
    component: WeegschaalPuzzle,
  },
]

export function findPuzzle(id: string): PuzzleMeta | undefined {
  return puzzles.find((p) => p.id === id)
}
