# Community / Pro separation — security and licensing policy

## Public repository rules

Never commit proprietary source, proprietary models/assets, private build artifacts, credentials, license signing keys, payment tokens, customer data, or private repository access tokens. Do not include them in GitHub Actions outputs, public releases, or issue reports.

The public release must remain fully usable without a Pro account or Pro backend. Do not add feature locks or time limits to the GPL community edition.

## Contribution rights

Community contributions are GPL-3.0. Do **not** assume that accepting a GPL pull request grants permission to relicense it into a proprietary combined application. Any dual-licensing strategy requires clear copyright ownership or appropriate contributor agreements and dependency review, implemented prospectively and transparently.

## Private repository policy

Restrict access to maintainers with a need to know; require MFA, protected branches, least-privilege CI tokens, secret scanning, and approval for releases. Private CI should only pull public upstream, never push a private branch or artifact to the public repository.

## Disclosure and remediation

If a secret or private code enters public history, removing a file in a later commit is insufficient. Revoke exposed credentials immediately, assess repository forks/caches, and follow an incident remediation process. Avoid force-pushing public history without coordinated review.
