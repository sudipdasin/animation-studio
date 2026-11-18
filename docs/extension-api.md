# Community extension API — design contract v0

The community edition may expose an optional, capability-limited extension interface. This is a **design contract**, not an implemented runtime API.

- Manifest: `id`, `name`, `version`, `apiVersion`, `permissions`, `entrypoint`.
- Capabilities: read scene summary, propose reversible scene operations, register tool panels, and receive selection/timeline events.
- Permission gating: extensions must request explicit capabilities; default deny for filesystem, network, and external services.
- Operations: validate inputs, track undo/redo, support cancellation and resource limits.
- Compatibility: semantic versioning and conformance tests, no direct mutation of private renderer state.
- Security: isolate untrusted code; do not eval arbitrary extension code in the app origin.
- Licensing: publishing an API does not itself determine whether a proprietary extension may be distributed with GPL-covered software. Legal review is required.

Do not load any Pro source, remote plugin URL, credentials, or billing code in the Community app.
