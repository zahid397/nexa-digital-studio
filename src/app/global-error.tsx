'use client'
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#101014',
          color: '#f6f5f1',
          fontFamily: 'system-ui,sans-serif',
          padding: '10vw',
        }}
      >
        <main>
          <p>Nexa Digital Studio</p>
          <h1>The studio is temporarily unavailable.</h1>
          <p>We couldn’t connect to the content system. Please try again shortly.</p>
          <button type="button" onClick={reset} style={{ padding: '14px 24px', cursor: 'pointer' }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
