const WaferDatabase = {
    cases: [],

    async init() {
        this.load();
        await this.loadSeedData();
        console.log(`Database initialized: ${this.cases.length} cases`);
    },

    save(waferCase) {
        waferCase.id = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        waferCase.timestamp = new Date().toISOString();
        this.cases.push(waferCase);

        try {
            localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
            console.log(`Saved case ${waferCase.id} | Total: ${this.cases.length} cases`);
        } catch (e) {
            console.warn('Storage limit reached, trimming old cases...');
            this.cases = this.cases.slice(-500);
            localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
        }

        return waferCase.id;
    },

    load() {
        try {
            const data = localStorage.getItem('waferDatabase');
            this.cases = data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load database:', e);
            this.cases = [];
        }
    },

    findSimilar(currentFeatures, topK = 5) {
        if (this.cases.length === 0) return [];

        return this.cases
            .filter(c => c.spatialFeatures)
            .map(c => ({
                case: c,
                similarity: this.cosineSimilarity(currentFeatures, c.spatialFeatures),
                id: c.id,
                diagnosis: c.aiDiagnosis,
                timestamp: c.timestamp
            }))
            .filter(s => s.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    },

    cosineSimilarity(featuresA, featuresB) {
        const vecA = Array.isArray(featuresA) ? featuresA : Object.values(featuresA);
        const vecB = Array.isArray(featuresB) ? featuresB : Object.values(featuresB);

        let dotProduct = 0, magA = 0, magB = 0;
        const len = Math.min(vecA.length, vecB.length);

        for (let i = 0; i < len; i++) {
            const a = vecA[i] || 0;
            const b = vecB[i] || 0;
            dotProduct += a * b;
            magA += a * a;
            magB += b * b;
        }

        const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
        return magnitude === 0 ? 0 : dotProduct / magnitude;
    },

    getStatisticalInsights() {
        if (this.cases.length < 5) {
            return {
                totalCases: this.cases.length,
                message: 'Not enough data yet. Keep analyzing wafers to build intelligence!'
            };
        }

        return {
            totalCases: this.cases.length,
            edgePatterns: this.analyzeEdgePatterns(),
            centerPatterns: this.analyzeCenterPatterns(),
            clusterPatterns: this.analyzeClusterPatterns(),
            hybridPatterns: this.analyzeHybridPatterns(),
            severityStats: this.analyzeSeverity(),
            commonDiagnoses: this.getCommonDiagnoses()
        };
    },

    analyzeEdgePatterns() {
        const edgeCases = this.cases.filter(c => c.spatialFeatures?.edgeConcentration > 0.6);
        if (edgeCases.length === 0) return { seen: 0 };

        const diagnoses = {};
        edgeCases.forEach(c => {
            const diag = c.aiDiagnosis || 'Unknown';
            diagnoses[diag] = (diagnoses[diag] || 0) + 1;
        });

        const total = edgeCases.length;
        const percentages = {};
        Object.entries(diagnoses).forEach(([diag, count]) => {
            percentages[diag] = ((count / total) * 100).toFixed(1) + '%';
        });

        return {
            seen: total,
            percentage: ((total / this.cases.length) * 100).toFixed(1) + '%',
            commonCauses: percentages
        };
    },

    analyzeCenterPatterns() {
        const centerCases = this.cases.filter(c => c.spatialFeatures?.centerConcentration > 0.5);
        if (centerCases.length === 0) return { seen: 0 };

        const diagnoses = {};
        centerCases.forEach(c => {
            const diag = c.aiDiagnosis || 'Unknown';
            diagnoses[diag] = (diagnoses[diag] || 0) + 1;
        });

        const total = centerCases.length;
        const percentages = {};
        Object.entries(diagnoses).forEach(([diag, count]) => {
            percentages[diag] = ((count / total) * 100).toFixed(1) + '%';
        });

        return {
            seen: total,
            percentage: ((total / this.cases.length) * 100).toFixed(1) + '%',
            commonCauses: percentages
        };
    },

    analyzeClusterPatterns() {
        const clusterCases = this.cases.filter(c => c.spatialFeatures?.clusterDetected === true);
        if (clusterCases.length === 0) return { seen: 0 };

        return {
            seen: clusterCases.length,
            percentage: ((clusterCases.length / this.cases.length) * 100).toFixed(1) + '%'
        };
    },

    analyzeHybridPatterns() {
        const hybridCases = this.cases.filter(c => {
            const sf = c.spatialFeatures;
            if (!sf) return false;

            const hasEdge = (sf.edgeConcentration || 0) > 0.5;
            const hasCenter = (sf.centerConcentration || 0) > 0.3;
            const hasCluster = sf.clusterDetected;

            return (hasEdge && hasCenter) || (hasEdge && hasCluster) || (hasCenter && hasCluster);
        });

        return {
            seen: hybridCases.length,
            percentage: this.cases.length > 0
                ? ((hybridCases.length / this.cases.length) * 100).toFixed(1) + '%'
                : '0%',
            note: hybridCases.length < 3
                ? 'Rare pattern - analyze carefully!'
                : 'Multiple instances observed'
        };
    },

    analyzeSeverity() {
        const severities = { low: 0, moderate: 0, high: 0, critical: 0 };

        this.cases.forEach(c => {
            // Check both top-level and nested dieDistribution
            const dist = c.dieDistribution || c.defectData?.dieDistribution;
            if (!dist) return;

            const total = Object.values(dist).reduce((a, b) => a + b, 0);
            if (total === 0) return;
            const failures = (dist.faulty || 0) + (dist.dead || 0);
            const failureRate = failures / total;

            if (failureRate < 0.2) severities.low++;
            else if (failureRate < 0.4) severities.moderate++;
            else if (failureRate < 0.6) severities.high++;
            else severities.critical++;
        });

        return severities;
    },

    getCommonDiagnoses() {
        const diagnoses = {};
        this.cases.forEach(c => {
            const diag = c.aiDiagnosis || 'Unknown';
            diagnoses[diag] = (diagnoses[diag] || 0) + 1;
        });

        return Object.entries(diagnoses)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([diag, count]) => ({
                diagnosis: diag,
                count: count,
                percentage: ((count / this.cases.length) * 100).toFixed(1) + '%'
            }));
    },

    clear() {
        if (confirm('Clear ALL database cases? This cannot be undone!')) {
            this.cases = [];
            localStorage.removeItem('waferDatabase');
            console.log('Database cleared');
            return true;
        }
        return false;
    },

    export() {
        const dataStr = JSON.stringify(this.cases, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `wafer-database-backup-${Date.now()}.json`;
        link.click();

        console.log(`Exported ${this.cases.length} cases`);
        return dataStr;
    },

    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (!Array.isArray(imported)) throw new Error('Invalid database format');

                    const existingIds = new Set(this.cases.map(c => c.id));
                    const newCases = imported.filter(c => !existingIds.has(c.id));

                    this.cases.push(...newCases);
                    localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
                    console.log(`Imported ${newCases.length} new cases (${imported.length - newCases.length} duplicates skipped)`);
                    resolve(newCases.length);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    async loadSeedData() {
        try {
            const response = await fetch('data/wafer-database-seed.json');
            if (response.ok) {
                const seedData = await response.json();
                if (seedData && seedData.length > 0) {
                    const existingIds = new Set(this.cases.map(c => c.id));
                    const newSeedCases = seedData.filter(c => !existingIds.has(c.id));

                    if (newSeedCases.length > 0) {
                        this.cases.push(...newSeedCases);
                        localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
                        console.log(`Loaded ${newSeedCases.length} seed cases from project`);
                    }
                }
            }
        } catch (e) {
            // No seed file found — normal for fresh installs
        }
    }
};

if (typeof window !== 'undefined') {
    window.WaferDatabase = WaferDatabase;
    WaferDatabase.init();
}
