# Private Pro repository bootstrap (maintainer instructions)

Create a **private** repository named `animation-studio-pro`. This document contains no proprietary source and does not create the repository.

Recommended private layout:

```text
animation-studio-pro/
  README.md
  upstream/                  # checked-out/pinned Community source (ignored or submodule)
  pro/
    modules/                 # private proprietary implementations
    assets/                  # licensed premium assets
    services/                # private entitlement/billing services
    ui/                      # private Pro-only UI
  tests/
    integration/
    licensing/
    security/
  .github/workflows/         # PRIVATE CI only
  upstream-lock.json         # exact Community commit SHA and release tag
```

Use a read-only Git remote to `https://github.com/sudipdasin/animation-studio.git`. Pin and verify a public commit, run compatibility tests, and update only via a reviewed private PR. Do not mirror the private repo to the public one.

Pro product and licensing design require separate review before implementation/distribution.
