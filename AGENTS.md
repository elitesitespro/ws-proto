<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design system

This app is on the WorldStreet design system (`../worldstreet/design-system`, docs at https://worldstreet-design-system.vercel.app/, adoption rules in its `ADOPT.md`).

- `ds/` is a vendored copy. Never edit it. To change the system, change `design-system/`, then run `pnpm ds:sync` here. `pnpm ds:check` fails if the copy is stale.
- The wiring lives in `app/globals.css` (the kit, its Tailwind utilities, the shadcn bridge and the app's type scale mapped onto the system's ramp) and `app/layout.tsx` (Manrope, `data-brand="worldstreet"`, `cx-root`, `<IconDefs>`).
- `app/hues.css` gives each platform its colour, copied from `worldstreet-hub/app/hues.css`. Keep the two in step.
- Icons go through `components/icon.tsx`. The shared `Button` and `Card` in `components/ui/` render the system's `.cx-btn` and `.cx-card`.

## UI and UX rules

Read and follow `UIUX.md` for every new or changed screen and component.

## Page and component structure

- Put each page section in its own file. Keep route `page.tsx` files focused on composing sections. Colocate page-specific sections in the route's `_components` folder.
- Build repeated parts as reusable components.
- Check the design system's kit (`@/ds/components`), then shadcn/ui and ReUI, for an existing component before creating one.
- For a one-off design, wrap an existing shadcn/ui or ReUI component instead of changing the shared primitive. For common primitives such as buttons, extend the shared primitive directly.
