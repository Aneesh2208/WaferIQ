const DefectGeneratorAI = {
    async generateRealisticDefects(waferDiameter, dieSize, productionLine) {
        console.log("🔴 AI MODEL 1: Defect Generator Starting...");

        const totalDies = Math.floor(
            (Math.PI * Math.pow(waferDiameter / 2, 2)) / dieSize
        );
        const defectTypes = [
    "Edge Die Failure",
    "Center Particle Contamination",
    "Radial Pattern Defect",
    "Random Defect Scatter",
    "Cluster Failure",
    "Scratch Pattern",
    "Perfect Run"
];

const forcedDefect = defectTypes[Math.floor(Math.random() * defectTypes.length)];


        const prompt = `You are an AI that simulates semiconductor manufacturing defects.

WAFER SPECS:
- Diameter: ${waferDiameter}mm
- Die Size: ${dieSize}mm²
- Process Node: ${productionLine}
- Total Dies: ~${totalDies}

TASK: Generate a realistic defect pattern for this wafer.

The defect type for this run is:
${forcedDefect}

You must simulate this specific defect realistically.


Respond with ONLY this JSON (no markdown):

{
  "defectType": "<defect name>",
  "severity": "<low|moderate|high|critical>",
  "region": "<edge|center|radial|random|cluster|linear|none>",
  "description": "<what happened in manufacturing>",
  "dieDistribution": {
    "premium": <number>,
    "standard": <number>,
    "economy": <number>,
    "faulty": <number>,
    "dead": <number>
  },
  "spatialPattern": "<pattern description>"
}

RESPONSE MUST BE VALID JSON.
NO markdown.
NO explanation.
NO extra text.
DO NOT wrap in \`\`\`json.
DO NOT add commentary.

IMPORTANT:
All numeric values must be integers where specified.
Arrays must not be empty.
Ensure total die count is realistic.
`;

        try {
            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`AI Backend Error: ${response.status} - ${error}`);
            }

            const data = await response.json();
const defectData = data.result;

// 🔥 Hybrid deterministic distribution engine

function generateDistribution(totalDies, severity) {
  let failureRate;

  switch (severity) {
    case "low":
      failureRate = 0.05;
      break;
    case "moderate":
      failureRate = 0.12;
      break;
    case "high":
      failureRate = 0.25;
      break;
    case "critical":
      failureRate = 0.45;
      break;
    default:
      failureRate = 0.10;
  }

  const failedDies = Math.floor(totalDies * failureRate);
  const remainingDies = totalDies - failedDies;

  const premium = Math.floor(remainingDies * 0.6);
  const standard = Math.floor(remainingDies * 0.25);
  const economy = remainingDies - premium - standard;

  const faulty = Math.floor(failedDies * 0.7);
  const dead = failedDies - faulty;

  return {
    premium,
    standard,
    economy,
    faulty,
    dead
  };
}

defectData.dieDistribution = generateDistribution(
  totalDies,
  defectData.severity
);

return defectData;




        } catch (error) {
            console.error("❌ AI MODEL 1 FAILED:", error);
            throw error;
        }
    }
};

console.log("🔴 AI Model 1 (OpenAI) Loaded");
