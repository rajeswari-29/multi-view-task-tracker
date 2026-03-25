# Project Tracker (Multi-View, Custom Drag-and-Drop, Virtual Scrolling, Live Presence)

React + TypeScript frontend (no UI/component libraries, no DnD libs, no virtual scrolling libs).

## Features

- 3 instant-switchable views over one shared task dataset:
  - Kanban: `To Do`, `In Progress`, `In Review`, `Done`
  - List: sortable table with inline status dropdown
  - Timeline/Gantt: month axis with priority-colored bars + today marker
- Custom drag-and-drop between Kanban columns (mouse + touch) implemented with native pointer events.
- Virtual scrolling in List view for large datasets (500+ tasks) via `useVirtualList`.
- Live collaboration indicators (mock interval simulation) with enter/leave animations.
- URL-synced filters (status/priority/assignee multi-select + due date range). Back/forward restores filter state.

## Setup

```bash
npm install
npm run dev
```

Production build + preview:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 5175
```

Seed data generator: `src/data/seedTasks.ts` (generates 500 tasks as required)

## Deployment (GitHub Pages)

This project is deployed using GitHub Pages.

### Step 1: Install dependency

npm install gh-pages --save-dev

### Step 2: Update `package.json`

Add:

"homepage": "https://rajeswari-29.github.io/multi-view-task-tracker"

Update scripts:

"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

### Step 3: Configure Vite

Update `vite.config.js`:

export default defineConfig({
  base: "/multi-view-task-tracker/",
})

### Step 4: Deploy

npm run deploy

### Live Demo

https://rajeswari-29.github.io/multi-view-task-tracker/

### Note

* The `dist` folder is used because this project is built with Vite.
* Setting the correct `base` path ensures assets load properly on GitHub Pages.


I used Zustand because tasks are updated frequently from multiple UI surfaces (Kanban drag + inline List status dropdown). Zustand avoids prop drilling, keeps updates predictable via immutable updates, and remains lightweight for a highly interactive UI.

## Virtual Scrolling (How it works)

List view uses a custom `useVirtualList` hook (`src/hooks/useVirtualList.ts`). It calculates the visible range from `scrollTop` and a fixed `rowHeight`, then renders only:

- Rows currently visible
- Plus an overscan buffer of 5 rows above and below

The total height is preserved using a spacer (`totalHeight = count * rowHeight`) and translating the rendered subset with `transform: translateY(...)`. This prevents blank gaps and jumpiness during fast scroll.

## Drag-and-Drop (How it works)

Kanban drag-and-drop is implemented in `src/hooks/useKanbanDnd.ts` using native pointer events:

- On pointer-down, the dragged card is measured and a same-height placeholder is rendered in the origin column.
- A fixed-position “ghost” follows the cursor with reduced opacity and shadow.
- Drop zones are detected by hit-testing pointer coordinates against each column’s scroll container bounding rect.
- If dropped outside a valid column, the ghost animates back smoothly and the task status is unchanged.

## Lighthouse Report

Include a screenshot of your Lighthouse report showing 85+ performance score.

![Lighthouse Report](reports/lighthouse-screenshot.png) Note: Deployed version may score higher due to better hosting.

## Hardest UI Problem (150-250 words)

The hardest UI problem was implementing drag-and-drop that remains stable without layout shift while still feeling precise. During a drag, I avoid reflowing the column by not moving the underlying task until pointer-up. Instead, I measure the dragged card’s exact height and render a same-height placeholder in its original slot. The visual element the user interacts with is a fixed-position ghost that follows the pointer (slightly transparent with a drop shadow), while the real layout stays locked by the placeholder. For snap-back, if the pointer is released outside any valid column, I animate the ghost back to its original screen coordinates and then clear the drag state—so the card reappears cleanly in the correct place. Drop-zone validity feedback is done via subtle background changes on the target column while dragging over it. If I refactor with more time, I’d add Kanban column virtualization (similar to List) to improve performance further on very large datasets.
