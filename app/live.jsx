"use client";

import { useEffect, useState } from "react";

const STATUS_API =
  process.env.NEXT_PUBLIC_STATUS_API || "https://monitor.ll4sch.com/api/status";

const PUBLIC = {
  minecraft: "216.228.185.138:25565",
  valheim: "216.228.185.138:2456",
  bluemap: "map.ll4sch.com",
};

const NAMES = {
  minecraft: "PaperMC",
  valheim: "Valheim",
  discord: "Discord Bot",
  bluemap: "BlueMap",
};

const ORDER = ["minecraft", "valheim", "bluemap", "discord"];

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
        <div className="bar"><i style={{ width: `${clamp(cpu)}%` }} /></div>
      </article>
      <article className="meter">
        <span>RAM</span>
        <strong>{ram == null ? "\u2014" : `${Math.round(ram)}%`}</strong>
        <small>
          {host
            ? `${host.ram_used_gb?.toFixed?.(1) ?? host.ram_used_gb} / ${host.ram_total_gb} GB`
            : "waiting"}
        </small>
        <div className="bar"><i style={{ width: `${clamp(ram)}%` }} /></div>
      </article>
      <article className="meter">
        <span>GPU</span>
        <strong>{gpu?.util_percent == null ? "\u2014" : `${Math.round(gpu.util_percent)}%`}</strong>
        <small>
          {gpu
            ? `${gpu.name}${gpu.temp_c != null ? ` \u00b7 ${Math.round(gpu.temp_c)}\u00b0` : ""}${gpu.mem_used_mb != null ? ` \u00b7 ${gpu.mem_used_mb}/${gpu.mem_total_mb} MB` : ""}`
            : "Not installed"}
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
          <h2>{svc.name || NAMES[svc.id] || svc.id}</h2>
          <p className={`badge ${svc.online == null ? "" : svc.online ? "up" : "down"}`}>
            {svc.online == null ? "waiting" : svc.online ? "online" : "down"}
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

export function LiveServer({ ids }) {
  const { data, error } = useStatus();
  const found = (data?.services || []).filter((svc) => ids.includes(svc.id));
  const services = found.length ? found : ids.map((id) => ({ id, name: NAMES[id] || id }));

  return (
    <>
      {error && !data ? <p className="badge down">Status API offline ({error})</p> : null}
      <Usage host={data?.host} />
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
    : ["minecraft", "valheim", "bluemap", "discord"].map((id) => ({ id, name: NAMES[id] }));

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
