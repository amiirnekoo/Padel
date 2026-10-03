import sys
import os
import time
import subprocess
import urllib.request
import json
import asyncio
import websockets

sys.stdout.reconfigure(encoding='utf-8')

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9222

print("Launching Chrome headless with CDP...")
proc = subprocess.Popen([
    CHROME_PATH,
    "--headless=new",
    f"--remote-debugging-port={PORT}",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1280,900"
])

try:
    time.sleep(2)
    # Check JSON version
    resp = urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=5)
    ver = json.loads(resp.read().decode())
    print("Chrome CDP Version:", ver.get("Browser"))
    ws_url = ver.get("webSocketDebuggerUrl")
    print("Browser WS URL:", ws_url)
finally:
    proc.terminate()
    proc.wait()
    print("Chrome stopped successfully.")
