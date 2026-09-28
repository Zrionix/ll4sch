"use client";

import { LiveBoard } from "../live";

export default function MonitorPage() {
  return (
    <>
      <p className="kicker">Status</p>
      <h1>Monitor</h1>
      <p className="lead">CPU, memory, and every service on the server.</p>
      <LiveBoard />
    </>
  );
}
