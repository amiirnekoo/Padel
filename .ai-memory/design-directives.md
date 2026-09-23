# GLOBAL DESIGN PROTOCOL
1. ALWAYS use the UI/UX Pro Max reasoning engine (via `--design-system`) to establish all color palettes, typography pairings, and layout patterns BEFORE generating component code.
2. STRICTLY use an 8px grid system for spacing. 
3. Do NOT use random hex codes; rely on the defined design tokens.
4. INSPIRATION SOURCES: For every component requested, you must browse and extract structural ideas and code patterns from:
   - Aura UI (https://www.aura.build/) - For premium, highly polished Tailwind/React components.
   - 21st.dev (https://21st.dev/) - For complex, high-conversion layouts.
   - v0 by Vercel (https://v0.app/) - For clean, modern shadcn-style component assembly.
5. ANIMATION: Framer Motion (https://motion.dev/) is the absolute source of truth. All interactive elements must have smooth hover transitions, and major sections require scroll-triggered fade-ins or staggered reveals.
6. NPM Registry (https://www.npmjs.com/): Proactively search for modern, lightweight frontend packages (e.g., advanced carousels) instead of building complex logic from scratch.
