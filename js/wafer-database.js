// 📚 INTELLIGENT WAFER DEFECT DATABASE
// Stores past analyses and extracts statistical insights

const WaferDatabase = {
    cases: [],

    async init() {
        this.load(); // Load from localStorage first
        await this.loadSeedData(); // Then merge with seed data from git
        console.log(`📚 Wafer Database initialized: ${this.cases.length} cases total`);
        console.log(`💡 Use WaferDatabase.export() to backup for git commit`);
    },

    // Save new case to database
    save(waferCase) {
        waferCase.id = `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        waferCase.timestamp = new Date().toISOString();

        this.cases.push(waferCase);

        // Persist to localStorage
        try {
            localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
            console.log(`💾 Saved case ${waferCase.id} | Total: ${this.cases.length} cases`);
        } catch (e) {
            console.warn('⚠️ Database storage limit reached, clearing old cases...');
            this.cases = this.cases.slice(-500); // Keep only last 500
            localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
        }

        return waferCase.id;
    },

    // Load database from localStorage
    load() {
        try {
            const data = localStorage.getItem('waferDatabase');
            this.cases = data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load database:', e);
            this.cases = [];
        }
    },

    // Find similar past cases using cosine similarity
    findSimilar(currentFeatures, topK = 5) {
        if (this.cases.length === 0) {
            return [];
        }

        const similarities = this.cases
            .filter(c => c.spatialFeatures) // Only cases with features
            .map(c => ({
                case: c,
                similarity: this.cosineSimilarity(currentFeatures, c.spatialFeatures),
                id: c.id,
                diagnosis: c.aiDiagnosis,
                timestamp: c.timestamp
            }))
            .filter(s => s.similarity > 0.3) // Only reasonably similar cases
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);

        return similarities;
    },

    // Cosine similarity between two feature vectors
    cosineSimilarity(featuresA, featuresB) {
        // Convert to arrays if objects
        const vecA = Array.isArray(featuresA) ? featuresA : Object.values(featuresA);
        const vecB = Array.isArray(featuresB) ? featuresB : Object.values(featuresB);

        let dotProduct = 0;
        let magA = 0;
        let magB = 0;

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

    // Extract statistical insights from all accumulated data
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

    // Analyze patterns with high edge concentration
    analyzeEdgePatterns() {
        const edgeCases = this.cases.filter(c =>
            c.spatialFeatures?.edgeConcentration > 0.6
        );

        if (edgeCases.length === 0) return { seen: 0 };

        const diagnoses = {};
        edgeCases.forEach(c => {
            const diag = c.aiDiagnosis || 'Unknown';
            diagnoses[diag] = (diagnoses[diag] || 0) + 1;
        });

        // Convert to percentages
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

    // Analyze patterns with high center concentration
    analyzeCenterPatterns() {
        const centerCases = this.cases.filter(c =>
            c.spatialFeatures?.centerConcentration > 0.5
        );

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

    // Analyze cluster patterns
    analyzeClusterPatterns() {
        const clusterCases = this.cases.filter(c =>
            c.spatialFeatures?.clusterDetected === true
        );

        if (clusterCases.length === 0) return { seen: 0 };

        return {
            seen: clusterCases.length,
            percentage: ((clusterCases.length / this.cases.length) * 100).toFixed(1) + '%'
        };
    },

    // Analyze hybrid/multi-stage patterns
    analyzeHybridPatterns() {
        const hybridCases = this.cases.filter(c => {
            const sf = c.spatialFeatures;
            if (!sf) return false;

            const hasEdge = (sf.edgeConcentration || 0) > 0.5;
            const hasCenter = (sf.centerConcentration || 0) > 0.3;
            const hasCluster = sf.clusterDetected;

            // Hybrid = multiple spatial signatures
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

    // Analyze failure severity distribution
    analyzeSeverity() {
        const severities = {
            low: 0,      // < 20% failure
            moderate: 0, // 20-40%
            high: 0,     // 40-60%
            critical: 0  // > 60%
        };

        this.cases.forEach(c => {
            if (!c.dieDistribution) return;

            const total = Object.values(c.dieDistribution).reduce((a, b) => a + b, 0);
            const failures = (c.dieDistribution.faulty || 0) + (c.dieDistribution.dead || 0);
            const failureRate = failures / total;

            if (failureRate < 0.2) severities.low++;
            else if (failureRate < 0.4) severities.moderate++;
            else if (failureRate < 0.6) severities.high++;
            else severities.critical++;
        });

        return severities;
    },

    // Get most common diagnoses
    getCommonDiagnoses() {
        const diagnoses = {};

        this.cases.forEach(c => {
            const diag = c.aiDiagnosis || 'Unknown';
            diagnoses[diag] = (diagnoses[diag] || 0) + 1;
        });

        // Sort by frequency
        return Object.entries(diagnoses)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([diag, count]) => ({
                diagnosis: diag,
                count: count,
                percentage: ((count / this.cases.length) * 100).toFixed(1) + '%'
            }));
    },

    // Clear database (for testing)
    clear() {
        if (confirm('⚠️ Clear ALL database cases? This cannot be undone!')) {
            this.cases = [];
            localStorage.removeItem('waferDatabase');
            console.log('🗑️ Database cleared');
            return true;
        }
        return false;
    },

    // Export database as JSON (for git commit)
    export() {
        const dataStr = JSON.stringify(this.cases, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `wafer-database-backup-${Date.now()}.json`;
        link.click();

        console.log(`📦 Exported ${this.cases.length} cases to JSON file`);
        console.log('💡 TO COMMIT TO GIT:');
        console.log('   1. Save the downloaded file as "data/wafer-database-seed.json"');
        console.log('   2. git add data/wafer-database-seed.json');
        console.log('   3. git commit -m "Update trained database"');
        console.log('   4. git push');

        return dataStr;
    },

    // Import database from JSON file
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);

                    if (!Array.isArray(imported)) {
                        throw new Error('Invalid database format');
                    }

                    // Merge with existing cases (avoid duplicates by ID)
                    const existingIds = new Set(this.cases.map(c => c.id));
                    const newCases = imported.filter(c => !existingIds.has(c.id));

                    this.cases.push(...newCases);
                    localStorage.setItem('waferDatabase', JSON.stringify(this.cases));

                    console.log(`📥 Imported ${newCases.length} new cases (${imported.length - newCases.length} duplicates skipped)`);
                    console.log(`📊 Total database: ${this.cases.length} cases`);

                    resolve(newCases.length);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // Load seed data from project file (for fresh deployments)
    async loadSeedData() {
        try {
            const response = await fetch('data/wafer-database-seed.json');
            if (response.ok) {
                const seedData = await response.json();
                if (seedData && seedData.length > 0) {
                    console.log(`🌱 Found ${seedData.length} seed cases in project`);

                    // Merge with localStorage (prioritize localStorage)
                    const existingIds = new Set(this.cases.map(c => c.id));
                    const newSeedCases = seedData.filter(c => !existingIds.has(c.id));

                    if (newSeedCases.length > 0) {
                        this.cases.push(...newSeedCases);
                        localStorage.setItem('waferDatabase', JSON.stringify(this.cases));
                        console.log(`📥 Loaded ${newSeedCases.length} seed cases from project`);
                    }
                }
            }
        } catch (e) {
            console.log('📂 No seed data found (this is normal for new installations)');
        }
    }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
    window.WaferDatabase = WaferDatabase;
    WaferDatabase.init();
}
