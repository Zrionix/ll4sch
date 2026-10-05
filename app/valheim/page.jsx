import { LiveServer } from "../live";
import { LogFeed } from "../logs";

export const metadata = { title: "Valheim \u2014 ll4sch" };

export default function ValheimPage() {
  return (
    <>
      <p className="kicker">Dedicated</p>
      <h1>Valheim</h1>
      <p className="lead">
        World Troglodies. Direct connect on the address below. Ask Zrionix
        on Discord before you join.
      </p>
      <div className="ip hero">208.100.174.90:2456</div>
      <LiveServer ids={["valheim"]} />
      <LogFeed id="valheim" title="Valheim console" />
    </>
  );
}
