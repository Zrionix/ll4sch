import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <p className="kicker">Service hub</p>
      <h1>Welcome to ll4sch.com</h1>
      <p className="lead">
        ll4sch.com holds the public addresses for our hosted services — Minecraft,
        Valheim, KSP, and the rest of the box. This is the replacement for the
        old Google Site.
      </p>
      <section className="grid">
        <Link className="card" href="/java-minecraft-server">
          <h2>Java Minecraft</h2>
          <p>Paper world. Join at mc.ll4sch.com. Live map on the monitor page.</p>
          <div className="ip">mc.ll4sch.com</div>
        </Link>
        <Link className="card" href="/bettermc-java-minecraft-server">
          <h2>BetterMC</h2>
          <p>A new start in 2026. Ask CoMinder on Discord before joining.</p>
          <div className="ip">216.228.185.138:25564</div>
        </Link>
        <Link className="card" href="/servermonitor">
          <h2>Server monitor</h2>
          <p>Live status for Paper, Valheim, Discord bot, plus the BlueMap embed.</p>
          <div className="ip">/servermonitor</div>
        </Link>
      </section>
    </>
  );
}
