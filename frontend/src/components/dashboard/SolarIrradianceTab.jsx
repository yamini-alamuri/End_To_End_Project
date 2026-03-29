import { useState } from 'react';
import { Sun, Zap, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SolarIrradianceTab = () => {
  const [selectedDay, setSelectedDay] = useState('today');

  // Generate realistic solar irradiance data with smooth, gradual cloud effects
  const generateRealisticSolarData = (seed, weatherPattern) => {
    const times = [];
    const startHour = 5; // 5 AM
    const endHour = 20; // 8 PM
    
    // Seeded random for consistent daily patterns
    let randomSeed = seed;
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };

    // Broad cloud systems (slow dips)
    const cloudEvents = [];
    const eventCount = 3 + Math.floor(seededRandom() * 4); // 3 to 6 events per day
    for (let i = 0; i < eventCount; i++) {
      cloudEvents.push({
        center: 8 + seededRandom() * 9.5,         // event center between 8:00 and 17:30
        duration: 0.5 + seededRandom() * 1.5,     // 30 to 120 minutes
        depth: 0.12 + seededRandom() * 0.38       // 12% to 50% attenuation at peak cloud cover
      });
    }

    let previousSurface = null;
    let transientDip = 0;
    let transientBoost = 0;
    let burstRemaining = 0;
    let burstDepth = 0;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeDecimal = hour + minute / 60;
        const hourLabel = hour <= 12 ? hour : hour - 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hourLabel === 0 ? 12 : hourLabel;
        const time = minute === 0 
          ? `${displayHour} ${period}` 
          : `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        
        // Calculate TOA (Top of Atmosphere) radiation - smooth bell curve
        const solarNoon = 12.0; // Peak at noon
        const dayLength = 14;
        const normalizedTime = (timeDecimal - solarNoon) / (dayLength / 2);
        const toaRadiation = normalizedTime >= -1 && normalizedTime <= 1
          ? Math.max(0, 1150 * Math.pow(Math.cos(normalizedTime * Math.PI / 2), 0.8))
          : 0;
        
        if (toaRadiation < 10) {
          times.push({
            time,
            timeDecimal,
            surfaceRadiation: 0,
            toaRadiation: Math.round(toaRadiation),
            power: 0
          });
          continue;
        }
        
        // Base transmittance (clear-sky + weather quality)
        const baseTransmittance = 0.62 + weatherPattern * 0.22;

        // Slow atmospheric variability (haze/humidity changes)
        const slowVariation = 1
          + Math.sin(timeDecimal * 0.9 + seed * 0.01) * 0.035
          + Math.cos(timeDecimal * 1.3 + seed * 0.02) * 0.028;

        // Apply smooth cloud attenuation from predefined events
        let cloudFactor = 1;
        for (const event of cloudEvents) {
          const halfDuration = event.duration / 2;
          const x = (timeDecimal - event.center) / halfDuration;
          if (Math.abs(x) < 1) {
            // Cosine bell: smooth entry and exit, strongest attenuation at center
            const influence = 0.5 * (1 + Math.cos(Math.PI * x));
            cloudFactor *= (1 - event.depth * influence);
          }
        }

        // Small-scale atmospheric variability
        const texture = 1
          + Math.sin(timeDecimal * 6.8 + seed * 0.03) * 0.055
          + Math.cos(timeDecimal * 9.4 + seed * 0.04) * 0.045;

        // Daytime transient cloud shadows create sharp spikes/dips like measured data
        const activeSpikes = timeDecimal >= 9 && timeDecimal <= 17.5;
        if (activeSpikes) {
          const cloudiness = Math.max(0.05, 1 - weatherPattern);

          // Natural decay of short events
          transientDip *= 0.50;
          transientBoost *= 0.42;

          // Frequent single-step dips
          const dipChance = 0.10 + cloudiness * 0.20;
          if (seededRandom() < dipChance) {
            transientDip = Math.max(transientDip, 0.20 + seededRandom() * 0.56);
          }

          // Occasional cloud-edge brightening right after shadows
          const boostChance = 0.05 + cloudiness * 0.08;
          if (seededRandom() < boostChance) {
            transientBoost = Math.max(transientBoost, 0.04 + seededRandom() * 0.12);
          }

          // Burst mode: a few consecutive sharp dips (matches reference midday jaggedness)
          const burstChance = 0.022 + cloudiness * 0.055;
          if (burstRemaining === 0 && seededRandom() < burstChance) {
            burstRemaining = 2 + Math.floor(seededRandom() * 5); // 2 to 6 points
            burstDepth = 0.18 + seededRandom() * 0.34;
          }
        } else {
          transientDip *= 0.55;
          transientBoost *= 0.45;
        }

        let burstFactor = 1;
        if (burstRemaining > 0) {
          const burstJitter = 0.90 + seededRandom() * 0.22;
          burstFactor = 1 - Math.min(0.55, burstDepth * burstJitter);
          burstRemaining -= 1;
          if (burstRemaining === 0) {
            burstDepth = 0;
          }
        }

        const transientFactor = Math.max(0.20, 1 - transientDip + transientBoost);

        // Smooth baseline envelope to preserve the outer parabolic daily shape
        const baselineRadiation = toaRadiation * baseTransmittance * slowVariation * cloudFactor;

        let surfaceRadiation = baselineRadiation * texture * transientFactor * burstFactor;

        // Higher local variability for visible jagged profile
        const noiseFactor = ((seededRandom() + seededRandom()) - 1) * 0.085;
        surfaceRadiation += toaRadiation * noiseFactor;

        // Preserve envelope: allow spikes, but keep overall curve tracking the baseline
        const upCap = baselineRadiation * 0.18;
        const downCap = baselineRadiation * (activeSpikes ? 0.62 : 0.45);
        const deviation = surfaceRadiation - baselineRadiation;
        surfaceRadiation = baselineRadiation + Math.max(-downCap, Math.min(upCap, deviation));

        // Adaptive physical floor: stronger floor near noon, lower at morning/evening
        const daylightStrength = Math.min(1, toaRadiation / 1150);
        const minimumRadiation = toaRadiation * (0.14 + 0.18 * Math.pow(daylightStrength, 1.2));
        surfaceRadiation = Math.max(minimumRadiation, surfaceRadiation);
        
        // Ensure surface radiation doesn't exceed TOA
        surfaceRadiation = Math.min(surfaceRadiation, toaRadiation * 0.98);

        // Very light continuity control to preserve spikes but avoid impossible cliffs
        if (previousSurface !== null) {
          const maxStep = toaRadiation * 0.45 + 40;
          const delta = surfaceRadiation - previousSurface;
          if (Math.abs(delta) > maxStep) {
            surfaceRadiation = previousSurface + Math.sign(delta) * maxStep;
          }
          surfaceRadiation = previousSurface * 0.05 + surfaceRadiation * 0.95;
        }
        previousSurface = surfaceRadiation;
        
        times.push({
          time,
          timeDecimal,
          surfaceRadiation: Math.round(surfaceRadiation),
          toaRadiation: Math.round(toaRadiation),
          power: (surfaceRadiation / 200).toFixed(2)
        });
      }
    }
    
    return times;
  };

  // Keep Yesterday and 3 Days Ago as-is (user-preferred reference style)
  const yesterdayData = generateRealisticSolarData(23456, 0.85); // Better conditions (unchanged)
  const threeDaysAgoData = generateRealisticSolarData(45678, 0.80); // Good conditions (unchanged)

  // Align other days to the same overall profile family (parabolic envelope + realistic spikes)
  const todayData = generateRealisticSolarData(12345, 0.83);
  const twoDaysAgoData = generateRealisticSolarData(34567, 0.82);
  const fourDaysAgoData = generateRealisticSolarData(56789, 0.81);
  const fiveDaysAgoData = generateRealisticSolarData(67890, 0.84);
  const sixDaysAgoData = generateRealisticSolarData(78901, 0.82);

  // Get current time for "today" filter
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeDecimal = currentHour + currentMinute / 60;
  
  // Filter today's data to only show up to current time
  const filteredTodayData = todayData.filter(d => d.timeDecimal <= currentTimeDecimal);
  
  const dataOptions = {
    today: { data: filteredTodayData.length > 0 ? filteredTodayData : todayData.slice(0, 1), label: 'Today', condition: 'Mostly Clear' },
    yesterday: { data: yesterdayData, label: 'Yesterday', condition: 'Mostly Clear' },
    '2days': { data: twoDaysAgoData, label: '2 Days Ago', condition: 'Good Conditions' },
    '3days': { data: threeDaysAgoData, label: '3 Days Ago', condition: 'Good Conditions' },
    '4days': { data: fourDaysAgoData, label: '4 Days Ago', condition: 'Good Conditions' },
    '5days': { data: fiveDaysAgoData, label: '5 Days Ago', condition: 'Mostly Clear' },
    '6days': { data: sixDaysAgoData, label: '6 Days Ago', condition: 'Good Conditions' }
  };

  const currentData = dataOptions[selectedDay].data;
  const currentCondition = dataOptions[selectedDay].condition;

  // Calculate statistics
  const peakSurface = Math.max(...currentData.map(d => d.surfaceRadiation));
  const peakTOA = Math.max(...currentData.map(d => d.toaRadiation));
  const avgSurface = Math.round(currentData.reduce((sum, d) => sum + d.surfaceRadiation, 0) / currentData.length);
  const peakPower = (peakSurface / 200).toFixed(2);

  // Show every 5-minute point while keeping the curve physically realistic
  const displayData = currentData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-solar-500" />
              Solar Radiation Analysis
            </h2>
            <p className="text-gray-600">5-Minute Average Solar Radiation - {dataOptions[selectedDay].label}</p>
            <p className="text-sm text-gray-500 mt-1">Weather: {currentCondition}</p>
          </div>
        </div>

        {/* Day Selection Buttons */}
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-6">
          {Object.keys(dataOptions).map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedDay === day
                  ? 'bg-solar-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dataOptions[day].label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Sun className="w-8 h-8" />}
            title="Peak Surface Radiation"
            value={`${peakSurface} W/m²`}
            subtitle="Maximum recorded"
            color="from-blue-400 to-blue-600"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Peak TOA Radiation"
            value={`${peakTOA} W/m²`}
            subtitle="Top of atmosphere"
            color="from-red-400 to-red-600"
          />
          <StatCard
            icon={<Zap className="w-8 h-8" />}
            title="Estimated Peak Power"
            value={`${peakPower} kW`}
            subtitle="System output"
            color="from-green-400 to-green-600"
          />
        </div>

        {/* Solar Radiation Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">5-Minute Average Solar Radiation (W/m²)</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={12}
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  domain={[0, 1200]}
                  ticks={[0, 200, 400, 600, 800, 1000, 1200]}
                  label={{ value: 'Radiation (W/m²)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="linear" 
                  dataKey="surfaceRadiation" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="Surface Radiation"
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="toaRadiation" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  dot={false}
                  name="TOA Radiation"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span className="font-semibold text-blue-900">Surface Radiation</span>
              </div>
              <p className="text-blue-800 text-xs">
                Actual solar radiation reaching the ground after atmospheric absorption and scattering. 
                Shows variations due to clouds, humidity, and aerosols.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-0.5 bg-red-500"></div>
                <span className="font-semibold text-red-900">TOA Radiation</span>
              </div>
              <p className="text-red-800 text-xs">
                Top of Atmosphere radiation - theoretical maximum solar energy available without 
                atmospheric interference. Forms the smooth envelope curve.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard
          title="Understanding Solar Radiation Data"
          content="Surface radiation shows real-world conditions with gradual fluctuations caused by clouds, atmospheric particles, and weather patterns. TOA (Top of Atmosphere) radiation shows the smooth theoretical maximum available from the sun."
          icon="📊"
        />
        <InfoCard
          title="Why Data Varies Daily"
          content="Each day has unique atmospheric conditions - cloud cover, humidity, air quality, and seasonal factors affect how much solar energy reaches your panels. This realistic data helps predict actual system performance rather than idealized estimates."
          icon="☁️"
        />
        <InfoCard
          title="Reading the Graph"
          content="The blue line (Surface Radiation) shows actual usable sunlight with smooth weather-driven variation. The red line (TOA Radiation) shows maximum possible radiation in perfect conditions. The gap between them represents atmospheric losses."
          icon="📈"
        />
        <InfoCard
          title="Impact on Solar Panels"
          content="Your solar panels respond to surface radiation levels. Higher radiation means more power generation. Monitoring these patterns helps optimize panel placement and predict energy production. Even on cloudy days, modern panels capture significant energy."
          icon="⚡"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  </div>
);

const InfoCard = ({ title, content, icon }) => (
  <div className="card">
    <div className="flex items-start space-x-3">
      <div className="text-4xl">{icon}</div>
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  </div>
);

export default SolarIrradianceTab;

