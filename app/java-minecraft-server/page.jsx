import { Edition, LiveServer } from "../live";
import { LogFeed } from "../logs";

export const metadata = { title: "OG \u2014 ll4sch" };

export default function JavaPage() {
  return (
    <>
      <p className="kicker">Current world</p>
      <h1>OG</h1>
      <Edition id="minecraft" />
      <div className="ip hero">mc.ll4sch.com</div>
      <LiveServer ids={["minecraft", "bluemap"]} />
      <LogFeed id="minecraft" title="OG console" />
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
