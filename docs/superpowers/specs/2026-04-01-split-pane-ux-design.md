# Split Pane UX Improvements

**Date:** 2026-04-01
**Scope:** `CloneSplitPane`, `MappingSection`, and related components

## Summary

Three UX improvements to the clone split pane view to improve clarity, hierarchy visibility, and space management.

## Changes

### 1. Resizable Split Pane with Drag Handle and Collapsible Left Column

**Current state:** Fixed 45%/55% grid layout with no resize capability.

**New behavior:**
- A vertical drag handle between the two panes allows the user to resize the column widths by dragging left/right.
- The left pane header displays "Google Ads Source" with a "Hide" button. Clicking "Hide" collapses the left pane entirely.
- When collapsed, a narrow vertical tab labeled "Source" appears at the left edge. Clicking it restores the pane to its previous width.
- The drag handle is purely for resizing — it has no collapse behavior (no double-click).

**Left pane header styling:**
- Icon + "Google Ads Source" label on the left
- "Hide" button (subtle, `background: muted`, small chevron + text) on the right

**Collapsed state:**
- Left pane shrinks to ~36px wide vertical tab
- Vertical text reads "Source" with an expand chevron
- Right pane fills remaining width
- Drag handle is visually muted / inactive when collapsed

### 2. Collapsible Sections Within the Left Pane

**Current state:** Left pane uses static `Card` components — Campaign card, then one card per ad group. Not collapsible.

**New behavior:**
- Each section (Campaign, each Ad Group) gets a simple collapsible header: chevron icon + title text.
- Clicking the header toggles the section content.
- **All sections open by default.**
- No status badges on the left side — these are read-only source data sections, kept simple.
- Lightweight styling: subtle background on the header row, no card borders needed.

### 3. Color-Coded Level Tags on Right Pane Section Headers

**Current state:** Section titles include the level as a prefix: "Campaign", "Ad Set: {name}", "Creative: {headline}". No visual distinction between levels beyond text.

**New behavior:**

The level moves from the title text into a color-coded tag badge. Tag appears **before** the title. The title drops the level prefix.

**Tag placement (left to right):** `[chevron] [LEVEL TAG] [Section Title] ... [Status Badge]`

**Level tag colors (subtle tint style):**

| Level | Background | Text | Border |
|-------|-----------|------|--------|
| Campaign | `blue-500/12%` | `blue-400` | `blue-500/25%` |
| Ad Set | `violet-500/12%` | `violet-400` | `violet-500/25%` |
| Creative | `teal-500/12%` | `teal-400` | `teal-500/25%` |

**Tag styling:** Uppercase text, `10px` font size, `600` weight, `0.5px` letter spacing, full-round (`9999px`) border radius, `1px` border. Tinted background with colored text — not solid fills.

**Status badge styling (platform-wide):** The existing "Fully mapped" / "Needs input" / "Mapped" / "Action needed" badges should adopt the same subtle tint style:

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Fully mapped / Mapped | `green-500/12%` | `green-400` | `green-500/25%` |
| Needs input / Action needed | `amber-500/12%` | `amber-400` | `amber-500/25%` |

This tinted badge style becomes the **platform-wide standard** for all tags/badges in Liftometer.

**Section title changes:**

| Before | After |
|--------|-------|
| `Campaign` | `[CAMPAIGN] General Settings` (or the campaign name — use the draft's `name` field) |
| `Ad Set: Brand Terms` | `[AD SET] Brand Terms` |
| `Creative: Shop Summer Deals` | `[CREATIVE] Shop Summer Deals` |

**Spacing fix:** Field rows within an open section (e.g., Strategy, Topics, Locations) need increased vertical padding to prevent status badges from overlapping visually.

## Components Affected

| Component | Change |
|-----------|--------|
| `CloneSplitPane` | Replace CSS grid with resizable layout, add drag handle, add collapse state, add left pane header |
| `MappingSection` | Add `level` prop (`"campaign" \| "ad-set" \| "creative"`), render level tag before title, remove level prefix from title text, adopt tinted badge style for status |
| `MappingField` | Adopt tinted badge style for status badges, increase vertical padding between rows |
| New: left-pane collapsible section | Simple chevron + title header with toggle, no card wrapper |

## Data Model

No changes. The current `Campaign → AdSet[] → Creative[]` nesting correctly reflects both Google Ads (Ad Group → Ad) and OAI (Ad Set → Creative) hierarchies. Creatives are owned by a specific ad set, not shared across ad sets or campaigns.

Note: Google Ads has a separate "Assets" concept (reusable text/image fragments shareable across ad groups and campaigns), but these are distinct from composed Ads. Since Liftometer clones composed ads into composed creatives, the nested model is correct.

## Out of Scope

- Mobile responsiveness (desktop-only per project convention)
- Persisting the user's column width preference across sessions
- Changes to the data model or clone flow logic
