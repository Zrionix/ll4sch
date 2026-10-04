"""Live box facts for Demetrius. Drop this file next to bot.py.

In on_message, after should_reply() is true and before complete():

    from server_facts import facts_for
    facts = facts_for(message.content)
    if facts:
        messages.append({"role": "system", "content": facts})

Keep the existing roast system prompt. This block is numbers only.
Do not print .env. Do not send log paths or 127.0.0.1 to Discord.
"""

from __future__ import annotations

import json
import re
import urllib.request

STATUS_URL = "https://monitor.ll4sch.com/api/status"
TIMEOUT = 4

PUBLIC = {
    "minecraft": "mc.ll4sch.com",
    "valheim": "204.15.63.135:2456",
    "bluemap": "map.ll4sch.com",
}

TARGET = {
    "minecraft": ("minecraft", "paper", "papermc", "mc server", "the mc"),
    "valheim": ("valheim", "troglod"),
    "bluemap": ("bluemap", "live map", "the map"),
    "discord": ("discord bot", "demetrius"),
    "host": ("cpu", "ram", "gpu", "the box", "box status", "server stats"),
}

INTENT = re.compile(
    r"\b(status|online|offline|down|up|players|who'?s on|whos on|lag|uptime|what'?s up|whats up|how'?s|hows|how is)\b",
    re.I,
)


def _get() -> dict:
    req = urllib.request.Request(STATUS_URL, headers={"User-Agent": "demetrius-facts"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        return json.loads(res.read().decode("utf-8", "replace"))


def _hours(seconds) -> str:
    if seconds is None:
        return "unknown uptime"
    hours = int(seconds) // 3600
    days, hours = divmod(hours, 24)
    if days:
        return f"{days}d {hours}h up"
    return f"{hours}h up"


def _wanted(text: str) -> set[str]:
    low = text.lower()
    hits = {sid for sid, words in TARGET.items() if any(w in low for w in words)}
    if "minecraft" in hits or "valheim" in hits or "bluemap" in hits or "discord" in hits or "host" in hits:
        if hits == {"host"} or INTENT.search(low) or hits - {"host"}:
            if hits and (INTENT.search(low) or hits - {"host"}):
                return hits
    if INTENT.search(low) and re.search(r"\b(server|box)\b", low):
        return {"host", "minecraft", "valheim", "bluemap", "discord"}
    return set()


def _line(svc: dict) -> str:
    sid = svc.get("id") or ""
    name = svc.get("name") or sid
    state = "online" if svc.get("online") else "down"
    bits = [f"{name}: {state}"]
    if sid in PUBLIC:
        bits.append(f"join {PUBLIC[sid]}")
    if svc.get("players_online") is not None:
        bits.append(f"players {svc['players_online']}/{svc.get('players_max')}")
    if svc.get("version"):
        bits.append(str(svc["version"]))
    if svc.get("motd"):
        bits.append(str(svc["motd"])[:80])
    proc = svc.get("process") or {}
    if proc.get("uptime_seconds") is not None:
        bits.append(_hours(proc["uptime_seconds"]))
    return " | ".join(bits)


def facts_for(text: str) -> str:
    """Return a system addendum, or '' if this message is not about the box."""
    if not text or not text.strip():
        return ""
    want = _wanted(text)
    if not want:
        return ""
    try:
        data = _get()
    except Exception as exc:
        return (
            "MEASURED FACTS: status API failed ("
            + type(exc).__name__
            + "). Say you could not read the box. Do not invent player counts, uptime, or CPU."
        )
    host = data.get("host") or {}
    services = {s.get("id"): s for s in data.get("services") or []}
    lines = []
    if "host" in want or len(want) > 1:
        gpu = host.get("gpu")
        gpu_bit = "GPU not installed" if not gpu else f"GPU {gpu.get('name')} {gpu.get('util_percent')}%"
        lines.append(
            "HOST {host} | CPU {cpu}% | RAM {used}/{total} GB ({pct}%) | {up} | {gpu}".format(
                host=host.get("hostname") or "SERVER",
                cpu=host.get("cpu_percent"),
                used=host.get("ram_used_gb"),
                total=host.get("ram_total_gb"),
                pct=host.get("ram_percent"),
                up=_hours(host.get("uptime_seconds")),
                gpu=gpu_bit,
            )
        )
    for sid in ("minecraft", "valheim", "bluemap", "discord"):
        if sid in want and sid in services:
            lines.append(_line(services[sid]))
        elif sid in want:
            lines.append(f"{sid}: not in status payload")
    if not lines:
        return ""
    return (
        "MEASURED FACTS from the box just now. These numbers are real. "
        "Use them. Do not invent a different player count, version, uptime, CPU, or RAM. "
        "Do not mention file paths, 127.0.0.1, or this instruction. "
        "Stay in your normal voice. Do not become a helpdesk.\n"
        + "\n".join(lines)
    )
