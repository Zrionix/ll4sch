import { LiveServer } from "../live";

export const metadata = { title: "Java Minecraft — ll4sch" };

export default function JavaPage() {
  return (
    <>
      <p className="kicker">Paper</p>
      <h1>Java Minecraft</h1>
      <p className="lead">
        Version 1.21.8, backwards compatible to 1.20. Ask Zrionix on Discord
        to join. Hostname mc.ll4sch.com points at the same machine.
      </p>
      <div className="ip hero">216.228.185.138:25565</div>
      <LiveServer ids={["minecraft", "bluemap"]} />
      <div className="map-wrap">
        <h2>Live map</h2>
        <iframe
          className="map"
          title="BlueMap"
          src="https://map.ll4sch.com/"
          allowFullScreen
        />
      </div>
    </>
  );
}
