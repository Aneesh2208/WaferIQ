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
        loadingSubtext.textContent = 'Training neural network on 10,000 patterns';
        
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
        
        loadingText.textContent = '📊 Displaying Results...';
        loadingSubtext.textContent = 'Finalizing analysis';
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
    document.getElementById('diagnosisBadge').textContent = defectData.defectType;
    document.getElementById('diagnosisBadge').style.background = 'rgba(0,200,83,0.2)';
    document.getElementById('diagnosisBadge').style.color = 'var(--success)';
    
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
                <strong>ML Confidence:</strong> ${mlPrediction.confidence}%<br>
                <strong>Probabilities:</strong>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                    ${Object.entries(mlPrediction.probabilities).map(([name, prob]) => 
                        `<li>${name}: ${prob}%</li>`
                    ).join('')}
                </ul>
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
                    ${analysis.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    document.getElementById('aiAnalysisCard').style.display = 'block';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener("load", () => {
    WaferRenderer.init();
    console.log("🚀 Semiconductor Yield Intelligence Platform Loaded");
    console.log("🔴 AI Model 1: Defect Generator (OpenAI)");
    console.log("🔵 AI Model 2: Defect Analyzer (OpenAI)");
    console.log("🧠 ML Model: Pattern Recognition (TensorFlow.js)");
});

