#!/usr/bin/env python3
"""Public-release boundary guard; conservative heuristic, not a complete secret scanner."""
from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[1]
blocked_dirs={'.env','pro-private','proprietary','private-assets','billing-secrets','license-keys'}
blocked_files={'id_rsa','id_ed25519','credentials.json','service-account.json','.npmrc'}
errors=[]
for p in root.rglob('*'):
    if not p.is_file(): continue
    rel=p.relative_to(root)
    if any(part in blocked_dirs for part in rel.parts) or p.name in blocked_files:
        errors.append(f'Forbidden public path: {rel}')
    if any(part in {'node_modules','.git','web-dist','dist'} for part in rel.parts): continue
    if p.suffix.lower() not in {'.md','.py','.js','.mjs','.json','.yml','.yaml','.html','.sh','.txt','.svg'}: continue
    if p.stat().st_size>1_000_000: continue
    data=p.read_text('utf-8',errors='replace')
    for pattern in [r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'ghp_[A-Za-z0-9]{30,}',r'github_pat_[A-Za-z0-9_]{30,}',r'sk_live_[A-Za-z0-9]{12,}']:
        if re.search(pattern,data):
            errors.append(f'Potential credential in {rel}')
if errors:
    print('\n'.join(errors),file=sys.stderr)
    raise SystemExit(1)
print('Public boundary heuristic passed (not a substitute for full secret scanning).')
