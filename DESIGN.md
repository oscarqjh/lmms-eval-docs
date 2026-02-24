# LMMS-Lab Design System

A flat, accessible, brutalist-inspired design language for AI research communication.

---

## Design Philosophy

**"Quiet assets, Loud impact."**

We build interfaces with intention, not noise. Every design decision is shaped by restraint, long-term thinking, and respect for content. No manufactured hype, no endless gradients - just work designed to hold its ground.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Content First** | Design serves research, not the reverse |
| **Flat & Honest** | No fake depth, shadows, or skeuomorphism |
| **High Contrast** | Accessibility is non-negotiable |
| **Systematic** | Consistent patterns, predictable behavior |
| **Fast** | Performance over decoration |

---

## Color System

Sourced from [randoma11y.com](https://randoma11y.com) with APCA accessibility algorithm.

### Primary Palette

| Role | Color | HEX | Usage |
|------|-------|-----|-------|
| **Background** | Deep Teal | `#03639a` | Header, footer, dark sections |
| **Foreground** | Warm Cream | `#fed7aa` | Text on dark, blog content bg |

### Color Formats (for advanced usage)

```css
/* Background - Deep Teal */
--background: #03639a;
--background-hsl: 201.85 96.18% 30.78%;
--background-oklch: 48.087% 0.11659 243.64;

/* Foreground - Warm Cream */
--foreground: #fed7aa;
--foreground-hsl: 32.143 97.675% 83.138%;
--foreground-oklch: 90.146% 0.07295 70.697;
```

### Accessibility Metrics

| Metric | Value | Status |
|--------|-------|--------|
| APCA Contrast | Lc 60+ | Passes for body text |
| WCAG 2.1 Ratio | 4.77:1 | AA for normal text |

### Derived Colors

| Use Case | Light Mode | Dark Mode |
|----------|------------|-----------|
| Body text | `#1a1a1a` | `var(--foreground)` |
| Muted text | `#4a4a4a` | `rgba(254,215,170,0.7)` |
| Borders | `var(--background)` | `currentColor` |
| Highlights | `rgba(3,105,161,0.1)` | `rgba(254,215,170,0.1)` |

---

## Typography

### Font Stack

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
```

**Why system fonts?**
- Zero load time
- Native feel per platform
- Excellent rendering
- No FOUT/FOIT

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 (Hero) | 3.5rem | 800 | 1.1 |
| H1 (Blog) | 2.25-3.5rem | 800 | 1.1 |
| H2 | 1.5rem | 700 | 1.2 |
| H3 | 1.25rem | 700 | 1.2 |
| Body | 1.125rem | 400 | 1.8 |
| Small/Label | 0.75rem | 600 | 1.4 |

### Text Treatments

| Type | Style |
|------|-------|
| Headings | Teal (`var(--background)`), tight tracking |
| Body | Dark gray (`#1a1a1a`), generous line-height |
| Links | Teal, underline, hover opacity fade |
| Code | Mono, teal text, subtle teal background |
| Labels | Uppercase, wide letter-spacing (0.1em) |

---

## Visual Language

### Flat Design Characteristics

1. **No rounded corners** - Sharp edges only (border-radius: 0)
2. **No drop shadows** - Use `box-shadow: 0 0 0 Npx` for borders
3. **No gradients** - Solid colors only
4. **No blur effects** - Except functional (reduced motion safe)
5. **High contrast** - Bold color blocking

### Box-Shadow as Border

```css
/* Thin border */
box-shadow: 0 0 0 1px currentColor;

/* Medium border */
box-shadow: 0 0 0 2px currentColor;

/* Thick border */
box-shadow: 0 0 0 4px currentColor;
```

### Dither Patterns

Decorative texture patterns for visual interest without compromising flatness.

| Pattern | Use Case |
|---------|----------|
| `dots` | Hero sections, cards |
| `lines` | Dividers, backgrounds |
| `checker` | Emphasis areas |
| `noise` | Subtle texture |

```tsx
<DitherPattern variant="dots" size="sm" opacity={0.15} />
```

### Pixel Shapes

Geometric decorative elements:
- `square` - Basic building block
- `diamond` - Accent, bullet points
- `cross` - Markers, icons
- `triangle` - Directional hints

### Retro-Technical Engineering Aesthetic (New)

Inspired by Hex.co, we incorporate elements of modern technical schematics:

1.  **Technical Schematics**: Grid patterns, dot matrices, and corner brackets (`⌜ ⌝ ⌞ ⌟`) to frame content.
2.  **Monochromatic & High Contrast**: Sticking to our Deep Teal/Warm Cream palette but using them to create "blueprint" or "terminal" vibes.
3.  **Keyboard-First UI**: Visual hints for shortcuts (e.g., `[K]`) where applicable.
4.  **SVG-Based Effects**: Lightweight, crisp animations using SVG paths and CSS/Framer Motion rather than heavy raster graphics.

---

## Motion System

### Timing Tokens

```css
--duration-instant: 100ms;   /* Micro-interactions */
--duration-fast: 150ms;      /* Hover states */
--duration-normal: 250ms;    /* Transitions */
--duration-slow: 400ms;      /* Page elements */
--duration-slower: 600ms;    /* Hero animations */
```

### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* Enter */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);       /* Exit */
--ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);  /* Continuous */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
```

### Animation Principles

| Principle | Implementation |
|-----------|----------------|
| **Purposeful** | Only animate what needs attention |
| **Subtle** | Small movements (4-16px), low opacity changes |
| **Fast** | 150-300ms for most interactions |
| **Respectful** | Honor `prefers-reduced-motion` |

### Entrance Animations

```css
.fade-in-up {
  animation: fadeInUp var(--duration-normal) var(--ease-out);
}
```

Use staggered delays for lists:
```css
.stagger-1 { animation-delay: 50ms; }
.stagger-2 { animation-delay: 100ms; }
.stagger-3 { animation-delay: 150ms; }
```

### Hover States

| Element | Effect |
|---------|--------|
| Links | Underline animation, opacity fade |
| Cards | Lift (translateY -4px), shadow increase |
| Buttons | Brightness filter (1.1-1.2) |
| Images | Subtle scale or border color |

**Important:** No layout-shifting transforms on hover.

---

## Component Patterns

### Cards

```css
.card {
  padding: var(--space-lg);
  box-shadow: 0 0 0 2px currentColor;
  transition: transform 250ms ease-out, box-shadow 250ms ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0 0 2px currentColor, 0 8px 24px -8px rgba(0,0,0,0.3);
}
```

### Buttons

| Variant | Style |
|---------|-------|
| Default | Inverted colors (fg bg, bg text) |
| Outline | Transparent, 2px border |
| Ghost | No border, just text |

All buttons: No border-radius, 2px box-shadow border.

### Tags/Badges

```css
.tag {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.375em 0.75em;
  background: var(--background);
  color: var(--foreground);
}
```

### Table of Contents

- Sticky positioning (top: 2rem)
- Hidden scrollbar
- Active item: left border + background tint
- Indent by heading level

---

## Layout

### Spacing Scale

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 2rem;      /* 32px */
--space-xl: 4rem;      /* 64px */
```

### Container Widths

| Type | Max Width | Use |
|------|-----------|-----|
| Wide | 72rem | Full layouts |
| Narrow | 48rem | Blog content |
| Article | 52rem | Blog with sidebar |

### Blog Layout

```
Desktop (≥1024px):
┌─────────┬────────────────────────┐
│   TOC   │      Article           │
│  240px  │        1fr             │
└─────────┴────────────────────────┘

Mobile:
┌────────────────────────────────────┐
│            Article                 │
│           (TOC hidden)             │
└────────────────────────────────────┘
```

### Z-Index Scale

```css
--z-base: 0;
--z-dropdown: 100;
--z-sticky: 200;
--z-fixed: 300;
--z-modal-backdrop: 400;
--z-modal: 500;
--z-popover: 600;
--z-tooltip: 700;
```

---

## Accessibility

### Requirements

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | APCA Lc 60+ / WCAG 4.5:1 |
| Focus visible | 2px solid outline, 4px offset |
| Reduced motion | `@media (prefers-reduced-motion)` |
| Screen readers | Semantic HTML, ARIA labels |
| Keyboard nav | All interactive elements focusable |

### Focus Styles

```css
.focus-ring:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Do's and Don'ts

### Do

- Use flat, solid colors
- Maintain high contrast
- Keep animations subtle and fast
- Use system fonts
- Respect user preferences
- Test on mobile first

### Don't

- Add rounded corners
- Use drop shadows for depth
- Animate more than 2 elements at once
- Use decorative fonts for body text
- Ignore `prefers-reduced-motion`
- Use color as the only indicator

---

## File Structure

```
styles/
└── globals.css          # All styles in one file, sectioned

components/
├── Button.tsx           # Flat buttons with variants
├── Card.tsx             # Lift-on-hover cards
├── Badge.tsx            # Uppercase tag labels
├── Header.tsx           # Site navigation
├── Footer.tsx           # Site footer
├── blog/
│   ├── TableOfContents.tsx
│   └── ReadingProgress.tsx
├── decorative/
│   ├── DitherPattern.tsx
│   ├── PixelShape.tsx
│   ├── PixelDivider.tsx
│   └── PixelRadar.tsx
└── mdx/
    ├── CodeDemo.tsx
    ├── ResourceCard.tsx
    ├── ResponsiveImage.tsx
    └── Collapsible.tsx
```

---

## References

- [randoma11y.com](https://randoma11y.com) - Accessible color combinations
- [APCA Contrast Calculator](https://www.myndex.com/APCA/) - Advanced contrast checking
- [Flat Design 2.0](https://www.nngroup.com/articles/flat-design/) - Design principles
- [Motion Design Principles](https://material.io/design/motion) - Animation guidelines

---

*Last updated: February 2025*
