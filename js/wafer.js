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

                    const colors = {
                        premium: '#00ff88',
                        standard: '#00cc66',
                        economy: '#ff9933',
                        faulty: '#ff6b6b',
                        dead: '#cc0000'
                    };

                    let status = 'premium';

const normalizedDistance = distFromCenter / radius;
let defectProbability = 0;

switch (defectType) {

    case "Scratch Pattern":
        const scratchBand = Math.abs(dx - dy);
        defectProbability = scratchBand < dieWidth * 2 ? 0.7 : 0.05;
        break;

    case "Edge Die Failure":
        defectProbability = normalizedDistance > 0.8 ? 0.6 : 0.05;
        break;

    case "Center Particle Contamination":
        defectProbability = normalizedDistance < 0.3 ? 0.7 : 0.05;
        break;

    case "Radial Pattern Defect":
        defectProbability =
            Math.abs(Math.sin(Math.atan2(dy, dx) * 4)) > 0.8 ? 0.6 : 0.05;
        break;

    case "Cluster Failure":
        const clusterX = centerX + radius * 0.3;
        const clusterY = centerY - radius * 0.2;
        const clusterDist = Math.sqrt(
            Math.pow(cellCenterX - clusterX, 2) +
            Math.pow(cellCenterY - clusterY, 2)
        );
        defectProbability = clusterDist < radius * 0.2 ? 0.7 : 0.05;
        break;

    case "Random Defect Scatter":
        defectProbability = 0.15;
        break;

    case "Perfect Run":
        defectProbability = 0.01;
        break;
}

if (Math.random() < defectProbability) {
    status = Math.random() < 0.5 ? 'faulty' : 'dead';
} else {
    status = 'premium';
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
