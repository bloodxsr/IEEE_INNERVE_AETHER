"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ fontFamily: "monospace", padding: "2rem", background: "black", color: "white" }}>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>Try again</button>
      </body>
    </html>
  );
}