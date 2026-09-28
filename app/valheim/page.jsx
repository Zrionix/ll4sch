import Link from "next/link";

export const metadata = { title: "Valheim — ll4sch" };

export default function ValheimPage() {
  return (
    <>
      <p className="kicker">Dedicated</p>
      <h1>Valheim</h1>
      <p className="lead">
        World Troglodies. Direct connect on the public address below. Ask
        Zrionix on Discord before you join. Live up/down is on the{" "}
        <Link href="/servermonitor">monitor</Link>.
      </p>
      <div className="ip hero">216.228.185.138:2456</div>
    </>
  );
}
