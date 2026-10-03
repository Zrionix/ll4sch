import { Edition, LiveServer } from "../live";
import { LogFeed } from "../logs";

export const metadata = { title: "Three Peaks \u2014 ll4sch" };

export default function MinecraftPage() {
  return (
    <>
      <p className="kicker">New world</p>
      <h1>Three Peaks</h1>
      <Edition id="minecraft-new" />
      <div className="ip hero">mc.ll4sch.com</div>
      <LiveServer ids={["minecraft-new", "bluemap-new"]} />
      <LogFeed id="minecraft-new" title="Three Peaks console" />
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
