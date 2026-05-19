---
name: Monolith Journal
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e3e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.75'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 8px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 20px
  max-width: 1200px
  reading-width: 680px
---

## Brand & Style

The design system is rooted in **Structural Minimalism**. It prioritizes the written word and high-fidelity content over decorative artifice. By removing the distraction of color and depth, the UI becomes a transparent vessel for thought.

The emotional response should be one of clarity, authority, and calm. It targets an intellectual audience that values efficiency and focus. The aesthetic draws from Swiss International Style—utilizing a strict grid, ample white space, and a monochromatic palette to create a timeless, professional digital environment.

## Colors

The palette is strictly monochromatic to ensure maximum legibility and a sophisticated "editorial" feel. 

- **Primary:** True Black (#000000) is used for all primary headings, body text, and high-emphasis UI elements.
- **Secondary:** A mid-tone neutral (#737373) is reserved for metadata, captions, and secondary information to create a clear visual hierarchy.
- **Surface:** The background is pure White (#FFFFFF), providing a high-contrast canvas that reduces eye strain and emphasizes the layout's structural lines.
- **Accents:** Very light greys are used sparingly for dividers and subtle background shifts in UI containers.

## Typography

This design system utilizes **Inter** for all roles to maintain a systematic and utilitarian appearance. The focus is on weight contrast and whitespace rather than font variety.

- **Scale:** A generous typographic scale ensures that headlines are commanding while body text remains breathable. 
- **Body Text:** Set with a line-height of 1.75 to optimize for long-form reading.
- **Labels:** Small caps or increased letter spacing should be applied to labels and metadata to distinguish them from the narrative flow.
- **Hierarchy:** Use bold weights (700) for displays and semi-bold (600) for headlines to create immediate focal points.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to maintain editorial control over line lengths.

- **The Grid:** A 12-column grid is used for the main site structure. However, the "Reading Zone" is constrained to a single column of 680px, centered on the page, to ensure an optimal number of characters per line.
- **Spacing Rhythm:** Based on an 8px base unit. Vertical rhythm is strictly enforced; spacing between sections should be large (e.g., 80px, 120px) to allow the content to breathe.
- **Breakpoints:**
  - **Desktop:** 1200px+ (12 columns, 64px margins)
  - **Tablet:** 768px - 1199px (8 columns, 40px margins)
  - **Mobile:** < 767px (4 columns, 20px margins, typography downscales).

## Elevation & Depth

To maintain the minimalist and content-centric aesthetic, this design system eschews shadows and blurs.

- **Flat Design:** All elements exist on a single flat plane.
- **Differentiation:** Hierarchy is established through **Low-contrast outlines** (1px solid borders in #E5E5E5) and tonal shifts in the background (using White vs. Light Grey #F5F5F5).
- **Interactions:** Hover states are signaled by color inversions (e.g., a white background turning black) or subtle opacity changes rather than lifting the element off the page.

## Shapes

The design system uses **Sharp (0)** roundedness. Every UI element—from buttons to input fields to cards—features crisp 90-degree angles. This reinforces the architectural, structured feel of the grid and aligns with the professional, no-nonsense brand personality.

## Components

### Buttons
Buttons are high-contrast rectangles. 
- **Primary:** Solid black background with white text. No border.
- **Secondary:** White background with a 1px black border and black text.
- **State:** On hover, the primary button shifts to a dark grey (#262626).

### Input Fields
Inputs are defined by a 1px black bottom-border only, or a full 1px light grey border. Focus state is indicated by a 1px solid black border. Labels should use the `label-md` typographic style, placed above the field.

### Cards
Cards do not use shadows. They are defined by a 1px #E5E5E5 border or a subtle #F5F5F5 background fill. Padding within cards should be generous (min 32px) to prevent content from feeling cramped.

### Lists
Lists for blog feeds should be separated by a single 1px light grey horizontal rule. Metadata (date, category) should appear above or beside the title in the `caption` or `label-md` style.

### Navigation
The navigation bar is a simple horizontal list. Active states are indicated by a bold weight or a simple underline. Avoid sticky headers unless they are extremely low-profile.