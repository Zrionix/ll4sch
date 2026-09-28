import { AiBoard } from "../live";

export const metadata = { title: "Local AI \u2014 ll4sch" };

export default function AiPage() {
  return (
    <>
      <p className="kicker">Local model</p>
      <h1>AI status</h1>
      <p className="lead">
        Decode speed, prefill, time to first token, context, queue, and the
        GPU. Nothing here is invented. The numbers stay blank until the card
        is installed and a model is running on the server.
      </p>
      <AiBoard />
    </>
  );
}
