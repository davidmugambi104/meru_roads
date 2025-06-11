import { useState, useEffect, useMemo, useRef } from 'react';
import { FaLeaf, FaTree, FaPaw, FaCloud, FaRecycle, FaLightbulb } from 'react-icons/fa';
import CyberCard from './CyberCard';

const EnvironmentalImpact = ({ roadData }) => {
  const [impactData, setImpactData] = useState(null);
  const [headlines, setHeadlines] = useState(['', '']);
  const cardRef = useRef(null);
  const overlayRef = useRef(null);

  // Headline templates with placeholders
  const headlineTemplates = useMemo(() => [
    "🌿 BREAKING: {co2Reduction} TONS OF CO₂ REDUCED • WILDLIFE CORRIDORS INCREASE BY 37% • SUSTAINABLE ROAD TECH ADOPTED IN 12 COUNTRIES",
    "🚨 URGENT: ECO-CONSTRUCTION SAVES {treesPlanted} TREES • CARBON-NEUTRAL INFRASTRUCTURE MANDATE PASSED • GREEN TECH INVESTMENTS UP 45%",
    "🌎 NEW RESEARCH: ROAD PROJECTS USING GREEN TECH CUT EMISSIONS BY {co2Reduction} TONS • BIODIVERSITY UP 22% IN AREAS WITH ECO-ROADS",
    "💡 INNOVATION: SOLAR ROADS GENERATE 5MW IN TRIAL • {treesPlanted} TREES PLANTED ALONG HIGHWAYS • WILDLIFE CROSSINGS PREVENT 90% OF ANIMAL DEATHS",
    "🚧 CONSTRUCTION UPDATE: {wildlifeCorridors} WILDLIFE PASSAGES BUILT THIS YEAR • RECYCLED MATERIALS USED IN 85% OF NEW ROADS",
    "🌱 GREEN AWARD: OUR PROJECT WINS SUSTAINABILITY PRIZE • {co2Reduction} TONS CARBON OFFSET • {treesPlanted} TREES PLANTED"
  ], []);

  // Update headlines every minute
  useEffect(() => {
    const updateHeadlines = () => {
      const shuffled = [...headlineTemplates].sort(() => Math.random() - 0.5);
      const formattedHeadlines = shuffled.slice(0, 2).map(headline => {
        return headline
          .replace('{co2Reduction}', impactData?.co2Reduction || '15,000')
          .replace('{treesPlanted}', impactData?.treesPlanted || '10,000')
          .replace('{wildlifeCorridors}', impactData?.wildlifeCorridors || '50');
      });
      setHeadlines(formattedHeadlines);
    };

    updateHeadlines(); // Initial update
    const interval = setInterval(updateHeadlines, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [headlineTemplates, impactData]);

  // Mouse tracking effect for dynamic gradient
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      if (!overlayRef.current) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      overlayRef.current.style.background = `radial-gradient(800px circle at ${x}px ${y}px, rgba(72, 187, 120, 0.15), transparent 40%)`;
      overlayRef.current.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      if (overlayRef.current) {
        overlayRef.current.style.opacity = '0';
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Static sustainability tips (no longer rotating)
  const dailyTips = useMemo(() => [
    { text: "Use recycled materials for road construction", icon: <FaRecycle className="text-green-400" /> },
    { text: "Implement solar-powered road lighting", icon: <FaLightbulb className="text-yellow-400" /> },
    { text: "Plant native vegetation along roadsides", icon: <FaTree className="text-green-500" /> }
  ], []);

  // Calculate impact data
  useEffect(() => {
    if (roadData?.length) {
      setImpactData({
        co2Reduction: (roadData.length * 150).toLocaleString(),
        treesPlanted: Math.floor(roadData.length * 100).toLocaleString(),
        wildlifeCorridors: Math.floor(roadData.length / 5)
      });
    }
  }, [roadData]);

  return (
    <div className="relative">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* News headline styles */
        .headline-container {
          position: relative;
          height: 60px;
          overflow: hidden;
          border-bottom: 1px solid rgba(72, 187, 120, 0.3);
          font-size: 1.3rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .headline-track {
          position: absolute;
          white-space: nowrap;
          will-change: transform;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .headline-1 {
          animation: scrollLeft 20s linear infinite;
          top: 10%;
        }
        
        .headline-2 {
          animation: scrollRight 22s linear infinite;
          top: 60%;
        }
        
        @keyframes scrollLeft {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes scrollRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Environmental card styles with increased font sizes */
        .environmental-impact-card {
          background: linear-gradient(145deg, #0f172a 0%, #14532d 100%);
          border: 1px solid rgba(72, 187, 120, 0.3);
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(72, 187, 120, 0.2);
          overflow: hidden;
          height: 120px;
          position: relative;
          font-size: 1.05rem; /* Base font size increased */
        }
        
        h3 {
          font-size: 1.8rem; /* Increased from 2xl */
        }
        
        .metric-card {
          font-size: 1.1rem; /* Increased metric font size */
          background: linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(6, 78, 59, 0.7));
          border: 1px solid rgba(72, 187, 120, 0.2);
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          height: 100%;
          padding: 1rem;
          transition: all 0.3s ease;
        }
        
        .metric-card:hover {
          border-color: #48bb78;
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(72, 62, 62, 0.3);
        }
        
        .tips-container {
          background: rgba(69, 91, 121, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(72, 187, 120, 0.2);
          border-radius: 0.75rem;
          padding: 1.25rem;
          font-size: 1.05rem; /* Increased tips font */
        }
      `}</style>

      <CyberCard className="environmental-impact-card" ref={cardRef}>
        {/* News headlines section */}
        <div className="headline-container">
          <div className="headline-track headline-1 text-green-300">
            {headlines[0] || '🌿 LOADING ENVIRONMENTAL NEWS • PLEASE STAND BY •'} •
          </div>
          <div className="headline-track headline-2 text-amber-300">
            {headlines[1] || '🚨 PREPARING SUSTAINABILITY UPDATES • PLEASE STAND BY •'} •
          </div>
        </div>

        <div 
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0"
        />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-700 p-3 rounded-full">
              {/* <FaLeaf className="text-green-300 text-2xl" /> */}
            </div>
            {/* <h3 className="text-2xl font-bold text-white">
              Environmental Impact
            </h3> */}
          </div>

          {impactData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="metric-card bg-gradient-to-br from-blue-900 to-cyan-900">
                <div className="bg-gray-800 p-3 rounded-full mb-3">
                  <FaCloud className="text-blue-300 text-xl" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {impactData.co2Reduction}<span className="text-lg"> tons</span>
                </div>
                <div className="text-gray-300 text-sm font-medium">CO₂ Reduction</div>
              </div>

              <div className="metric-card bg-gradient-to-br from-green-900 to-emerald-900">
                <div className="bg-gray-800 p-3 rounded-full mb-3">
                  <FaTree className="text-green-400 text-xl" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {impactData.treesPlanted}
                </div>
                <div className="text-gray-300 text-sm font-medium">Trees Planted</div>
              </div>

              <div className="metric-card bg-gradient-to-br from-amber-900 to-yellow-900">
                <div className="bg-gray-800 p-3 rounded-full mb-3">
                  <FaPaw className="text-amber-400 text-xl" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {impactData.wildlifeCorridors}
                </div>
                <div className="text-gray-300 text-sm font-medium">Wildlife Crossings</div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex flex-col space-y-4 mb-8">
              <div className="h-24 bg-gray-800 rounded-lg"></div>
              <div className="h-24 bg-gray-800 rounded-lg"></div>
              <div className="h-24 bg-gray-800 rounded-lg"></div>
            </div>
          )}

          {/* <div className="tips-container">
            <div className="flex items-center gap-2 mb-3 text-green-300">
              <FaLightbulb className="text-xl" />
              <h4 className="font-bold text-lg">Sustainability Tips</h4>
            </div> */}

            {/* <ul className="space-y-3">
              {dailyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">{tip.icon}</span>
                  <span className="text-gray-200">{tip.text}</span>
                </li>
              ))}
            </ul> */}
          </div>
        {/* </div> */}
      </CyberCard>
    </div>
  );
};

export default EnvironmentalImpact;