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
    "valheim": "208.100.174.95:2456",
    "bluemap": "map.ll4sch.com",
}
