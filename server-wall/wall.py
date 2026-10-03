"""Fullscreen ll4sch status wall for the SERVER desktop.

Shows Paper, Valheim, BlueMap, and the Discord bot plus CPU, RAM, disk, and GPU.
The log board has one main console and a separate console for each server.
Starts an Edge app window on the primary monitor and keeps it above other windows
until Escape, the pin button, or a manual focus change releases it.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import threading
import time
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8791
PID_PATH = ROOT / "wall.pid"
HTML = (ROOT / "wall.html").read_text(encoding="utf-8")
STATUS_URLS = [
    "http://127.0.0.1:8787/api/status",
    "http://127.0.0.1:8000/api/status",
    "http://127.0.0.1:8080/api/status",
    "https://monitor.ll4sch.com/api/status",
]
SKIP_DIRS = {
    "node_modules", ".git", "versions", "libraries", "cache", "caches",
    "edge-profile", "__pycache__", "windows", "program files", "program files (x86)",
    "$recycle.bin", "system volume information",
}
LOG_NAMES = {
    "latest.log", "debug.log", "server.log", "output_log.txt",
    "logoutput.log", "console.log",
}
SERVERS = (
    ("main", "Main"),
    ("minecraft-new", "Minecraft"),
    ("minecraft", "Original Java"),
    ("valheim", "Valheim"),
    ("discord", "Discord"),
    ("bluemap", "Original map"),
)

state_lock = threading.Lock()
state = {
    "pinned": True,
    "force_foreground": True,
    "status": None,
    "status_error": "",
    "status_url": "",
    "logs": [],
    "log_note": "",
    "disks": [],
    "gpu": None,
    "logs_at": 0.0,
}


def write_pid() -> None:
    PID_PATH.write_text(str(os.getpid()), encoding="ascii")


def fetch_status() -> None:
    last_error = "status unreachable"
    for url in STATUS_URLS:
        try:
            request = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 ll4sch-wall"},
            )
            with urllib.request.urlopen(request, timeout=2.5) as response:
                payload = json.loads(response.read().decode("utf-8", "replace"))
            with state_lock:
                state["status"] = payload
                state["status_error"] = ""
                state["status_url"] = url
            return
        except Exception as exc:
            last_error = str(exc)
    with state_lock:
        state["status_error"] = last_error


def disk_stats():
    found = []
    for letter in "CDEFG":
        mount = f"{letter}:\\"
        if not os.path.exists(mount):
            continue
        try:
            usage = shutil.disk_usage(mount)
        except OSError:
            continue
        found.append({
            "mount": f"{letter}:",
            "percent": round(usage.used * 100 / usage.total, 1) if usage.total else 0,
            "free_gb": round(usage.free / (1024 ** 3), 1),
            "total_gb": round(usage.total / (1024 ** 3), 1),
        })
    return found


def gpu_stats():
    candidates = [
        shutil.which("nvidia-smi"),
        r"C:\Windows\System32\nvidia-smi.exe",
        r"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe",
    ]
    exe = next((path for path in candidates if path and os.path.isfile(path)), None)
    if not exe:
        return None
    try:
        output = subprocess.check_output(
            [
                exe,
                "--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu",
                "--format=csv,noheader,nounits",
            ],
            timeout=4,
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return None
    line = output.strip().splitlines()
    if not line:
        return None
    parts = [part.strip() for part in line[0].split(",")]
    if len(parts) < 4:
        return None

    def num(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    return {
        "name": parts[0],
        "util_percent": num(parts[1]),
        "mem_used_mb": num(parts[2]),
        "mem_total_mb": num(parts[3]),
        "temp_c": num(parts[4]) if len(parts) > 4 else None,
    }


def tail(path: str, max_lines: int = 40, max_bytes: int = 64000) -> list[str]:
    with open(path, "rb") as handle:
        handle.seek(0, os.SEEK_END)
        size = handle.tell()
        handle.seek(max(0, size - max_bytes))
        data = handle.read().decode("utf-8", "replace")
    return data.splitlines()[-max_lines:]


def classify(path: str) -> str:
    low = path.lower()
    name = os.path.basename(low)
    new = "server 2" in low
    if "valheim" in low:
        return "valheim"
    if "discord" in low or "demetrius" in low:
        return "discord"
    if "bluemap" in low:
        return "bluemap-new" if new else "bluemap"
    if new:
        return "minecraft-new"
    if "paper" in low or "minecraft" in low or "papermc" in low or name == "latest.log":
        return "minecraft"
    return "main"


def rank(name: str) -> int:
    order = {
        "latest.log": 0,
        "server.log": 1,
        "console.log": 2,
        "output_log.txt": 3,
        "logoutput.log": 4,
        "debug.log": 8,
    }
    return order.get(name.lower(), 5)


PINNED_LOGS = {
    "minecraft": r"C:\Users\Admin\Desktop\PaperMC server\logs\latest.log",
    "minecraft-new": r"C:\Users\Admin\Desktop\PaperMC server 2\logs\latest.log",
    "valheim": r"C:\Users\Admin\Documents\ValheimServerLogs\troglodies.log",
    "bluemap": r"C:\Users\Admin\Desktop\PaperMC server\bluemap\logs\webserver.log",
    "bluemap-new": r"C:\Users\Admin\Desktop\PaperMC server 2\bluemap\logs\webserver.log",
}


def ignored_log(path: str) -> bool:
    low = path.lower().replace("/", "\\")
    if "\\old\\" in low:
        return True
    return False


def discover_logs() -> list[dict]:
    home = Path.home()
    roots = [Path(r"C:\Project"), home / "Desktop", home / "Documents"]
    found = []
    now = time.time()
    for root in roots:
        if not root.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            depth = len(Path(dirpath).relative_to(root).parts)
            if depth > 5:
                dirnames[:] = []
                continue
            dirnames[:] = [name for name in dirnames if name.lower() not in SKIP_DIRS]
            folder = dirpath.lower()
            for name in filenames:
                low = name.lower()
                interesting = low in LOG_NAMES or (
                    low.endswith(".log")
                    and any(token in folder for token in ("log", "valheim", "paper", "discord", "bluemap", "minecraft"))
                )
                if not interesting:
                    continue
                path = os.path.join(dirpath, name)
                if ignored_log(path):
                    continue
                try:
                    stat = os.stat(path)
                except OSError:
                    continue
                if stat.st_size <= 0 or stat.st_size > 80_000_000:
                    continue
                kind = classify(path)
                if kind == "main" and now - stat.st_mtime > 2 * 86400:
                    continue
                found.append((rank(name), -stat.st_mtime, path, kind))

    best = {}
    for item in found:
        kind = item[3]
        previous = best.get(kind)
        if previous is None or item[0] < previous[0] or (item[0] == previous[0] and item[1] < previous[1]):
            best[kind] = item

    for kind, path in PINNED_LOGS.items():
        if os.path.isfile(path):
            best[kind] = (0, 0, path, kind)

    picked = []
    for kind, title in SERVERS:
        item = best.get(kind)
        if not item:
            picked.append({"id": kind, "title": title, "source": "", "lines": []})
            continue
        path = item[2]
        try:
            lines = tail(path, 36 if kind == "main" else 48)
        except OSError:
            lines = []
        picked.append({"id": kind, "title": title, "source": path, "lines": lines})
    return picked


def sample_machine() -> None:
    while True:
        fetch_status()
        disks = disk_stats()
        gpu = gpu_stats()
        now = time.time()
        with state_lock:
            state["disks"] = disks
            state["gpu"] = gpu
            stale = now - state["logs_at"] > 15
        if stale:
            try:
                logs = discover_logs()
                note = ""
                if not any(log["lines"] for log in logs):
                    note = "No log files found under C:\\Project, Desktop, or Documents."
            except Exception as exc:
                logs = [
                    {"id": kind, "title": title, "source": "", "lines": []}
                    for kind, title in SERVERS
                ]
                note = str(exc)
            with state_lock:
                state["logs"] = logs
                state["log_note"] = note
                state["logs_at"] = now
        time.sleep(3)


def board_payload() -> dict:
    with state_lock:
        return {
            "pinned": state["pinned"],
            "status": state["status"],
            "status_error": state["status_error"],
            "status_url": state["status_url"],
            "disks": state["disks"],
            "gpu": state["gpu"],
            "logs": state["logs"],
            "log_note": state["log_note"],
        }


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:
        return

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path.startswith("/api/board"):
            body = json.dumps(board_payload()).encode("utf-8")
            self._send(200, body, "application/json")
            return
        self._send(200, HTML.encode("utf-8"), "text/html; charset=utf-8")

    def do_POST(self) -> None:
        if not self.path.startswith("/api/pin"):
            self._send(404, b"{}", "application/json")
            return
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            pinned = bool(json.loads(raw.decode("utf-8") or "{}").get("pinned"))
        except json.JSONDecodeError:
            pinned = False
        with state_lock:
            state["pinned"] = pinned
            state["force_foreground"] = pinned
        self._send(200, json.dumps({"pinned": pinned}).encode("utf-8"), "application/json")


def edge_path():
    candidates = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        shutil.which("msedge"),
    ]
    return next((path for path in candidates if path and os.path.isfile(path)), None)


def launch_edge() -> None:
    edge = edge_path()
    if not edge or os.name != "nt":
        return
    profile = ROOT / "edge-profile"
    profile.mkdir(exist_ok=True)
    subprocess.Popen(
        [
            edge,
            "--app=http://127.0.0.1:%d/" % PORT,
            "--user-data-dir=%s" % profile,
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-features=Translate",
            "--start-maximized",
            "--window-position=0,0",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def focus_loop() -> None:
    if os.name != "nt":
        return
    import ctypes

    user32 = ctypes.windll.user32
    HWND_TOPMOST = -1
    HWND_NOTOPMOST = -2
    SWP_SHOWWINDOW = 0x0040
    SWP_NOMOVE = 0x0002
    SWP_NOSIZE = 0x0001
    enum_proc = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)

    def find_hwnd():
        found = []

        def callback(hwnd, _lparam):
            length = user32.GetWindowTextLengthW(hwnd)
            if length <= 0:
                return True
            buffer = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buffer, length + 1)
            title = buffer.value.lower()
            if "ll4sch wall" in title or "127.0.0.1:%d" % PORT in title:
                found.append(hwnd)
            return True

        user32.EnumWindows(enum_proc(callback), 0)
        return found[0] if found else None

    launched = False
    held_foreground = False
    while True:
        try:
            hwnd = find_hwnd()
            with state_lock:
                pinned = state["pinned"]
                force = state["force_foreground"]
            if hwnd is None and not launched:
                launch_edge()
                launched = True
                time.sleep(1.2)
                continue
            if hwnd is None:
                time.sleep(0.8)
                continue
            width = user32.GetSystemMetrics(0)
            height = user32.GetSystemMetrics(1)
            foreground = user32.GetForegroundWindow()
            if pinned:
                user32.ShowWindow(hwnd, 3)
                user32.SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, width, height, SWP_SHOWWINDOW)
                if force or not held_foreground:
                    user32.keybd_event(0x12, 0, 0, 0)
                    user32.SetForegroundWindow(hwnd)
                    user32.keybd_event(0x12, 0, 2, 0)
                    if user32.GetForegroundWindow() == hwnd:
                        held_foreground = True
                        with state_lock:
                            state["force_foreground"] = False
                elif foreground not in (hwnd, 0) and held_foreground:
                    user32.SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)
                    with state_lock:
                        state["pinned"] = False
                    held_foreground = False
            else:
                user32.SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)
                held_foreground = False
        except Exception:
            pass
        time.sleep(0.4)


def main() -> None:
    write_pid()
    threading.Thread(target=sample_machine, daemon=True).start()
    threading.Thread(target=focus_loop, daemon=True).start()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("ll4sch wall on http://127.0.0.1:%d/" % PORT, flush=True)
    server.serve_forever()


if __name__ == "__main__":
    try:
        main()
    except OSError as exc:
        print("wall already running or port blocked: %s" % exc, file=sys.stderr)
        sys.exit(1)
