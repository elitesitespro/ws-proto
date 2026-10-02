<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI and UX rules

Read and follow `UIUX.md` for every new or changed screen and component.

## Page and component structure

- Put each page section in its own file. Keep route `page.tsx` files focused on composing sections. Colocate page-specific sections in the route's `_components` folder.
- Build repeated parts as reusable components.
- Check shadcn/ui and ReUI for an existing component before creating one.
- For a one-off design, wrap an existing shadcn/ui or ReUI component instead of changing the shared primitive. For common primitives such as buttons, extend the shared primitive directly.
