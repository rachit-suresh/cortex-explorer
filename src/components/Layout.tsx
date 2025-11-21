import { Link, Outlet, useLocation } from "react-router-dom";
import { BrainCircuit, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div
      className="min-h-screen text-black font-bold selection:bg-[#facc15]"
      style={
        !isLanding
          ? {
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
            }
          : { background: "#fff" }
      }
    >
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      {/* Navigation */}
      <nav className="relative z-50 border-b-4 border-black bg-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-[#facc15] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                <BrainCircuit className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                Cortex Explorer
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/map"
                className="text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 decoration-[#fb7185]"
              >
                My Map
              </Link>
              <Link
                to="/global-map"
                className="text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 decoration-[#22d3ee]"
              >
                Global Map
              </Link>
              <Link
                to="/recommendations"
                className="flex items-center gap-2 text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 decoration-[#facc15]"
              >
                <Sparkles className="w-4 h-4" />
                Discover
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};
