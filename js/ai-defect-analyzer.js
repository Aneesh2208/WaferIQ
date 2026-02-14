const DefectAnalyzerAI = {
    async analyzeDefects(waferData, defectData, financials) {
        console.log("🔵 AI MODEL 2: Defect Analyzer Starting...");

        const prompt = `You are an expert semiconductor manufacturing diagnostician AI.

WAFER INFO:
- Diameter: ${waferData.waferDiameter}mm
- Die Size: ${waferData.dieSize}mm²
- Process Node: ${waferData.productionLine}
- Total Dies: ${waferData.totalDies}

DEFECT DATA:
- Type: ${defectData.defectType}
- Severity: ${defectData.severity}
- Region: ${defectData.region}
- Pattern: ${defectData.spatialPattern}

FINANCIAL IMPACT:
- Gross Revenue: $${financials.grossRevenue}
- Total Costs: $${financials.totalCosts}
- Net Profit: $${financials.netProfit}
- Yield Rate: ${financials.yieldRate}%

Respond ONLY with JSON:

{
  "confidence": <85-99>,
  "diagnosis": "<diagnosis>",
  "rootCauses": ["<cause1>", "<cause2>", "<cause3>"],
  "simpleExplanation": "<simple explanation>",
  "technicalAnalysis": "<detailed analysis>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "severity": "<severity>",
  "processingSteps": ["<step1>", "<step2>"]
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
            return data.result;


        } catch (error) {
            console.error("❌ AI MODEL 2 FAILED:", error);
            throw error;
        }
    }
};

console.log("🔵 AI Model 2 (OpenAI) Loaded");
