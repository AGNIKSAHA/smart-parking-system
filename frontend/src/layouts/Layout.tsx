import { Outlet } from "react-router-dom";
import { useRealtime } from "../features/realtime/realtime.hook";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const Layout = () => {
  useRealtime();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
