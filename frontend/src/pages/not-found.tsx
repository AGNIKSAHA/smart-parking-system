import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="rounded-xl border bg-white p-8 text-center">
    <h1 className="text-2xl font-bold">Page not found</h1>
    <Link to="/" className="mt-4 inline-block rounded-lg bg-slate-900 px-3 py-2 text-white">Go home</Link>
  </div>
);
