import { motion } from 'framer-motion';
import { ArrowRight, Brain, Share2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 inline-block p-4 bg-[#22d3ee] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-black">
            Map Your<br />
            <span className="text-white stroke-black" style={{ WebkitTextStroke: '2px black' }}>Universe</span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-black font-bold mb-12 max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Visualize your interests, discover new passions, and connect the dots in a 
          mind-bending interactive graph.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to="/onboarding"
            className="neo-btn neo-btn-primary text-xl flex items-center gap-2"
          >
            Start Mapping <ArrowRight className="w-6 h-6" />
          </Link>
          <Link 
            to="/global-map"
            className="neo-btn bg-white hover:bg-gray-100 text-black text-xl"
          >
            Explore Global Map
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl">
        {[
          { icon: Brain, title: "Smart Clustering", desc: "AI-powered grouping of your related interests.", color: "bg-[#fb7185]" },
          { icon: Zap, title: "Instant Discovery", desc: "Get personalized recommendations in seconds.", color: "bg-[#facc15]" },
          { icon: Share2, title: "Deep Hierarchy", desc: "Drill down from Sports to F1 to Drivers.", color: "bg-[#22d3ee]" }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className={`p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${feature.color}`}
          >
            <feature.icon className="w-12 h-12 mb-4 text-black" />
            <h3 className="text-2xl font-black uppercase mb-2">{feature.title}</h3>
            <p className="font-bold">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
