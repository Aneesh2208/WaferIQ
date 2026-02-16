const FinancialCalculator = {
    calculate(dieDistribution, waferDiameter) {
        const revenue = {
            premium: dieDistribution.premium * CONFIG.PRICING.premium,
            standard: dieDistribution.standard * CONFIG.PRICING.standard,
            economy: dieDistribution.economy * CONFIG.PRICING.economy
        };
        
        const grossRevenue = revenue.premium + revenue.standard + revenue.economy;
        
        const totalDies = Object.values(dieDistribution).reduce((a, b) => a + b, 0);
        const laborCost = totalDies * CONFIG.COSTS.laborPerDie;
        const miscCost = totalDies * CONFIG.COSTS.miscPerDie;
        const waferCost = CONFIG.COSTS.waferCost[waferDiameter];
        const qcCost = CONFIG.COSTS.qualityControlBase;
        const deadDieLoss = (dieDistribution.dead + dieDistribution.faulty) * CONFIG.COSTS.deadDieLoss;
        
        const totalCosts = laborCost + miscCost + waferCost + qcCost + deadDieLoss;
        const netProfit = grossRevenue - totalCosts;
        const yieldRate = ((totalDies - dieDistribution.dead) / totalDies * 100);
        
        return {
            revenue,
            grossRevenue,
            costs: { labor: laborCost, misc: miscCost, wafer: waferCost, qc: qcCost, deadDieLoss },
            totalCosts,
            netProfit,
            yieldRate: yieldRate.toFixed(2),
            dieDistribution,
            totalDies
        };
    },
    
    updateUI(financials) {
        const tableBody = document.getElementById('revenueTableBody');
        tableBody.innerHTML = `
            <tr>
                <td><span class="tier-badge tier-premium">Tier 1 (Premium)</span></td>
                <td style="text-align: right;">${financials.dieDistribution.premium}</td>
                <td style="text-align: right;">$${CONFIG.PRICING.premium.toFixed(2)}</td>
                <td style="text-align: right;">$${financials.revenue.premium.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td><span class="tier-badge tier-standard">Tier 2 (Standard)</span></td>
                <td style="text-align: right;">${financials.dieDistribution.standard}</td>
                <td style="text-align: right;">$${CONFIG.PRICING.standard.toFixed(2)}</td>
                <td style="text-align: right;">$${financials.revenue.standard.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
                <td><span class="tier-badge tier-economy">Tier 3 (Economy)</span></td>
                <td style="text-align: right;">${financials.dieDistribution.economy}</td>
                <td style="text-align: right;">$${CONFIG.PRICING.economy.toFixed(2)}</td>
                <td style="text-align: right;">$${financials.revenue.economy.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr style="background: rgba(255,23,68,0.05);">
                <td><span class="tier-badge tier-scrap">Scrap</span></td>
                <td style="text-align: right;">${financials.dieDistribution.dead + financials.dieDistribution.faulty}</td>
                <td style="text-align: right;">$0.00</td>
                <td style="text-align: right;">$0.00</td>
            </tr>
        `;
        
        document.getElementById('grossRevenue').textContent = 
            `$${financials.grossRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('totalCosts').textContent = 
            `$${financials.totalCosts.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        
        const netProfitEl = document.getElementById('netProfit');
        netProfitEl.textContent = `$${financials.netProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        netProfitEl.className = financials.netProfit >= 0 ? 'metric-value positive' : 'metric-value negative';
        
        document.getElementById('costBreakdownPopup').innerHTML = `
            <div style="font-weight: 600; margin-bottom: 1rem;">Cost Breakdown</div>
            <div class="cost-item">
                <span class="cost-item-label">Wafer Cost</span>
                <span class="cost-item-value">$${financials.costs.wafer.toLocaleString()}</span>
            </div>
            <div class="cost-item">
                <span class="cost-item-label">Labor</span>
                <span class="cost-item-value">$${financials.costs.labor.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="cost-item">
                <span class="cost-item-label">Miscellaneous</span>
                <span class="cost-item-value">$${financials.costs.misc.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="cost-item">
                <span class="cost-item-label">Quality Control</span>
                <span class="cost-item-value">$${financials.costs.qc.toLocaleString()}</span>
            </div>
            <div class="cost-item">
                <span class="cost-item-label">Dead Die Loss</span>
                <span class="cost-item-value" style="color: var(--error);">$${financials.costs.deadDieLoss.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        `;

        const profitPopup = document.getElementById('profitBreakdownPopup');
        if (financials.netProfit < 0) {
            const scrapCount = financials.dieDistribution.faulty + financials.dieDistribution.dead;
            const lostRevenue = scrapCount * CONFIG.PRICING.standard;

            profitPopup.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 1rem; color: var(--error);">Loss Breakdown</div>
                <div class="cost-item">
                    <span class="cost-item-label">Revenue Earned</span>
                    <span class="cost-item-value">$${financials.grossRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Total Costs</span>
                    <span class="cost-item-value" style="color: var(--error);">-$${financials.totalCosts.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item" style="border-top: 1px solid var(--glass-border); padding-top: 0.75rem;">
                    <span class="cost-item-label">Net Loss</span>
                    <span class="cost-item-value" style="color: var(--error); font-weight: 800;">-$${Math.abs(financials.netProfit).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Scrapped Dies</span>
                    <span class="cost-item-value" style="color: var(--error);">${scrapCount} dies</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Lost Potential Revenue</span>
                    <span class="cost-item-value" style="color: var(--error);">~$${lostRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Dead Die Penalty</span>
                    <span class="cost-item-value" style="color: var(--error);">$${financials.costs.deadDieLoss.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
            `;
        } else {
            profitPopup.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 1rem; color: var(--success);">Profit Summary</div>
                <div class="cost-item">
                    <span class="cost-item-label">Revenue</span>
                    <span class="cost-item-value">$${financials.grossRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Costs</span>
                    <span class="cost-item-value" style="color: var(--error);">-$${financials.totalCosts.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item" style="border-top: 1px solid var(--glass-border); padding-top: 0.75rem;">
                    <span class="cost-item-label">Net Profit</span>
                    <span class="cost-item-value" style="color: var(--success); font-weight: 800;">$${financials.netProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Profit Margin</span>
                    <span class="cost-item-value" style="color: var(--success);">${(financials.netProfit / financials.grossRevenue * 100).toFixed(1)}%</span>
                </div>
                <div class="cost-item">
                    <span class="cost-item-label">Yield</span>
                    <span class="cost-item-value">${financials.yieldRate}%</span>
                </div>
            `;
        }
    }
};
