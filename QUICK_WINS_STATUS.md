# Quick Wins Status - 24 Januari 2026

## ✅ Geïmplementeerd

### 1. Weekweergave in Calendar ✅
**Status:** Al geïmplementeerd  
**Locatie:** `app/components/CalendarView.tsx`  
**Features:**
- Toggle tussen maand/week view
- Default week view op mobile
- Week navigatie (vorige/volgende week)
- Week range display

### 2. Drag & Drop voor Posts ✅
**Status:** Geïmplementeerd  
**Locatie:** `app/components/CalendarView.tsx` + `app/planner/page.tsx`  
**Features:**
- Drag & drop posts tussen calendar dagen
- Visual feedback tijdens drag (opacity, overlay)
- API call om post scheduledDate te updaten
- Touch-friendly (touchAction: 'none')
- Droppable date cells met visual feedback

**Code:**
- `DndContext` wrapper rond calendar
- `SortablePost` component voor draggable posts
- `DroppableDateCell` component voor droppable dates
- `handlePostMove` functie in planner/page.tsx

### 3. Dark Mode ⚠️
**Status:** Gedeeltelijk geïmplementeerd  
**Locatie:** `app/lib/theme.tsx`, `app/components/ThemeToggle.tsx`, `app/globals.css`  
**Features:**
- ✅ ThemeProvider met localStorage
- ✅ System preference detection
- ✅ ThemeToggle component
- ✅ CSS variables voor dark mode
- ⚠️ Veel inline styles gebruiken nog hardcoded kleuren (moet worden vervangen door CSS variables)

**Wat nog moet:**
- Inline styles vervangen door CSS variables (bijv. `#fff` → `var(--color-bg-panel)`)
- Alle componenten updaten om dark mode te ondersteunen

---

## ❌ Build Error

**Probleem:** `app/planner/page.tsx` regel 994-995  
**Error:** "Unexpected token `div`. Expected jsx identifier"  
**Oorzaak:** Parser interpreteert arrow functions binnen `PlannerContent` verkeerd

**Status:** In onderzoek  
**Impact:** Blokkeert deployment naar Vercel

**Mogelijke oplossingen:**
1. Functies (`AnalyticsView`, `LinkedInPostPreview`, `InstagramPostPreview`) buiten `PlannerContent` verplaatsen
2. Functies omzetten naar gewone function declarations
3. TypeScript/Next.js configuratie aanpassen

---

## 📋 Volgende Stappen

1. **Build error oplossen** (prioriteit 1)
2. **Dark mode volledig implementeren** (inline styles → CSS variables)
3. **Deployment naar Vercel**

---

**Laatste update:** 24 Januari 2026
