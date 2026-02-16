let mlModelReady = false;

document.getElementById('dieSize').addEventListener('input', (e) => {
    document.getElementById('dieSizeSlider').value = e.target.value;
    document.getElementById('dieSizeValue').textContent = `${e.target.value} mm²`;
});

document.getElementById('dieSizeSlider').addEventListener('input', (e) => {
    document.getElementById('dieSize').value = e.target.value;
    document.getElementById('dieSizeValue').textContent = `${e.target.value} mm²`;
});

document.getElementById('startRun').addEventListener('click', async () => {
    await runDualAIAnalysis();
});

async function runDualAIAnalysis() {
    const waferDiameter = parseInt(document.getElementById('waferDiameter').value);
    const dieSize = parseInt(document.getElementById('dieSize').value);
    const productionLine = document.getElementById('productionLine').value;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.getElementById('loadingSubtext');
    const startBtn = document.getElementById('startRun');
    
    loadingOverlay.classList.add('active');
    startBtn.disabled = true;
    
    try {
        console.log('═══════════════════════════════════════');
        console.log('🚀 DUAL AI + ML ANALYSIS STARTING');
        console.log('═══════════════════════════════════════');
        
        loadingText.textContent = '🧠 Training ML Model...';
        loadingSubtext.textContent = 'Training on 50,000 real wafer patterns + 15 expert cases';
        
        if (!mlModelReady) {
            await MLPatternRecognition.trainModel();
            mlModelReady = true;
        }
        await sleep(500);
        
        loadingText.textContent = '🔴 AI MODEL 1: Generating Defects...';
        loadingSubtext.textContent = 'AI simulating realistic manufacturing defects';
        await sleep(300);
        
        const defectData = await DefectGeneratorAI.generateRealisticDefects(
            waferDiameter,
            dieSize,
            productionLine
        );
        
        const totalDies = Object.values(defectData.dieDistribution).reduce((a, b) => a + b, 0);
        
        loadingText.textContent = '💰 Calculating Financials...';
        loadingSubtext.textContent = 'Computing revenue, costs, and profit';
        await sleep(400);
        
        const financials = FinancialCalculator.calculate(
            defectData.dieDistribution,
            waferDiameter
        );
        
        loadingText.textContent = '🎨 Rendering Wafer Map...';
        loadingSubtext.textContent = 'Drawing die-level visualization';
        await sleep(300);
        
        WaferRenderer.renderWafer(
    waferDiameter,
    dieSize,
    defectData.dieDistribution,
    defectData.defectType
);

        loadingText.textContent = '🧠 ML Pattern Recognition...';
        loadingSubtext.textContent = 'Neural network analyzing pattern';
        await sleep(400);
        
        const mlPrediction = await MLPatternRecognition.predictPattern(
            defectData.dieDistribution,
            waferDiameter,
            dieSize
        );
        
        loadingText.textContent = '🔵 AI MODEL 2: Analyzing Defects...';
        loadingSubtext.textContent = 'AI diagnosing root causes';
        await sleep(300);
        
        const waferData = {
            waferDiameter,
            dieSize,
            productionLine,
            totalDies
        };
        
        const analysis = await DefectAnalyzerAI.analyzeDefects(
            waferData,
            defectData,
            financials
        );
        
        loadingText.textContent = '💾 Saving to Knowledge Base...';
        loadingSubtext.textContent = 'Building intelligence for future analyses';
        await sleep(200);

        // 💾 SAVE TO DATABASE - Build knowledge base!
        const spatialFeatures = DefectAnalyzerAI.extractSpatialFeatures(defectData);
        const caseId = WaferDatabase.save({
            waferData,
            defectData,
            dieDistribution: defectData.dieDistribution,
            spatialFeatures,
            aiDiagnosis: analysis.diagnosis,
            rootCauses: analysis.rootCauses,
            confidence: analysis.confidence,
            severity: analysis.severity,
            mlPrediction: mlPrediction.pattern,
            mlConfidence: mlPrediction.confidence,
            reasoning: analysis.reasoning || [],
            financials
        });

        console.log(`💾 Case ${caseId} saved | Total cases: ${WaferDatabase.cases.length}`);

        loadingText.textContent = '📊 Displaying Results...';
        loadingSubtext.textContent = 'System is learning from this analysis!';
        await sleep(300);

        FinancialCalculator.updateUI(financials);
        displayAnalysis(defectData, analysis, mlPrediction);

        console.log('═══════════════════════════════════════');
        console.log('✅ DUAL AI + ML ANALYSIS COMPLETE');
        console.log('═══════════════════════════════════════');
        console.log('🔴 AI Model 1:', defectData.defectType);
        console.log('🔵 AI Model 2:', analysis.diagnosis);
        console.log('🧠 ML Prediction:', mlPrediction.pattern, `(${mlPrediction.confidence}%)`);
        console.log('═══════════════════════════════════════');
        
    } catch (error) {
        console.error('💥 CRITICAL FAILURE:', error);
        loadingText.textContent = '❌ AI Analysis Failed';
        loadingSubtext.textContent = error.message;
        alert(`AI SYSTEM FAILURE:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            startBtn.disabled = false;
        }, 800);
    }
}

function displayAnalysis(defectData, analysis, mlPrediction) {
    const diagnosisBadge = document.getElementById('diagnosisBadge');
    diagnosisBadge.textContent = defectData.defectType;
    diagnosisBadge.style.background = 'rgba(0,200,83,0.2)';
    diagnosisBadge.style.color = 'var(--success)';

    // Add tooltip with defect description
    diagnosisBadge.title = `${defectData.defectType}: ${defectData.description || 'Click "Defect Types" button for full explanation'}`;
    diagnosisBadge.style.cursor = 'help'; // Show help cursor on hover

    document.getElementById('confidenceValue').textContent = `${analysis.confidence}%`;
    document.getElementById('confidenceFill').style.width = `${analysis.confidence}%`;
    
    document.getElementById('rootCauseList').innerHTML = 
        analysis.rootCauses.map(cause => `<li class="root-cause-item">• ${cause}</li>`).join('');
    
    const detailedAnalysis = document.getElementById('detailedAnalysis');
    detailedAnalysis.innerHTML = `
        <div class="simple-explanation">
            <strong>💡 What Happened</strong>
            ${analysis.simpleExplanation}
        </div>

        ${analysis.reasoning && analysis.reasoning.length > 0 ? `
        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">🕵️ AI Detective Reasoning</h4>
            <div class="analysis-content">
                <ol style="padding-left: 1.5rem; margin: 0;">
                    ${analysis.reasoning.map(step => `<li style="margin-bottom: 0.8rem; line-height: 1.6;">${step}</li>`).join('')}
                </ol>
            </div>
        </div>
        ` : ''}

        ${analysis.uniqueFeatures ? `
        <div class="analysis-section" style="background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107;">
            <h4 style="margin-bottom: 1rem; color: #ffc107;">⚡ What Makes This Case Unique</h4>
            <div class="analysis-content">${analysis.uniqueFeatures}</div>
        </div>
        ` : ''}

        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">🔴 AI Model 1 (Defect Generator)</h4>
            <div class="analysis-content">
                <strong>Generated Defect:</strong> ${defectData.defectType}<br>
                <strong>Severity:</strong> ${defectData.severity}<br>
                <strong>Region:</strong> ${defectData.region}<br>
                <strong>Pattern:</strong> ${defectData.spatialPattern}
            </div>
        </div>
        
        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">🧠 ML Pattern Recognition</h4>
            <div class="analysis-content">
                <strong>Predicted Pattern:</strong> ${mlPrediction.pattern}<br>
                <strong>ML Confidence:</strong> ${mlPrediction.confidence}<br>
                <strong>Model Status:</strong> Neural network trained on 20,000 realistic samples
            </div>
        </div>
        
        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">🔵 AI Model 2 (Defect Analyzer)</h4>
            <div class="analysis-content">${analysis.technicalAnalysis}</div>
        </div>
        
        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">✅ Recommendations</h4>
            <div class="analysis-content">
                <ul style="padding-left: 1.5rem; margin: 0;">
                    ${analysis.recommendations.map(rec => {
                        // Handle both string and object cases
                        const recText = typeof rec === 'string' ? rec : (rec.recommendation || rec.text || JSON.stringify(rec));
                        return `<li style="margin-bottom: 0.5rem;">${recText}</li>`;
                    }).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('aiAnalysisCard').style.display = 'block';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Defect Info Modal handlers
document.getElementById('defectInfoBtn').addEventListener('click', () => {
    document.getElementById('defectInfoModal').classList.add('active');
});

document.getElementById('closeDefectInfo').addEventListener('click', () => {
    document.getElementById('defectInfoModal').classList.remove('active');
});

// Close modal when clicking outside
document.getElementById('defectInfoModal').addEventListener('click', (e) => {
    if (e.target.id === 'defectInfoModal') {
        document.getElementById('defectInfoModal').classList.remove('active');
    }
});

// Database Management Buttons
document.getElementById('exportDatabaseBtn').addEventListener('click', () => {
    WaferDatabase.export();
    alert(`📦 Database exported!\n\nTotal cases: ${WaferDatabase.cases.length}\n\n✅ TO COMMIT TO GIT:\n1. Save downloaded file as "data/wafer-database-seed.json"\n2. git add data/wafer-database-seed.json\n3. git commit -m "Update trained database"\n4. git push\n\nNow your trained data will be in git!`);
});

document.getElementById('databaseStatsBtn').addEventListener('click', () => {
    const insights = WaferDatabase.getStatisticalInsights();
    const stats = `
📊 DATABASE STATISTICS

Total Cases Analyzed: ${insights.totalCases}

${insights.totalCases >= 5 ? `
Edge Patterns: ${insights.edgePatterns?.seen || 0} cases
Center Patterns: ${insights.centerPatterns?.seen || 0} cases
Hybrid Patterns: ${insights.hybridPatterns?.seen || 0} cases (${insights.hybridPatterns?.percentage || '0%'})

Severity Distribution:
  • Low: ${insights.severityStats?.low || 0}
  • Moderate: ${insights.severityStats?.moderate || 0}
  • High: ${insights.severityStats?.high || 0}
  • Critical: ${insights.severityStats?.critical || 0}

Most Common Diagnoses:
${insights.commonDiagnoses?.slice(0, 3).map(d => `  • ${d.diagnosis}: ${d.count} (${d.percentage})`).join('\n') || '  Building...'}
` : '\nNeed at least 5 cases to show statistics.\nKeep analyzing wafers to build intelligence!'}

💡 Tip: Use "Export DB" to save for git commit!
    `.trim();

    alert(stats);
    console.log('📊 Database Statistics:', insights);
});

window.addEventListener("load", () => {
    WaferRenderer.init();
    console.log("🚀 Semiconductor Yield Intelligence Platform Loaded");
    console.log("🔴 AI Model 1: Defect Generator (LM Studio - LLaMA 3)");
    console.log("🔵 AI Model 2: Defect Analyzer (LM Studio - LLaMA 3)");
    console.log("🧠 ML Model: Pattern Recognition (TensorFlow.js)");
    console.log(`📚 Database: ${WaferDatabase.cases.length} cases loaded`);
});

