const DefectAnalyzerAI = {
    async analyzeDefects(waferData, defectData, financials) {
        console.log("AI Model 2: Analyzing defects...");

        const spatialFeatures = this.extractSpatialFeatures(defectData);
        const similarCases = WaferDatabase.findSimilar(spatialFeatures, 5);
        const insights = WaferDatabase.getStatisticalInsights();

        console.log(`  Database: ${insights.totalCases} past cases | ${similarCases.length} similar found`);

        const prompt = `You are a DETECTIVE analyzing semiconductor manufacturing defects. Think step-by-step. Don't just pattern match - REASON through the evidence.

=== CURRENT WAFER EVIDENCE ===

PHYSICAL OBSERVATIONS:
- Wafer: ${waferData.waferDiameter}mm diameter, ${waferData.totalDies} chips total
- Chip size: ${waferData.dieSize}mm²
- Technology: ${waferData.productionLine}

DEFECT PATTERN OBSERVED:
- Initial diagnosis label: "${defectData.defectType}"
- Severity observed: ${defectData.severity}
- Spatial pattern: ${defectData.spatialPattern}
- Location: ${defectData.region} region
- Event description: ${defectData.description}

DIE DISTRIBUTION (The Evidence):
- Premium quality: ${defectData.dieDistribution.premium} chips (${((defectData.dieDistribution.premium / waferData.totalDies) * 100).toFixed(1)}%)
- Standard quality: ${defectData.dieDistribution.standard} chips (${((defectData.dieDistribution.standard / waferData.totalDies) * 100).toFixed(1)}%)
- Economy quality: ${defectData.dieDistribution.economy} chips (${((defectData.dieDistribution.economy / waferData.totalDies) * 100).toFixed(1)}%)
- Faulty: ${defectData.dieDistribution.faulty} chips (${((defectData.dieDistribution.faulty / waferData.totalDies) * 100).toFixed(1)}%)
- Dead: ${defectData.dieDistribution.dead} chips (${((defectData.dieDistribution.dead / waferData.totalDies) * 100).toFixed(1)}%)
- Total failure rate: ${(((defectData.dieDistribution.faulty + defectData.dieDistribution.dead) / waferData.totalDies) * 100).toFixed(1)}%

SPATIAL FEATURES EXTRACTED:
${JSON.stringify(spatialFeatures, null, 2)}

FINANCIAL IMPACT:
- Yield: ${financials.yieldRate}%
- Revenue: $${financials.grossRevenue}
- Profit: $${financials.netProfit}

=== YOUR ACCUMULATED KNOWLEDGE (${insights.totalCases} past cases analyzed) ===

${insights.totalCases >= 5 ? `
STATISTICAL PATTERNS FROM DATABASE:

Edge Pattern Statistics (${insights.edgePatterns?.seen || 0} cases):
${insights.edgePatterns?.commonCauses ? Object.entries(insights.edgePatterns.commonCauses).map(([cause, pct]) => `  - ${cause}: ${pct}`).join('\n') : '  - Not enough data yet'}

Center Pattern Statistics (${insights.centerPatterns?.seen || 0} cases):
${insights.centerPatterns?.commonCauses ? Object.entries(insights.centerPatterns.commonCauses).map(([cause, pct]) => `  - ${cause}: ${pct}`).join('\n') : '  - Not enough data yet'}

Hybrid/Multi-Stage Patterns:
  - Seen ${insights.hybridPatterns?.seen || 0} times (${insights.hybridPatterns?.percentage || '0%'} of all cases)
  - ${insights.hybridPatterns?.note || 'Track these carefully - they\'re complex!'}

Severity Distribution Across All Cases:
  - Low severity: ${insights.severityStats?.low || 0} cases
  - Moderate: ${insights.severityStats?.moderate || 0} cases
  - High: ${insights.severityStats?.high || 0} cases
  - Critical: ${insights.severityStats?.critical || 0} cases

Most Common Diagnoses:
${insights.commonDiagnoses?.slice(0, 5).map(d => `  - ${d.diagnosis}: ${d.count} cases (${d.percentage})`).join('\n') || '  - Building database...'}
` : 'BUILDING KNOWLEDGE BASE... Only ' + insights.totalCases + ' cases so far. Need more data to establish patterns.'}

${similarCases.length > 0 ? `
=== SIMILAR PAST CASES (Cross-Reference) ===

Found ${similarCases.length} similar cases in database:

${similarCases.map((s, i) => `
Case ${i + 1}: ${s.id}
  - Similarity: ${(s.similarity * 100).toFixed(1)}%
  - Past diagnosis: "${s.diagnosis}"
  - Date: ${s.timestamp ? new Date(s.timestamp).toLocaleDateString() : 'Unknown'}
  - Key features: ${JSON.stringify(s.case.spatialFeatures || {}, null, 2)}
  - Root causes found: ${s.case.rootCauses ? s.case.rootCauses.slice(0, 2).join('; ') : 'Not recorded'}
`).join('\n')}

CROSS-REFERENCE QUESTIONS TO ASK YOURSELF:
1. How does this case DIFFER from similar past cases?
2. Do the similar cases suggest a common root cause?
3. Are there any UNIQUE features in this case that weren't in the similar ones?
4. If the initial label says "${defectData.defectType}", do similar past cases support or contradict this?
` : '=== NO SIMILAR CASES FOUND ===\nThis appears to be a NOVEL pattern not seen before in the database!\nYou must analyze it from first principles.'}

=== YOUR DETECTIVE TASK ===

You are NOT a simple pattern matcher. You are a DETECTIVE solving a mystery.

THINK STEP-BY-STEP:

1. OBSERVE THE EVIDENCE:
   - What does the die distribution tell you?
   - What does the spatial pattern reveal?
   - Are there any contradictions in the data?

2. CROSS-REFERENCE YOUR KNOWLEDGE:
   - Have you seen similar patterns before?
   - What do past cases suggest as likely causes?
   - How is THIS case different or unique?

3. APPLY LOGIC AND REASONING:
   - Can a single root cause explain ALL observations?
   - Or is this a multi-stage/hybrid failure?
   - What sequence of events would create this pattern?

4. FORM YOUR DIAGNOSIS:
   - What REALLY happened? (Don't just copy the label!)
   - Why are you confident (or uncertain)?
   - What makes this case unique?

5. EXPLAIN YOUR REASONING:
   - Show your detective work step-by-step
   - Reference similar cases when relevant
   - Point out what differentiates this case

IMPORTANT RULES:
- DON'T just accept the initial label "${defectData.defectType}" - verify it with evidence!
- If spatial patterns contradict the label, say so!
- If this is a hybrid defect, identify BOTH components
- Be honest about uncertainty - it's OK to say "This is rare, only ${similarCases.length} similar cases"
- Use SIMPLE language for simpleExplanation
- Use TECHNICAL language for technicalAnalysis
- SHOW YOUR REASONING in the technicalAnalysis

Respond ONLY with JSON (show your detective work!):

{
  "confidence": <number 70-99 based on evidence strength and past cases>,
  "diagnosis": "<Your final conclusion in ONE clear sentence - what REALLY happened>",
  "reasoning": [
    "Step 1: I observed [specific evidence from die distribution/spatial pattern]",
    "Step 2: This pattern suggests [logical deduction]",
    "Step 3: Cross-referencing with ${similarCases.length} similar cases shows [insight from database]",
    "Step 4: The key differentiator is [what makes this case unique]",
    "Step 5: Therefore, my conclusion is [final diagnosis with reasoning]"
  ],
  "rootCauses": [
    "Primary cause: [specific technical or process issue]",
    "Contributing factor: [secondary issue]",
    "Underlying reason: [systemic or environmental factor]",
    "Optional: [additional cause if relevant]"
  ],
  "simpleExplanation": "Explain in 2-3 sentences using SIMPLE words (like talking to a beginner). Use everyday language: 'the machine', 'temperature', 'dust', 'chemicals', etc.",
  "technicalAnalysis": "DETAILED technical analysis (4-6 sentences): Include your detective work, reference to similar cases if any, statistical insights from database, process-specific details, equipment considerations, and why you reached this conclusion. Show that you THOUGHT about it, didn't just pattern match!",
  "uniqueFeatures": "What makes THIS case different from typical '${defectData.defectType}' cases? What surprised you? What doesn't fit the standard pattern?",
  "recommendations": [
    "Immediate action: [specific fix with parameters]",
    "Root cause fix: [address underlying issue]",
    "Prevention: [how to avoid in future]",
    "Monitoring: [what to watch for]"
  ],
  "severity": "<low|moderate|high|critical>",
  "processingSteps": [
    "Primary failed step",
    "Secondary affected step",
    "Optional third step if relevant"
  ]
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
            console.error("AI Model 2 failed:", error);
            throw error;
        }
    },

    extractSpatialFeatures(defectData) {
        const total = defectData.dieDistribution.premium +
                     defectData.dieDistribution.standard +
                     defectData.dieDistribution.economy +
                     defectData.dieDistribution.faulty +
                     defectData.dieDistribution.dead;

        const failureRate = (defectData.dieDistribution.faulty + defectData.dieDistribution.dead) / total;
        const deadRatio = defectData.dieDistribution.dead / (defectData.dieDistribution.faulty + defectData.dieDistribution.dead + 0.001);

        const region = (defectData.region || '').toLowerCase();
        const pattern = (defectData.spatialPattern || '').toLowerCase();

        return {
            failureRate,
            deadRatio,
            edgeConcentration: region.includes('edge') || pattern.includes('edge') ? 0.7 : 0.2,
            centerConcentration: region.includes('center') || pattern.includes('center') ? 0.7 : 0.2,
            clusterDetected: region.includes('cluster') || pattern.includes('cluster'),
            premiumRatio: defectData.dieDistribution.premium / total,
            severity: defectData.severity,
            region: defectData.region
        };
    }
};
