import { AiChat } from "./chat";

export const metadata = { title: "Local AI \u2014 ll4sch" };

export default function AiPage() {
  return (
    <>
      <p className="kicker">Local model</p>
      <h1>AI</h1>
      <p className="lead">
        Waiting on the RTX 3080 Ti. No model is running on the CPU or iGPU.
      </p>
      <AiChat />
    </>
  );
}
