let mlModelReady = false;

// Silent audio context prevents browser from throttling background tabs during training
function keepAlive() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    return { stop() { oscillator.stop(); ctx.close(); } };
}

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
    const audio = keepAlive();

    try {
        loadingText.textContent = 'Training ML Model...';
        loadingSubtext.textContent = 'Training on 50,000 synthetic wafer patterns';

        if (!mlModelReady) {
            await MLPatternRecognition.trainModel();
            mlModelReady = true;
        }
        await sleep(500);

        loadingText.textContent = 'Generating Defects...';
        loadingSubtext.textContent = 'LLM simulating realistic manufacturing defects';
        await sleep(300);

        const defectData = await DefectGeneratorAI.generateRealisticDefects(
            waferDiameter, dieSize, productionLine
        );

        const totalDies = Object.values(defectData.dieDistribution).reduce((a, b) => a + b, 0);

        loadingText.textContent = 'Calculating Financials...';
        loadingSubtext.textContent = 'Computing revenue, costs, and profit';
        await sleep(400);

        const financials = FinancialCalculator.calculate(defectData.dieDistribution, waferDiameter);

        loadingText.textContent = 'Rendering Wafer Map...';
        loadingSubtext.textContent = 'Drawing die-level visualization';
        await sleep(300);

        WaferRenderer.renderWafer(waferDiameter, dieSize, defectData.dieDistribution, defectData.defectType);

        loadingText.textContent = 'ML Pattern Recognition...';
        loadingSubtext.textContent = 'Neural network analyzing spatial pattern';
        await sleep(400);

        const spatialData = WaferRenderer.extractSpatialFeatures();
        const mlPrediction = await MLPatternRecognition.predictFromSpatial(spatialData, waferDiameter, dieSize);

        loadingText.textContent = 'Analyzing Defects...';
        loadingSubtext.textContent = 'LLM diagnosing root causes';
        await sleep(300);

        const waferData = { waferDiameter, dieSize, productionLine, totalDies };
        const analysis = await DefectAnalyzerAI.analyzeDefects(waferData, defectData, financials);

        loadingText.textContent = 'Saving to Knowledge Base...';
        loadingSubtext.textContent = 'Building intelligence for future analyses';
        await sleep(200);

        const spatialFeatures = DefectAnalyzerAI.extractSpatialFeatures(defectData);
        WaferDatabase.save({
            waferData, defectData,
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

        loadingText.textContent = 'Done';
        loadingSubtext.textContent = 'Analysis complete';
        await sleep(300);

        FinancialCalculator.updateUI(financials);
        displayAnalysis(defectData, analysis, mlPrediction);

        console.log(`Result: ${defectData.defectType} | ML: ${mlPrediction.pattern} (${mlPrediction.confidence})`);

    } catch (error) {
        console.error('Analysis failed:', error);
        loadingText.textContent = 'Analysis Failed';
        loadingSubtext.textContent = error.message;
    } finally {
        audio.stop();
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
    diagnosisBadge.title = `${defectData.defectType}: ${defectData.description || 'See Defect Types for details'}`;
    diagnosisBadge.style.cursor = 'help';

    document.getElementById('rootCauseList').innerHTML =
        analysis.rootCauses.map(cause => `<li class="root-cause-item">${cause}</li>`).join('');

    const detailedAnalysis = document.getElementById('detailedAnalysis');
    detailedAnalysis.innerHTML = `
        <div class="simple-explanation">
            <strong>What Happened</strong>
            ${analysis.simpleExplanation}
        </div>

        ${analysis.reasoning && analysis.reasoning.length > 0 ? `
        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">AI Detective Reasoning</h4>
            <div class="analysis-content">
                <ol style="padding-left: 1.5rem; margin: 0;">
                    ${analysis.reasoning.map(step => `<li style="margin-bottom: 0.8rem; line-height: 1.6;">${step}</li>`).join('')}
                </ol>
            </div>
        </div>
        ` : ''}

        ${analysis.uniqueFeatures ? `
        <div class="analysis-section" style="background: rgba(255, 193, 7, 0.1); border-left: 3px solid #ffc107;">
            <h4 style="margin-bottom: 1rem; color: #ffc107;">What Makes This Case Unique</h4>
            <div class="analysis-content">${analysis.uniqueFeatures}</div>
        </div>
        ` : ''}

        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">Defect Generator (LLM)</h4>
            <div class="analysis-content">
                <strong>Defect:</strong> ${defectData.defectType}<br>
                <strong>Severity:</strong> ${defectData.severity}<br>
                <strong>Region:</strong> ${defectData.region}<br>
                <strong>Pattern:</strong> ${defectData.spatialPattern}
            </div>
        </div>

        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">ML Pattern Recognition</h4>
            <div class="analysis-content">
                <strong>Predicted Pattern:</strong> ${mlPrediction.pattern} (${mlPrediction.confidence})<br>
                ${mlPrediction.top3 ? `<div style="margin-top: 0.5rem;">
                    ${mlPrediction.top3.map((p, i) => `<div style="display: flex; justify-content: space-between; padding: 0.25rem 0; ${i === 0 ? 'color: var(--accent); font-weight: 600;' : 'color: var(--text-secondary);'}">
                        <span>${i + 1}. ${p.pattern}</span><span>${p.confidence}</span>
                    </div>`).join('')}
                </div>` : ''}
            </div>
        </div>

        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">Defect Analyzer (LLM)</h4>
            <div class="analysis-content">${analysis.technicalAnalysis}</div>
        </div>

        <div class="analysis-section">
            <h4 style="margin-bottom: 1rem; color: var(--text-secondary);">Recommendations</h4>
            <div class="analysis-content">
                <ul style="padding-left: 1.5rem; margin: 0;">
                    ${analysis.recommendations.map(rec => {
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

// Modal handlers
document.getElementById('defectInfoBtn').addEventListener('click', () => {
    document.getElementById('defectInfoModal').classList.add('active');
});
document.getElementById('closeDefectInfo').addEventListener('click', () => {
    document.getElementById('defectInfoModal').classList.remove('active');
});
document.getElementById('defectInfoModal').addEventListener('click', (e) => {
    if (e.target.id === 'defectInfoModal') e.target.classList.remove('active');
});

// Database export
document.getElementById('exportDatabaseBtn').addEventListener('click', () => {
    WaferDatabase.export();
    const modal = document.getElementById('exportModal');
    document.getElementById('exportModalBody').innerHTML = `
        <div class="stat-card" style="margin-bottom: 1.25rem;">
            <div class="stat-card-label">Export Complete</div>
            <div class="stat-card-value">${WaferDatabase.cases.length} cases</div>
            <div class="stat-card-sub">File downloaded to your system</div>
        </div>
        <div class="stats-section">
            <div class="stats-section-title">To Commit to Git</div>
            <ol class="export-steps">
                <li><span>1.</span> Save file as data/wafer-database-seed.json</li>
                <li><span>2.</span> git add data/wafer-database-seed.json</li>
                <li><span>3.</span> git commit -m "Update trained database"</li>
                <li><span>4.</span> git push</li>
            </ol>
        </div>
    `;
    modal.classList.add('active');
});
document.getElementById('closeExportModal').addEventListener('click', () => {
    document.getElementById('exportModal').classList.remove('active');
});
document.getElementById('exportModal').addEventListener('click', (e) => {
    if (e.target.id === 'exportModal') e.target.classList.remove('active');
});

// Database stats
document.getElementById('databaseStatsBtn').addEventListener('click', () => {
    const insights = WaferDatabase.getStatisticalInsights();
    const modal = document.getElementById('dbStatsModal');
    const body = document.getElementById('dbStatsBody');

    if (insights.totalCases < 5) {
        body.innerHTML = `
            <div class="stat-card" style="text-align: center; padding: 2rem;">
                <div class="stat-card-value">${insights.totalCases}</div>
                <div class="stat-card-label" style="margin-top: 0.5rem;">Cases Analyzed</div>
                <div class="stat-card-sub" style="margin-top: 1rem;">Need at least 5 cases to show full statistics.<br>Keep analyzing wafers to build intelligence!</div>
            </div>
        `;
    } else {
        const sev = insights.severityStats || {};
        const sevTotal = (sev.low || 0) + (sev.moderate || 0) + (sev.high || 0) + (sev.critical || 0);
        const sevMax = Math.max(sev.low || 0, sev.moderate || 0, sev.high || 0, sev.critical || 0, 1);

        body.innerHTML = `
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-card-label">Total Cases</div>
                    <div class="stat-card-value">${insights.totalCases}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">Hybrid Patterns</div>
                    <div class="stat-card-value small">${insights.hybridPatterns?.seen || 0}</div>
                    <div class="stat-card-sub">${insights.hybridPatterns?.percentage || '0%'} of all cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">Edge Patterns</div>
                    <div class="stat-card-value small">${insights.edgePatterns?.seen || 0}</div>
                    <div class="stat-card-sub">${insights.edgePatterns?.percentage || '0%'} of all cases</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">Center Patterns</div>
                    <div class="stat-card-value small">${insights.centerPatterns?.seen || 0}</div>
                    <div class="stat-card-sub">${insights.centerPatterns?.percentage || '0%'} of all cases</div>
                </div>
            </div>

            <div class="stats-section">
                <div class="stats-section-title">Severity Distribution (${sevTotal} cases)</div>
                ${['low', 'moderate', 'high', 'critical'].map(level => `
                    <div class="severity-bar-row">
                        <div class="severity-bar-label">${level}</div>
                        <div class="severity-bar-track">
                            <div class="severity-bar-fill ${level}" style="width: ${((sev[level] || 0) / sevMax) * 100}%"></div>
                        </div>
                        <div class="severity-bar-count">${sev[level] || 0}</div>
                    </div>
                `).join('')}
            </div>

            <div class="stats-section">
                <div class="stats-section-title">Most Common Diagnoses</div>
                ${(insights.commonDiagnoses || []).slice(0, 5).map(d => `
                    <div class="diagnosis-list-item">
                        <div class="diagnosis-list-text">${d.diagnosis}</div>
                        <div class="diagnosis-list-count">${d.count} · ${d.percentage}</div>
                    </div>
                `).join('') || '<div style="color: var(--text-secondary); font-size: 0.85rem;">Building diagnosis patterns...</div>'}
            </div>
        `;
    }

    modal.classList.add('active');
});
document.getElementById('closeDbStats').addEventListener('click', () => {
    document.getElementById('dbStatsModal').classList.remove('active');
});
document.getElementById('dbStatsModal').addEventListener('click', (e) => {
    if (e.target.id === 'dbStatsModal') e.target.classList.remove('active');
});

// Init
window.addEventListener("load", () => {
    WaferRenderer.init();

    // Hover popups for cost breakdown cards
    document.querySelectorAll('.metric-card').forEach(card => {
        const popup = card.querySelector('.cost-breakdown-popup');
        if (!popup) return;
        card.addEventListener('mouseenter', () => {
            if (popup.innerHTML.trim()) popup.classList.add('visible');
        });
        card.addEventListener('mouseleave', () => {
            popup.classList.remove('visible');
        });
    });

    console.log(`WaferIQ loaded | Database: ${WaferDatabase.cases.length} cases`);
});
