# Design tokens

Extracted from `frontend/index.html` and the Twind utility classes used throughout
`frontend/*.tsx`. These describe the existing interface; they are not a new theme.
Twind's standard utility palette supplies the named colors, so its CDN version is
part of the visual dependency.

| Role | Existing value or utility |
| --- | --- |
| Page background | `linear-gradient(180deg, #f7f4ef 0%, #eef2f7 100%)` |
| Primary text / actions | `slate-900`; action text `white` |
| Secondary text | `slate-700`, `slate-600`, `slate-500`; muted `slate-400` |
| Surfaces and borders | `white`, `slate-50`; `slate-200`, `slate-300` |
| Warnings | `amber-50`, `amber-300`, `amber-900` |
| Errors / urgent cues | `rose-50`, `rose-300`, `rose-800`, `rose-900` |
| Informational cues | `sky-50`, `sky-900` |
| Typeface | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`; monospace for references |
| Type scale | Twind `text-xs`, `text-sm`, `text-xl`, `text-3xl`, plus `10px` and `11px` labels |
| Weight | `font-medium`, `font-semibold` |
| Spacing | Twind spacing scale, especially `gap-2`, `gap-3`, `px-3`, `px-4`, `py-2`, `p-4` |
| Shape | `rounded-lg` for controls/cards, `rounded-full` for badges |
| Layout | centered `max-w-3xl`, responsive `sm:` grids |

The utilities are the source of truth for individual components. Do not assume all
palette values are hard-coded hex colors: they are supplied by Twind at runtime.
