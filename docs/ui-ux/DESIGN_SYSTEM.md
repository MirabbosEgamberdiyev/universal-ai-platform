# NOVASPHERE AI — DESIGN SYSTEM SPECIFICATION
**Version:** 2.0.0  
**Theme Support:** Full Dark / Light with LocalStorage Persistence  
**CSS Framework:** Tailwind CSS 3.4 + CSS Variables  
**Typography:** Inter / system-ui  

---

## 1. DESIGN PHILOSOPHY & PRINCIPLES

1. **Semantic Surface Architecture:** No hardcoded backgrounds or text colors. All components must use semantic dark/light classes:
   - Light mode: Clean, crisp, high-contrast surfaces (`bg-white`, `border-slate-200`, `text-slate-900`).
   - Dark mode: Deep, modern slate surfaces (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-white`).
2. **Predictable Typography Hierarchy:** Strict sizing and line-height scale ensuring immediate readability and visual balance across desktop, tablet, and mobile viewports.
3. **Accessibility First (WCAG 2.2 Level AA):**
   - Minimum normal text contrast ratio: **4.5:1** (NovaSphere achieves **14.8:1** in light and **16.1:1** in dark).
   - Interactive targets maintain minimum touch footprint of **44x44px** on touch devices.
   - Visible focus indicators (`ring-2 ring-indigo-500/20`) on all keyboard-navigable elements.

---

## 2. COLOR TOKEN SYSTEM

### 2.1 Surfaces & Backgrounds
| Token / Utility | Light Mode Value | Dark Mode Value | Usage Context |
|:---|:---|:---|:---|
| `bg-background` | `#f8fafc` (`slate-50`) | `#020617` (`slate-950`) | Application root viewport canvas |
| `bg-surface` | `#ffffff` (`white`) | `#0f172a` (`slate-900`) | Cards, sidebar, headers, modals |
| `bg-surface-elevated` | `#ffffff` + `shadow-md` | `#1e293b` (`slate-800`) | Dropdowns, popovers, floating menus |
| `bg-surface-subtle` | `#f1f5f9` (`slate-100`) | `#1e293b`/50 (`slate-800/50`) | Inactive tabs, disabled inputs, badges |

### 2.2 Text & Typography Colors
| Token / Utility | Light Mode Value | Dark Mode Value | Usage Context |
|:---|:---|:---|:---|
| `text-primary` | `#0f172a` (`slate-900`) | `#f8fafc` (`slate-50`) | Page headers, card titles, primary body |
| `text-secondary` | `#475569` (`slate-600`) | `#94a3b8` (`slate-400`) | Descriptions, metadata, secondary labels |
| `text-muted` | `#94a3b8` (`slate-400`) | `#64748b` (`slate-500`) | Captions, placeholders, timestamps |

### 2.3 Brand & Semantic Accent Colors
| Role | Hex Code | Tailwind Utility | Semantic Purpose |
|:---|:---|:---|:---|
| **Primary Brand** | `#4f46e5` | `indigo-600` | Primary buttons, active nav items, key badges |
| **Primary Hover** | `#4338ca` | `indigo-700` | Hover state for primary interactive elements |
| **Success** | `#10b981` | `emerald-500` | Published status, positive metrics, token valid |
| **Warning / Schedule** | `#f59e0b` | `amber-500` | Scheduled posts, pending approvals, queue countdown |
| **Danger** | `#ef4444` | `rose-500` | Disconnect accounts, delete content, fatal errors |
| **Telegram Accent** | `#0284c7` | `sky-600` | Telegram platform badges, modals, CTAs |
| **Instagram Accent** | `#d946ef` | `fuchsia-600` | Instagram platform badges, preview borders |
| **YouTube Accent** | `#dc2626` | `red-600` | YouTube channel badges, video preview player |

---

## 3. TYPOGRAPHY HIERARCHY

```
Page Title (H1):      text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white
Section Title (H2):   text-base md:text-lg font-bold text-slate-900 dark:text-white
Card Heading (H3):    text-sm font-semibold text-slate-900 dark:text-white
Body Text:            text-xs md:text-sm font-normal text-slate-600 dark:text-slate-300
Caption / Meta:       text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400
Pill / Badge:         text-[10px] md:text-[11px] font-bold uppercase tracking-wider
```

---

## 4. COMPONENT ARCHITECTURE & PRIMITIVES

### 4.1 Card Component (`frontend/components/ui/Card.tsx`)
```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting context description.</CardDescription>
  </CardHeader>
  <CardContent>
    Main card content goes here.
  </CardContent>
  <CardFooter>
    Action buttons or summary metrics.
  </CardFooter>
</Card>
```

### 4.2 Button Component (`frontend/components/ui/Button.tsx`)
```tsx
<Button variant="primary" size="md" isLoading={loading}>
  Nashr qilish (Publish)
</Button>
<Button variant="outline" size="sm" onClick={onCancel}>
  Bekor qilish
</Button>
```

### 4.3 Theme Switcher (`frontend/components/ui/ThemeToggle.tsx`)
Features smooth icon transition between Sun (`lucide-react`) and Moon (`lucide-react`), bound to `ThemeContext.tsx` with instantaneous `localStorage` synchronization:
```tsx
const { theme, toggleTheme } = useTheme();
// Toggles 'dark' class on document.documentElement
```

---

## 5. LOCALIZATION ARCHITECTURE

All textual strings are organized into four parallel dictionaries in `frontend/lib/i18n/translations.ts`:
1. `uzl`: O'zbekcha (Lotin) — **System Default**
2. `uzc`: Ўзбекча (Кирилл)
3. `ru`: Русский
4. `en`: English (US)

**Forbidden Pattern:** `language === "uzl" ? A : B` (causes broken hybrid languages).  
**Enforced Pattern:** Always access via `t.<namespace>.<key>`.
