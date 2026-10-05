"use client";

import { Fragment, useEffect, useState } from "react";

const STATUS_API =
  process.env.NEXT_PUBLIC_STATUS_API || "https://monitor.ll4sch.com/api/status";

const PUBLIC = {
  minecraft: "og.ll4sch.com",
  "minecraft-new": "mc.ll4sch.com",
  valheim: "208.100.174.95:2456",
  bluemap: "ogmap.ll4sch.com",
  "bluemap-new": "map.ll4sch.com",
};

const NAMES = {
  minecraft: "OG Java",
  "minecraft-new": "New Java",
  valheim: "Valheim",
  discord: "Discord Bot",
  bluemap: "OG map",
  "bluemap-new": "New map",
};

const ORDER = ["minecraft-new", "minecraft", "valheim", "bluemap-new", "bluemap", "discord"];

function addressFor(svc) {
  if (PUBLIC[svc.id]) return PUBLIC[svc.id];
  const host = svc.host || "";
  const local = host === "127.0.0.1" || host === "localhost" || host.startsWith("10.");
  if (local || !svc.port) return null;
  return `${host}:${svc.port}`;
}

function sortServices(services) {
  return [...services].sort((a, b) => {
    const ai = ORDER.indexOf(a.id);
    const bi = ORDER.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function formatUptime(seconds) {
  if (seconds == null) return null;
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h up`;
  return `${hours}h up`;
}

function clamp(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function dash(value, digits) {
  if (value == null || value === "") return "\u2014";
  const n = Number(value);
  if (!Number.isFinite(n)) return "\u2014";
  return digits == null ? String(Math.round(n)) : n.toFixed(digits);
}

export function useStatus() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch(STATUS_API, { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const json = await res.json();
        if (!stop) {
          setData(json);
          setError("");
        }
      } catch (err) {
        if (!stop) setError(err.message || "unreachable");
      }
    }
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  return { data, error };
}

export function Usage({ host }) {
  const gpu = host?.gpu;
  const cpu = host?.cpu_percent;
  const ram = host?.ram_percent;

  return (
    <section className="meters">
      <article className="meter">
        <span>CPU</span>
        <strong>{cpu == null ? "\u2014" : `${Math.round(cpu)}%`}</strong>
        <small>server</small>
        <div className="bar"><i style={{ width: `${clamp(cpu)}%` }} /></div>
      </article>
      <article className="meter">
        <span>RAM</span>
        <strong>{ram == null ? "\u2014" : `${Math.round(ram)}%`}</strong>
        <small>
          {host
            ? `${host.ram_used_gb?.toFixed?.(1) ?? host.ram_used_gb} / ${host.ram_total_gb} GB`
            : "server"}
        </small>
        <div className="bar"><i style={{ width: `${clamp(ram)}%` }} /></div>
      </article>
      <article className="meter">
        <span>GPU</span>
        <strong>{gpu?.util_percent == null ? "\u2014" : `${Math.round(gpu.util_percent)}%`}</strong>
        <small>
          {gpu
            ? `${gpu.name}${gpu.temp_c != null ? ` \u00b7 ${Math.round(gpu.temp_c)}\u00b0` : ""}${gpu.mem_used_mb != null ? ` \u00b7 ${gpu.mem_used_mb}/${gpu.mem_total_mb} MB` : ""}`
            : "No GPU"}
        </small>
        {gpu ? (
          <div className="bar"><i style={{ width: `${clamp(gpu.util_percent)}%` }} /></div>
        ) : null}
      </article>
    </section>
  );
}

export function ServiceCards({ services }) {
  return sortServices(services).map((svc) => {
    const address = addressFor(svc);
    return (
      <article className="card" key={svc.id || svc.name}>
        <div className="row">
          <h2>{NAMES[svc.id] || svc.name || svc.id}</h2>
          <p className={`badge ${svc.online == null ? "" : svc.online ? "up" : "down"}`}>
            {svc.online == null ? "\u2014" : svc.online ? "online" : "down"}
          </p>
        </div>
        {address ? <div className="ip">{address}</div> : null}
        {svc.players_online != null ? (
          <p style={{ marginTop: 8 }}>
            Players {svc.players_online}
            {svc.players_max != null ? ` / ${svc.players_max}` : ""}
          </p>
        ) : null}
        {svc.motd ? <p style={{ marginTop: 8 }}>{svc.motd}</p> : null}
        {svc.server_name && svc.server_name !== svc.motd ? (
          <p style={{ marginTop: 8 }}>{svc.server_name}</p>
        ) : null}
      </article>
    );
  });
}

function formatCpu(cpu) {
  const n = Number(cpu);
  if (!Number.isFinite(n)) return "\u2014";
  if (n > 100) return `${(n / 100).toFixed(1)} cores`;
  return `${Math.round(n)}%`;
}
function formatRam(mb) {
  const n = Number(mb);
  if (!Number.isFinite(n)) return "\u2014";
  if (n >= 1024) return `${(n / 1024).toFixed(1)} GB`;
  if (n >= 10) return `${Math.round(n)} MB`;
  return `${n.toFixed(1)} MB`;
}

function processRows(services) {
  const seen = new Set();
  const rows = [];
  for (const svc of services) {
    const proc = svc.process || {};
    if (proc.pid != null && seen.has(proc.pid)) continue;
    if (proc.pid != null) seen.add(proc.pid);
    rows.push({
      id: svc.id || svc.name,
      name: NAMES[svc.id] || svc.name || svc.id,
      cpu: proc.cpu_percent,
      ram: proc.rss_mb ?? proc.memory_mb,
      exe: proc.name || "",
    });
  }
  return rows;
}

export function ProcessUsage({ services }) {
  const rows = processRows(services);
  const single = rows.length === 1;
  return (
    <section className="meters">
      {rows.map((row) => (
        <Fragment key={row.id}>
          <article className="meter">
            <span>{single ? "CPU" : `${row.name} CPU`}</span>
            <strong>{formatCpu(row.cpu)}</strong>
            <small>{row.exe || "process"}</small>
            {row.cpu == null || row.cpu === "" || Number(row.cpu) > 100 ? null : (
              <div className="bar"><i style={{ width: `${clamp(row.cpu)}%` }} /></div>
            )}
          </article>
          <article className="meter">
            <span>{single ? "RAM" : `${row.name} RAM`}</span>
            <strong>{formatRam(row.ram)}</strong>
            <small>process</small>
          </article>
        </Fragment>
      ))}
    </section>
  );
}

export function LiveServer({ ids }) {
  const { data, error } = useStatus();
  const found = (data?.services || []).filter((svc) => ids.includes(svc.id));
  const services = found.length ? found : ids.map((id) => ({ id, name: NAMES[id] || id }));

  return (
    <>
      {error && !data ? <p className="badge down">Status API offline ({error})</p> : null}
      <ProcessUsage services={services} />
      <section className="grid">
        <ServiceCards services={services} />
      </section>
    </>
  );
}

export function LiveBoard() {
  const { data, error } = useStatus();
  const host = data?.host;
  const services = data?.services?.length
    ? data.services
    : ["minecraft-new", "minecraft", "valheim", "bluemap-new", "bluemap", "discord"].map((id) => ({ id, name: NAMES[id] }));

  return (
    <>
      {host ? (
        <div className="host">
          <span>{host.hostname}</span>
          <span>{formatUptime(host.uptime_seconds)}</span>
        </div>
      ) : null}
      {error && !data ? <p className="badge down">Status API offline ({error})</p> : null}
      <Usage host={host} />
      <section className="grid">
        <ServiceCards services={services} />
      </section>
    </>
  );
}

function Meter({ label, value, note, pct, lead }) {
  return (
    <article className={lead ? "meter lead-stat" : "meter"}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
      {pct == null ? null : (
        <div className="bar"><i style={{ width: `${clamp(pct)}%` }} /></div>
      )}
    </article>
  );
}

export function AiBoard() {
  const { data, error } = useStatus();
  const ai = data?.ai || {};
  const gpu = data?.host?.gpu || ai.gpu || null;
  const online = ai.online === true;
  const down = ai.online === false;
  const model = ai.model || ai.model_name || null;
  const vramPct = gpu?.mem_total_mb ? (Number(gpu.mem_used_mb) / Number(gpu.mem_total_mb)) * 100 : null;
  const contextPct = ai.context_max ? (Number(ai.context_used) / Number(ai.context_max)) * 100 : null;
  let state = "No GPU";
  let stateClass = "";
  if (error && !data) {
    state = "Status API offline";
    stateClass = "down";
  } else if (online) {
    state = "online";
    stateClass = "up";
  } else if (down) {
    state = "model down";
    stateClass = "down";
  } else if (gpu) {
    state = "No model";
  }

  return (
    <>
      <div className="host">
        <span>{data?.host?.hostname || "SERVER"}</span>
        <span className={`badge ${stateClass}`}>{state}</span>
        {model ? <span>{model}</span> : <span>No model</span>}
        {ai.backend ? <span>{ai.backend}</span> : null}
        {ai.uptime_seconds != null ? <span>{formatUptime(ai.uptime_seconds)}</span> : null}
      </div>
      <section className="meters">
        <Meter lead label="Decode" value={dash(ai.tokens_per_sec, 1)} note="tokens / sec" />
        <Meter label="Prefill" value={dash(ai.prefill_tokens_per_sec)} note="prompt tokens / sec" />
        <Meter label="First token" value={dash(ai.ttft_ms)} note="milliseconds" />
        <Meter
          label="Context"
          value={ai.context_max ? `${ai.context_used ?? "\u2014"} / ${ai.context_max}` : "\u2014"}
          note="tokens in the window"
          pct={contextPct}
        />
        <Meter label="Queue" value={dash(ai.queue)} note={ai.active != null ? `${ai.active} running` : "requests"} />
        <Meter label="Last reply" value={dash(ai.last_latency_ms)} note="milliseconds" />
        <Meter
          label="GPU"
          value={gpu?.util_percent == null ? "\u2014" : `${Math.round(gpu.util_percent)}%`}
          note={gpu?.name || "No GPU"}
          pct={gpu?.util_percent}
        />
        <Meter
          label="VRAM"
          value={gpu?.mem_total_mb ? `${(Number(gpu.mem_used_mb || 0) / 1024).toFixed(1)} / ${(Number(gpu.mem_total_mb) / 1024).toFixed(1)} GB` : "\u2014"}
          note={gpu ? "on the card" : "No GPU"}
          pct={vramPct}
        />
        <Meter label="GPU temp" value={gpu?.temp_c == null ? "\u2014" : `${Math.round(gpu.temp_c)}\u00b0`} note="card" />
        <Meter
          label="Power"
          value={gpu?.power_w == null ? "\u2014" : `${Math.round(gpu.power_w)} W`}
          note={gpu?.power_limit_w ? `of ${Math.round(gpu.power_limit_w)} W` : "draw"}
        />
      </section>
    </>
  );
}

const DROPS = [
  ["26.3", "Wilderness Bound"],
  ["26.2", "Chaos Cubed"],
  ["26.1", "Tiny Takeover"],
];

export function Edition({ id }) {
  const { data } = useStatus();
  const svc = (data?.services || []).find((item) => item.id === id);
  const version = svc?.version || "";
  const drop = DROPS.find(([key]) => version.includes(key));
  const parts = [];
  if (drop) parts.push(drop[1]);
  if (version) parts.push(version);
  const detail = parts.length ? `${parts.join(". ")} on the server.` : "Java Edition on the server.";
  return <p className="lead">{detail} Ask Zrionix on Discord to join.</p>;
}
