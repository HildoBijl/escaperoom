import type { ComponentType } from 'react'

/**
 * The puzzle contract.
 *
 * This is the most important file in the lab: it is the boundary between a
 * puzzle and whatever surrounds it. In the lab that surrounding is a gallery;
 * in the 2027 rooms it will be a story. A puzzle must work in both, so it
 * never imports anything from the lab itself — only from this file.
 */

export type Difficulty = 'makkelijk' | 'normaal' | 'moeilijk'

/** Everything a puzzle receives from the world around it. */
export interface PuzzleProps {
  /** Call once when the player has solved the puzzle. */
  onSolved: () => void

  /**
   * Optional progress signal, 0..1. The lab shows it as a bar; a room may use
   * it to decide when to offer a hint. Safe to ignore.
   */
  onProgress?: (fraction: number) => void

  /** Optional variant. A puzzle that has only one version can ignore this. */
  difficulty?: Difficulty
}

/**
 * How far along a puzzle is. Shown in the gallery so the team can tell a
 * finished puzzle from a sketch at a glance.
 */
export type PuzzleStatus = 'idee' | 'prototype' | 'af'

/** Group in Dutch primary school; our audience is 6, 7 and 8. */
export type Groep = 6 | 7 | 8

/** A puzzle plus everything the puzzle makers need to judge it. */
export interface PuzzleMeta {
  /** Stable url slug — appears in the shared link, so don't rename casually. */
  id: string

  title: string

  /** One sentence, written for the puzzle makers rather than for the player. */
  summary: string

  /** Which groups this is aimed at. */
  groep: Groep[]

  /** Skills it practises, e.g. ['optellen', 'logisch redeneren']. */
  skills: string[]

  status: PuzzleStatus

  /** Open questions or doubts to discuss with the team. Optional. */
  notes?: string

  component: ComponentType<PuzzleProps>
}
