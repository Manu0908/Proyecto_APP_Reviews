---
name: Abyssal Purity
colors:
  surface: '#09151c'
  surface-dim: '#09151c'
  surface-bright: '#2f3b43'
  surface-container-lowest: '#041016'
  surface-container-low: '#111d24'
  surface-container: '#152128'
  surface-container-high: '#202b33'
  surface-container-highest: '#2b363e'
  on-surface: '#d8e4ee'
  on-surface-variant: '#c1c8c9'
  inverse-surface: '#d8e4ee'
  inverse-on-surface: '#26323a'
  outline: '#8b9293'
  outline-variant: '#414849'
  surface-tint: '#adccd3'
  primary: '#adccd3'
  on-primary: '#16353b'
  primary-container: '#7b99a0'
  on-primary-container: '#123137'
  inverse-primary: '#46636a'
  secondary: '#afcbd5'
  on-secondary: '#19343c'
  secondary-container: '#324d56'
  on-secondary-container: '#a1bdc7'
  tertiary: '#bac9cd'
  on-tertiary: '#253336'
  tertiary-container: '#88969a'
  on-tertiary-container: '#212f32'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e8f0'
  primary-fixed-dim: '#adccd3'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#2e4b51'
  secondary-fixed: '#cae7f2'
  secondary-fixed-dim: '#afcbd5'
  on-secondary-fixed: '#011f27'
  on-secondary-fixed-variant: '#304b53'
  tertiary-fixed: '#d6e5e9'
  tertiary-fixed-dim: '#bac9cd'
  on-tertiary-fixed: '#101e21'
  on-tertiary-fixed-variant: '#3b494c'
  background: '#09151c'
  on-background: '#d8e4ee'
  surface-variant: '#2b363e'
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 30px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  metric-display:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 52px
    letterSpacing: -0.03em
  metric-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an uncompromising standard of culinary transparency, clinical precision, and deep oceanic atmosphere. Built for discerning diners, Michelin inspectors, and culinary purists, the platform replaces mundane civic health scores with a refined editorial aesthetic. It conveys absolute confidence, scientific rigor, and understated luxury.

The style unites **Atmospheric Glassmorphism** with **Editorial Precision**:
- **Oceanic Depth:** Dark, cavernous backdrops evoke pristine deep-sea trenches and sterile underwater environments, grounding the experience in silence and focus.
- **Luminescent Clarity:** Glowing teal and aqua indicators cut through dark substrates, mimicking bioluminescent organisms and precision instrumentation.
- **Editorial Distinction:** High-contrast serif headlines evoke gastronomic publications, balanced with tabular, monospace-grade sans typography for sanitary metrics and inspection dates.

## Colors

The color architecture directly implements the Palette Point oceanic hierarchy, engineered exclusively for high-contrast dark mode legibility and luminescent feedback:

- **Surface Base (`#08141B`, Midnight Edition):** The foundational infinite canvas, providing deep optical sink for translucent layers.
- **Surface Elevation (`#132F37`, Elite Teal):** The substrate for elevated cards, floating sheets, and docked navigation bars.
- **Structural Borders (`#2A4F58`, Atlantic Deep):** Subtle hairline borders (`1px`) defining containers and section delimiters without visual clutter.
- **Muted Data & Supporting Copy (`#51727A`, Tornado Season):** Secondary labels, metadata timestamps, and inactive toggle states.
- **Primary Accent & Interactive Indicators (`#7B99A0`, Tranquil Aqua):** Primary interactive targets, active filter pills, and focused outline rings.
- **Luminescent Emissive Accent (`#A6C0C6`, Juliet Blue):** Glow radii, hovering map pins, and hygiene grade seals.
- **Pure Metric & Headline Display (`#D7E6EA`, White Sea):** Crisp typographic hero text, numeric score readouts, and pristine status verification icons.

### Semantic Status Tokens
- **Pristine / Grade A:** `#A6C0C6` with an emissive `rgba(166, 192, 198, 0.25)` ambient glow.
- **Conditional / Grade B:** `#E5B869` with an amber low-glow halo.
- **Critical / Remedial:** `#C85A5A` with an alert crimson low-glow halo.

## Typography

The typographic hierarchy establishes a dialogue between gastronomy and empirical scrutiny:

- **Editorial Headings (`Newsreader`):** Used with italics and standard weights for restaurant names, curation reviews, and section headers. Conveys heritage, fine dining prestige, and critical authority.
- **Body & Interface Elements (`Geist`):** Delivers neutral, highly legible sans-serif readability on dark frosted glass panels. Excellent optical clarity at small sizes for inspection transcripts and violation logs.
- **Metrics, Data & Inspection Tags (`Space Grotesk`):** A geometric, monospaced-leaning sans utilized exclusively for rating digits (e.g., `99.4/100`), inspection timestamps, hazard codes, and uppercase category caps.

## Layout & Spacing

The layout employs a structured 12-column fluid grid on desktop (max canvas width: `1440px`), collapsing to a 6-column grid on tablet and a single-column flow on mobile viewports.

- **Desktop (1024px+):** `margin: 3rem`, `gutter: 1.5rem`. Wide atmospheric breathing room to support staggered map splits and sticky metric panels.
- **Tablet (768px - 1023px):** `margin: 2rem`, `gutter: 1.25rem`. Two-column split with collapsible overlay inspection drawers.
- **Mobile (<768px):** `margin: 1.25rem`, `gutter: 1rem`. Bottom-sheet anchored interface with sticky inspection grade headers.

Rhythm is strictly mathematical around multiples of `0.25rem` (4px base unit), enforcing consistent visual balance between clinical data dense tables and expansive photography cards.

## Shapes

The system uses balanced, modern radiuses (`roundedness: 2` — `0.5rem` / `8px` default) to convey architectural discipline and precision:

- **Cards & Data Panels:** `rounded-lg` (`1rem` / `16px`) to produce soft, lens-like containment.
- **Buttons, Badges & Micro Chips:** Pill styling (`rounded-full` / `9999px`) used selectively on status tags and action pills to mimic clinical capsules.
- **Input Fields & Metric Containers:** `rounded-md` (`0.5rem` / `8px`) with sharp, clean boundaries that align with tabular inspection figures.

## Components

### Buttons
- **Primary Action:** Solid background using `#7B99A0`, text colored in `#08141B` (bold weight for stark contrast), rounded pill shape (`9999px`), with hover transitions activating a subtle glow (`0 0 16px rgba(166, 192, 198, 0.4)`).
- **Secondary Action:** Frosted surface `rgba(19, 47, 55, 0.6)` with a `1px` border of `#2A4F58`, text in `#D7E6EA`. On hover, border shifts to `#7B99A0`.
- **Ghost Action:** Transparent background, text in `#A6C0C6`, accompanied by an underline indicator that expands on focus.

### Pristine Hygiene Badges
- Circular or capsule seals featuring a glowing concentric outline.
- **Grade 100 / Platinum Pass:** Emissive ring in `#D7E6EA` over `#132F37`, displaying the `Space Grotesk` numeric score with a centered sterile shield glyph.
- Ambient aqua radiance ensures instant visual confirmation even over dark imagery.

### Cards & Inspection Modules
- Deep oceanic frosted base (`backdrop-filter: blur(20px)` over `rgba(19, 47, 55, 0.4)`).
- Top edge features an inner stroke highlight: `box-shadow: inset 0 1px 1px 0 rgba(215, 230, 234, 0.15)`.
- Metadata displayed in neat grids with `#51727A` labels and `#D7E6EA` values.

### Glowing Map Pins
- Outer pulsing beacon rendered with `rgba(123, 153, 160, 0.25)`.
- Inner diamond or circular core in solid `#D7E6EA` that displays the numerical rating at elevated zoom levels.

### Input Fields & Search Bars
- Recessed deep pill container with `background: rgba(8, 20, 27, 0.8)` and a fine border of `#2A4F58`.
- Placeholder text in `#51727A`.
- Active focus transitions the border to `#7B99A0` with an ambient glow spread of `0 0 0 3px rgba(123, 153, 160, 0.2)`.

### Chips & Filter Pills
- Inactive: `#132F37` fill, `#2A4F58` border, `#A6C0C6` label.
- Active: `#7B99A0` background, `#08141B` text, and a distinct dot indicator that illuminates in `#D7E6EA`.

### Checkboxes & Radios
- Custom rounded squares (`checkbox`) and rings (`radio`) filled with `#08141B`, bounded by `1px solid #51727A`.
- Checked state transitions background to `#7B99A0` with an internal check icon rendered in `#08141B`.