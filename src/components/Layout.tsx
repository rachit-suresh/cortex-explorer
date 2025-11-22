import { Link, Outlet, useLocation } from "react-router-dom";
import { BrainCircuit, Sparkles, Moon, Sun } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";

interface LayoutProps {
  children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDark));
  }, [isDark]);

  return (
    <div
      className={`min-h-screen font-bold selection:bg-[#facc15] ${isDark ? 'text-white' : 'text-black'}`}
      style={
        !isLanding
          ? {
              background: isDark
                ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7b2cbf 100%)"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
            }
          : { background: isDark ? "#1a1a2e" : "#fff" }
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
      <nav 
        className={`relative z-50 border-b-4 border-black ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 bg-[#facc15] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                <BrainCircuit className="w-6 h-6 text-black" />
              </div>
              <span className={`text-2xl font-black tracking-tighter uppercase ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                Cortex Explorer
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/map"
                className={`text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 ${
                  isDark ? 'text-white decoration-[#facc15]' : 'text-black decoration-[#fb7185]'
                }`}
              >
                My Map
              </Link>
              <Link
                to="/global-map"
                className={`text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 ${
                  isDark ? 'text-white decoration-[#22d3ee]' : 'text-black decoration-[#22d3ee]'
                }`}
              >
                Global Map
              </Link>
              <Link
                to="/recommendations"
                className={`flex items-center gap-2 text-sm font-bold uppercase hover:underline decoration-2 underline-offset-4 ${
                  isDark ? 'text-white decoration-[#c084fc]' : 'text-black decoration-[#facc15]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Discover
              </Link>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                title={isDark ? "Light Mode" : "Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4 text-black" /> : <Moon className="w-4 h-4 text-black" />}
              </button>
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
