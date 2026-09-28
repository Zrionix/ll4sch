import { LiveServer } from "../live";
import { LogFeed } from "../logs";

export const metadata = { title: "Java Minecraft \u2014 ll4sch" };

export default function JavaPage() {
  return (
    <>
      <p className="kicker">Paper</p>
      <h1>Java Minecraft</h1>
      <p className="lead">
        Version 1.21.8, backwards compatible to 1.20. Ask Zrionix on Discord
        to join.
      </p>
      <div className="ip hero">mc.ll4sch.com</div>
      <LiveServer ids={["minecraft", "bluemap"]} />
      <LogFeed id="minecraft" title="Paper console" />
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
