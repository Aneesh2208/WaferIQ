const MLPatternRecognition = {
    model: null,
    trained: false,

    patternNames: [
        'Edge Die Failure',
        'Center Particle Contamination',
        'Radial Pattern Defect',
        'Random Defect Scatter',
        'Cluster Failure',
        'Scratch Pattern',
        'Wafer Bow Distortion',
        'Etch Non-Uniformity',
        'Ion Implantation Drift',
        'Lithography Misalignment',
        'Chemical Vapor Deposition Defect',
        'Metal Layer Delamination',
        'Plasma Damage',
        'Photoresist Residue',
        'Micro-crack Propagation',
        'Thermal Stress Fracture',
        'Cross-Contamination',
        'Incomplete Oxide Formation',
        'Step Coverage Failure',
        'Polysilicon Grain Boundaries',
        'Perfect Run'
    ],

    async initializeModel() {
        console.log('Initializing ML model (128->64->21)...');

        if (!window.tf) {
            await this.loadTensorFlow();
        }

        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    units: 128,
                    activation: 'relu',
                    inputShape: [36],
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.batchNormalization(),
                tf.layers.dropout({ rate: 0.3 }),

                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
                }),
                tf.layers.batchNormalization(),
                tf.layers.dropout({ rate: 0.25 }),

                tf.layers.dense({ units: 21, activation: 'softmax' })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        return this.model;
    },

    async loadTensorFlow() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
            script.onload = () => {
                console.log('TensorFlow.js loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    generateTrainingData(numSamples = 50000) {
        console.log(`Generating ${numSamples.toLocaleString()} training samples...`);

        const samplesPerPattern = Math.floor(numSamples / 21);
        const xs = [];
        const ys = [];
        const startTime = Date.now();

        for (let patternIdx = 0; patternIdx < 21; patternIdx++) {
            const defectType = this.patternNames[patternIdx];

            for (let i = 0; i < samplesPerPattern; i++) {
                const waferDiameter = [300, 450][Math.floor(Math.random() * 2)];
                const dieSize = 25 + Math.random() * 175;

                const dieDistribution = this.generateRealWaferData(waferDiameter, dieSize, defectType);
                const features = this.extractAllFeatures(dieDistribution, waferDiameter, dieSize);

                const label = new Array(21).fill(0);
                label[patternIdx] = 1;

                xs.push(features);
                ys.push(label);
            }

            console.log(`  Pattern ${patternIdx + 1}/21: ${defectType}`);
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Training data ready: ${xs.length} samples in ${totalTime}s`);

        return {
            xs: tf.tensor2d(xs),
            ys: tf.tensor2d(ys)
        };
    },

    generateRealWaferData(waferDiameter, dieSize, defectType) {
        const radius = waferDiameter / 2;
        const dieWidth = Math.sqrt(dieSize);
        const gridSize = Math.floor((waferDiameter * 0.9) / dieWidth);
        const centerX = gridSize * dieWidth / 2;
        const centerY = gridSize * dieWidth / 2;

        let premium = 0, standard = 0, economy = 0, faulty = 0, dead = 0;
        const radialZones = [0, 0, 0, 0, 0];
        const angularSectors = [0, 0, 0, 0, 0, 0, 0, 0];
        const quadrants = [0, 0, 0, 0];
        let leftDefects = 0, rightDefects = 0, topDefects = 0, bottomDefects = 0;
        let totalDies = 0, totalDefects = 0;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellCenterX = col * dieWidth + dieWidth / 2;
                const cellCenterY = row * dieWidth + dieWidth / 2;
                const dx = cellCenterX - centerX;
                const dy = cellCenterY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > radius) continue;

                totalDies++;
                const normalizedDistance = distance / radius;
                const angle = Math.atan2(dy, dx);

                const defectProbability = this.getDefectProbability(
                    defectType, normalizedDistance, angle, dx, dy,
                    dieWidth, radius, cellCenterX, cellCenterY, centerX, centerY
                );

                if (Math.random() < defectProbability) {
                    const severityRoll = Math.random();
                    if (severityRoll < 0.4) dead++;
                    else if (severityRoll < 0.7) faulty++;
                    else economy++;

                    totalDefects++;

                    const zoneIdx = Math.min(Math.floor(normalizedDistance * 5), 4);
                    radialZones[zoneIdx]++;

                    const normalizedAngle = (angle + Math.PI) % (2 * Math.PI);
                    const sectorIdx = Math.floor(normalizedAngle / (Math.PI / 4)) % 8;
                    angularSectors[sectorIdx]++;

                    const quadIdx = (dx < 0 ? 0 : 1) + (dy < 0 ? 0 : 2);
                    quadrants[quadIdx]++;

                    if (dx < 0) leftDefects++; else rightDefects++;
                    if (dy < 0) topDefects++; else bottomDefects++;
                } else {
                    const qualityRoll = Math.random();
                    if (qualityRoll < 0.6) premium++;
                    else if (qualityRoll < 0.85) standard++;
                    else economy++;
                }
            }
        }

        const defectCount = totalDefects || 0.001;
        return {
            premium, standard, economy, faulty, dead,
            radialZone0: radialZones[0] / defectCount,
            radialZone1: radialZones[1] / defectCount,
            radialZone2: radialZones[2] / defectCount,
            radialZone3: radialZones[3] / defectCount,
            radialZone4: radialZones[4] / defectCount,
            sector0: angularSectors[0] / defectCount,
            sector1: angularSectors[1] / defectCount,
            sector2: angularSectors[2] / defectCount,
            sector3: angularSectors[3] / defectCount,
            sector4: angularSectors[4] / defectCount,
            sector5: angularSectors[5] / defectCount,
            sector6: angularSectors[6] / defectCount,
            sector7: angularSectors[7] / defectCount,
            quadNW: quadrants[0] / defectCount,
            quadNE: quadrants[1] / defectCount,
            quadSE: quadrants[2] / defectCount,
            quadSW: quadrants[3] / defectCount,
            leftRightAsymmetry: (rightDefects - leftDefects) / defectCount,
            topBottomAsymmetry: (bottomDefects - topDefects) / defectCount
        };
    },

    getDefectProbability(defectType, normalizedDistance, angle, dx, dy,
                         dieWidth, radius, cellCenterX, cellCenterY, centerX, centerY) {
        switch(defectType) {
            case "Scratch Pattern": {
                const scratchBand = Math.abs(dx - dy);
                return scratchBand < dieWidth * 2 ? 0.7 : 0.05;
            }
            case "Edge Die Failure":
                return normalizedDistance > 0.8 ? 0.8 : 0.05;
            case "Center Particle Contamination":
                return normalizedDistance < 0.3 ? 0.75 : 0.05;
            case "Radial Pattern Defect":
                return Math.abs(Math.sin(angle * 4)) > 0.8 ? 0.7 : 0.05;
            case "Cluster Failure": {
                const clusterX = centerX + radius * 0.3;
                const clusterY = centerY - radius * 0.2;
                const clusterDist = Math.sqrt(
                    Math.pow(cellCenterX - clusterX, 2) + Math.pow(cellCenterY - clusterY, 2)
                );
                return clusterDist < radius * 0.25 ? 0.8 : 0.05;
            }
            case "Random Defect Scatter":
                return 0.20;
            case "Wafer Bow Distortion":
                return normalizedDistance > 0.7 ? 0.7 : normalizedDistance > 0.5 ? 0.3 : 0.05;
            case "Etch Non-Uniformity": {
                const ringPattern = Math.abs((normalizedDistance % 0.3) - 0.15);
                return ringPattern < 0.05 ? 0.7 : 0.1;
            }
            case "Ion Implantation Drift": {
                const gradientFactor = (dx + radius) / (2 * radius);
                return gradientFactor > 0.6 ? 0.7 : gradientFactor > 0.4 ? 0.3 : 0.05;
            }
            case "Lithography Misalignment": {
                const gridX = Math.abs(dx % (dieWidth * 4));
                const gridY = Math.abs(dy % (dieWidth * 4));
                return (gridX < dieWidth || gridY < dieWidth) ? 0.6 : 0.1;
            }
            case "Chemical Vapor Deposition Defect":
                return normalizedDistance < 0.4 ? 0.8 : normalizedDistance < 0.6 ? 0.4 : 0.1;
            case "Metal Layer Delamination": {
                const spiralFactor = Math.abs(Math.sin(angle * 3 + normalizedDistance * 5));
                return spiralFactor > 0.7 ? 0.7 : 0.1;
            }
            case "Plasma Damage":
                return (Math.abs(Math.sin(angle * 6)) > 0.6 && normalizedDistance > 0.5) ? 0.8 : 0.1;
            case "Photoresist Residue": {
                const clusterPattern = Math.sin(dx * 0.1) * Math.cos(dy * 0.1);
                return clusterPattern > 0.5 ? 0.6 : 0.1;
            }
            case "Micro-crack Propagation": {
                const crackLine1 = Math.abs(dx * 0.8 - dy);
                const crackLine2 = Math.abs(dx * 0.8 + dy);
                return (crackLine1 < dieWidth * 3 || crackLine2 < dieWidth * 3) ? 0.7 : 0.08;
            }
            case "Thermal Stress Fracture":
                return 0.5 + (Math.random() * 0.3);
            case "Cross-Contamination":
                return 0.25;
            case "Incomplete Oxide Formation": {
                const patchX = Math.floor(cellCenterX / (dieWidth * 5)) % 2;
                const patchY = Math.floor(cellCenterY / (dieWidth * 5)) % 2;
                return (patchX === patchY) ? 0.6 : 0.08;
            }
            case "Step Coverage Failure":
                return (normalizedDistance > 0.7 || Math.abs(Math.sin(angle * 8)) > 0.8) ? 0.7 : 0.1;
            case "Polysilicon Grain Boundaries":
                return 0.18;
            case "Perfect Run":
                return 0.02;
            default:
                return 0.15;
        }
    },

    // Duplicate of getDefectProbability kept for simulateDefectPattern compatibility
    // (used by extractAllFeatures during prediction on live data)
    simulateDefectPattern(defectType, waferDiameter, dieSize) {
        const radius = waferDiameter / 2;
        const dieWidth = Math.sqrt(dieSize);
        const gridSize = Math.floor((waferDiameter * 0.9) / dieWidth);
        const centerX = gridSize * dieWidth / 2;
        const centerY = gridSize * dieWidth / 2;

        let premium = 0, standard = 0, economy = 0, faulty = 0, dead = 0;
        const radialZones = [0, 0, 0, 0, 0];
        const angularSectors = [0, 0, 0, 0, 0, 0, 0, 0];
        const quadrants = [0, 0, 0, 0];
        let leftDefects = 0, rightDefects = 0, topDefects = 0, bottomDefects = 0;
        let totalDies = 0, totalDefects = 0;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cellCenterX = col * dieWidth + dieWidth / 2;
                const cellCenterY = row * dieWidth + dieWidth / 2;
                const dx = cellCenterX - centerX;
                const dy = cellCenterY - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > radius) continue;

                totalDies++;
                const normalizedDistance = distance / radius;
                const angle = Math.atan2(dy, dx);

                const defectProbability = this.getDefectProbability(
                    defectType, normalizedDistance, angle, dx, dy,
                    dieWidth, radius, cellCenterX, cellCenterY, centerX, centerY
                );

                if (Math.random() < defectProbability) {
                    const severityRoll = Math.random();
                    if (severityRoll < 0.4) dead++;
                    else if (severityRoll < 0.7) faulty++;
                    else economy++;

                    totalDefects++;

                    const zoneIdx = Math.min(Math.floor(normalizedDistance * 5), 4);
                    radialZones[zoneIdx]++;

                    const normalizedAngle = (angle + Math.PI) % (2 * Math.PI);
                    const sectorIdx = Math.floor(normalizedAngle / (Math.PI / 4)) % 8;
                    angularSectors[sectorIdx]++;

                    const quadIdx = (dx < 0 ? 0 : 1) + (dy < 0 ? 0 : 2);
                    quadrants[quadIdx]++;

                    if (dx < 0) leftDefects++; else rightDefects++;
                    if (dy < 0) topDefects++; else bottomDefects++;
                } else {
                    const qualityRoll = Math.random();
                    if (qualityRoll < 0.6) premium++;
                    else if (qualityRoll < 0.85) standard++;
                    else economy++;
                }
            }
        }

        const totalDiesNorm = totalDies || 1;
        const totalDefectsNorm = totalDefects || 0.001;

        return {
            premium, standard, economy, faulty, dead,
            totalDefectRatio: totalDefects / totalDiesNorm,
            radialZone0: radialZones[0] / totalDiesNorm,
            radialZone1: radialZones[1] / totalDiesNorm,
            radialZone2: radialZones[2] / totalDiesNorm,
            radialZone3: radialZones[3] / totalDiesNorm,
            radialZone4: radialZones[4] / totalDiesNorm,
            sector0: angularSectors[0] / totalDiesNorm,
            sector1: angularSectors[1] / totalDiesNorm,
            sector2: angularSectors[2] / totalDiesNorm,
            sector3: angularSectors[3] / totalDiesNorm,
            sector4: angularSectors[4] / totalDiesNorm,
            sector5: angularSectors[5] / totalDiesNorm,
            sector6: angularSectors[6] / totalDiesNorm,
            sector7: angularSectors[7] / totalDiesNorm,
            quadNW: quadrants[0] / totalDiesNorm,
            quadNE: quadrants[1] / totalDiesNorm,
            quadSW: quadrants[2] / totalDiesNorm,
            quadSE: quadrants[3] / totalDiesNorm,
            leftRightAsymmetry: totalDefects > 10 ? (rightDefects - leftDefects) / totalDefectsNorm : 0,
            topBottomAsymmetry: totalDefects > 10 ? (bottomDefects - topDefects) / totalDefectsNorm : 0
        };
    },

    extractAllFeatures(dieDistribution, waferDiameter, dieSize) {
        const total = dieDistribution.premium + dieDistribution.standard +
                     dieDistribution.economy + dieDistribution.faulty + dieDistribution.dead;

        return [
            // Defect density (scaled for better learning)
            (dieDistribution.totalDefectRatio || 0) * 10,

            // 5 radial zones (scaled)
            (dieDistribution.radialZone0 || 0) * 10,
            (dieDistribution.radialZone1 || 0) * 10,
            (dieDistribution.radialZone2 || 0) * 10,
            (dieDistribution.radialZone3 || 0) * 10,
            (dieDistribution.radialZone4 || 0) * 10,

            // 8 angular sectors
            dieDistribution.sector0 || 0,
            dieDistribution.sector1 || 0,
            dieDistribution.sector2 || 0,
            dieDistribution.sector3 || 0,
            dieDistribution.sector4 || 0,
            dieDistribution.sector5 || 0,
            dieDistribution.sector6 || 0,
            dieDistribution.sector7 || 0,

            // 4 quadrants
            dieDistribution.quadNW || 0,
            dieDistribution.quadNE || 0,
            dieDistribution.quadSE || 0,
            dieDistribution.quadSW || 0,

            // Asymmetry
            dieDistribution.leftRightAsymmetry || 0,
            dieDistribution.topBottomAsymmetry || 0,

            // Die quality ratios
            dieDistribution.premium / total,
            dieDistribution.standard / total,
            dieDistribution.economy / total,
            dieDistribution.faulty / total,
            dieDistribution.dead / total,

            // Severity indicators
            (dieDistribution.faulty + dieDistribution.dead) / total,
            dieDistribution.dead / (dieDistribution.faulty + dieDistribution.dead + 0.001),
            (dieDistribution.faulty + dieDistribution.dead) > total * 0.5 ? 1 : 0,

            // Quality distribution
            (dieDistribution.premium + dieDistribution.standard) / total,
            dieDistribution.premium / (dieDistribution.premium + dieDistribution.standard + 0.001),
            Math.abs(dieDistribution.dead - dieDistribution.faulty) / total,

            // Pattern flags
            dieDistribution.dead / total > 0.3 ? 1 : 0,
            dieDistribution.premium / total > 0.7 ? 1 : 0,
            (dieDistribution.faulty + dieDistribution.dead) / total < 0.1 ? 1 : 0,

            // Wafer context
            waferDiameter / 450,
            dieSize / 200
        ];
    },

    async trainModel() {
        if (this.trained) {
            console.log('Model already trained, skipping');
            return;
        }

        console.log('Training ML model...');

        if (!this.model) {
            await this.initializeModel();
        }

        const { xs, ys } = this.generateTrainingData();

        await this.model.fit(xs, ys, {
            epochs: 20,
            batchSize: 256,
            validationSplit: 0.2,
            shuffle: true,
            verbose: 0,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const trainAcc = (logs.acc * 100).toFixed(2);
                    const valAcc = (logs.val_acc * 100).toFixed(2);

                    console.log(`Epoch ${String(epoch + 1).padStart(3)}/100: ` +
                               `loss=${logs.loss.toFixed(4)}, ` +
                               `acc=${trainAcc}%, ` +
                               `val_acc=${valAcc}%`);

                    if (epoch > 20 && logs.val_acc > 0.75) {
                        console.log('Target accuracy reached, stopping early');
                        this.model.stopTraining = true;
                    }
                }
            }
        });

        this.trained = true;
        console.log('ML training complete');

        xs.dispose();
        ys.dispose();
    },

    async predictPattern(dieDistribution, waferDiameter, dieSize) {
        if (!this.trained) {
            await this.trainModel();
        }

        const features = this.extractAllFeatures(dieDistribution, waferDiameter, dieSize);
        const input = tf.tensor2d([features]);
        const prediction = this.model.predict(input);
        const probabilities = await prediction.data();

        const maxProb = Math.max(...probabilities);
        const predictedIndex = probabilities.indexOf(maxProb);
        const confidence = (maxProb * 100).toFixed(1) + '%';

        input.dispose();
        prediction.dispose();

        return {
            pattern: this.patternNames[predictedIndex],
            confidence: confidence,
            probabilities: Object.fromEntries(
                this.patternNames.map((name, i) =>
                    [name, (probabilities[i] * 100).toFixed(2) + '%']
                )
            )
        };
    }
};
