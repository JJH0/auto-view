# History

## Description
- Record each Git change or local file change summary.
- Each entry includes reason, impact scope, and related links (put links in Notes when applicable).
- If owner is not specified, default to `<project-name>-agent-1`.
- Use datetime format `YYYY-MM-DD HH:MM` (24h).

## Mandatory Action
- MUST: When this table reaches 50 entries, compress the records into shorter and more general summaries, keeping stable and reusable change points.

## Record Template
| Date Time | Type | Summary | Reason | Impact Scope | Owner Id | Notes |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 2026-03-19 11:36 | local file change | Added Firefox WebExtension scaffold with manifest, content script entry, and icon asset. | Complete task 01 base structure for auto-scroll add-on. | Firefox temporary add-on loading and future content-script development. | 01KM223SC9Y1Y290JTVN6X15TW | Created `manifest.json`, `content/content.js`, `icons/icon.svg`. |
| 2026-03-19 11:39 | local file change | Implemented floating control, hover speed options, and auto-scroll behavior in content script. | Complete remaining interactive features for the Firefox auto-scroll add-on. | In-page UI, scrolling behavior, and stop conditions for all matched pages. | 01KM223SC9Y1Y290JTVN6X15TW | Updated `content/content.js`; apply_patch tool failed so shell write was used as fallback. |
| 2026-03-19 11:56 | local file change | Added draggable floating control with idle auto-collapse, edge snapping, and restore interactions. | Complete tasks 05 and 06 for enhanced floating control behavior. | Floating control positioning, drag interaction, idle animation, and existing scroll controls. | 01KM223SC9Y1Y290JTVN6X15TW | Updated `content/content.js`; verified syntax and presence of drag/collapse handlers. |
| 2026-03-19 12:03 | local file change | Reverted drag and auto-collapse behavior from floating control. | User requested rollback of tasks 05 and 06 changes. | Restored content script to pre-task-05/06 behavior while preserving auto-scroll features. | 01KM223SC9Y1Y290JTVN6X15TW | Replaced `content/content.js` with the earlier non-draggable, non-collapsing version. |
|  |  |  |  |  |  |  |
