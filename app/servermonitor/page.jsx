"use client";

import { useEffect, useState } from "react";

const STATUS_API =
  process.env.NEXT_PUBLIC_STATUS_API || "https://monitor.ll4sch.com/api/status";
const MAP_URL = process.env.NEXT_PUBLIC_MAP_URL || "https://map.ll4sch.com/";
const LAN_FALLBACK = "http://10.0.0.31:8787/api/status";

export default function MonitorPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stop = false;
    async function tick() {
      const urls = [STATUS_API, LAN_FALLBACK];
      let last = "unreachable";
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error(`status ${res.status}`);
          const json = await res.json();
          if (!stop) {
            setData(json);
            setError("");
          }
          return;
        } catch (err) {
          last = err.message || String(err);
        }
      }
      if (!stop) setError(last);
    }
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const services = data?.services || [];

  return (
    <>
      <p className="kicker">Dedicated box</p>
      <h1>Server monitor</h1>
      <p className="lead">
        Live checks from the game box when the status API is reachable. BlueMap
        is public at map.ll4sch.com either way.
      </p>
      {error && !data ? (
        <p className="badge down">Status API offline ({error}). Map still below.</p>
      ) : null}
      <section className="grid">
        {services.length
          ? services.map((svc) => (
              <article className="card" key={svc.id || svc.name}>
                <p className={`badge ${svc.online ? "up" : "down"}`}>
                  {svc.online ? "online" : "down"}
                </p>
                <h2>{svc.name}</h2>
                <p>{svc.kind}</p>
                {svc.port ? <div className="ip">{svc.host}:{svc.port}</div> : null}
                {svc.players_online != null ? (
                  <p style={{ marginTop: 8 }}>
                    Players {svc.players_online}
                    {svc.players_max != null ? ` / ${svc.players_max}` : ""}
                  </p>
                ) : null}
                {svc.motd ? <p style={{ marginTop: 8 }}>{svc.motd}</p> : null}
              </article>
            ))
          : ["PaperMC", "Valheim", "Discord Bot", "BlueMap"].map((name) => (
              <article className="card" key={name}>
                <p className="badge">waiting</p>
                <h2>{name}</h2>
                <p>No live poll yet</p>
              </article>
            ))}
      </section>
      <iframe className="map" title="BlueMap" src={MAP_URL} allowFullScreen />
    </>
  );
}
