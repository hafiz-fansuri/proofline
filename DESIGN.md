# Proofline design system

The interface uses Hallmark's Furrow material across its two public application views. The defining object is a selectable OWASP source atlas, with the question composer visible alongside it on desktop.

## Material and typography

- Warm manila surfaces, near-black ink, orange actions, and subdued contour lines confined to the atlas.
- Self-hosted Red Hat Display 600 for headings; Red Hat Text 400/500 for body text and controls.
- Sentence-case labels, untracked navigation, and tabular numerals for comparisons.
- `tokens.css` supplies the palette, spacing scale, typography, radii, and motion values. `base.css` supplies shared defaults. `src/style.css` defines the application layout.

## Core tokens

```css
:root {
  --color-paper: oklch(96% 0.011 85);
  --color-paper-2: oklch(99.5% 0.005 85);
  --color-ink: oklch(18% 0.006 60);
  --color-muted: oklch(44% 0.012 60);
  --color-accent: oklch(70% 0.19 40);
  --color-accent-ink: oklch(18% 0.006 60);
  --font-display: "Red Hat Display", "Red Hat Text", sans-serif;
  --font-body: "Red Hat Text", system-ui, sans-serif;
  --radius-card: 10px;
  --radius-pill: 6px;
}
```

## Composition and interaction

- A restrained two-destination navigation strip, never a redundant sidebar.
- Research opens with the composer and atlas. Source selection changes the preview; investigation runs the existing API; source reading opens the original document.
- The atlas is a navigation layout. Its coordinates and contours do not represent measured similarity, geography, risk severity, or relationships between risks.
- Answer mode contracts the opening region and prioritizes the cited answer and evidence rail. A return control restores exploration.
- Evaluation, model comparisons and CI/CD belong in owner reports and developer tooling, not the public interface.
- Use rules and spacing for ordinary structure. A raised surface is reserved for source reading.

## Controls and motion

- Orange primary controls use ink text; selected navigation uses ink with paper text.
- Visible keyboard focus, disabled/loading states, and source-reader focus restoration remain required.
- No decorative looping motion. Loading indicators stop under reduced motion.
- Desktop uses a capped 1,440px container. Research stacks at 760px; all views must work at 390px.

## Product truth

Use plain-language topics, simple actions and readable sources. Hide search settings, model identifiers, timing metrics, chunk counts and deployment details from the public flow. Never add invented testimonials, activity, performance claims or compliance guarantees. Keep a short reminder that AI can be wrong and sources should be checked.
