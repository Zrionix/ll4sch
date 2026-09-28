import { LiveServer } from "../live";

export const metadata = { title: "Valheim — ll4sch" };

export default function ValheimPage() {
  return (
    <>
      <p className="kicker">Dedicated</p>
      <h1>Valheim</h1>
      <p className="lead">
        World Troglodies. Direct connect on the public address below. Ask
        Zrionix on Discord before you join.
      </p>
      <div className="ip hero">216.228.185.138:2456</div>
      <LiveServer ids={["valheim"]} />
    </>
  );
}
