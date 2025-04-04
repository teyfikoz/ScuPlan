        // Check if it's a shallow and/or short dive
        if (divePlan.depth <= 12 || divePlan.bottomTime <= 20) {
            // For shallow dives (<=12m) or short dives (<=20min), standard tank is always sufficient
            gasConsumptionSection.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong>Gas Consumption</strong>: Standard recreational equipment is sufficient for this dive.
                </div>
                <div class="mt-3">
                    <h6>Gas Requirements for this Dive:</h6>
                    <ul class="list-unstyled">
                        <li><i class="fas fa-check-circle text-success me-1"></i> Estimated gas needed: ~${estimatedGasNeeded}L (w/o reserve)</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended with reserve: ~${Math.ceil(estimatedGasNeeded * 1.3)}L</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended configuration: 1 x 12L tank</li>
                        <li><i class="fas fa-check-circle text-success me-1"></i> Recommended gas mix: Air or Nitrox 32%</li>
                    </ul>
                </div>
                <div class="small mt-2 text-muted">
                    Based on average SAC rate of 20L/min at surface. Your actual consumption may vary based on experience, conditions, and exertion level.
                </div>
            `;
            return;
        }
