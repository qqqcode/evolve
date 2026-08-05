import { useCallback, useEffect, useRef, useState } from 'react'
import {
  buyMutation,
  click,
  evolve,
  loadState,
  resetState,
  saveState,
  tick,
} from '../game/engine'
import type { GameState } from '../game/types'

const TICK_MS = 100
const SAVE_MS = 5000

export function useGame() {
  const [state, setState] = useState<GameState>(() => loadState())
  const stateRef = useRef(state)
  stateRef.current = state

  // Passive economy loop.
  useEffect(() => {
    const id = window.setInterval(() => {
      setState((s) => tick(s, TICK_MS / 1000))
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  // Periodic autosave plus a final save on unload.
  useEffect(() => {
    const id = window.setInterval(() => saveState(stateRef.current), SAVE_MS)
    const onHide = () => saveState(stateRef.current)
    window.addEventListener('beforeunload', onHide)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('beforeunload', onHide)
      saveState(stateRef.current)
    }
  }, [])

  const doClick = useCallback(() => setState((s) => click(s)), [])
  const doBuy = useCallback((id: string) => setState((s) => buyMutation(s, id)), [])
  const doEvolve = useCallback(() => setState((s) => evolve(s)), [])
  const doReset = useCallback(() => {
    const fresh = resetState()
    setState(fresh)
    saveState(fresh)
  }, [])

  return { state, doClick, doBuy, doEvolve, doReset }
}
