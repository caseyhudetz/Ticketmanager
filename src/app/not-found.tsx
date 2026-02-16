export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">404 — Page not found</h2>
        <p className="mt-2 text-surface-500">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
