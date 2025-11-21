import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Music, Film, Trophy, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  {
    id: "music",
    label: "Music",
    icon: Music,
    placeholder: "e.g., Rock, Jazz, Taylor Swift",
  },
  {
    id: "movies",
    label: "Movies & TV",
    icon: Film,
    placeholder: "e.g., Sci-Fi, Nolan, Inception",
  },
  {
    id: "sports",
    label: "Sports",
    icon: Trophy,
    placeholder: "e.g., Basketball, F1, Yoga",
  },
  {
    id: "hobbies",
    label: "Hobbies",
    icon: Palette,
    placeholder: "e.g., Photography, Coding, Cooking",
  },
];

export const InterestForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [interests, setInterests] = useState<Record<string, string[]>>({
    music: [],
    movies: [],
    sports: [],
    hobbies: [],
  });
  const [currentInput, setCurrentInput] = useState("");

  const currentCategory = CATEGORIES[currentStep];

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    setInterests((prev) => ({
      ...prev,
      [currentCategory.id]: [...prev[currentCategory.id], currentInput.trim()],
    }));
    setCurrentInput("");
  };

  const removeInterest = (category: string, interest: string) => {
    setInterests((prev) => ({
      ...prev,
      [category]: prev[category].filter((i) => i !== interest),
    }));
  };

  const handleNext = () => {
    if (currentStep < CATEGORIES.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save to local storage or backend
      localStorage.setItem("userInterests", JSON.stringify(interests));
      navigate("/map");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="mb-8 flex justify-between items-center">
        {CATEGORIES.map((cat, idx) => (
          <div key={cat.id} className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                idx === currentStep
                  ? "bg-cyan-500 text-white"
                  : idx < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <cat.icon className="w-5 h-5" />
            </div>
            <span
              className={`text-xs font-medium ${
                idx === currentStep ? "text-cyan-400" : "text-slate-500"
              }`}
            >
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <currentCategory.icon className="w-8 h-8 text-cyan-400" />
            What {currentCategory.label.toLowerCase()} do you like?
          </h2>
          <p className="text-slate-400 mb-6">
            Add as many as you want. This helps build your Cortex.
          </p>

          <form onSubmit={handleAddInterest} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={currentCategory.placeholder}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder:text-slate-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!currentInput.trim()}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded-lg transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 min-h-[100px]">
            {interests[currentCategory.id].map((interest, idx) => (
              <motion.span
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm"
              >
                {interest}
                <button
                  onClick={() => removeInterest(currentCategory.id, interest)}
                  className="hover:text-white ml-1"
                >
                  ×
                </button>
              </motion.span>
            ))}
            {interests[currentCategory.id].length === 0 && (
              <div className="w-full text-center text-slate-600 italic py-8">
                No interests added yet...
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-cyan-50 transition-colors"
            >
              {currentStep === CATEGORIES.length - 1
                ? "Generate Map"
                : "Next Category"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
