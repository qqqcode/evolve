import { formatNumber } from '../game/format'

interface Props {
  energy: number
  eps: number
  dna: number
  clickPower: number
}

export function StatsBar({ energy, eps, dna, clickPower }: Props) {
  return (
    <div className="stats-bar">
      <Stat label="Energy" value={formatNumber(energy)} icon="⚡" accent="energy" />
      <Stat label="Per second" value={formatNumber(eps)} icon="🔄" accent="eps" />
      <Stat label="Per click" value={formatNumber(clickPower)} icon="👆" accent="click" />
      <Stat label="DNA" value={formatNumber(dna)} icon="🧬" accent="dna" />
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string
  icon: string
  accent: string
}) {
  return (
    <div className={`stat stat--${accent}`}>
      <span className="stat__icon" aria-hidden>
        {icon}
      </span>
      <span className="stat__value" data-testid={`stat-${accent}`}>
        {value}
      </span>
      <span className="stat__label">{label}</span>
    </div>
  )
}
