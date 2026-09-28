import { AiBoard } from "../live";

export const metadata = { title: "Local AI \u2014 ll4sch" };

export default function AiPage() {
  return (
    <>
      <p className="kicker">Local model</p>
      <h1>AI</h1>
      <p className="lead">
        Token speed, context, and GPU on the server.
      </p>
      <AiBoard />
    </>
  );
}
