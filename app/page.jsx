import Link from "next/link";

const servers = [
  {
    href: "/java-minecraft-server",
    title: "Java Minecraft",
    copy: "Paper 1.21.8, playable back to 1.20. Live map is on this page.",
    ip: "216.228.185.138:25565",
  },
  {
    href: "/bettermc-java-minecraft-server",
    title: "BetterMC",
    copy: "2026 world. Ask Zrionix on Discord for a whitelist slot.",
    ip: "216.228.185.138:25564",
  },
  {
    href: "/servermonitor",
    title: "Valheim",
    copy: "Troglodies. Status for the box lives on the monitor.",
    ip: "216.228.185.138:2456",
  },
];

export default function HomePage() {
  return (
    <>
      <p className="kicker">ll4sch.com</p>
      <h1>Game servers, public addresses.</h1>
      <p className="lead">
        Join addresses for the box. The monitor shows who is actually up.
        Ask Zrionix on Discord before you connect.
      </p>
      <section className="grid">
        {servers.map((server) => (
          <Link className="card" href={server.href} key={server.title}>
            <h2>{server.title}</h2>
            <p>{server.copy}</p>
            <div className="ip">{server.ip}</div>
          </Link>
        ))}
      </section>
    </>
  );
}
