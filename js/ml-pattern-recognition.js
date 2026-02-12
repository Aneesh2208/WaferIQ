const MLPatternRecognition = {
    model: null,
    trained: false,
    
    async initializeModel() {
        console.log('🧠 Initializing ML Model...');
        
        if (!window.tf) {
            console.log('📦 Loading TensorFlow.js...');
            await this.loadTensorFlow();
        }
        
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ units: 128, activation: 'relu', inputShape: [10] }),
                tf.layers.dropout({ rate: 0.3 }),
                tf.layers.dense({ units: 64, activation: 'relu' }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 32, activation: 'relu' }),
                tf.layers.dense({ units: 7, activation: 'softmax' })
            ]
        });
        
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        console.log('✅ ML Model Architecture Created');
        return this.model;
    },
    
    async loadTensorFlow() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
            script.onload = () => {
                console.log('✅ TensorFlow.js Loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    generateTrainingData(numSamples = 10000) {
        console.log(`🎓 Generating ${numSamples} training samples...`);
        
        const xs = [];
        const ys = [];
        
        const patterns = [
            { name: 'Edge', label: 0 },
            { name: 'Center', label: 1 },
            { name: 'Radial', label: 2 },
            { name: 'Random', label: 3 },
            { name: 'Cluster', label: 4 },
            { name: 'Scratch', label: 5 },
            { name: 'Perfect', label: 6 }
        ];
        
        for (let i = 0; i < numSamples; i++) {
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            const features = this.generatePatternFeatures(pattern.name);
            const label = new Array(7).fill(0);
            label[pattern.label] = 1;
            
            xs.push(features);
            ys.push(label);
        }
        
        console.log('✅ Training data generated');
        return {
            xs: tf.tensor2d(xs),
            ys: tf.tensor2d(ys)
        };
    },
    
    generatePatternFeatures(patternType) {
        let features = new Array(10).fill(0);
        
        switch(patternType) {
            case 'Edge':
                features[0] = Math.random() * 0.3 + 0.7;
                features[1] = Math.random() * 0.3;
                features[2] = Math.random();
                break;
            case 'Center':
                features[0] = Math.random() * 0.3;
                features[1] = Math.random() * 0.3 + 0.7;
                features[2] = Math.random();
                break;
            case 'Radial':
                features[3] = Math.random() * 0.4 + 0.6;
                features[4] = Math.random();
                break;
            case 'Random':
                for (let i = 0; i < 10; i++) {
                    features[i] = Math.random() * 0.5;
                }
                break;
            case 'Cluster':
                features[5] = Math.random() * 0.4 + 0.6;
                features[6] = Math.random();
                break;
            case 'Scratch':
                features[7] = Math.random() * 0.4 + 0.6;
                features[8] = Math.random();
                break;
            case 'Perfect':
                features[9] = Math.random() * 0.3 + 0.7;
                break;
        }
        
        return features;
    },
    
    async trainModel() {
        if (this.trained) {
            console.log('⚠️ Model already trained');
            return;
        }
        
        console.log('🎓 Training ML Model on 10,000 patterns...');
        
        if (!this.model) {
            await this.initializeModel();
        }
        
        const { xs, ys } = this.generateTrainingData(10000);
        
        await this.model.fit(xs, ys, {
            epochs: 20,
            batchSize: 128,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 5 === 0) {
                        console.log(`Epoch ${epoch}: loss=${logs.loss.toFixed(4)}, accuracy=${logs.acc.toFixed(4)}`);
                    }
                }
            }
        });
        
        this.trained = true;
        console.log('✅ ML Model Training Complete');
        
        xs.dispose();
        ys.dispose();
    },
    
    async predictPattern(dieDistribution, waferDiameter, dieSize) {
        if (!this.trained) {
            console.log('⚠️ Model not trained yet, training now...');
            await this.trainModel();
        }
        
        const total = Object.values(dieDistribution).reduce((a, b) => a + b, 0);
        const features = [
            dieDistribution.premium / total,
            dieDistribution.standard / total,
            dieDistribution.economy / total,
            dieDistribution.faulty / total,
            dieDistribution.dead / total,
            waferDiameter / 450,
            dieSize / 1000,
            Math.random(),
            Math.random(),
            Math.random()
        ];
        
        const input = tf.tensor2d([features]);
        const prediction = this.model.predict(input);
        const probabilities = await prediction.data();
        
        const patternNames = ['Edge Die Failure', 'Center Contamination', 'Radial Defect', 
                              'Random Scatter', 'Cluster Failure', 'Scratch Pattern', 'Perfect Run'];
        
        const maxProb = Math.max(...probabilities);
        const predictedIndex = probabilities.indexOf(maxProb);
        
        input.dispose();
        prediction.dispose();
        
        return {
            pattern: patternNames[predictedIndex],
            confidence: (maxProb * 100).toFixed(1),
            probabilities: Object.fromEntries(
                patternNames.map((name, i) => [name, (probabilities[i] * 100).toFixed(1)])
            )
        };
    }
};

console.log('🧠 ML Pattern Recognition Module Loaded');
