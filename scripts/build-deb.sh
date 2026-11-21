#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/dist}"
mkdir -p "$OUT"
if [ ! -f "$ROOT/web-dist/app.bundle.js" ]; then
  (cd "$ROOT" && npm run build:web)
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/DEBIAN" "$TMP/opt/animation-studio" "$TMP/usr/bin" "$TMP/usr/share/applications" "$TMP/usr/share/doc/animation-studio-community"
cp "$ROOT"/web-dist/{index.html,app.bundle.js,manifest.webmanifest,sw.js,icon.svg} "$TMP/opt/animation-studio/"
cp "$ROOT"/{README.md,CONTRIBUTING.md,FEEDBACK.md,LICENSE} "$TMP/opt/animation-studio/"
cp "$ROOT/LICENSE" "$TMP/usr/share/doc/animation-studio-community/copyright"
cat > "$TMP/DEBIAN/control" <<'CTRL'
Package: animation-studio-community
Version: 2.0.0
Section: graphics
Priority: optional
Architecture: all
Depends: python3, chromium | google-chrome-stable
Maintainer: Animation Studio Contributors <noreply@example.invalid>
Description: Experimental 3D modeling, sculpting and animation browser app
CTRL
cat > "$TMP/usr/bin/animation-studio-community" <<'LAUNCH'
#!/usr/bin/env python3
import http.server
import subprocess
import threading
from functools import partial
from pathlib import Path
from shutil import which
root = Path('/opt/animation-studio')
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(http.server.SimpleHTTPRequestHandler, directory=str(root)))
url = f'http://127.0.0.1:{server.server_port}/index.html'
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    for browser in ('chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome'):
        if which(browser):
            subprocess.run([browser, '--app=' + url], check=False)
            break
finally:
    server.shutdown()
LAUNCH
chmod 755 "$TMP/usr/bin/animation-studio-community"
cat > "$TMP/usr/share/applications/animation-studio-community.desktop" <<'DESKTOP'
[Desktop Entry]
Type=Application
Name=Animation Studio Community
Comment=3D modeling and animation preview
Exec=animation-studio-community
Icon=/opt/animation-studio/icon.svg
Terminal=false
Categories=Graphics;3DGraphics;
DESKTOP
chmod 644 "$TMP/usr/share/applications/animation-studio-community.desktop"
dpkg-deb --build --root-owner-group "$TMP" "$OUT/animation-studio-community_2.0.0_all.deb"
