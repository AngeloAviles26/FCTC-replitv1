# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### From Campus to Career (Mobile App)
- **Type**: Expo (React Native)
- **Directory**: `artifacts/campus-to-career/`
- **Color scheme**: Blue (#1A5CDB primary) and white/light gray for light mode; deep navy for dark mode
- **Screens**: Login, Register, Home/Dashboard, Gap Analysis, Roadmap, Profile
- **Navigation**: Bottom tabs (Home, Gap Analysis, Roadmap, Profile)
- **State**: AsyncStorage-backed via `context/AppContext.tsx`
- **Theme tokens**: `constants/colors.ts` + `hooks/useColors.ts`

### API Server
- **Type**: Express + TypeScript
- **Directory**: `artifacts/api-server/`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/campus-to-career run dev` — run Expo app locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
