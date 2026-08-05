import { mutationCost } from '../game/engine'
import { formatNumber } from '../game/format'
import type { GameState, MutationDef } from '../game/types'

interface Props {
  state: GameState
  mutations: MutationDef[]
  onBuy: (id: string) => void
}

export function MutationList({ state, mutations, onBuy }: Props) {
  return (
    <section className="panel mutations">
      <h3 className="panel__title">Mutations</h3>
      <ul className="mutations__list">
        {mutations.map((m) => {
          const owned = state.mutations[m.id] ?? 0
          const cost = mutationCost(m.id, owned)
          const affordable = state.energy >= cost
          return (
            <li key={m.id}>
              <button
                className="mutation"
                disabled={!affordable}
                onClick={() => onBuy(m.id)}
                data-testid={`buy-${m.id}`}
              >
                <span className="mutation__emoji" aria-hidden>
                  {m.emoji}
                </span>
                <span className="mutation__body">
                  <span className="mutation__top">
                    <span className="mutation__name">{m.name}</span>
                    <span className="mutation__owned">{owned}</span>
                  </span>
                  <span className="mutation__desc">{m.description}</span>
                  <span className="mutation__stats">
                    {m.eps > 0 && <em>+{formatNumber(m.eps)}/s</em>}
                    {m.clickBonus > 0 && <em>+{formatNumber(m.clickBonus)}/click</em>}
                  </span>
                </span>
                <span className="mutation__cost">
                  <span aria-hidden>⚡</span> {formatNumber(cost)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
