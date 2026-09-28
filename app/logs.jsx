"use client";

import { useEffect, useRef } from "react";
import "./console.css";
import { useStatus } from "./live";

function asLines(value) {
  if (Array.isArray(value)) return value.map((line) => String(line));
  if (typeof value === "string" && value.trim()) return value.split(/\r?\n/);
  return [];
}

function pickLogs(data, id) {
  const service = (data?.services || []).find((item) => item.id === id);
  const fromService = asLines(service?.log_lines || service?.logs || service?.log);
  if (fromService.length) {
    return { source: service.log_source || service.log_path || "", lines: fromService };
  }
  const blocks = Array.isArray(data?.logs) ? data.logs : [];
  const block = blocks.find((item) => item && (item.id === id || item.service === id));
  if (block) return { source: block.source || "", lines: asLines(block.lines || block.text) };
  return { source: "", lines: [] };
}

export function LogFeed({ id, title }) {
  const { data, error } = useStatus();
  const scroller = useRef(null);
  const { source, lines } = pickLogs(data, id);
  const text = lines.slice(-120).join("\n");

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <section className="console" ref={scroller}>
      <div className="row">
        <h2>{title}</h2>
        <p className="badge">{lines.length ? `${Math.min(lines.length, 120)} lines` : "\u2014"}</p>
      </div>
      {source ? <p className="console-path">{source}</p> : null}
      <pre>
        {text ||
          (error && !data
            ? "Status feed is offline."
            : "No lines.")}
      </pre>
    </section>
  );
}
