export const metadata = { title: "Java Minecraft Server — ll4sch" };

export default function JavaPage() {
  return (
    <>
      <p className="kicker">Paper</p>
      <h1>Java Minecraft Server</h1>
      <p className="lead">
        Version 1.21.8, backwards compatible to 1.20. Contact CoMinder on Discord
        if you want to join.
      </p>
      <div className="card" style={{ marginTop: 24 }}>
        <h2>Address</h2>
        <div className="ip">mc.ll4sch.com</div>
      </div>
      <p style={{ marginTop: 20 }}>
        Live server map: <a href="https://map.ll4sch.com/">map.ll4sch.com</a>
      </p>
    </>
  );
}
