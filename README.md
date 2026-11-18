# Animation Studio — Public Beta v0.3.2

**Experimental open-source beta. Not a stable or fully validated production release.**

Animation Studio is a browser-based 3D modeling, sculpting, painting, animation and media-preview workspace. Source is licensed under **GNU GPL v3.0** (see [LICENSE](LICENSE)).

## Try it

- Browser preview, once GitHub Pages deployment succeeds: https://sudipdasin.github.io/animation-studio/
- Linux installer: see [GitHub Releases](https://github.com/sudipdasin/animation-studio/releases) or the GitHub Pages downloads directory after deployment.
- From source: run `python3 -m http.server 8000` in the repository root, then open `http://localhost:8000/`.

**Requirements:** A modern browser with WebGL; an internet connection for the Three.js module downloads from jsDelivr. The Debian launcher requires Python 3 and Chromium or Chrome.

## Workspaces

- **Model:** Gray cube, sphere, cylinder, cone, torus and plane primitives.
- **Sculpt:** Inflate, deflate, smooth, flatten, crease and grab brushes; symmetry; undo and redo.
- **Paint:** Separate vertex-color painting workspace.
- **Animate:** Keyframes, timeline and motion presets.
- **Edit:** Basic audio-waveform visualization and background image import.
- **AI:** Limited, offline command rules—not a remotely connected AI assistant.
- **Experimental:** Developer IDE preview (Luau, Python and Java). No code execution.

## Known limitations

The browser prototype's features have **not been fully end-to-end tested**. Sculpting and painting depend on geometry density. This is not a complete video editor, MP4 encoder, Roblox export tool, or compiler. The app loads Three.js from a CDN and will not initialize its 3D viewport without that connection. Do not rely on this beta for irreplaceable project data.

## Build and validate on Linux

```bash
python3 tests/static_smoke.py
bash scripts/build-deb.sh
sudo apt install ./dist/animation-studio-beta_0.3.2_all.deb
```

The installer starts an ephemeral localhost server and opens Chromium in app mode; it installs no background system service. Package is for Debian-derived Linux distributions and is not a native Windows/macOS installer.

## Feedback and contributions

[Report bugs](https://github.com/sudipdasin/animation-studio/issues/new/choose), [request features](https://github.com/sudipdasin/animation-studio/issues/new/choose), or propose improvements in a pull request. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and [FEEDBACK.md](FEEDBACK.md). Keep experimental functions clearly separated and preserve existing workspaces.

## Release

The `Publish beta` GitHub Actions workflow runs static checks, builds a Debian package, creates a **prerelease** tagged `v0.3.2-beta.1` if none exists, and attempts GitHub Pages deployment. Public hosting and release status must be verified in the Actions logs / Releases page; committing a workflow does not itself prove deployment succeeded.

## Beta 0.3.2 CI and deployment

Static validation and Debian package creation are automated. GitHub Pages deployment is currently blocked by repository Pages configuration; to enable it, set **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow no longer attempts to change repository settings automatically. No browser-level sculpting test has passed yet.

## v0.3.3 performance preview

Sculpt smoothing now constructs a mesh-local adjacency cache and averages each unique neighbor once, avoiding a full triangle-index scan for every brushed vertex. This is an algorithmic performance improvement; interactive speed and visual fidelity have not yet been benchmarked in a real browser.
