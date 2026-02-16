const DefectGeneratorAI = {
    async generateRealisticDefects(waferDiameter, dieSize, productionLine) {
        console.log("AI Model 1: Generating defects...");

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
            "Wafer Bow Distortion",
            "Etch Non-Uniformity",
            "Ion Implantation Drift",
            "Lithography Misalignment",
            "Chemical Vapor Deposition Defect",
            "Metal Layer Delamination",
            "Plasma Damage",
            "Photoresist Residue",
            "Micro-crack Propagation",
            "Thermal Stress Fracture",
            "Cross-Contamination",
            "Incomplete Oxide Formation",
            "Step Coverage Failure",
            "Polysilicon Grain Boundaries"
        ];

        // Pick defect type: 5% perfect, 30% hybrid (two combined), 65% single
        const randomValue = Math.random();
        let forcedDefect;
        let isHybrid = false;

        if (randomValue < 0.05) {
            forcedDefect = "Perfect Run";
        } else if (randomValue < 0.35) {
            const primary = defectTypes[Math.floor(Math.random() * defectTypes.length)];
            const secondary = defectTypes[Math.floor(Math.random() * defectTypes.length)];
            forcedDefect = `${primary} + ${secondary}`;
            isHybrid = true;
        } else {
            forcedDefect = defectTypes[Math.floor(Math.random() * defectTypes.length)];
        }

        const prompt = `You create realistic wafer manufacturing problems. Use SIMPLE, CLEAR language that beginners can understand.

IMPORTANT: Be CREATIVE and DIFFERENT every time. Never repeat the same description twice!

WAFER INFO:
- Size: ${waferDiameter}mm diameter
- Chip Size: ${dieSize}mm² per chip
- Technology: ${productionLine} process
- Total Chips: ~${totalDies}

TODAY'S PROBLEM: ${forcedDefect}
${isHybrid ? 'HYBRID DEFECT: This is a MULTI-STAGE or COMBINED failure. Create a scenario where BOTH defects occur (e.g., contamination happened first, then thermal stress, OR two simultaneous issues). Make the spatial pattern show BOTH signatures!' : ''}

YOUR JOB:
1. Create a UNIQUE, realistic version of this problem
2. ${isHybrid ? 'For hybrid defects: explain the SEQUENCE or COMBINATION of events (e.g., "First X happened, then Y made it worse" OR "X and Y occurred simultaneously")' : ''}
3. Pick a random severity level (low, moderate, high, or critical) - don't always pick the same one!
4. Describe where on the wafer this problem appears
5. ${isHybrid ? 'Show BOTH patterns in the spatial distribution (e.g., edge issues + center cluster)' : ''}
6. Explain what went wrong in SIMPLE words (like "the machine got too hot" or "dust particles landed on the wafer")
7. ${forcedDefect === "Perfect Run" ? "For perfect runs: describe near-perfect manufacturing conditions with maybe one tiny issue" : "Make it messy and realistic - real manufacturing has problems!"}

Use everyday language. Pretend you're explaining to someone who's learning for the first time.


Respond with ONLY this JSON (no markdown, no code blocks):

{
  "defectType": "${forcedDefect}",
  "severity": "<pick ONE: low, moderate, high, or critical - choose randomly!>",
  "region": "<where the problem is: edge, center, radial, random, cluster, linear, or none>",
  "description": "<Explain in 1-2 simple sentences what went wrong. Use everyday words like: 'the machine', 'temperature', 'dust', 'chemicals', 'timing was off', etc. No complex technical jargon!>",
  "dieDistribution": {
    "premium": 0,
    "standard": 0,
    "economy": 0,
    "faulty": 0,
    "dead": 0
  },
  "spatialPattern": "<Describe the pattern in simple words, like: 'failures mostly at the edges', 'problems spread randomly', 'cluster of bad chips in one area', etc.>"
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

            // Override die distribution with our own randomized engine
            // so results aren't dependent on LLM numeric accuracy
            defectData.dieDistribution = generateDistribution(
                totalDies,
                defectData.severity,
                defectData.defectType
            );

            return defectData;

        } catch (error) {
            console.error("AI Model 1 failed:", error);
            throw error;
        }
    }
};

function generateDistribution(totalDies, severity, defectType) {
    let baseFailureRate;

    switch (severity) {
        case "low":
            baseFailureRate = 0.05 + (Math.random() * 0.04 - 0.02);
            break;
        case "moderate":
            baseFailureRate = 0.12 + (Math.random() * 0.08 - 0.04);
            break;
        case "high":
            baseFailureRate = 0.25 + (Math.random() * 0.15 - 0.075);
            break;
        case "critical":
            baseFailureRate = 0.45 + (Math.random() * 0.20 - 0.10);
            break;
        default:
            baseFailureRate = 0.10 + (Math.random() * 0.06 - 0.03);
    }

    // Catastrophic defects can push failure rates much higher
    const catastrophicDefects = ["Wafer Bow Distortion", "Thermal Stress Fracture", "Chemical Vapor Deposition Defect"];
    if (catastrophicDefects.includes(defectType)) {
        baseFailureRate = Math.min(baseFailureRate * (1.5 + Math.random()), 0.85);
    }

    const clusterMultiplier = 1 + (Math.random() * 0.4 - 0.2);
    const failedDies = Math.floor(totalDies * baseFailureRate * clusterMultiplier);
    const remainingDies = totalDies - failedDies;

    const premiumRate = 0.5 + (Math.random() * 0.3 - 0.15);
    const standardRate = 0.2 + (Math.random() * 0.2 - 0.1);

    const premium = Math.floor(remainingDies * premiumRate);
    const standard = Math.floor(remainingDies * standardRate);
    const economy = remainingDies - premium - standard;

    const faultyRate = 0.6 + (Math.random() * 0.3 - 0.15);
    const faulty = Math.floor(failedDies * faultyRate);
    const dead = failedDies - faulty;

    return {
        premium: Math.max(0, premium),
        standard: Math.max(0, standard),
        economy: Math.max(0, economy),
        faulty: Math.max(0, faulty),
        dead: Math.max(0, dead)
    };
}
