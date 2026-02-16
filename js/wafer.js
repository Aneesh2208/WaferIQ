const WaferRenderer = {
    canvas: null,
    ctx: null,

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

   renderWafer(waferDiameter, dieSize, dieDistribution, defectType)
 {
        const scale = this.canvas.width / (waferDiameter * 1.1);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = (waferDiameter / 2) * scale;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw wafer circle
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
        const diesPerCol = diesPerRow; // symmetric grid

        const offsetX = centerX - (diesPerRow * dieWidth) / 2;
        const offsetY = centerY - (diesPerCol * dieWidth) / 2;

        const dieStatuses = this.createDieStatusArray(dieDistribution);
        let statusIndex = 0;

        for (let row = 0; row < diesPerCol; row++) {
            for (let col = 0; col < diesPerRow; col++) {

                const x = offsetX + col * dieWidth;
                const y = offsetY + row * dieWidth;

                const cellCenterX = x + dieWidth / 2;
                const cellCenterY = y + dieWidth / 2;

                const dx = cellCenterX - centerX;
                const dy = cellCenterY - centerY;

                const distFromCenter = Math.sqrt(dx * dx + dy * dy);

                if (distFromCenter <= radius - dieWidth / 2) {

                    // 🎨 Enhanced color scheme for better visibility
                    const colors = {
                        premium: '#00ff88',    // Bright green - perfect
                        standard: '#66d9a6',   // Light green - good
                        economy: '#ffaa00',    // Orange - marginal
                        faulty: '#ff4444',     // Red - defective but salvageable
                        dead: '#aa0000'        // Dark red - completely failed
                    };

                    // 🎨 SMART STATUS ASSIGNMENT - Uses actual die distribution
                    let status = 'premium';

const normalizedDistance = distFromCenter / radius;
const angle = Math.atan2(dy, dx);
let defectProbability = 0;

// 🔥 COMPLETE DEFECT VISUALIZATION LIBRARY
switch (defectType) {
    // ═══ ORIGINAL DEFECTS ═══
    case "Scratch Pattern":
        const scratchBand = Math.abs(dx - dy);
        defectProbability = scratchBand < dieWidth * 2 ? 0.7 : 0.05;
        break;

    case "Edge Die Failure":
        defectProbability = normalizedDistance > 0.8 ? 0.8 : 0.05;
        break;

    case "Center Particle Contamination":
        defectProbability = normalizedDistance < 0.3 ? 0.75 : 0.05;
        break;

    case "Radial Pattern Defect":
        defectProbability = Math.abs(Math.sin(angle * 4)) > 0.8 ? 0.7 : 0.05;
        break;

    case "Cluster Failure":
        const clusterX = centerX + radius * 0.3;
        const clusterY = centerY - radius * 0.2;
        const clusterDist = Math.sqrt(
            Math.pow(cellCenterX - clusterX, 2) + Math.pow(cellCenterY - clusterY, 2)
        );
        defectProbability = clusterDist < radius * 0.25 ? 0.8 : 0.05;
        break;

    case "Random Defect Scatter":
        defectProbability = 0.20; // Increased for visibility
        break;

    // ═══ NEW DEFECTS ═══
    case "Wafer Bow Distortion":
        // Edge warping - affects outer rings
        defectProbability = normalizedDistance > 0.7 ? 0.7 : normalizedDistance > 0.5 ? 0.3 : 0.05;
        break;

    case "Etch Non-Uniformity":
        // Concentric ring pattern
        const ringPattern = Math.abs((normalizedDistance % 0.3) - 0.15);
        defectProbability = ringPattern < 0.05 ? 0.7 : 0.1;
        break;

    case "Ion Implantation Drift":
        // Gradient from one side to another
        const gradientFactor = (dx + radius) / (2 * radius);
        defectProbability = gradientFactor > 0.6 ? 0.7 : gradientFactor > 0.4 ? 0.3 : 0.05;
        break;

    case "Lithography Misalignment":
        // Grid-like pattern defects
        const gridX = Math.abs(dx % (dieWidth * 4));
        const gridY = Math.abs(dy % (dieWidth * 4));
        defectProbability = (gridX < dieWidth || gridY < dieWidth) ? 0.6 : 0.1;
        break;

    case "Chemical Vapor Deposition Defect":
        // Center concentration
        defectProbability = normalizedDistance < 0.4 ? 0.8 : normalizedDistance < 0.6 ? 0.4 : 0.1;
        break;

    case "Metal Layer Delamination":
        // Spiral pattern
        const spiralFactor = Math.abs(Math.sin(angle * 3 + normalizedDistance * 5));
        defectProbability = spiralFactor > 0.7 ? 0.7 : 0.1;
        break;

    case "Plasma Damage":
        // Asymmetric radial damage
        defectProbability = (Math.abs(Math.sin(angle * 6)) > 0.6 && normalizedDistance > 0.5) ? 0.8 : 0.1;
        break;

    case "Photoresist Residue":
        // Random clusters
        const clusterPattern = Math.sin(dx * 0.1) * Math.cos(dy * 0.1);
        defectProbability = clusterPattern > 0.5 ? 0.6 : 0.1;
        break;

    case "Micro-crack Propagation":
        // Linear fracture lines
        const crackLine1 = Math.abs(dx * 0.8 - dy);
        const crackLine2 = Math.abs(dx * 0.8 + dy);
        defectProbability = (crackLine1 < dieWidth * 3 || crackLine2 < dieWidth * 3) ? 0.7 : 0.08;
        break;

    case "Thermal Stress Fracture":
        // Catastrophic - widespread damage from center
        defectProbability = 0.5 + (Math.random() * 0.3); // High random failure
        break;

    case "Cross-Contamination":
        // Scattered random defects
        defectProbability = 0.25;
        break;

    case "Incomplete Oxide Formation":
        // Patchy pattern
        const patchX = Math.floor(cellCenterX / (dieWidth * 5)) % 2;
        const patchY = Math.floor(cellCenterY / (dieWidth * 5)) % 2;
        defectProbability = (patchX === patchY) ? 0.6 : 0.08;
        break;

    case "Step Coverage Failure":
        // Edge-heavy with radial component
        defectProbability = (normalizedDistance > 0.7 || Math.abs(Math.sin(angle * 8)) > 0.8) ? 0.7 : 0.1;
        break;

    case "Polysilicon Grain Boundaries":
        // Fine-grained random defects
        defectProbability = 0.18;
        break;

    case "Perfect Run":
        defectProbability = 0.02; // Almost none
        break;

    default:
        // Fallback for any unknown defect type
        defectProbability = 0.15;
        break;
}

// 🎲 Apply defect probability with quality degradation
if (Math.random() < defectProbability) {
    // Defected die - decide severity
    const severityRoll = Math.random();
    if (severityRoll < 0.4) {
        status = 'dead'; // 40% dead
    } else if (severityRoll < 0.7) {
        status = 'faulty'; // 30% faulty
    } else {
        status = 'economy'; // 30% economy (marginal)
    }
} else {
    // Good die - assign quality tier
    const qualityRoll = Math.random();
    if (qualityRoll < 0.6) {
        status = 'premium';
    } else if (qualityRoll < 0.85) {
        status = 'standard';
    } else {
        status = 'economy';
    }
}


                    this.ctx.fillStyle = colors[status];
                    this.ctx.fillRect(x, y, dieWidth * 0.95, dieWidth * 0.95);

                    this.ctx.strokeStyle = '#0a0e1a';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, dieWidth * 0.95, dieWidth * 0.95);
                }
            }
        }
    },

    createDieStatusArray(distribution) {
        const statuses = [];

        for (let i = 0; i < distribution.premium; i++) statuses.push('premium');
        for (let i = 0; i < distribution.standard; i++) statuses.push('standard');
        for (let i = 0; i < distribution.economy; i++) statuses.push('economy');
        for (let i = 0; i < distribution.faulty; i++) statuses.push('faulty');
        for (let i = 0; i < distribution.dead; i++) statuses.push('dead');

        return statuses;
    }
};

console.log('🎨 Wafer Renderer Loaded');
