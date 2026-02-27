# UI Design Guidelines for BrickBuilder
Last updated: February 2026

## General Philosophy
- Clean, modern, playful LEGO-inspired aesthetic
- Target audience: families & children (6–12 years old) → cheerful, rounded, colorful, easy to read
- Mobile-first, fully responsive
- Use generous spacing and visual hierarchy
- Prefer subtle animations/hover effects over heavy motion
- Color palette:
  - Primary: purple-600 (#9333ea), indigo-600 (#4f46e5)
  - Accent: purple-500, indigo-500, pink-500 (for variety)
  - Neutral: slate-50 → slate-900
  - Success/positive: emerald-600
  - Warning/error: red-600

## Typography
- Headings: font-extrabold / font-bold, tracking-tight
  - Hero (h1): 4xl → 5xl / 5xl → 6xl on lg
  - Section titles (h2): 2xl → 3xl
  - Card titles: xl → 2xl
- Body text: text-lg or text-xl for readability on mobile
- Line height: leading-relaxed or leading-loose
- Font family: default system sans-serif (no custom font needed)

## Spacing & Layout
- Container: max-w-4xl to max-w-5xl for content, max-w-7xl for grids
- Padding: p-6 sm:p-8 lg:p-10 (cards), py-10 px-4 sm:px-6 lg:px-8 (main)
- Gap: gap-5 → gap-8 (grids), space-y-6 → space-y-10 (vertical stacks)
- Cards: rounded-3xl, shadow-2xl, border border-slate-200/70
- Sections: mb-10 → mb-16 between major blocks

## Buttons
- Primary: gradient from-indigo-600 to-purple-600 → hover:from-indigo-700 to-purple-700
  - py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl active:scale-[0.98]
- Secondary / outline: bg-purple-50 text-purple-700 hover:bg-purple-100
- With icon: flex items-center gap-2 or gap-3
- Loading: show <Loader2 className="h-6 w-6 animate-spin" /> inside button

## Cards & Lists
- Brick/idea cards: rounded-2xl, bg-gradient-to-br from-slate-50 to-white, hover:shadow-md hover:border-purple-200
- Step cards: flex items-start gap-6, border-b last:border-0
- Step number: w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold shadow-md
- Lists: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6

## States
- Loading: centered Loader2 + message, text-purple-600
- Error: bg-red-50 border-red-200 text-red-700 rounded-2xl p-6 text-center with <AlertCircle />
- Empty: italic text-slate-500 text-center py-12

## Interactions
- Hover: scale-105, shadow increase, color shift (purple/indigo)
- Active: scale-[0.98]
- Speaking state (voice): bg-purple-600 text-white scale-110 shadow-lg

## Icons
- Use lucide-react icons
- Sizes: h-6 w-6 (buttons), h-7 w-7 (larger), h-14 w-14 (empty/error states)
- Colors: inherit from context or explicit purple/indigo

## Backgrounds
- Main page: bg-gradient-to-b from-slate-50 to-slate-100
- Cards: white or very light gradient

## Accessibility & Polish
- Good contrast (text-slate-800 on white, white on purple/indigo)
- aria-label on icon-only buttons
- Focus states: ring-2 ring-purple-400
- Transitions: duration-200 or duration-300, ease-in-out

When suggesting or modifying UI code:
- Always follow these guidelines unless explicitly told otherwise
- Prioritize mobile readability
- Use Tailwind classes consistently
- Prefer rounded-2xl/3xl over rounded-lg
- Add subtle hover and active states
- Keep visual hierarchy clear (big titles → subtitles → content)

Happy building! 🧱