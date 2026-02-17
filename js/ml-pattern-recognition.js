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
        if (!window.tf) await this.loadTensorFlow();

        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    units: 128,
                    activation: 'relu',
                    inputShape: [32],
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
                tf.layers.dropout({ rate: 0.2 }),
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

    // 32 features derived from die counts + spatial distribution
    // Used identically in training and prediction to avoid mismatch
    extractFeatures(spatial, waferDiameter, dieSize) {
        const p = spatial.premium || 0;
        const s = spatial.standard || 0;
        const e = spatial.economy || 0;
        const f = spatial.faulty || 0;
        const d = spatial.dead || 0;
        const total = p + s + e + f + d || 1;
        const failures = f + d || 0.001;
        const good = p + s || 0.001;

        const rz = spatial.radialZones || [0, 0, 0, 0, 0];
        const as = spatial.angularSectors || [0, 0, 0, 0, 0, 0, 0, 0];
        const qu = spatial.quadrants || [0, 0, 0, 0];

        return [
            p / total, s / total, e / total, f / total, d / total,
            (f + d) / total,
            d / failures,
            p / good,
            (p + s) / total,
            Math.abs(d - f) / total,
            spatial.totalDefectRatio || 0,
            rz[0], rz[1], rz[2], rz[3], rz[4],
            as[0], as[1], as[2], as[3], as[4], as[5], as[6], as[7],
            qu[0], qu[1], qu[2], qu[3],
            spatial.leftRightAsymmetry || 0,
            spatial.topBottomAsymmetry || 0,
            waferDiameter / 450,
            dieSize / 200
        ];
    },

    // Simulate a wafer and extract spatial features for training
    simulateAndExtract(waferDiameter, dieSize, defectType) {
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
                const cx = col * dieWidth + dieWidth / 2;
                const cy = row * dieWidth + dieWidth / 2;
                const dx = cx - centerX;
                const dy = cy - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > radius) continue;

                totalDies++;
                const nd = distance / radius;
                const angle = Math.atan2(dy, dx);

                const prob = WaferRenderer.getDefectProbability(
                    defectType, nd, angle, dx, dy,
                    dieWidth, radius, cx, cy, centerX, centerY
                );

                if (Math.random() < prob) {
                    const roll = Math.random();
                    if (roll < 0.4) dead++;
                    else if (roll < 0.7) faulty++;
                    else economy++;

                    totalDefects++;
                    const zoneIdx = Math.min(Math.floor(nd * 5), 4);
                    radialZones[zoneIdx]++;

                    const normAngle = (angle + Math.PI) % (2 * Math.PI);
                    const sectorIdx = Math.floor(normAngle / (Math.PI / 4)) % 8;
                    angularSectors[sectorIdx]++;

                    const quadIdx = (dx < 0 ? 0 : 1) + (dy < 0 ? 0 : 2);
                    quadrants[quadIdx]++;

                    if (dx < 0) leftDefects++; else rightDefects++;
                    if (dy < 0) topDefects++; else bottomDefects++;
                } else {
                    const roll = Math.random();
                    if (roll < 0.6) premium++;
                    else if (roll < 0.85) standard++;
                    else economy++;
                }
            }
        }

        const defectCount = totalDefects || 0.001;

        return {
            premium, standard, economy, faulty, dead,
            totalDefectRatio: totalDefects / totalDies,
            radialZones: radialZones.map(z => z / defectCount),
            angularSectors: angularSectors.map(s => s / defectCount),
            quadrants: quadrants.map(q => q / defectCount),
            leftRightAsymmetry: totalDefects > 5 ? (rightDefects - leftDefects) / defectCount : 0,
            topBottomAsymmetry: totalDefects > 5 ? (bottomDefects - topDefects) / defectCount : 0
        };
    },

    generateTrainingData(numSamples = 50000) {
        console.log(`Generating ${numSamples.toLocaleString()} training samples...`);

        const samplesPerPattern = Math.floor(numSamples / 21);
        const xs = [];
        const ys = [];

        for (let patternIdx = 0; patternIdx < 21; patternIdx++) {
            const defectType = this.patternNames[patternIdx];

            for (let i = 0; i < samplesPerPattern; i++) {
                const waferDiameter = [200, 300, 450][Math.floor(Math.random() * 3)];
                const dieSize = 25 + Math.random() * 175;

                const spatial = this.simulateAndExtract(waferDiameter, dieSize, defectType);
                const features = this.extractFeatures(spatial, waferDiameter, dieSize);

                const label = new Array(21).fill(0);
                label[patternIdx] = 1;

                xs.push(features);
                ys.push(label);
            }

            if ((patternIdx + 1) % 7 === 0) {
                console.log(`  Generated ${patternIdx + 1}/21 patterns`);
            }
        }

        console.log(`Training data ready: ${xs.length} samples`);

        // Shuffle so the validation split gets all 21 patterns evenly
        for (let i = xs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [xs[i], xs[j]] = [xs[j], xs[i]];
            [ys[i], ys[j]] = [ys[j], ys[i]];
        }

        return { xs: tf.tensor2d(xs), ys: tf.tensor2d(ys) };
    },

    async trainModel() {
        if (this.trained) {
            console.log('Model already trained, skipping');
            return;
        }

        console.log('Training ML model...');
        if (!this.model) await this.initializeModel();

        // Use setTimeout instead of requestAnimationFrame so training runs in background tabs
        const origRAF = window.requestAnimationFrame;
        window.requestAnimationFrame = cb => setTimeout(cb, 0);

        const { xs, ys } = this.generateTrainingData();
        const loadingSub = document.getElementById('loadingSubtext');

        await this.model.fit(xs, ys, {
            epochs: 60,
            batchSize: 512,
            validationSplit: 0.2,
            shuffle: true,
            verbose: 0,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    const trainAcc = logs.acc ?? logs.accuracy ?? 0;
                    const valAcc = logs.val_acc ?? logs.val_accuracy ?? 0;
                    console.log(`Epoch ${epoch + 1}/60: loss=${logs.loss.toFixed(4)}, train=${(trainAcc * 100).toFixed(1)}%, val=${(valAcc * 100).toFixed(1)}%`);
                    if (loadingSub) {
                        loadingSub.textContent = `Epoch ${epoch + 1}/60 — train: ${(trainAcc * 100).toFixed(1)}% | val: ${(valAcc * 100).toFixed(1)}%`;
                    }
                    if (epoch > 40 && valAcc > 0.92) {
                        console.log('Target accuracy reached, stopping early');
                        this.model.stopTraining = true;
                    }
                }
            }
        });

        window.requestAnimationFrame = origRAF;
        this.trained = true;
        console.log('ML training complete');

        xs.dispose();
        ys.dispose();
    },

    async predictFromSpatial(spatialData, waferDiameter, dieSize) {
        if (!this.trained) await this.trainModel();

        const features = this.extractFeatures(spatialData, waferDiameter, dieSize);
        const input = tf.tensor2d([features]);
        const prediction = this.model.predict(input);
        const probs = await prediction.data();

        const indexed = Array.from(probs).map((p, i) => ({ prob: p, idx: i }));
        indexed.sort((a, b) => b.prob - a.prob);

        const top = indexed[0];

        input.dispose();
        prediction.dispose();

        return {
            pattern: this.patternNames[top.idx],
            confidence: (top.prob * 100).toFixed(1) + '%',
            top3: indexed.slice(0, 3).map(x => ({
                pattern: this.patternNames[x.idx],
                confidence: (x.prob * 100).toFixed(1) + '%'
            }))
        };
    }
};
