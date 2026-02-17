const WaferRenderer = {
    canvas: null,
    ctx: null,
    lastDieGrid: [],

    init() {
        this.canvas = document.getElementById('waferCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawBlankWafer();
    },

    drawBlankWafer() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 250;

        this.ctx.fillStyle = '#1a2332';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#2d3a52';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    },

    renderWafer(waferDiameter, dieSize, dieDistribution, defectType) {
        const scale = this.canvas.width / (waferDiameter * 1.1);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = (waferDiameter / 2) * scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#1a2332';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#2d3a52';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        const dieWidth = Math.sqrt(dieSize) * scale;
        const gridWidth = waferDiameter * scale;
        const diesPerRow = Math.floor(gridWidth / dieWidth);
        const diesPerCol = diesPerRow;

        const offsetX = centerX - (diesPerRow * dieWidth) / 2;
        const offsetY = centerY - (diesPerCol * dieWidth) / 2;

        const colors = {
            premium: '#00ff88',
            standard: '#66d9a6',
            economy: '#ffaa00',
            faulty: '#ff4444',
            dead: '#aa0000'
        };

        this.lastDieGrid = [];

        for (let row = 0; row < diesPerCol; row++) {
            for (let col = 0; col < diesPerRow; col++) {
                const x = offsetX + col * dieWidth;
                const y = offsetY + row * dieWidth;
                const cellCenterX = x + dieWidth / 2;
                const cellCenterY = y + dieWidth / 2;
                const dx = cellCenterX - centerX;
                const dy = cellCenterY - centerY;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);

                if (distFromCenter > radius - dieWidth / 2) continue;

                const normalizedDistance = distFromCenter / radius;
                const angle = Math.atan2(dy, dx);

                const defectProbability = this.getDefectProbability(
                    defectType, normalizedDistance, angle, dx, dy,
                    dieWidth, radius, cellCenterX, cellCenterY, centerX, centerY
                );

                let status;
                if (Math.random() < defectProbability) {
                    const roll = Math.random();
                    if (roll < 0.4) status = 'dead';
                    else if (roll < 0.7) status = 'faulty';
                    else status = 'economy';
                } else {
                    const roll = Math.random();
                    if (roll < 0.6) status = 'premium';
                    else if (roll < 0.85) status = 'standard';
                    else status = 'economy';
                }

                this.lastDieGrid.push({ normalizedDistance, angle, dx, dy, status });

                this.ctx.fillStyle = colors[status];
                this.ctx.fillRect(x, y, dieWidth * 0.95, dieWidth * 0.95);
                this.ctx.strokeStyle = '#0a0e1a';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, dieWidth * 0.95, dieWidth * 0.95);
            }
        }
    },

    // Shared defect probability engine used by both the renderer and ML training
    getDefectProbability(defectType, nd, angle, dx, dy,
                         dieWidth, radius, cx, cy, centerX, centerY) {
        switch (defectType) {
            case "Scratch Pattern": {
                const band = Math.abs(dx - dy);
                return band < dieWidth * 2 ? 0.7 : 0.05;
            }
            case "Edge Die Failure":
                return nd > 0.8 ? 0.8 : 0.05;
            case "Center Particle Contamination":
                return nd < 0.3 ? 0.75 : 0.05;
            case "Radial Pattern Defect":
                return Math.abs(Math.sin(angle * 4)) > 0.8 ? 0.7 : 0.05;
            case "Cluster Failure": {
                const clX = centerX + radius * 0.3;
                const clY = centerY - radius * 0.2;
                const clDist = Math.sqrt((cx - clX) ** 2 + (cy - clY) ** 2);
                return clDist < radius * 0.25 ? 0.8 : 0.05;
            }
            case "Random Defect Scatter":
                return 0.20;
            case "Wafer Bow Distortion":
                return nd > 0.7 ? 0.7 : nd > 0.5 ? 0.3 : 0.05;
            case "Etch Non-Uniformity": {
                const ring = Math.abs((nd % 0.3) - 0.15);
                return ring < 0.05 ? 0.7 : 0.1;
            }
            case "Ion Implantation Drift": {
                const grad = (dx + radius) / (2 * radius);
                return grad > 0.6 ? 0.7 : grad > 0.4 ? 0.3 : 0.05;
            }
            case "Lithography Misalignment": {
                const gx = Math.abs(dx % (dieWidth * 4));
                const gy = Math.abs(dy % (dieWidth * 4));
                return (gx < dieWidth || gy < dieWidth) ? 0.6 : 0.1;
            }
            case "Chemical Vapor Deposition Defect":
                return nd < 0.4 ? 0.8 : nd < 0.6 ? 0.4 : 0.1;
            case "Metal Layer Delamination": {
                const spiral = Math.abs(Math.sin(angle * 3 + nd * 5));
                return spiral > 0.7 ? 0.7 : 0.1;
            }
            case "Plasma Damage":
                return (Math.abs(Math.sin(angle * 6)) > 0.6 && nd > 0.5) ? 0.8 : 0.1;
            case "Photoresist Residue": {
                const cluster = Math.sin(dx * 0.1) * Math.cos(dy * 0.1);
                return cluster > 0.5 ? 0.6 : 0.1;
            }
            case "Micro-crack Propagation": {
                const c1 = Math.abs(dx * 0.8 - dy);
                const c2 = Math.abs(dx * 0.8 + dy);
                return (c1 < dieWidth * 3 || c2 < dieWidth * 3) ? 0.7 : 0.08;
            }
            case "Thermal Stress Fracture":
                return 0.5 + (Math.random() * 0.3);
            case "Cross-Contamination":
                return 0.25;
            case "Incomplete Oxide Formation": {
                const px = Math.floor(cx / (dieWidth * 5)) % 2;
                const py = Math.floor(cy / (dieWidth * 5)) % 2;
                return (px === py) ? 0.6 : 0.08;
            }
            case "Step Coverage Failure":
                return (nd > 0.7 || Math.abs(Math.sin(angle * 8)) > 0.8) ? 0.7 : 0.1;
            case "Polysilicon Grain Boundaries":
                return 0.18;
            case "Perfect Run":
                return 0.02;
            default:
                return 0.15;
        }
    },

    extractSpatialFeatures() {
        const grid = this.lastDieGrid;
        if (!grid.length) return null;

        const total = grid.length;
        const radialZones = [0, 0, 0, 0, 0];
        const angularSectors = [0, 0, 0, 0, 0, 0, 0, 0];
        const quadrants = [0, 0, 0, 0];
        let leftDefects = 0, rightDefects = 0, topDefects = 0, bottomDefects = 0;
        let totalDefects = 0;
        let premium = 0, standard = 0, economy = 0, faulty = 0, dead = 0;

        for (const die of grid) {
            const isDefect = die.status === 'faulty' || die.status === 'dead';

            if (die.status === 'premium') premium++;
            else if (die.status === 'standard') standard++;
            else if (die.status === 'economy') economy++;
            else if (die.status === 'faulty') faulty++;
            else if (die.status === 'dead') dead++;

            if (isDefect) {
                totalDefects++;
                const zoneIdx = Math.min(Math.floor(die.normalizedDistance * 5), 4);
                radialZones[zoneIdx]++;

                const normAngle = (die.angle + Math.PI) % (2 * Math.PI);
                const sectorIdx = Math.floor(normAngle / (Math.PI / 4)) % 8;
                angularSectors[sectorIdx]++;

                const quadIdx = (die.dx < 0 ? 0 : 1) + (die.dy < 0 ? 0 : 2);
                quadrants[quadIdx]++;

                if (die.dx < 0) leftDefects++; else rightDefects++;
                if (die.dy < 0) topDefects++; else bottomDefects++;
            }
        }

        const defectCount = totalDefects || 0.001;

        return {
            premium, standard, economy, faulty, dead,
            totalDefectRatio: totalDefects / total,
            radialZones: radialZones.map(z => z / defectCount),
            angularSectors: angularSectors.map(s => s / defectCount),
            quadrants: quadrants.map(q => q / defectCount),
            leftRightAsymmetry: totalDefects > 5 ? (rightDefects - leftDefects) / defectCount : 0,
            topBottomAsymmetry: totalDefects > 5 ? (bottomDefects - topDefects) / defectCount : 0
        };
    }
};
