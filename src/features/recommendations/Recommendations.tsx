import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { getRecommendations } from "./RecommendationEngine";
import { useNavigate } from "react-router-dom";

const NEO_COLORS = [
  "bg-[#facc15]", // Yellow
  "bg-[#fb7185]", // Pink
  "bg-[#22d3ee]", // Cyan
  "bg-[#a3e635]", // Lime
  "bg-[#c084fc]", // Purple
  "bg-[#fb923c]", // Orange
];

const getCategoryColor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return NEO_COLORS[Math.abs(hash) % NEO_COLORS.length];
};

export const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<
    Array<{ category: string; name: string; reason: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedIds = localStorage.getItem("userSelectedIds");
    if (!storedIds) {
      navigate("/onboarding");
      return;
    }

    const selectedIds = JSON.parse(storedIds);
    // Simulate API delay
    setTimeout(() => {
      const recs = getRecommendations(selectedIds);
      setRecommendations(recs);
      setLoading(false);
    }, 1500);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-black mb-4" />
        </motion.div>
        <p className="text-black font-black uppercase animate-pulse">
          Analyzing your Cortex...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-10 text-center">
        <h2 className="text-5xl font-black uppercase mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-black fill-[#facc15]" />
          Recommended
        </h2>
        <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          Based on your interests, we think you might enjoy exploring these
          topics. Expand your universe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, idx) => {
          const colorClass = getCategoryColor(rec.category);
          return (
            <motion.div
              key={`${rec.name}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border-4 border-black p-6 relative overflow-hidden group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              <div
                className={`absolute top-0 right-0 ${colorClass} border-b-4 border-l-4 border-black text-black text-xs font-black px-3 py-1 uppercase`}
              >
                {rec.category}
              </div>

              <h3 className="text-3xl font-black uppercase mb-4 mt-4 leading-none">
                {rec.name}
              </h3>
              <p className="text-sm font-bold text-gray-600 mb-6 border-l-4 border-black pl-3 py-1">
                {rec.reason}
              </p>

              <button className="w-full py-3 border-4 border-black font-black hover:bg-black hover:text-white transition-colors uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
                Add to Map
              </button>
            </motion.div>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center text-slate-500 py-20">
          <p className="font-bold text-xl mb-4">
            Add more interests to get better recommendations!
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="bg-[#22d3ee] text-black font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            Go back to inputs
          </button>
        </div>
      )}
    </div>
  );
};
