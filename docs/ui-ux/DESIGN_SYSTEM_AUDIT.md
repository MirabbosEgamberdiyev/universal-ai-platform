# NovaSphere AI — Design System Audit & Token Architecture
**Platform:** NovaSphere AI  
**Location:** `D:\My-project\universal-ai-platform`  
**Date:** 2026-11-10  

---

## 1. Token Audit & Defect Catalog

### Initial Deficiencies:
1. **Ad-hoc Colors:** Pages used conflicting color palettes (`bg-zinc-900`, `bg-slate-950`, `bg-black`, `bg-slate-50`) without a single source of truth.
2. **Missing Theme Architecture:** Dark mode was hardcoded in specific content divs rather than governed by the HTML root class (`.dark`).
3. **Contrast Violations:** Text colors like `text-white` or `text-zinc-400` rendered against light backgrounds with contrast ratios < 1.8:1 (failing WCAG 2.2 AA).
4. **Lack of Reusable Component Primitives:** Each page re-invented buttons, input fields, modal overlays, and empty states using custom inline Tailwind classes.

---

## 2. Canonical Semantic Design System Tokens

### Color Tokens

| Token Name | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `background` | `#F8FAFC` (`slate-50`) | `#090D16` (`slate-950`) | Global page viewport background |
| `surface` | `#FFFFFF` (`white`) | `#0F172A` (`slate-900`) | Cards, tables, modals, sidebars |
| `surface-hover` | `#F1F5F9` (`slate-100`) | `#1E293B` (`slate-800`) | Interactive list items, hover cards |
| `border-subtle` | `#E2E8F0` (`slate-200`) | `#1E293B` (`slate-800`) | Card borders, dividers, inputs |
| `text-primary` | `#0F172A` (`slate-900`) | `#F8FAFC` (`slate-50`) | Primary headings, table text |
| `text-secondary`| `#475569` (`slate-600`) | `#94A3B8` (`slate-400`) | Body copy, descriptions |
| `text-muted` | `#94A3B8` (`slate-400`) | `#64748B` (`slate-500`) | Meta info, timestamps, placeholders |
| `primary` | `#4F46E5` (`indigo-600`) | `#6366F1` (`indigo-500`) | Brand buttons, active tabs, primary accents |
| `success` | `#10B981` (`emerald-500`)| `#059669` (`emerald-600`)| Published status, verified badges |
| `warning` | `#F59E0B` (`amber-500`) | `#D97706` (`amber-600`) | Scheduled status, rate limit alerts |
| `danger` | `#EF4444` (`rose-500`) | `#E11D48` (`rose-600`) | Failed jobs, delete actions, errors |

### Typography Scale

- **Display:** `text-4xl md:text-5xl font-extrabold tracking-tight` (Hero titles)
- **H1:** `text-2xl font-bold tracking-tight text-slate-900 dark:text-white` (Page titles)
- **H2:** `text-lg font-bold tracking-tight text-slate-900 dark:text-white` (Card titles)
- **H3:** `text-sm font-semibold text-slate-800 dark:text-slate-200` (Subheadings)
- **Body:** `text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed`
- **Caption / Meta:** `text-[10px] md:text-xs text-slate-400 dark:text-slate-500`
- **Button / Label:** `text-xs font-semibold uppercase tracking-wider`

### Elevation & Shadows

- **Subtle Card:** `shadow-xs border border-slate-200 dark:border-slate-800`
- **Elevated Dropdown / Modal:** `shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900`
- **Primary Button:** `shadow-sm shadow-indigo-600/20 active:translate-y-px`
