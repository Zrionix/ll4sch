import Link from "next/link";

const servers = [
  {
    href: "/java-minecraft-server",
    title: "Java Minecraft",
    copy: "Java Edition. Live map on this page.",
    ip: "mc.ll4sch.com",
  },
  {
    href: "/valheim",
    title: "Valheim",
    copy: "World Troglodies. Direct connect.",
    ip: "216.228.185.138:2456",
  },
  {
    href: "/ai",
    title: "Local AI",
    copy: "Token speed, context, and GPU.",
    ip: "On the server",
  },
];

export default function HomePage() {
  return (
    <>
      <p className="kicker">ll4sch</p>
      <h1>The server</h1>
      <p className="lead">
        Public addresses. Ask Zrionix on Discord before you connect.
      </p>
      <section className="directory">
        {servers.map((server) => (
          <Link className="entry" href={server.href} key={server.title}>
            <div>
              <h2>{server.title}</h2>
              <p>{server.copy}</p>
            </div>
            <div className="ip">{server.ip}</div>
          </Link>
        ))}
      </section>
    </>
  );
}
