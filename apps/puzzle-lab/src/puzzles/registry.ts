import type { PuzzleMeta } from './types'
import WeegschaalPuzzle from './weegschaal/WeegschaalPuzzle'
import LetterslotPuzzle from './letterslot/LetterslotPuzzle'

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
  {
    id: 'letterslot',
    title: 'Letterslot',
    summary:
      'Een slot met vijf wielen van elk vijf letters. Draai eraan tot er in alle drie de zichtbare rijen een woord staat.',
    groep: [6, 7, 8],
    skills: ['woordenschat', 'logisch redeneren', 'systematisch zoeken'],
    status: 'prototype',
    notes:
      'Letters aangeleverd door het puzzelteam. Het slot draait, maar controleert de oplossing nog NIET — dat is bewust, zodat het team er zelf op kan puzzelen. Zie het gemarkeerde blok in LetterslotPuzzle.tsx voor waar die controle hoort.',
    component: LetterslotPuzzle,
  },
]

export function findPuzzle(id: string): PuzzleMeta | undefined {
  return puzzles.find((p) => p.id === id)
}
