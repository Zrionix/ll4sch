"use client";

import { useEffect, useState } from "react";

const STATUS_API =
  process.env.NEXT_PUBLIC_STATUS_API || "https://monitor.ll4sch.com/api/status";

const PUBLIC = {
  minecraft: "216.228.185.138:25565",
  valheim: "216.228.185.138:2456",
  bluemap: "map.ll4sch.com",
};

function addressFor(svc) {
  if (PUBLIC[svc.id]) return PUBLIC[svc.id];
  const host = svc.host || "";
  const local = host === "127.0.0.1" || host === "localhost" || host.startsWith("10.");
  if (local || !svc.port) return null;
  return `${host}:${svc.port}`;
}

function formatUptime(seconds) {
  if (seconds == null) return null;
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h up`;
  return `${hours}h up`;
}

export default function MonitorPage() {
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

  const services = data?.services || [];
  const host = data?.host;

  return (
    <>
      <p className="kicker">Live</p>
      <h1>Server monitor</h1>
      <p className="lead">
        Public join addresses. The map for the Java world is on the Java page.
      </p>
      {host ? (
        <div className="host">
          <span>{host.hostname}</span>
          <span>CPU {Math.round(host.cpu_percent)}%</span>
          <span>
            RAM {host.ram_used_gb?.toFixed?.(1) ?? host.ram_used_gb} / {host.ram_total_gb} GB
          </span>
          <span>{formatUptime(host.uptime_seconds)}</span>
        </div>
      ) : null}
      {error && !data ? <p className="badge down">Status API offline ({error})</p> : null}
      <section className="grid">
        {(services.length
          ? services
          : [
              { id: "minecraft", name: "PaperMC", kind: "minecraft" },
              { id: "valheim", name: "Valheim", kind: "valheim" },
              { id: "discord", name: "Discord Bot", kind: "discord" },
              { id: "bluemap", name: "BlueMap", kind: "http" },
            ]
        ).map((svc) => {
          const address = addressFor(svc);
          return (
            <article className="card" key={svc.id || svc.name}>
              <div className="row">
                <h2>{svc.name}</h2>
                <p className={`badge ${svc.online == null ? "" : svc.online ? "up" : "down"}`}>
                  {svc.online == null ? "waiting" : svc.online ? "online" : "down"}
                </p>
              </div>
              <p>{svc.kind}</p>
              {address ? <div className="ip">{address}</div> : null}
              {svc.players_online != null ? (
                <p style={{ marginTop: 8 }}>
                  Players {svc.players_online}
                  {svc.players_max != null ? ` / ${svc.players_max}` : ""}
                </p>
              ) : null}
              {svc.motd ? <p style={{ marginTop: 8 }}>{svc.motd}</p> : null}
              {svc.server_name ? <p style={{ marginTop: 8 }}>{svc.server_name}</p> : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
