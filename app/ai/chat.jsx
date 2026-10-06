"use client";

export function AiChat() {
  return (
    <section className="ai-panel">
      <div className="host">
        <span>No model loaded</span>
        <span className="badge">waiting</span>
        <span>RTX 3080 Ti</span>
      </div>
      <p className="ai-note">
        The iGPU and CPU paths are off so the Paper servers keep the machine. Chat comes back after the 3080 Ti and NVIDIA drivers are in. First login then pulls dolphin-llama3:8b onto the card.
      </p>
      <div className="ai-log" aria-live="polite">
        <p className="ai-empty">Chat is paused until the GPU is installed.</p>
      </div>
      <form className="ai-form" onSubmit={(event) => event.preventDefault()}>
        <input
          value=""
          placeholder="Waiting for the 3080 Ti"
          aria-label="Local model chat, paused"
          disabled
        />
        <button type="submit" disabled>Send</button>
      </form>
    </section>
  );
}
