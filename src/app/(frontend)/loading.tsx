export default function Loading() {
  return (
    <div className="container page-loading" aria-busy="true" role="status">
      <span className="loading-dot" />
      <p>Opening the studio…</p>
      <div className="skeleton" />
      <div className="skeleton short" />
    </div>
  )
}
