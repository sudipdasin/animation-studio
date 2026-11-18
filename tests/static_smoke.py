#!/usr/bin/env python3
"""Offline static smoke checks; does not substitute for 3D browser tests."""
import pathlib, re, subprocess, sys, tempfile
root = pathlib.Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
for token in ('data-mode="model"', 'data-mode="sculpt"', 'data-mode="paint"', 'data-mode="animate"', 'data-mode="experimental"', 'data-shape="sphere"', 'data-brush="inflate"', 'id="undoSculpt"', 'id="paintFill"'):
    assert token in html, f"missing UI feature: {token}"
match = re.search(r'<script type="module">([\s\S]*?)</script>', html)
assert match, "3D module script missing"
with tempfile.TemporaryDirectory() as folder:
    module = pathlib.Path(folder) / 'app.mjs'
    module.write_text(match.group(1), encoding='utf-8')
    subprocess.run(['node', '--check', str(module)], check=True)
assert (root / 'LICENSE').read_text(encoding='utf-8').startswith('                    GNU GENERAL PUBLIC LICENSE')
print('Static checks passed; browser/WebGL/interactive behavior NOT verified.')

# Validate beta feedback UI and GitHub issue-draft integration.
for token in ('id="beta-feedback"', 'id="feedback-workspace"', 'id="feedback-description"', 'id="feedback-submit"', 'github.com/sudipdasin/animation-studio/issues/new?'):
    assert token in html, f"missing feedback UI element: {token}"
print('Feedback UI static checks passed; interaction NOT verified.')

# Smoothing must use cached adjacency rather than scan every face for each vertex.
assert 'function vertexNeighbors(geo)' in html
assert 'neighbors?.[i]' in html
assert 'for(let j=0;j<ix.length;j+=3)' not in html
print('Smoothing adjacency static regression passed; visual correctness NOT verified.')
