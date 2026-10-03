# UI and UX rules

Apply these rules to every new or changed screen and component. Add new rules here as the project grows.

- Never render text smaller than 14px.
- Never use a font weight above semibold (600).
- Do not use hairline text (font weight 100) until requested.
- Use an 8px spacing grid for layout spacing: padding, margin, and gaps must be multiples of 8px. Avoid fractional and arbitrary Tailwind spacing values.
- Size every element's bounding box in multiples of 4px for both width and height.
- Use a small border-radius scale: 4px for small details, 8px for compact surfaces, 16px for cards, and 24px for large panels. Buttons and input fields are the exception: give them fully rounded ends. Icon-only buttons must be circular.
- Never render an icon smaller than 20px by 20px. Measure the icon itself, not just its button or container.
- The down chevrons in the desktop primary navigation are the only exception: render them at 16px by 16px.
- Calculate the Major Third type scale from 14px, multiplying each step by 1.25. Round each calculated size to the nearest multiple of 4px, rounding up when exactly halfway. The final font size divided by 4px must always be a whole number, never a decimal. For example, 27.430px becomes 28px because 28 ÷ 4 = 7. Use the shared type sizes in `app/globals.css` rather than one-off font sizes.
- The desktop primary navigation labels are 14px as an exception to the rounded type scale.
- Footer text is 14px as an exception to the rounded type scale, except the introductory sentence below the logo, which is 16px.
- As font size increases, use tighter letter spacing and tighter line spacing relative to the font size.
- Use sentence case for all UI text. Do not use Title Case or ALL CAPS.
- Use opacity on the main text color for muted text. Do not use a solid gray color for muted text.
- When adding a component from a registry, adjust its text and spacing to follow these rules before using it.
