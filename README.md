# Animation Studio — v0.5.0 Beta 1

Open-source experimental 3D modeling, sculpting, painting and animation browser application, licensed under **GPL-3.0**.

## Download

See [Releases](https://github.com/sudipdasin/animation-studio/releases) for:
- `animation-studio-community_0.6.8_all.deb` — Debian/Ubuntu Linux installer.
- `animation-studio-web-v0.6.8-beta.1.zip` — standalone web preview, including bundled Three.js.

The standalone web preview runs with a simple localhost HTTP server and **does not require a Three.js CDN**. Extract the ZIP, then run `python3 -m http.server 8000` in its folder and open http://localhost:8000.

## Developer build

Requires Node.js 22+, npm, Python 3, and (for package creation) dpkg-deb.

```bash
npm install
python3 tests/static_smoke.py
npm run build:web
npx playwright install --with-deps chromium
npm run test:browser
bash scripts/build-deb.sh
```

GitHub Actions runs this build and Chromium WebGL tests on a fresh Ubuntu VM, and only publishes a release after tests pass.

## Beta features and limitations

Model primitives; mesh sculpting with Inflate/Deflate/Smooth/Flatten/Crease/Grab; separate vertex-color painting; keyframe animation; media preview; experimental editor; in-app GitHub feedback. Features remain experimental. VM tests exercise core geometry isolation, undo/redo, painting, and keyframes; they do not establish production readiness.

GitHub Pages deployment may require enabling **Settings → Pages → Source: GitHub Actions** in repository settings. The release's standalone web ZIP is available independently of Pages.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [FEEDBACK.md](FEEDBACK.md) for community participation.

## GitHub Pages configuration

The release artifacts work without GitHub Pages. To enable the optional site deployment, configure repository **Settings → Pages → Build and deployment → Source: GitHub Actions**, then add repository Actions variable `ENABLE_GITHUB_PAGES=true` under **Settings → Secrets and variables → Actions → Variables**. Until enabled, the Pages job is skipped so it does not falsely mark successful VM tests and releases as failed.

## Community / future Pro editions

**Animation Studio Community** remains public, free, and GPL-3.0. A future **Animation Studio Pro** may add independently developed commercial capabilities from a **separate private repository**; the private repository is maintained separately. Community code and contributions are not automatically relicensed as proprietary. See [architecture](docs/architecture-community-pro.md), [public/private policy](docs/community-pro-policy.md), and [private bootstrap guide](docs/private-repository-bootstrap.md). No Pro-only source or entitlement logic is included in Community builds.

## v0.5.0 Beta 1 release notes

- Responsive editor layout for narrower displays; accessible keyboard focus indicators and reduced-motion support.
- Version-correct beta feedback and updated offline cache lifecycle with old-cache cleanup.
- Community installer identity separated from future private Pro edition.
- Existing modeling, sculpting, painting, and animation regression checks retained. The beta is not a production-ready stable release.

## v0.5.1 Beta 1 release notes

- Validate project file structure and finite transforms before mutating the scene; invalid projects leave existing objects untouched.
- Reject unsupported formats, oversized project files and excessive object/keyframe counts.
- Add a browser regression for non-destructive failure handling.
- Maintain separate GPL Community and private Pro repositories; Community improvements are proposed to Pro through one-way private synchronization, subject to CI and review.

## v0.6.0 Beta 1 release notes

- Duplicate selected scene objects using the viewport button or Ctrl+D; cloned geometry and materials are independent.
- Save projects with Ctrl+S when focus is outside editable fields.
- Preserve validated project-import safeguards and regression coverage from v0.5.1.
- Beta release; continue reporting issues via the in-app GitHub feedback form.

## v0.6.1 Beta 1 release notes

- Explicit browser-local project recovery snapshots using Snapshot and Recover controls.
- Confirmation and validation before replacing the scene from recovery storage.
- Browser regression for snapshot persistence; retains project-import and object-duplication checks.
- Recovery is local to the browser profile and origin; use downloaded JSON files for portable backups.

## v0.6.2 Beta 1 release notes

- Validate recovery snapshot size and keyframe records before scene replacement.
- Test successful snapshot round-trip restoration and corrupted recovery handling in Chromium.
- Preserve v0.6.1 snapshot controls, object duplication and safe project imports.
- Beta release: further cross-distribution and manual QA required before stable certification.

## v0.6.3 Beta 1 release notes

- Preserve the preceding valid local recovery snapshot whenever a new snapshot is saved.
- Fall back to that previous snapshot when the latest saved recovery data is corrupt.
- Validate snapshot data before scene replacement and test fallback behavior in Chromium.
- Local recovery is not a substitute for portable JSON backups; beta validation is not stable certification.

## v0.6.4 Beta 1 release notes

- Automatically store a browser-local scene snapshot every 30 seconds and on page exit when possible.
- Keep automatic snapshots separate from user-created manual recovery snapshots.
- Fall back to an automatic snapshot if both manual recovery generations are missing or invalid.
- Browser regression coverage for autosave creation and manual snapshot preservation.
- Autosave is best effort, origin-local and cannot guarantee recovery after sudden power loss or storage clearing.

## v0.6.5 Beta 1 release notes

- Add browser regression tests for restoring the automatic snapshot when manual snapshots are absent.
- Confirm malformed automatic snapshots cannot destroy the active scene.
- Retain independent manual and automatic recovery, previous-snapshot fallback, and safe project import.
- Browser-local autosave remains best effort; use JSON downloads for portable backups.

## v0.6.6 Beta 1 release notes

- Verify that cancelling a recovery confirmation preserves the edited scene.
- Verify oversized browser recovery snapshots are rejected without clearing scene objects.
- Preserve prior recovery fallback and automatic local snapshots.
- Automated Ubuntu/Chromium verification is required before the release is published.

## v0.6.7 Beta 1 release notes

- Reject non-finite and oversized keyframe position, rotation and scale vectors before importing a project.
- Add Chromium tests confirming invalid keyframes and zero-scale objects do not replace the working scene.
- Retain local autosave, recovery fallback and existing editing regression coverage.
- Stable certification still requires broader Linux VM and integration testing.

## v0.6.8 Beta 1 release notes

- Fix an incompatibility between the animation editor's keyframe schema (t, p, r, s) and project-import validation.
- Validate animation keyframe vectors and scale before modifying the scene.
- Add a browser regression test for animated-scene snapshot save, edit and restore.
- Maintain automatic recovery, manual checkpoints and corrupt-data rejection.
