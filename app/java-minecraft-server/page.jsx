import { Edition, LiveServer } from "../live";

export const metadata = { title: "OG Java \u2014 ll4sch" };

export default function JavaPage() {
  return (
    <>
      <p className="kicker">First world</p>
      <h1>OG Java</h1>
      <Edition id="minecraft" />
      <div className="ip hero">og.ll4sch.com</div>
      <LiveServer ids={["minecraft", "bluemap"]} />
      <div className="map-wrap">
        <h2>Live map</h2>
        <iframe
          className="map"
          title="Original BlueMap"
          src="https://ogmap.ll4sch.com/"
          allowFullScreen
        />
      </div>
    </>
  );
}
