# Validation / 验证记录

## Automated checks / 自动化检查

`npm test` covers 14 cases: submission cues, fast replies, unacknowledged submissions, disconnects, long thinking, restart behavior, four-edge docking, clipping geometry, thinking/tool/composing states, conversation selection, snapshot freshness, historical-cache exclusion and completed turns.

`npm run build` performs Vue / TypeScript checking and creates the production renderer.

`npm run test:ui` runs 16 interaction checks plus a native topmost-flag probe in an actual Windows Electron window, including half size, rendered states, random and explicit actions, skins, roaming, docking, dragging/release and tray menus. It requires a graphical Windows session. UI checks are local; CI runs the unit checks and build.

## Actual Grok integration / 实际联动

Tested on 2026-10-30 with Grok Bot 0.78.1. One authorized, non-operational test message requested only a short confirmation. The running installed pet was observed and captured directly:

| Time after submission | State | Actual rendered UI |
| --- | --- | --- |
| ~0.33 s | Thinking | Question marks visible, laptop absent |
| ~3.28 s | Working | Laptop visible, question marks absent |
| ~4.22 s | Idle | Laptop and question marks absent |

The expected reply was confirmed. Historical busy snapshots did not prevent returning to idle. After a restart, the pet remained idle and connected.

The repository includes only the pet screenshots, not test conversation records, user profiles, local paths or credentials. These timings describe that individual run, not a response-time guarantee. Future Grok UI changes may require adapting the reader.

## Visual checks / 画面检查

The laptop stays behind the pet's body, two circular hands tap the exposed keyboard without arms, and the lower edges are close to aligned. The laptop remains stationary during typing; both hands stop during the rest interval while the head looks up. Continuous frames were inspected, together with idle, thinking, work and docking screenshots.

### Current clean-checkout run / 本次干净目录检查

The build and all 14 unit checks passed. All 16 interaction checks passed. The native `isAlwaysOnTop()` probe returned false in the current automated desktop session, including immediately after `setAlwaysOnTop(true)`. This probe is reported as **SKIP / manual verification required**, rather than a pass. The production topmost configuration is retained unchanged; verify the pet against other windows in the target desktop session.

本次干净目录中，构建、14 项逻辑检查及 16 项交互检查通过。当前自动化桌面会话的原生置顶标志返回 false，因此该项单独标为待人工确认，没有计入通过项。生产程序的原有置顶设置未改动。
