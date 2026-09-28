"use client";

import { LiveBoard } from "../live";

export default function MonitorPage() {
  return (
    <>
      <p className="kicker">Live</p>
      <h1>Server monitor</h1>
      <p className="lead">
        The whole box. Java and Valheim each show only their own status.
      </p>
      <LiveBoard />
    </>
  );
}
