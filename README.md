\# AquaJarvis Vision



\*\*AquaJarvis Vision — Local Desktop Vision and Automation Tool\*\*  

Created and adapted by \*\*Waya Steurbaut\*\*. A privacy‑first, local, free Windows Electron app that combines screen vision, desktop automation, and voice control into a Jarvis‑like assistant optimized for NVIDIA users while remaining compatible with all systems.



---



\## Quick overview



\*\*Purpose\*\*  

Turn an existing modified repository into a clean, local Electron desktop app that: detects system specs, runs local AI models (Ollama), accepts free offline voice input, learns locally, auto‑generates small automation tools, and optionally controls mouse and keyboard only with explicit user consent.



\*\*Key principles\*\*

\- \*\*Local first\*\*: models, learning data, and generated tools are stored and executed locally by default.  

\- \*\*Privacy by design\*\*: nothing is sent online unless the user explicitly opts in.  

\- \*\*User control\*\*: every automation, input permission, and generated tool requires explicit approval.  

\- \*\*Free and open\*\*: open‑source repo, free to run, and easy to build into a Windows installer.



---



\## Repo handling and setup tasks (do this first)



\*\*Goal\*\* Keep the current folder and Git history, remove all project files except `.git`, then initialize the new Electron app in the same folder.



\*\*Task list\*\*



1\. \*\*Save current modifications to your GitHub account\*\*

&nbsp;  - Fork or duplicate the current modified repo into your GitHub account.

&nbsp;  - Push all local changes and verify the remote is fully synced.



2\. \*\*Prepare the working folder (same folder method)\*\*

&nbsp;  - Stay in the current folder (do not create a new folder).

&nbsp;  - \*\*Delete all files and folders except the `.git` directory\*\*.

&nbsp;    - Keep `.git` intact to preserve full commit history.

&nbsp;    - Remove build artifacts, node\_modules, source files, assets, and any other project folders.

&nbsp;  - Confirm the working tree is clean except for `.git`.



3\. \*\*Reinitialize project structure for AquaJarvis Vision\*\*

&nbsp;  - Create a new project scaffold for an Electron app in the same folder.

&nbsp;  - Add new source folders (e.g., `src/`, `app/`, `tools/`, `mcp\_local/`, `assets/`, `build/`).

&nbsp;  - Add a new `package.json`, Electron main process, renderer scaffolding, and build scripts.

&nbsp;  - Commit the new structure to the existing Git history.



4\. \*\*Rename and update remote repository\*\*

&nbsp;  - Rename the GitHub repo to `AquaJarvis-Vision` (or create a new repo and update `origin`).

&nbsp;  - Update remote origin if necessary:

&nbsp;    ```bash

&nbsp;    git remote set-url origin git@github.com:YOUR\_USERNAME/AquaJarvis-Vision.git

&nbsp;    git push -u origin main

&nbsp;    ```



5\. \*\*Use modified repo logic\*\*

&nbsp;  - Reuse useful scripts, configuration, and logic from the previous repo where applicable.

&nbsp;  - Ensure any reused code is adapted to the new Electron architecture and local‑first model handling.



---



\## Project structure suggestion



```

AquaJarvis-Vision/

├─ .git/

├─ package.json

├─ README.md

├─ src/

│  ├─ main.js

│  ├─ preload.js

│  └─ renderer/

│     ├─ index.html

│     ├─ styles/

│     └─ components/

├─ tools/

│  └─ generated/

├─ mcp\_local/

├─ assets/

│  ├─ icons/

│  └─ animations/

├─ build/

│  └─ electron-builder-config.json

├─ docs/

│  └─ onboarding.md

└─ scripts/

&nbsp;  ├─ setup-ollama.sh

&nbsp;  └─ build-windows.sh

```



---



\## Core features



\### System detection and optimization

\- Auto detect \*\*CPU, RAM, GPU, VRAM, OS version, and storage\*\*.  

\- Provide \*\*minimum\*\* and \*\*recommended\*\* requirement checks.  

\- \*\*NVIDIA optimization\*\*: detect CUDA availability and recommend CUDA‑enabled models when appropriate.  

\- Warn about models that exceed available VRAM or CPU limits.



\### Local AI and model handling

\- One‑click \*\*Ollama\*\* install and configuration script with verification steps.  

\- Detect installed local models and recommend which are safe to run on the current hardware.  

\- Default to \*\*local models\*\*; allow optional MCPs only when the user explicitly enables them.  

\- Provide a model manager UI to install, remove, and inspect local models.



\### Desktop automation

\- Optional mouse and keyboard control \*\*only after explicit permission\*\*.  

\- Create, run, pause, stop, and edit automation workflows.  

\- Support automation for desktop apps, games, Blender, and other GUI tools using vision + input.  

\- Real‑time activity log with timestamps, actions, and results.



\### Vision integration

\- Screen analysis to locate UI elements and contextual regions.  

\- Vision‑based triggers and selectors for robust automation.  

\- Visual debugging overlay for development and permissioned use.



\### Free voice input

\- Integrate offline or open STT engines such as \*\*Vosk\*\*, \*\*Coqui STT\*\*, or \*\*Whisper.cpp\*\*.  

\- Provide \*\*push‑to‑talk\*\* and optional \*\*always‑listening\*\* (off by default).  

\- Support wake phrase, command parsing, confirmation prompts, and real‑time UI feedback.  

\- Include voice command examples in onboarding.



\### Local learning and personalization

\- Local Learning Engine stores patterns in an \*\*encrypted local file\*\*.  

\- Suggest automations based on repeated tasks and user behavior.  

\- Improve voice recognition for the user’s vocabulary over time.  

\- Allow users to view, export, or delete local learning data.



\### Local tool and MCP generation

\- Auto‑generate small scripts or modules for repeated tasks (stored in `/tools` or `/mcp\_local`).  

\- Require user approval and optional editing before activation.  

\- UI to enable/disable, edit, delete, and view logs for generated tools.  

\- Keep all generated tools local by default.



---



\## Voice Vision Automation example



\*\*User command\*\*  

> “Jarvis, open Photoshop, crop the top 20%, and save it as a new file.”



\*\*Agent flow\*\*

1\. Parse voice command and show parsed intent in UI.  

2\. Use vision to locate Photoshop window and relevant UI elements.  

3\. Execute the automation steps (open file, crop, save) using mouse/keyboard input if permitted.  

4\. Log each step with timestamps and results.  

5\. Ask for confirmation if any step is ambiguous.



---



\## UI and brand guidelines



\*\*Name\*\*: `AquaJarvis Vision`  

\*\*Primary aesthetic\*\*: clean, modern, tech‑friendly, trustable.



\*\*Layout\*\*

\- \*\*Sidebar navigation\*\* (Workflows, Models, Tools, Logs, Settings, About)  

\- \*\*Main workspace\*\* for building and running automations  

\- \*\*Live log panel\*\* visible by default or dockable



\*\*Animated loading screen\*\*

\- Aquamarine animated gradient with subtle motion and the app name.



\*\*Font\*\*

\- Use a modern geometric sans‑serif with bold and readable weights (avoid system default fonts). Examples to consider: \*\*Inter\*\*, \*\*Poppins\*\*, \*\*Montserrat\*\*.



\*\*Color schemes (user selectable)\*\*

\- \*\*Aquamarine\*\* (primary)  

\- \*\*Gold + black\*\*  

\- \*\*Silver + techy dark blue\*\*  

\- \*\*Bronze + black\*\*  

\- \*\*Brown + green paper/karton vibe\*\*  

\- \*\*White + red + dark purple\*\*



\*\*Icons and accessibility\*\*

\- Use clear icons for permissions and actions.  

\- High contrast mode and adjustable font sizes.



---



\## Onboarding and tutorial



\*\*First launch interactive tutorial\*\*

1\. Welcome screen and short explanation of AquaJarvis Vision.  

2\. Permissions walkthrough (screen access, mouse/keyboard control, file access, voice).  

3\. Ollama setup and model selection.  

4\. Create a simple automation example step‑by‑step.  

5\. Show how to view logs, stop tasks, and change settings.  

6\. Explain Local Learning and generated tools.  

7\. Provide voice command examples and a practice area.



\*\*Help\*\*

\- Re‑launchable tutorial from \*\*Help / Tutorial\*\*.  

\- Contextual tooltips and a searchable help index.



---



\## Build and distribution



\*\*Development\*\*

\- Provide `scripts/setup-dev.sh` to install dependencies and prepare the environment.  

\- Provide `scripts/setup-ollama.sh` to install and configure Ollama locally.



\*\*Build\*\*

\- Use Electron + electron-builder or equivalent to produce a Windows installer (.exe).  

\- Include build scripts:

&nbsp; ```bash

&nbsp; # install deps

&nbsp; npm install



&nbsp; # dev

&nbsp; npm run dev



&nbsp; # build windows installer

&nbsp; npm run build:win

&nbsp; ```

\- Document signing and installer options in `docs/build.md`.



\*\*Distribution\*\*

\- Publish source on GitHub.  

\- Provide prebuilt Windows installer in Releases.  

\- Include clear instructions for offline installation and model setup.



---



\## README content to include in repo root



Add a top section with badges and the Creator \& Community Links block.



\*\*Badges example\*\*

```md

\[!\[YouTube](https://img.shields.io/badge/YouTube-WayaCreate-red)](https://www.youtube.com/@wayasteurbaut)

\[!\[TikTok](https://img.shields.io/badge/TikTok-WayaCreateYTR-black)](https://www.tiktok.com/@wayacreateytr)

\[!\[Website](https://img.shields.io/badge/Website-WayaHub-blue)](https://wayashub.framer.ai/)

\[!\[Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2)](https://discord.com/invite/u7GA3MEa7X)

```



\*\*Creator and community links\*\*

```md

\### Creator \& Community Links



\- \*\*YouTube – WayaCreate\*\*  

&nbsp; https://www.youtube.com/@wayasteurbaut



\- \*\*TikTok – WayaCreateYTR\*\*  

&nbsp; https://www.tiktok.com/@wayacreateytr



\- \*\*Website – WayaHub\*\*  

&nbsp; https://wayashub.framer.ai/



\- \*\*Blog – WayaHub Blogspot\*\*  

&nbsp; https://wayashub.blogspot.com



\- \*\*Discord – WayaCreate Community\*\*  

&nbsp; https://discord.com/invite/u7GA3MEa7X



\- \*\*Fiverr Reference\*\*  

&nbsp; https://www.fiverr.com/mustafamasoodm/record-and-create-a-minecraft-server-trailer-for-you

```



---



\## Settings and permissions



\*\*Permissions center\*\*

\- Centralized settings page for:

&nbsp; - \*\*Mouse and keyboard control\*\* (grant/revoke)  

&nbsp; - \*\*Screen capture\*\* (grant/revoke)  

&nbsp; - \*\*Voice input\*\* (enable/disable, engine selection)  

&nbsp; - \*\*Local learning\*\* (enable/disable, clear data)  

&nbsp; - \*\*Generated tools\*\* (approve by default or require manual approval)



\*\*Safety\*\*

\- Always show a clear consent dialog before enabling any input control.  

\- Provide an emergency stop button that immediately halts all automation and input.  

\- Log all permission grants and revocations.



---



\## Generated tools management



\*\*Storage\*\*

\- Generated tools saved under `/tools/generated` or `/mcp\_local`.



\*\*UI\*\*

\- List of generated tools with metadata (name, created date, triggers, last run).  

\- Buttons to \*\*Edit\*\*, \*\*Enable/Disable\*\*, \*\*Run\*\*, \*\*Delete\*\*, and \*\*View Logs\*\*.  

\- Preview and manual approval step before first activation.



---



\## Development notes and best practices



\- Keep model inference local and provide clear guidance on VRAM and CPU requirements.  

\- Use sandboxed execution for generated scripts to limit unintended system changes.  

\- Encrypt local learning data and provide a one‑click clear option.  

\- Provide unit and integration tests for automation flows and vision components.  

\- Document third‑party dependencies and licenses.



---



\## Contributing



\*\*How to contribute\*\*

\- Fork the repo, create a feature branch, and open a pull request.  

\- Include tests and documentation for new features.  

\- Respect privacy and security guidelines when adding features that access system resources.



\*\*Code of conduct\*\*

\- Maintain respectful collaboration and clear, constructive feedback.



---



\## License



Add an open‑source license of your choice (MIT recommended for permissive use). Include a `LICENSE` file in the repo root.



---



\## Attribution and About



\*\*AquaJarvis Vision – Local Desktop Vision \& Automation Tool\*\*  

\*\*Created and adapted by Waya Steurbaut\*\* — transforming the original repo into a local desktop application.



\*\*About screen content\*\*

\- App name and short description.  

\- Version and build info.  

\- Creator \& Community Links (clickable, open in system browser).  

\- Short privacy statement: local by default; data is not sent online unless explicitly enabled.



---



\## Next steps I will follow for you



1\. Ensure the current modified repo is pushed to your GitHub account.  

2\. In the same folder, remove all files except `.git`.  

3\. Scaffold the Electron app structure and add the features described above.  

4\. Add onboarding, voice, local learning, and generated tools UI.  

5\. Add build scripts and produce a Windows installer.  

6\. Populate README.md with the content above, badges, and social links.  

7\. Commit and push changes to `AquaJarvis-Vision` repo.



---



\## Contact and links



\- \*\*YouTube – WayaCreate\*\*  

&nbsp; https://www.youtube.com/@wayasteurbaut



\- \*\*TikTok – WayaCreateYTR\*\*  

&nbsp; https://www.tiktok.com/@wayacreateytr



\- \*\*Website – WayaHub\*\*  

&nbsp; https://wayashub.framer.ai/



\- \*\*Blog – WayaHub Blogspot\*\*  

&nbsp; https://wayashub.blogspot.com



\- \*\*Discord – WayaCreate Community\*\*  

&nbsp; https://discord.com/invite/u7GA3MEa7X



\- \*\*Fiverr Reference\*\*  

&nbsp; https://www.fiverr.com/mustafamasoodm/record-and-create-a-minecraft-server-trailer-for-you



---



\*\*End of README content\*\*



"# aquajarvis-vision" 
