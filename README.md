# Evolve

An incremental **evolution** game. Guide a single cell across billions of years,
absorbing energy and buying mutations, until it becomes a thinking being.

Built with [Vite](https://vite.dev/), [React](https://react.dev/) and TypeScript.

## Gameplay

- Click the organism to **absorb energy** (⚡).
- Spend energy on **mutations** that generate passive energy per second or boost
  your click power.
- Fill the evolve bar to **evolve** into the next life stage, earning **DNA** (🧬).
- DNA and higher stages permanently multiply all energy production.
- Progress autosaves to `localStorage`, including capped offline progress.

## Requirements

- Node.js 20+ (developed on Node 22)
- npm 10+

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:5173
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (port 5173).       |
| `npm run build`     | Type-check and build a production bundle.    |
| `npm run preview`   | Preview the production build (port 4173).    |
| `npm run lint`      | Run ESLint over the project.                 |
| `npm run typecheck` | Type-check without emitting output.          |

## Project structure

```
src/
  game/         # framework-agnostic game logic (config, engine, formatting)
  hooks/        # React hook that drives the game loop and persistence
  components/   # UI components (organism, stats, mutations, evolve panel)
  App.tsx       # top-level layout
```

The game rules live in `src/game/engine.ts` as pure functions, which keeps the
economy easy to reason about and test independently of the UI.
