# Workspace

Next.js app with Tailwind CSS, shadcn/ui, and the ReUI registry, on the WorldStreet design system.

Run the app with `pnpm dev`.

Add shadcn/ui components with `pnpm exec shadcn add button`. Add ReUI items with `pnpm exec shadcn add @reui/c-alert-1`. Re-skin them to `UIUX.md` before use.

The app starts in dark mode (WorldStreet stone and gold). Light mode is also configured through `next-themes`; there is no theme control in the UI.

## Design system

The WorldStreet design system is vendored in `ds/` from `../worldstreet/design-system`. Don't edit `ds/`: change the design system, then run `pnpm ds:sync` here (and `pnpm ds:check` to confirm the copy is current). `ds/` is committed because the app deploys on its own.
