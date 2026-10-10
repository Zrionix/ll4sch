import { Edition, LiveServer } from "../live";

export const metadata = { title: "New Java \u2014 ll4sch" };

export default function MinecraftPage() {
  return (
    <>
      <p className="kicker">New world</p>
      <h1>New Java</h1>
      <Edition id="minecraft-new" />
      <div className="ip hero">mc.ll4sch.com</div>
      <LiveServer ids={["minecraft-new", "bluemap-new"]} />
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
