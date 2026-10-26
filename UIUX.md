# UI and UX rules

Apply these rules to every new or changed screen and component. Add new rules here as the project grows.

This app is on the WorldStreet design system, vendored in `ds/` (see `AGENTS.md`). Its rules come first: `../worldstreet/design-system/ADOPT.md` and the live docs at https://worldstreet-design-system.vercel.app/. The rules below sit on top of it, and where one ever clashes with the system, the system wins.

## The look
- Gold (`bg-ember` / `bg-primary`, `text-ember-text`) carries meaning only: the brand, the primary action, the active state. Never use it as decoration or as a data colour. Text and icons on gold are ink (`text-primary-foreground`), never white.
- Emerald and red (`text-gain` / `text-loss`, or `text-credit` / `text-debit`) are for money direction only.
- Surfaces: the canvas is stone (`bg-background`), cards are `bg-card`, and fills inside a card are `bg-surface-2` / `bg-surface-3`. Separate things by fill, not borders. Where a line is needed, use `border-hairline`.
- Each platform has its own colour from `app/hues.css` (`data-hue="crypto"`, then `var(--hue)`). It marks where you are: a glyph, a dot, a thin ring. The platform previews are the one place it's worn as a page colour.
- Use the shared `Button` (the system's pill: one gold primary per view, `outline` for the partner action) and the shared `Card` (the system's 20px corner-lit card). Don't recolour them at the call site.
- Every icon is `<Icon name>` from `@/components/icon`, the system's gradient duotone set. Don't add other icon libraries.

## Type
- Manrope everywhere, set by the system.
- Use the shared sizes in `app/globals.css`. They sit on the system's ramp: `text-xs` 14, `text-sm` 16, `text-base` 20, `text-lg`/`text-xl` 32, `text-2xl`/`text-3xl` 52, `text-4xl` 64. The system's own names also work (`text-h1` … `text-h4`, `text-lead`, `text-body`, `text-small`, `text-caption`). Avoid one-off font sizes.
- Text is 14px or larger, except the system's 12px caption for tiny meta labels inside product mockups.
- Weights are 300 (big money figures), 400 (body and large display headings) and 500 (smaller headings and labels). Never go above 500, and don't use hairline text (100).
- As font size increases, use tighter letter spacing and line spacing. The shared sizes already carry the system's tracking.
- Money figures use tabular numerals (`tabular-nums`).
- Muted text uses the system's tokens (`text-muted`, `text-text-2`, `text-text-3`). Opacity on the main text colour (`text-white/70`) is fine on photos and coloured fills.
- Use sentence case for all UI text. Do not use Title Case or ALL CAPS.
- The desktop primary navigation labels and the footer are 14px. The footer's introductory sentence below the logo is 16px.

## Space and shape
- Layout spacing sits on an 8px grid: one Tailwind step is 8px (`p-1` is 8px). The system's 4px steps are there for component insides: `p-cx-3` is 12px, `p-cx-5` is 20px. Avoid fractional and arbitrary spacing values.
- Use the system's radius scale: `rounded-xs` 6 (tiny details), `rounded-sm` 8 (chips), `rounded-icon` 12 (icon tiles), `rounded-md` 16 (tiles inside a card), `rounded-card` 20 (cards), `rounded-lg` 30 (large panels and device frames). Buttons and input fields are fully rounded (`rounded-pill`), and icon-only buttons are circular. In CSS modules use `var(--cx-r-*)`.
- Never render an icon smaller than 20px by 20px, measuring the icon itself rather than its container. There are two exceptions: icons inside the system's buttons (18px), and the down chevrons in the desktop primary navigation (16px).

## Motion
- Use the system's springs (`--cx-spring`, `ease-cx`) and animate only transform, opacity and filter.
- Keep one signature effect per view (aurora, spotlight or beam).
- Everything honours `prefers-reduced-motion`.

## Registry components
- When adding a component from a registry (shadcn/ui, ReUI), first check whether the system's kit (`@/ds/components`) has it. If you use the registry one, re-skin it to these rules before using it.
