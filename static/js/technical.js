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
                throw new Error('MOD hesaplanırken bir hata oluştu.');
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
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Bu gaz karışımı ile dalış yapmak güvenli değil.';
            } else if (data.mod <= 18) {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Rekreasyonel dalış sınırları içinde güvenli.';
            } else if (data.mod <= 40) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Teknik dalış sınırları içinde. Uygun sertifikasyona sahip olduğunuzdan emin olun.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Çok derin dalış. İleri teknik dalış eğitimi ve deneyimi gerektirir.';
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
            showError('endResult', 'endAlert', 'Lütfen geçerli değerler girin. O₂ ve He toplamı 100\'den büyük olamaz.');
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
                throw new Error('END hesaplanırken bir hata oluştu.');
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
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Düşük narkoz riski, rekreasyonel dalış sınırları içinde.';
            } else if (data.end <= 30) {
                alertBox.className = 'alert alert-info mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Orta seviye narkoz riski. Teknik dalıcılar için kabul edilebilir.';
            } else if (data.end <= 40) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Yüksek narkoz riski. İleri teknik dalış eğitimi gerektirir.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Çok yüksek narkoz riski. 40m üzerinde END değerleri önerilmez.';
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
            showError('bestMixResult', 'bestMixAlert', 'Lütfen geçerli değerler girin.');
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
                throw new Error('En iyi karışım hesaplanırken bir hata oluştu.');
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
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Bu derinlik için Nitrox karışımı yeterli olabilir.';
            } else if (depth <= 60) {
                alertBox.className = 'alert alert-info mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-info-circle me-2"></i> Bu derinlikte Trimix kullanımı önerilir. En az Advanced Trimix sertifikasına sahip olmalısınız.';
            } else {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Teknik dalış sınırları. Full Trimix sertifikası ve ileri ekipman gerektirir.';
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
    const addSegmentBtn = document.getElementById('addCnsSegment');
    if (!cnsForm || !addSegmentBtn) return;
    
    // Add new segment
    addSegmentBtn.addEventListener('click', function() {
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
            showError('cnsResult', 'cnsAlert', 'En az bir geçerli segment girin.');
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
                throw new Error('CNS hesaplanırken bir hata oluştu.');
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
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Güvenli CNS seviyesi.';
            } else if (data.total_cns < 80) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Yükselen CNS seviyesi. Dikkatli olun ve ek dalışlar için recovery time bırakın.';
            } else {
                alertBox.className = 'alert alert-danger mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Tehlikeli CNS seviyesi! Bu dalışı gerçekleştirmek güvenli değil.';
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
    // Get elements
    const calculateBtn = document.getElementById('calculateMultiLevel');
    const addGasBtn = document.getElementById('addMultiLevelGas');
    const addSegmentBtn = document.getElementById('addMultiLevelSegment');
    
    if (!calculateBtn || !addGasBtn || !addSegmentBtn) return;
    
    // Add new gas
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
    
    // Add new segment
    addSegmentBtn.addEventListener('click', function() {
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
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> END 40m üzerinde, aşırı narkoz riski!</div>';
            } else if (data.max_end > 30) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> END 30m üzerinde, dikkatle yaklaşın.</div>';
            }
            
            // Check pO2 limits
            if (data.max_po2 > 1.6) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> pO2 1.6 üzerinde, oksijen toksisitesi riski!</div>';
            } else if (data.max_po2 > 1.4) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> pO2 1.4 üzerinde, dikkatle yaklaşın.</div>';
            }
            
            // Check CNS limits
            if (data.max_cns > 80) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-triangle me-2"></i> CNS %80 üzerinde, oksijen toksisitesi riski!</div>';
            } else if (data.max_cns > 50) {
                hasWarning = true;
                warningText += '<div><i class="fas fa-exclamation-circle me-2"></i> CNS %50 üzerinde, dikkatle yaklaşın.</div>';
            }
            
            if (hasWarning) {
                alertBox.className = 'alert alert-warning mt-3 mb-0';
                alertBox.innerHTML = warningText;
            } else {
                alertBox.className = 'alert alert-success mt-3 mb-0';
                alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i> Gaz değerleri güvenli sınırlar içinde.';
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