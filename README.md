# TaskFlow — Premium Dark Task Management App

A fully functional, production-grade To-Do app built with **vanilla HTML, CSS & JavaScript**.  
No frameworks. No hardcoded data. All tasks are user-generated and persist via `localStorage`.

---

## ✅ Feature Checklist

| Feature | Status |
|---|---|
| Add / Edit / Delete tasks | ✅ |
| Mark tasks complete / incomplete | ✅ |
| Title, Category, Priority, Deadline, Time, Note | ✅ |
| localStorage persistence | ✅ |
| Dashboard with progress ring | ✅ |
| Full task list with search | ✅ |
| Filter by category / priority / status | ✅ |
| Calendar view (timeline per day) | ✅ |
| Stats screen (weekly chart, category breakdown) | ✅ |
| Overdue detection + warning | ✅ |
| Empty states | ✅ |
| Toast notifications | ✅ |
| Delete confirmation dialog | ✅ |
| Fully responsive (mobile → desktop) | ✅ |
| Smooth animations & micro-interactions | ✅ |
| Keyboard accessible | ✅ |

---

## 📁 Full Project Structure

```
taskflow/
├── index.html                        ← Entry point (loads all CSS + JS in correct order)
│
└── src/
    ├── app.js                        ← Bootstrap: builds screens, mounts nav/FAB, inits store & router
    │
    ├── styles/
    │   ├── variables.css             ← Design tokens (colors, spacing, radii, fonts, shadows)
    │   ├── base.css                  ← Reset, typography, global layout, screen transitions
    │   ├── components.css            ← All component styles (nav, cards, modal, form, FAB…)
    │   └── responsive.css            ← Media queries (mobile → tablet → desktop → reduced-motion)
    │
    ├── utils/
    │   ├── storage.js                ← localStorage read/write layer
    │   ├── helpers.js                ← Shared utilities (date formatting, greeting, class maps…)
    │   ├── taskStore.js              ← Task state: CRUD, observers, computed stats
    │   └── router.js                 ← Screen navigation + hash-based routing
    │
    ├── components/
    │   ├── Toast.js                  ← Toast notification system
    │   ├── ConfirmDialog.js          ← Delete confirmation dialog
    │   ├── BottomNav.js              ← Bottom navigation bar
    │   ├── TaskCard.js               ← Task item renderer (DOM element + event listeners)
    │   ├── TaskModal.js              ← Add / Edit task bottom sheet
    │   └── FAB.js                    ← Floating action button
    │
    └── screens/
        ├── DashboardScreen.js        ← Home: progress ring, stat pills, recent tasks
        ├── TasksScreen.js            ← Task list: search, filters, sorted task cards
        ├── CalendarScreen.js         ← Calendar: date strip + event timeline
        └── StatsScreen.js            ← Stats: weekly chart, category breakdown, motivation
```

---

## 🚀 Getting Started

### Option 1 — Open directly
```bash
# macOS
open index.html

# Windows
start index.html

# Linux
xdg-open index.html
```

### Option 2 — Local dev server (recommended)
```bash
# Python 3
cd taskflow
python3 -m http.server 3000
# → http://localhost:3000

# Node.js
npx serve .
# → http://localhost:3000
```

### Option 3 — VS Code
Install **Live Server** extension → Right-click `index.html` → **Open with Live Server**

---

## 🎨 Design System

| Token | Value |
|---|---|
| Font (display) | Sora |
| Font (body) | DM Sans |
| Font (mono) | JetBrains Mono |
| Background | `#080c18` |
| Surface | `#0f1528` / `#131a30` |
| Accent blue | `#4f8ef7` |
| Accent violet | `#8b6ff5` |
| Accent cyan | `#00d4c8` |
| Border | `rgba(255,255,255,0.06)` |

All tokens live in `src/styles/variables.css`. Change one line = change the whole app.

---

## 🔧 Customisation

### Add a new category
In `src/components/TaskModal.js` (the `<select>` element) and `src/utils/helpers.js` (`catClass`, `catLabel`, `catColor`, `catTimelineColor` maps).

### Change accent color
Edit `--blue` and `--violet` in `src/styles/variables.css`.

### Add a new screen
1. Create `src/screens/MyScreen.js` with `build()`, `activate()`, `deactivate()`
2. Add `<script>` tag in `index.html` before `router.js`
3. Register in `Router._screens` in `src/utils/router.js`
4. Add nav button in `BottomNav.js`

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `< 360px`  | Compact spacing, stacked elements |
| `360–540px` | Default mobile layout |
| `540–768px` | Centered card with side borders |
| `768px+`   | Hover states, larger type |
| `1024px+`  | Subtle background vignette |

---

## 💾 Storage Format

Tasks are stored in `localStorage` under key `taskflow_tasks_v1` as a JSON array:

```json
[
  {
    "id": "lxk3a2-r4nd0m",
    "title": "My task",
    "category": "work",
    "priority": "high",
    "deadline": "2026-04-30",
    "time": "14:00",
    "note": "Optional note",
    "done": false,
    "createdAt": 1714435200000
  }
]
```

---

## 📄 License

MIT — free to use, modify, and distribute.
