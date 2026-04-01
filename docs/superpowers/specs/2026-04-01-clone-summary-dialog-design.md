# Clone Summary Dialog

Replace the toast-only feedback after a successful auto-clone with a verification dialog that shows the user what was mapped before they confirm.

## Problem

When all fields auto-map cleanly, the clone flow shows only a toast ("Campaign X cloned successfully") and redirects to the dashboard. Users clone campaigns multiple times a day and need to verify the mapping result before committing — a toast doesn't give them that opportunity.

## Solution

A centered dialog overlay that appears after mapping completes, showing a read-only summary of the draft. The user reviews it and either confirms, edits, or cancels.

## Dialog Layout

**Container:** shadcn `Dialog` with backdrop blur (`bg-black/60 backdrop-blur-sm`). Centered, max-width ~820px.

**Header:**
- Title: "Clone: {campaign.name}"
- Stats: "{X} mapped" (green check icon) + "{Y} need input" (amber alert icon, if > 0)

**Body — two-column split:**

| Left Pane (Google Ads Source) | Right Pane (OpenAI Ad Settings) |
|---|---|
| ~280px fixed width, collapsible via "Hide" button (eye-off icon) | Flex-1, fills remaining width |
| Pane header: grid icon + "Google Ads Source" + Hide button | Pane header: globe icon + "OpenAI Ad Settings" |
| Read-only collapsible sections using `SourceSection` component style | Read-only collapsible sections using `MappingSection` component style (without edit controls) |
| Campaign (blue badge) + Ad Groups (purple badge) | Campaign (blue badge) + Ad Sets (purple badge) |
| All sections collapsed by default | Campaign section expanded, ad sets collapsed |
| Each section shows label/value pairs in compact mono text | Same label/value format |
| Both panes scroll independently via `ScrollArea` | |

When the left pane is hidden, the right pane fills the full width. A collapsed tab (similar to the manual editor's collapse behavior) allows re-expanding.

**Footer — three pill-shaped buttons with Lucide icons:**
- Left side: `Cancel` (X icon) — closes dialog, returns to campaigns list
- Right side grouped: `Edit Draft` (pencil icon, outline variant) — navigates to the full split-pane manual editor with the draft pre-loaded; `Create Draft` (plus icon, default/primary variant) — submits the draft to the API

## Component: `CloneSummaryDialog`

**Props:**
- `open: boolean` — dialog visibility
- `onOpenChange: (open: boolean) => void` — close handler
- `campaign: GadsCampaign` — source campaign data
- `adGroups: GadsAdGroup[]` — source ad groups
- `adsByAdGroup: Record<string, GadsAd[]>` — source ads keyed by ad group
- `draft: OAICampaignDraft` — the mapped draft to preview
- `onConfirm: () => void` — called when "Create Draft" is clicked
- `onEdit: () => void` — called when "Edit Draft" is clicked (navigates to manual editor)

**Behavior:**
- Reuses `SourceSection` for left pane sections (already exists)
- Creates a new read-only variant of `MappingSection` (or a simpler `DraftSection` component) for the right pane — no input fields, just label/value display
- Left pane collapse state is local to the dialog
- Section expand/collapse states are local to the dialog

## Integration Points

### CloneConfirmDialog changes

The existing `CloneConfirmDialog` currently:
1. Runs mapping
2. If `actionNeeded === 0`: calls `/api/oai/clone` directly, shows toast, redirects
3. If `actionNeeded > 0`: calls `onFallback(campaignId)` to open manual editor

**New flow for step 2:** Instead of calling the API and showing a toast, open `CloneSummaryDialog` with the mapped draft. The user then confirms (which calls the API) or edits (which navigates to manual editor).

### Clone page (manual editor) changes

When navigating from "Edit Draft" in the summary dialog, the manual editor should receive the pre-mapped draft so it doesn't need to re-fetch and re-map.

## Button Style Standard (Platform-Wide)

All buttons across Liftometer must:
1. Include a Lucide icon alongside the text label
2. Use pill shape (`rounded-full` on shadcn `Button`)

This applies to this dialog and should be applied incrementally to existing buttons as they are touched.

## Design Decisions

- **Dialog over full page:** Users do this multiple times a day — a dialog is lighter weight, stays in context, and can be dismissed quickly.
- **Two-column layout:** Mirrors the manual editor's mental model so users can compare source vs. mapped values. Left pane is collapsible so it doesn't crowd the view when not needed.
- **Read-only by default:** The happy path is verify-and-confirm. Editing is one click away but not the default action.
- **Sections collapsed by default (left), campaign expanded (right):** The right pane is the primary focus — the user is verifying what will be created. Campaign-level settings are expanded since they're the most important. Source data is reference-only.
