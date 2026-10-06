"use client";

import { useEffect, useState } from "react";

function dash(value) {
  if (value == null || value === "") return "\u2014";
  return String(value);
}

export function AiChat() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch("/api/ai/status", { cache: "no-store" });
        const json = await res.json();
        if (!stop) {
          setStatus(json);
          setError(res.ok ? "" : json.error || `status ${res.status}`);
        }
      } catch (err) {
        if (!stop) setError(err.message || "unreachable");
      }
    }
    tick();
    const id = setInterval(tick, 8000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const perf = status?.perf || {};
  const device = perf.device_path || status?.device_path || {};
  const model = perf.loaded_model || status?.default_model || status?.model || "\u2014";
  const onCpu = perf.on_cpu === true;

  async function send(event) {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || busy) return;
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: text, tools: true }),
      });
      const json = await res.json();
      const reply = !res.ok || json.ok === false
        ? `Error: ${json.error || res.status}`
        : json.response || "(empty)";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (json.perf) setStatus((prev) => ({ ...(prev || {}), ...json, perf: json.perf }));
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: `Request failed: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ai-panel">
      <div className="host">
        <span>{model}</span>
        <span className={`badge ${onCpu ? "down" : error ? "down" : "up"}`}>
          {error ? "offline" : onCpu ? "CPU" : device.active || "loading"}
        </span>
        <span>{device.label || "device unknown"}</span>
        <span>{perf.size_vram_mb ? `${perf.size_vram_mb} MB on device` : "memory \u2014"}</span>
        <span>{perf.tokens_per_sec != null ? `${perf.tokens_per_sec} tok/s` : "tok/s \u2014"}</span>
      </div>
      <p className="ai-note">
        {error
          ? `Status failed: ${error}`
          : `CPU inference ${onCpu ? "on" : "off"}. ${device.future || "3080 Ti later switches this to dolphin-llama3:8b."}`}
      </p>
      <div className="ai-log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="ai-empty">Ask about Paper status, logs, or ports. Start and stop only happen if you explicitly ask.</p>
        ) : null}
        {messages.map((msg, i) => (
          <p className={`ai-msg ${msg.role}`} key={`${msg.role}-${i}`}>{msg.text}</p>
        ))}
      </div>
      <form className="ai-form" onSubmit={send}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Are both Paper servers up?"
          aria-label="Ask the local model"
          disabled={busy}
        />
        <button type="submit" disabled={busy || !prompt.trim()}>{busy ? "Sending" : "Send"}</button>
      </form>
    </section>
  );
}
