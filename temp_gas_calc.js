function displayGasConsumptionResults(results) {
    const container = document.getElementById('gasConsumptionResults');
    if (!container) return;
    
    // Sonuç yoksa veya boşsa, offline hesaplama yap
    if (!results || results.length === 0) {
        const diveDepth = parseFloat(document.getElementById('maxDepth')?.value || 10);
        const bottomTime = parseFloat(document.getElementById('bottomTime')?.value || 30);
        const sacRate = parseFloat(document.getElementById('sacRate')?.value || 20);
        
        if (app.tanks && app.tanks.length > 0) {
            // Sığ dalışlarda basit hesaplama
            const tank = app.tanks[0];
            const tankSize = tank.size || 12;
            const tankPressure = tank.pressure || 200;
            
            // Basit tüketim hesaplaması
            const pressureFactor = (diveDepth / 10) + 1;
            const bottomConsumption = sacRate * pressureFactor * bottomTime;
            const descentTime = diveDepth / 18;
            const ascentTime = diveDepth / 9;
            
            if (diveDepth > 15) {
                ascentTime += 3; // Güvenlik durağı
            }
            
            const totalConsumption = bottomConsumption + 
                                    (sacRate * ((diveDepth / 20) + 1) * descentTime) + 
                                    (sacRate * ((diveDepth / 20) + 1) * ascentTime);
            
            const tankGas = tankSize * tankPressure;
            const remainingGas = tankGas - totalConsumption;
            
            results = [{
                tankIndex: 0,
                tankSize: tankSize,
                initialPressure: tankPressure,
                gasType: tank.gasType || 'air',
                o2: tank.o2 || 21,
                he: tank.he || 0,
                totalConsumption: Math.round(totalConsumption),
                descentConsumption: Math.round(sacRate * ((diveDepth / 20) + 1) * descentTime),
                bottomConsumption: Math.round(bottomConsumption),
                ascentConsumption: Math.round(sacRate * ((diveDepth / 20) + 1) * ascentTime),
                remainingGas: Math.max(0, Math.round(remainingGas)),
                remainingPressure: Math.max(0, Math.round(remainingGas / tankSize)),
                safetyReserve: Math.round(totalConsumption * 0.33),
                safeRemainingPressure: Math.max(0, Math.round((remainingGas - (totalConsumption * 0.33)) / tankSize))
            }];
        }
    }
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="text-center text-muted"><small>No gas consumption data available</small></div>';
        return;
    }
    
    container.innerHTML = '';
    
    results.forEach(result => {
        const gasType = (result.gasType || 'air').charAt(0).toUpperCase() + (result.gasType || 'air').slice(1);
        const gasInfo = result.gasType === 'air' ? 'Air' : 
                       `${gasType} (${result.o2}% O₂${result.he > 0 ? ', ' + result.he + '% He' : ''})`;
