# Animation Studio — Community / Pro architecture

## Repository boundaries

| Component | Community (public) | Pro (private) |
|---|---|---|
| Core editor, scene model, renderer, sculpt, paint, timeline | GPL-3.0 source | Imported as an unmodified or tracked upstream dependency |
| Community tests, documentation, build scripts | GPL-3.0 source | Consumed from upstream |
| Pro-only algorithms, assets, workflows, premium UI | Not present | Separate proprietary repository |
| Licensing, subscriptions, entitlements, payment credentials | No secrets or billing code | Private services and configuration |
| Community feedback and contributions | Public issues/PRs | Reviewed upstream contributions |
| Pro releases | Never built or uploaded by public CI | Private CI with restricted artifacts |

## Repositories

- **Public:** `sudipdasin/animation-studio` — authoritative upstream for the community foundation.
- **Private (planned):** `sudipdasin/animation-studio-pro` — independent repository, **not yet provisioned**. Its contents must not be committed to public Git history.
- The private repo should track the public repo using a read-only `upstream` Git remote, pin exact public commit SHAs, and regularly merge/rebase upstream changes after validation. Never use a bidirectional blind mirror: that risks publishing proprietary commits.

## Integration strategy

1. Community app defines a narrow, versioned extension contract (see `docs/extension-api.md`).
2. Community releases contain no private code, proprietary assets, license keys, or entitlement checks.
3. Pro source lives only in the private repo and is assembled in private CI, with separate artifact storage.
4. Avoid copying public GPL source into private files merely to hide modifications. Changes to the GPL-covered foundation remain subject to its license when distributed.
5. Review whether the intended integration creates a combined derivative work before commercial distribution. A plugin boundary is **not automatically a legal separation** under GPL.
6. If proprietary combined distribution is desired, obtain appropriate rights/dual licenses from all relevant contributors and dependencies, or use legally independent components/services with counsel-reviewed boundaries.
7. Do not call Pro features secure just because client-side code is minified; proprietary server algorithms and keys should remain server-side.

## Sync policy

**One-way public → private.** On each public release, the private CI should fetch the tagged Community source, verify the exact commit SHA, run compatibility tests, and update the pinned upstream reference in a private pull request. Private changes never sync back automatically. Explicitly reviewed GPL-compatible improvements may be submitted upstream as ordinary PRs.

## Release channels

- Community: public GPL source, public installers, issue tracker, reproducible tests.
- Pro: private build infrastructure, distinct package/app identity, separate licensing and support, staged commercial rollout.

## Candidate Pro differentiators (research proposals, not implemented)

- Non-destructive procedural animation graphs with reusable motion templates
- Advanced retargeting and rigging diagnostics
- GPU/CPU adaptive sculpting and topology-aware detail preservation
- AI-assisted shot blocking, pose consistency, and batch render orchestration
- Professional asset/version comparison, collaboration and review workflows

Each must undergo novelty and user-value validation. No claim of exclusivity or uniqueness is established.
