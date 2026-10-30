# bot Desktop Pet 🐾

[简体中文](README.md) · [Download for Windows](https://github.com/XiangquanRuan/bot-desktop-pet/releases/latest)

A white, round desktop companion for Windows. Click it to play, drag it around, hide half of it at a screen edge, or connect it to the active Grok Bot conversation. Grok is optional: the pet also works on its own.

![Actual question-mark, laptop and idle states](docs/preview.png)

## Features

- **Grok activity sync:** question marks while waiting or thinking, laptop work while running tools or composing a reply, and idle when the turn ends.
- **Two ball-shaped hands:** an angled laptop with two small spheres tapping the keyboard, without arms. The pet occasionally pauses and looks up. The laptop stays behind its face and body.
- **Interaction:** random actions on idle clicks; a stretched, tilted, surprised pose while dragging.
- **Half-hidden edge docking:** drag to any edge of the display work area and release. Drag inward to restore. Automatic roaming pauses while docked.
- **Tray customization:** 8 shapes, 11 colors, 8 resting expressions, size controls, specific actions and optional idle hopping.
- **Connection indicator:** a green tray badge means connected; gray means disconnected. Hover for status details.
- Default window size: **132 × 140 Windows logical pixels**. No text label below the pet. Appearance and position persist locally.

The application menus are currently in Chinese; this repository provides both Chinese and English documentation.

## Download and run

1. Download `bot-desktop-pet-windows-x64.zip` from [Releases](https://github.com/XiangquanRuan/bot-desktop-pet/releases/latest).
2. **Extract the entire archive.** The executable needs the files beside it.
3. Run `bot.exe` directly, or run `Install.cmd` to install it and create a desktop shortcut.

Administrator access is not required. Exit an existing instance from its tray menu before updating. The application is not code-signed. If your system disallows installation scripts, run the extracted `bot.exe` directly.

| Action | Result |
| --- | --- |
| Click the pet | Random action while idle |
| Hold and drag | Move the pet with its picked-up effect |
| Release near an edge | Half-hide at that edge |
| Right-click the pet or tray | Actions, appearance and settings |
| 恢复完整显示 | Restore the full pet |
| 找回桌宠位置 | Bring it back to the primary display |
| 动作预览 → 电脑工作 | Preview laptop work without sending a message |

Installation does not enable automatic startup at login.

## Connect Grok Bot

Tested with **Grok Bot 0.78.1 on Windows x64**. The integration depends on that version's rendered window structure and may need updates for newer Grok versions. It is not an official Grok API or plugin.

When an existing `Grok Bot.lnk` is found on the desktop, the installer appends:

```text
--remote-debugging-address=127.0.0.1 --remote-debugging-port=19222
```

Exit Grok and reopen it from that shortcut once. The pet's “打开 Grok Bot” menu can also launch Grok from `%LOCALAPPDATA%\Programs\Grok Bot\Grok Bot.exe`.

For another installation location, append the arguments to your Grok shortcut manually. An already-running instance without those arguments must be exited and reopened; a computer restart is unnecessary.

### Status handling and local data

- Reads activity over a local Chromium debugging connection every 250 ms. No API key is required.
- Follows the currently selected conversation, ignores historical UI caches, and recognizes finished turns and requests for user confirmation.
- Keeps the initial question-mark cue visible for about 0.9 seconds so a quick reply cannot skip it entirely. Unacknowledged submissions expire after 12 seconds. Disconnection returns the pet to idle.
- Does not patch Grok's executable, upload conversations, or bundle login credentials. It observes composer submission events and reads activity objects already present in the window. Its diagnostic file stores only status metadata such as state, counts and time.
- Enabling Chromium debugging allows other local processes to access that runtime. Keep the endpoint on `127.0.0.1`; do not expose or forward the port. To disable sync, remove the shortcut arguments and restart Grok. Standalone pet interactions continue working.

## Run from source

Install Node.js **22.12+** and npm, then run these commands at the repository root:

```powershell
npm ci
npm run build
npm test
npm start
```

Electron is downloaded during dependency installation. If your network requires an Electron mirror, set `ELECTRON_MIRROR` in your terminal before retrying `npm ci`. No proxy configuration or credentials are included.

### Build a Windows package

On Windows:

```powershell
npm run package
```

The ZIP is written to `release/bot-desktop-pet-windows-x64.zip`. Build output, dependencies and binaries are excluded from Git and distributed through GitHub Releases.

### Validation

```powershell
npm test        # 14 activity, turn-completion and display-edge checks
npm run build   # TypeScript / Vue checks and Vite build
npm run test:ui # Actual Windows window checks; build first
```

UI checks briefly display a test pet using an isolated profile. Reports and screenshots go to `test-artifacts/ui/`, without overwriting everyday settings. See [docs/VALIDATION.md](docs/VALIDATION.md). CI runs automated checks and the build. Maintainers can push a `v*` version tag or run the “Publish Windows release” workflow manually to publish a download.

## Structure

```text
electron/       Native window, tray, Grok reader, activity controller and checks
src/            Vue / SVG animation and interaction
assets/         Application, desktop shortcut and tray icons
scripts/        Packaging, installation and UI-check entry points
docs/           Screenshots, validation and release notes
```

## Local files and removal

- Installation: `%LOCALAPPDATA%\Programs\bot`
- Settings, position and diagnostics: `%APPDATA%\bot-desktop-pet`
- To remove: exit the pet from its tray menu, delete the installation folder and desktop `bot.lnk`. Delete the settings folder separately if desired. Remove Grok's debugging arguments and restart Grok if you no longer want the integration.

## License and credits

MIT licensed. The animation core derives from Jérémy Perret's [bloub](https://github.com/jeremy-prt/bloub), including a supplied white-body, black-eye adaptation. Original copyright and terms are retained in [LICENSE.bloub](LICENSE.bloub); see [THIRD_PARTY.md](THIRD_PARTY.md). This project is not affiliated with Grok or xAI.
