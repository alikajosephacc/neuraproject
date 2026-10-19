---
name: ui-references
description: >-
  Curated collection of UI libraries, design systems, reference repositories, and hardware aesthetics for OLED Studio UI design. Use whenever researching, designing, implementing, or styling reactive, liquid, physical, dynamic island, or hardware-inspired UI components.
---

# OLED Studio UI Design References & Component Libraries

This skill preserves the authoritative set of open-source UI libraries, interaction physics references, and hardware design aesthetics used across the OLED Studio frontend.

---

## 1. Primary Component Libraries & Repositories

### 1. React Bits
- **Repo:** [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)
- **Website:** [reactbits.dev](https://reactbits.dev)
- **Primary Use Cases:**
  - `SpotlightCard` / `Spotlight`: Cursor-following ambient radial glow overlays (large radius `400px–600px` at low opacity `0.06–0.12`).
  - `BorderTrail` / `ElectricBorder`: Perimeter path animation running around chassis edges.
  - `ClickSpark`: Particle burst explosion on button click.
  - `DecryptedText`: Cyberpunk/telemetry alphanumeric scramble on hover/change.
  - `GlassSurface` / `TiltedCard`: 3D inertial tilt with specular highlight sheen.

### 2. 21st.dev
- **Website:** [21st.dev/?q=interactive](https://21st.dev/?q=interactive)
- **Primary Use Cases:**
  - Community-crafted interactive components, micro-interactions, dynamic island variants, border beams, and tactile controls.

### 3. Lenis (Darkroom Engineering)
- **Repo:** [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)
- **Primary Use Cases:**
  - Smooth inertial timeline scrubber physics using exponential damping ($x(t+\Delta t) = \text{lerp}(x(t), x^*, 1 - e^{-\lambda \Delta t})$).
  - Virtualized scroll/scrub without jerky step jumps.

### 4. Skiper UI
- **Website:** [skiper-ui.com/v1/skiper46](https://skiper-ui.com/v1/skiper46)
- **Primary Use Cases:**
  - `skiper46`: Liquid mercury tab transitions utilizing SVG gooey filters (`feGaussianBlur` + `feColorMatrix` thresholding).
  - `skiper3`: Apple-style reactive play button with gooey pulse halo.

### 5. GSAP (GreenSock)
- **Repo:** [greensock/gsap](https://github.com/greensock/gsap)
- **Primary Use Cases:**
  - Sub-frame playhead positioning and precision timeline animations.

### 6. Vanta.js
- **Repo:** [tengbao/vanta](https://github.com/tengbao/vanta)
- **Primary Use Cases:**
  - Lightweight 2D/3D ambient wavefields, procedural background canvas, and audio-reactive dot waves.

### 7. shadcn/ui
- **Repo:** [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
- **Website:** [ui.shadcn.com](https://ui.shadcn.com)
- **Primary Use Cases:**
  - Clean, unstyled accessible primitives (radix-based dialogs, popovers, badges, tooltips, dropdown menus).

### 8. HeroUI (formerly NextUI)
- **Repo:** [heroui-inc/heroui](https://github.com/heroui-inc/heroui)
- **Website:** [heroui.com](https://heroui.com)
- **Primary Use Cases:**
  - Modern acrylic surfaces, frosted slider tracks/handles, and crisp dark mode borders.

---

## 2. Technical Isometric & Mechanical Illustration Skills

In addition to component libraries, the workspace includes dedicated skills for rendering interactive physical instruments, technical cutaways, and hardware figures:

### Hairline (`hairline-create`)
- **Skill Path:** [SKILL.md](file:///c:/Users/manee/Desktop/oled/.agents/skills/hairline-create/SKILL.md)
- **Style:** Single-stroke isometric line drawings built from rounded solids that answer pointer input.
- **Reference Engine:** `@lucasmarkes/hairline`
- **Primary Use Cases:** Minimalist, high-precision isometric line figures, continuous field representations, and responsive tactile wireframes.

### Anatomy (`anatomy`)
- **Repo:** [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)
- **Skill Path:** [SKILL.md](file:///c:/Users/manee/Desktop/oled/.agents/skills/anatomy/SKILL.md)
- **Style:** Crafted, highly detailed interactive isometric SVG figures representing technical ideas as real physical machines (test rigs, dial gauges, cabinets, plotters, locks, lathe/tube parts, four-tone shading, and optional WebGL shaders).
- **Primary Use Cases:** "Linear-style" or premium technical drawings, physical hardware cutaways, exploded assembly views, and interactive instrument dials.

---

## 3. Key Micro-Interaction References & Math

### Magic UI (Border Beam)
- **Website:** [magicui.design/docs/components/border-beam](https://magicui.design/docs/components/border-beam)
- **Technique:** `conic-gradient` rotating along element perimeter combined with `mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)` and `mask-composite: exclude` to illuminate **only** the 1–2px border without contaminating the component face.

### ibelick (Spotlight & Clean Interactions)
- **Website:** [ui.ibelick.com](https://ui.ibelick.com)
- **Technique:** Soft room-scale light pool using large radius (`radial-gradient(500px circle at ${x}px ${y}px, rgba(..., 0.08), transparent 40%)`) rather than narrow, high-intensity laser spots.

---

## 4. Physical Hardware Aesthetics

### Teenage Engineering (OP-1 Field)
- **Reference:** [teenage.engineering](https://teenage.engineering)
- **Aesthetic Attributes:**
  - Matte ceramic casing (`#F6F6F4`) vs true optic black chassis (`#000000`).
  - Signal Amber (`#FF7700`) and Phosphor Green (`#00FF66`) functional accents.
  - Machined aluminum bezels, rotary encoder detents, mechanical bat toggle switches.
  - High-density information hierarchy without decorative fluff.

### Nothing Tech
- **Reference:** [nothing.tech](https://nothing.tech)
- **Aesthetic Attributes:**
  - High-contrast 1-bit typography, monospace telemetry readouts.
  - Dot-matrix glyphs, status pills, and transparent glass substrate layering.

### Apple Dynamic Island
- **Aesthetic Attributes:**
  - Gelatinous squish & stretch on cursor interaction.
  - Smooth spring morphing (`HW_SPRINGS.islandExpand`) between idle and active states.
  - Integrated micro-equalizer and contextually expanding telemetry.

---

## 5. Quick Guidelines for Implementation

When asked to implement or refine interactive components:
1. **Never invent narrow spotlight math**: Spotlights must have a wide falloff (`400px–600px`) at low opacity (`5%–12%`).
2. **Preserve component face clarity**: For border glow or caustic effects, mask or bound the glow to outer perimeter/bevel edges so icons, text, and inputs remain 100% legible.
3. **Use spring kinematics**: Prefer Framer Motion physical springs (`stiffness: 280-320`, `damping: 24-25`) over linear or ease-in-out CSS transitions for gesture reactivity.
4. **Leverage Anatomy & Hairline for Hardware Explanations**: When illustrating complex internal signal chains, ESP32 hardware layouts, or physical mechanics, use `anatomy` or `hairline-create` rather than abstract box diagrams.
