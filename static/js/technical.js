/**
 * ScuPlan - Technical Diving Module
 * Provides advanced gas mixture calculations for technical diving
 */

// Initialize all technical diving calculators
document.addEventListener('DOMContentLoaded', function() {
    // Initialize MOD calculator
    initMODCalculator();
    
    // Initialize END calculator
    initENDCalculator();
    
    // Initialize Best Mix calculator
    initBestMixCalculator();
    
    // Initialize CNS calculator
    initCNSCalculator();
    
    // Initialize Multi-Level calculator
    initMultiLevelCalculator();
});

/**
 * Initialize Maximum Operating Depth (MOD) calculator
 */
function initMODCalculator() {
    const modForm = document.getElementById('modForm');
    if (!modForm) return;
    
    modForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const o2Percentage = parseFloat(document.getElementById('modO2').value);
        const maxPO2 = parseFloat(document.getElementById('modPO2').value);
        
        // Validate inputs
        if (isNaN(o2Percentage) || isNaN(maxPO2) || o2Percentage <= 0 || o2Percentage > 100 || maxPO2 <= 0) {
            showError('modResult', 'modAlert', 'Please enter valid values.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/mod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                o2: o2Percentage,
                maxPo2: maxPO2
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error occurred while calculating MOD.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('modDepth').textContent = data.mod;
            document.getElementById('modDepthCheck').textContent = data.mod;
            document.getElementById('modPO2Check').textContent = data.max_po2;
            
            // Set alert based on the result
            const resultBox = document.getElementById('modResult');
            const alertBox = document.getElementById('modAlert');
            
            if (data.mod <= 0) {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> This gas mixture is not safe for diving.';
            } else if (data.mod <= 18) {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Safe within recreational diving limits.';
            } else if (data.mod <= 40) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Within technical diving limits. Ensure you have proper certification.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Very deep dive. Advanced technical diving training and experience required.';
            }
            
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('modResult', 'modAlert', error.message);
        });
    });
}

/**
 * Initialize Equivalent Narcotic Depth (END) calculator
 */
function initENDCalculator() {
    const endForm = document.getElementById('endForm');
    if (!endForm) return;
    
    endForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const depth = parseFloat(document.getElementById('endDepth').value);
        const o2Percentage = parseFloat(document.getElementById('endO2').value);
        const hePercentage = parseFloat(document.getElementById('endHe').value);
        
        // Validate inputs
        if (isNaN(depth) || isNaN(o2Percentage) || isNaN(hePercentage) || 
            depth < 0 || o2Percentage <= 0 || o2Percentage > 100 || 
            hePercentage < 0 || hePercentage >= 100 || 
            (o2Percentage + hePercentage) > 100) {
            showError('endResult', 'endAlert', 'Please enter valid values. O₂ and He total cannot exceed 100%.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/end', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                depth: depth,
                o2: o2Percentage,
                he: hePercentage
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error occurred while calculating END.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('endValue').textContent = data.end;
            document.getElementById('endActualDepth').textContent = data.depth;
            
            // Calculate N2 percentage
            const n2Percentage = data.n2_percentage;
            
            // Display gas mix
            document.getElementById('endGasMix').textContent = 
                `${o2Percentage}% O₂, ${hePercentage}% He, ${n2Percentage.toFixed(1)}% N₂ (${o2Percentage}/${hePercentage})`;
            
            // Set alert based on the result
            const resultBox = document.getElementById('endResult');
            const alertBox = document.getElementById('endAlert');
            
            if (data.end <= 18) {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Low narcosis risk, within recreational diving limits.';
            } else if (data.end <= 30) {
                alertBox.className = 'alert alert-info mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Medium narcosis risk. Acceptable for technical divers.';
            } else if (data.end <= 40) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> High narcosis risk. Advanced technical diving training required.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Very high narcosis risk. END values over 40m are not recommended.';
            }
            
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('endResult', 'endAlert', error.message);
        });
    });
}

/**
 * Initialize Best Mix calculator
 */
function initBestMixCalculator() {
    const bestMixForm = document.getElementById('bestMixForm');
    if (!bestMixForm) return;
    
    bestMixForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const depth = parseFloat(document.getElementById('bestMixDepth').value);
        const maxPO2 = parseFloat(document.getElementById('bestMixPO2').value);
        const maxEND = parseFloat(document.getElementById('bestMixEND').value);
        
        // Validate inputs
        if (isNaN(depth) || isNaN(maxPO2) || isNaN(maxEND) || 
            depth <= 0 || maxPO2 <= 0 || maxEND <= 0) {
            showError('bestMixResult', 'bestMixAlert', 'Please enter valid values.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/best-mix', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                depth: depth,
                maxPo2: maxPO2,
                maxEnd: maxEND
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error occurred while calculating best mix.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('bestMixName').textContent = data.mix_name;
            document.getElementById('bestMixTargetDepth').textContent = depth;
            document.getElementById('bestMixO2').textContent = data.o2_percentage;
            document.getElementById('bestMixHe').textContent = data.he_percentage;
            document.getElementById('bestMixN2').textContent = data.n2_percentage;
            
            // Set alert based on the result
            const resultBox = document.getElementById('bestMixResult');
            const alertBox = document.getElementById('bestMixAlert');
            
            if (depth <= 30) {
                alertBox.className = 'alert alert-info mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> For this depth, Nitrox mixture may be sufficient.';
            } else if (depth <= 60) {
                alertBox.className = 'alert alert-info mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Trimix usage is recommended for this depth. You must have at least Advanced Trimix certification.';
            } else {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Technical diving limits. Full Trimix certification and advanced equipment required.';
            }
            
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('bestMixResult', 'bestMixAlert', error.message);
        });
    });
}

/**
 * Initialize CNS Oxygen Toxicity calculator
 */
function initCNSCalculator() {
    const cnsForm = document.getElementById('cnsForm');
    if (!cnsForm) return;
    
    // Handle form submission for single calculation
    cnsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const depth = parseFloat(document.getElementById('cnsDepth').value);
        const o2 = parseFloat(document.getElementById('cnsO2').value);
        const time = parseFloat(document.getElementById('cnsTime').value);
        
        if (isNaN(depth) || isNaN(o2) || isNaN(time)) {
            showError('cnsResult', 'cnsAlert', 'Please enter valid values.');
            return;
        }
        
        // Calculate single segment CNS
        const segments = [{
            depth: depth,
            time: time,
            o2: o2
        }];
        
        fetch('/api/tech/cns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ segments: segments })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error calculating CNS loading.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('cnsValue').textContent = data.total_cns;
            document.getElementById('cnsPO2').textContent = data.segments[0].po2;
            document.getElementById('cnsExposureTime').textContent = time;
            
            // Set alert based on CNS level
            const alertBox = document.getElementById('cnsAlert');
            const resultBox = document.getElementById('cnsResult');
            
            if (data.total_cns < 80) {
                alertBox.className = 'alert alert-success mt-3';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> CNS loading is within safe limits.';
            } else if (data.total_cns < 100) {
                alertBox.className = 'alert alert-warning mt-3';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Approaching CNS limit. Consider reducing exposure time.';
            } else {
                alertBox.className = 'alert alert-danger mt-3';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> CNS limit exceeded! Dangerous oxygen exposure.';
            }
            
            alertBox.style.display = 'block';
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('cnsResult', 'cnsAlert', error.message);
        });
    });
    
    // Add new segment - ensure button exists
    const addSegmentBtnCNS = document.getElementById('addSegmentBtn');
    if (addSegmentBtnCNS) {
        addSegmentBtnCNS.addEventListener('click', function() {
            const segmentsTable = document.getElementById('cnsSegmentsTable').querySelector('tbody');
            const newRow = segmentsTable.querySelector('tr.cns-segment').cloneNode(true);
            
            // Clear values
            newRow.querySelectorAll('input').forEach(input => {
                if (input.classList.contains('depth')) {
                    input.value = 30;
                } else if (input.classList.contains('time')) {
                    input.value = 20;
                } else if (input.classList.contains('o2')) {
                    input.value = 32;
                }
            });
            
            // Enable remove button
            const removeBtn = newRow.querySelector('.remove-segment');
            removeBtn.disabled = false;
            removeBtn.addEventListener('click', function() {
                segmentsTable.removeChild(newRow);
            });
            
            segmentsTable.appendChild(newRow);
        });
    }
    
    // Enable removal for the first segment if more segments are added
    document.addEventListener('click', function() {
        const segments = document.querySelectorAll('.cns-segment');
        if (segments.length > 1) {
            segments[0].querySelector('.remove-segment').disabled = false;
        }
    });
    
    // Calculate CNS
    cnsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const segments = [];
        document.querySelectorAll('.cns-segment').forEach(row => {
            const depth = parseFloat(row.querySelector('.depth').value);
            const time = parseFloat(row.querySelector('.time').value);
            const o2 = parseFloat(row.querySelector('.o2').value);
            
            if (!isNaN(depth) && !isNaN(time) && !isNaN(o2) && depth > 0 && time > 0 && o2 > 0) {
                segments.push({
                    depth: depth,
                    time: time,
                    o2: o2
                });
            }
        });
        
        if (segments.length === 0) {
            showError('cnsResult', 'cnsAlert', 'Please enter at least one valid segment.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/cns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                segments: segments
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error calculating CNS loading.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('cnsTotalValue').textContent = data.total_cns;
            
            // Update progress bar
            const progressBar = document.getElementById('cnsProgressBar');
            const cnsValue = Math.min(data.total_cns, 100);
            progressBar.style.width = cnsValue + '%';
            progressBar.setAttribute('aria-valuenow', cnsValue);
            progressBar.textContent = cnsValue + '%';
            
            // Set progress bar color based on CNS value
            if (cnsValue < 50) {
                progressBar.className = 'progress-bar bg-success';
            } else if (cnsValue < 80) {
                progressBar.className = 'progress-bar bg-warning';
            } else {
                progressBar.className = 'progress-bar bg-danger';
            }
            
            // Show segment details
            const detailTable = document.getElementById('cnsDetailTable');
            detailTable.innerHTML = '';
            
            data.segments.forEach(segment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${segment.depth} m</td>
                    <td>${segment.time} dk</td>
                    <td>${segment.po2} bar</td>
                    <td>${segment.segment_cns}%</td>
                `;
                detailTable.appendChild(row);
            });
            
            // Set alert based on the result
            const resultBox = document.getElementById('cnsResult');
            const alertBox = document.getElementById('cnsAlert');
            
            if (data.total_cns < 50) {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Safe CNS level.';
            } else if (data.total_cns < 80) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Elevated CNS level. Be careful and allow recovery time for additional dives.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Dangerous CNS level! This dive is not safe to perform.';
            }
            
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('cnsResult', 'cnsAlert', error.message);
        });
    });
}

/**
 * Initialize Multi-Level Dive Planning calculator
 */
function initMultiLevelCalculator() {
    const multiLevelForm = document.getElementById('multiLevelForm');
    const removeSegmentBtn = document.getElementById('removeSegmentBtn');
    
    if (!multiLevelForm) return;
    
    // Handle form submission
    multiLevelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const segments = [];
        const gases = [];
        
        // Collect segment data
        document.querySelectorAll('.segment-group').forEach((segmentDiv, index) => {
            const depth = parseFloat(segmentDiv.querySelector('.segment-depth').value);
            const time = parseFloat(segmentDiv.querySelector('.segment-time').value);
            const o2 = parseFloat(segmentDiv.querySelector('.segment-o2').value);
            const he = parseFloat(segmentDiv.querySelector('.segment-he').value);
            
            if (!isNaN(depth) && !isNaN(time) && !isNaN(o2) && !isNaN(he)) {
                segments.push({ depth, time, gas_index: index });
                gases.push({ o2, he });
            }
        });
        
        if (segments.length === 0) {
            showError('multiLevelResult', 'multiLevelAlert', 'Please enter at least one valid segment.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/multi-level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                segments: segments,
                gases: gases
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error calculating multi-level profile.');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            document.getElementById('multiLevelTotalTime').textContent = data.total_time || '--';
            document.getElementById('multiLevelMaxDepth').textContent = data.max_depth || '--';
            document.getElementById('multiLevelTotalCNS').textContent = data.total_cns || '--';
            
            // Show results
            document.getElementById('multiLevelResult').style.display = 'block';
        })
        .catch(error => {
            showError('multiLevelResult', 'multiLevelAlert', error.message);
        });
    });
    
    // Add new gas - make sure element exists
    const addGasBtn = document.getElementById('addGasBtn');
    if (addGasBtn) {
        addGasBtn.addEventListener('click', function() {
        const gasesTable = document.getElementById('multiLevelGasesTable').querySelector('tbody');
        const newRow = gasesTable.querySelector('tr.multi-level-gas').cloneNode(true);
        
        // Update gas number
        const gasNumber = gasesTable.querySelectorAll('tr').length + 1;
        newRow.querySelector('.gas-number').textContent = gasNumber;
        
        // Clear values
        newRow.querySelector('.o2').value = 21;
        newRow.querySelector('.he').value = 0;
        
        // Enable remove button
        const removeBtn = newRow.querySelector('.remove-gas');
        removeBtn.disabled = false;
        removeBtn.addEventListener('click', function() {
            gasesTable.removeChild(newRow);
            updateGasNumbers();
            updateSegmentGasSelects();
        });
        
        gasesTable.appendChild(newRow);
        updateSegmentGasSelects();
        });
    }
    
    // Add new segment functionality for multi-level (avoid duplicate declaration)
    const addSegmentBtnMulti = document.getElementById('addSegmentBtn');
    if (addSegmentBtnMulti) {
        addSegmentBtnMulti.addEventListener('click', function() {
            const segmentsTable = document.getElementById('multiLevelSegmentsTable').querySelector('tbody');
            const newRow = segmentsTable.querySelector('tr.multi-level-segment').cloneNode(true);
            
            // Clear values
            newRow.querySelector('.depth').value = 30;
            newRow.querySelector('.time').value = 15;
            
            // Enable remove button
            const removeBtn = newRow.querySelector('.remove-segment');
            removeBtn.disabled = false;
            removeBtn.addEventListener('click', function() {
                segmentsTable.removeChild(newRow);
            });
            
            segmentsTable.appendChild(newRow);
            updateSegmentGasSelects();
        });
    }
    
    // Helper function to update gas numbers
    function updateGasNumbers() {
        const gases = document.querySelectorAll('.multi-level-gas');
        gases.forEach((gas, index) => {
            gas.querySelector('.gas-number').textContent = index + 1;
        });
    }
    
    // Helper function to update gas selects in segments
    function updateSegmentGasSelects() {
        const gasCount = document.querySelectorAll('.multi-level-gas').length;
        const gasSelects = document.querySelectorAll('.gas-index');
        
        gasSelects.forEach(select => {
            // Save current value if possible
            const currentValue = select.value;
            
            // Clear options
            select.innerHTML = '';
            
            // Add options for each gas
            for (let i = 0; i < gasCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i + 1;
                select.appendChild(option);
            }
            
            // Restore value if valid
            if (currentValue < gasCount) {
                select.value = currentValue;
            }
        });
    }
    
    // Enable removal for the first gas/segment if more are added
    document.addEventListener('click', function() {
        const gases = document.querySelectorAll('.multi-level-gas');
        if (gases.length > 1) {
            gases[0].querySelector('.remove-gas').disabled = false;
        }
        
        const segments = document.querySelectorAll('.multi-level-segment');
        if (segments.length > 1) {
            segments[0].querySelector('.remove-segment').disabled = false;
        }
    });
    
    // Calculate Multi-Level Profile
    const calculateBtn = document.getElementById('calculateMultiLevelBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
        // Collect gases data
        const gases = [];
        document.querySelectorAll('.multi-level-gas').forEach(row => {
            const o2 = parseFloat(row.querySelector('.o2').value);
            const he = parseFloat(row.querySelector('.he').value);
            
            if (!isNaN(o2) && !isNaN(he) && o2 > 0 && (o2 + he) <= 100) {
                gases.push({
                    o2: o2,
                    he: he
                });
            }
        });
        
        // Collect segments data
        const segments = [];
        document.querySelectorAll('.multi-level-segment').forEach(row => {
            const depth = parseFloat(row.querySelector('.depth').value);
            const time = parseFloat(row.querySelector('.time').value);
            const gasIndex = parseInt(row.querySelector('.gas-index').value);
            
            if (!isNaN(depth) && !isNaN(time) && !isNaN(gasIndex) && depth > 0 && time > 0 && gasIndex >= 0) {
                segments.push({
                    depth: depth,
                    time: time,
                    gas_index: gasIndex
                });
            }
        });
        
        // Validate data
        if (gases.length === 0) {
            showError('multiLevelResult', 'multiLevelAlert', 'En az bir gaz karışımı girin.');
            return;
        }
        
        if (segments.length === 0) {
            showError('multiLevelResult', 'multiLevelAlert', 'En az bir dalış segmenti girin.');
            return;
        }
        
        // Call API for calculation
        fetch('/api/tech/multi-level', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gases: gases,
                segments: segments
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Çoklu seviye profili hesaplanırken bir hata oluştu.');
            }
            return response.json();
        })
        .then(data => {
            // Display summary results
            document.getElementById('multiLevelTotalTime').textContent = data.total_time;
            document.getElementById('multiLevelMaxDepth').textContent = data.max_depth.toFixed(1);
            document.getElementById('multiLevelMaxEND').textContent = data.max_end.toFixed(1);
            document.getElementById('multiLevelMaxCNS').textContent = data.max_cns.toFixed(1);
            
            // Show segment details
            const detailTable = document.getElementById('multiLevelDetailTable');
            detailTable.innerHTML = '';
            
            data.segments.forEach(segment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${segment.depth.toFixed(1)} m</td>
                    <td>${segment.time} dk</td>
                    <td>${segment.gas.name}</td>
                    <td>${segment.end.toFixed(1)} m</td>
                    <td>${segment.po2.toFixed(2)} bar</td>
                    <td>${segment.cns.toFixed(1)}%</td>
                    <td>${segment.accumulated_cns.toFixed(1)}%</td>
                `;
                detailTable.appendChild(row);
            });
            
            // Set alert based on the result
            const resultBox = document.getElementById('multiLevelResult');
            const alertBox = document.getElementById('multiLevelAlert');
            
            let hasWarning = false;
            let warningText = '';
            
            // Check END limits
            if (data.max_end > 40) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> END over 40m, excessive narcosis risk!</div>';
            } else if (data.max_end > 30) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> END over 30m, approach with caution.</div>';
            }
            
            // Check pO2 limits
            if (data.max_po2 > 1.6) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> pO2 over 1.6, oxygen toxicity risk!</div>';
            } else if (data.max_po2 > 1.4) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> pO2 over 1.4, approach with caution.</div>';
            }
            
            // Check CNS limits
            if (data.max_cns > 80) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> CNS over 80%, oxygen toxicity risk!</div>';
            } else if (data.max_cns > 50) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> CNS over 50%, approach with caution.</div>';
            }
            
            if (hasWarning) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = warningText;
            } else {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Gas values within safe limits.';
            }
            
            resultBox.style.display = 'block';
        })
        .catch(error => {
            showError('multiLevelResult', 'multiLevelAlert', error.message);
        });
    });
}

/**
 * Show error message in result box
 * @param {string} resultBoxId - ID of the result container
 * @param {string} alertBoxId - ID of the alert element
 * @param {string} message - Error message to display
 */
function showError(resultBoxId, alertBoxId, message) {
    const resultBox = document.getElementById(resultBoxId);
    const alertBox = document.getElementById(alertBoxId);
    
    alertBox.className = 'alert alert-danger mt-3 mb-0';
    alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> ' + message;
    
    resultBox.style.display = 'block';
}