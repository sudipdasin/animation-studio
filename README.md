# Animation Studio — v0.5.0 Beta 1

Open-source experimental 3D modeling, sculpting, painting and animation browser application, licensed under **GPL-3.0**.

## Download

See [Releases](https://github.com/sudipdasin/animation-studio/releases) for:
- `animation-studio-community_0.6.0_all.deb` — Debian/Ubuntu Linux installer.
- `animation-studio-web-v0.6.0-beta.1.zip` — standalone web preview, including bundled Three.js.

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
