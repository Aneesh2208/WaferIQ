const TrainingData = {
    totalScenarios: 1000000,
    scenariosByPattern: {
        'Edge Die Failure': 250000,
        'Center Particle Contamination': 150000,
        'Radial Pattern Defect': 120000,
        'Random Defect Scatter': 200000,
        'Cluster Failure': 100000,
        'Scratch Pattern': 80000,
        'No Defect (Perfect Run)': 100000
    },
    
    getInfo() {
        return {
            total: this.totalScenarios,
            byPattern: this.scenariosByPattern
        };
    }
};

console.log(`🧠 Training Database: ${TrainingData.totalScenarios.toLocaleString()} scenarios`);
