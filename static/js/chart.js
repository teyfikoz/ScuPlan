/**
 * ScuPlan - Chart and Visualization Module
 * Handles drawing and updating dive profile charts
 */

/**
 * Draw a dive profile chart
 * @param {Object} profile - The dive profile data to display
 * @param {string} canvasId - The ID of the canvas element (optional, default: 'diveProfileChart')
 */
function drawDiveProfileChart(profile, canvasId = 'diveProfileChart') {
    // Get the canvas and context
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }
    
    // Check if a chart instance already exists
    let chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Extract time and depth data from profile points with unit conversion
    const timeData = profile.points.map(point => point.time);
    let depthData, depthUnit;
    
    if (window.unitsManager) {
        depthData = profile.points.map(point => window.unitsManager.convertDepth(point.depth, 'metric'));
        depthUnit = window.unitsManager.getDepthUnit();
    } else {
        depthData = profile.points.map(point => point.depth); // Positive values with reversed Y-axis
        depthUnit = 'm';
    }
    
    // Get the phases for coloring
    const phases = profile.points.map(point => point.phase);
    
    // Set up chart colors
    const phaseColors = {
        'surface': 'rgba(0, 123, 255, 0.5)',
        'descent': 'rgba(40, 167, 69, 0.5)',
        'bottom_start': 'rgba(255, 193, 7, 0.5)',
        'bottom_end': 'rgba(255, 193, 7, 0.5)',
        'deco_start': 'rgba(220, 53, 69, 0.5)',
        'deco_stop': 'rgba(220, 53, 69, 0.5)',
        'deco_transit': 'rgba(108, 117, 125, 0.5)',
        'ascent': 'rgba(23, 162, 184, 0.5)'
    };
    
    // Create segment colors based on phases
    const segmentColors = [];
    for (let i = 0; i < phases.length - 1; i++) {
        const phase = phases[i];
        segmentColors.push(phaseColors[phase] || 'rgba(0, 123, 255, 0.5)');
    }
    
    // Create the chart
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: timeData,
            datasets: [{
                label: 'Depth',
                data: depthData,
                borderColor: 'rgba(0, 123, 255, 1)',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: function(context) {
                    const index = context.dataIndex;
                    const phase = phases[index];
                    
                    // Special colors for certain points
                    if (phase === 'deco_stop') {
                        return 'rgba(220, 53, 69, 1)'; // Red for deco stops
                    } else if (phase === 'bottom_start' || phase === 'bottom_end') {
                        return 'rgba(255, 193, 7, 1)'; // Yellow for bottom time
                    } else if (phase === 'surface') {
                        return 'rgba(0, 123, 255, 1)'; // Blue for surface
                    }
                    
                    return 'rgba(0, 123, 255, 1)'; // Default blue
                },
                pointRadius: function(context) {
                    const index = context.dataIndex;
                    const phase = phases[index];
                    
                    // Larger points for important phases
                    if (phase === 'deco_stop' || phase === 'bottom_start' || 
                        phase === 'bottom_end' || phase === 'surface') {
                        return 5;
                    }
                    
                    return 3; // Default size
                },
                segment: {
                    borderColor: function(context) {
                        return segmentColors[context.p0DataIndex] || 'rgba(0, 123, 255, 1)';
                    }
                },
                fill: 'start'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (minutes)'
                    },
                    ticks: {
                        stepSize: 5,
                        callback: function(value) {
                            return value.toFixed(0);
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `Depth (${depthUnit})`
                    },
                    reverse: true, // Invert the scale
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(0);
                        }
                    },
                    min: 0,
                    max: Math.max(...depthData) + 2
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Time: ${tooltipItems[0].parsed.x.toFixed(1)} minutes`;
                        },
                        label: function(context) {
                            return `Depth: ${context.parsed.y.toFixed(1)} ${depthUnit}`;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            const phase = phases[index];
                            
                            // Return phase information
                            let phaseInfo = '';
                            switch (phase) {
                                case 'surface':
                                    return 'At surface';
                                case 'descent':
                                    return 'Descending';
                                case 'bottom_start':
                                case 'bottom_end':
                                    return 'Bottom time';
                                case 'deco_start':
                                case 'deco_stop':
                                    return 'Decompression stop';
                                case 'deco_transit':
                                    return 'Moving between stops';
                                case 'ascent':
                                    return 'Ascending';
                                default:
                                    return '';
                            }
                        }
                    }
                },
                annotation: {
                    annotations: {
                        // Add deco stop annotations
                        ...createDecoAnnotations(profile.decoStops),
                        // Add safety stop annotation if no deco stops
                        ...(!profile.decoStops || profile.decoStops.length === 0 ? createSafetyStopAnnotation() : {})
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Create annotation objects for decompression stops
 * @param {Array} decoStops - Array of decompression stop objects
 * @returns {Object} Annotation configuration objects
 */
function createDecoAnnotations(decoStops) {
    if (!decoStops || decoStops.length === 0) {
        return {};
    }
    
    const annotations = {};
    
    decoStops.forEach((stop, index) => {
        annotations[`decoLine${index}`] = {
            type: 'line',
            yMin: stop.depth,
            yMax: stop.depth,
            borderColor: 'rgba(220, 53, 69, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
                content: `${stop.time}min @ ${stop.depth}m`,
                position: 'end',
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                font: {
                    size: 10
                }
            }
        };
    });
    
    return annotations;
}

/**
 * Create annotation for safety stop (when no deco stops are present)
 * @returns {Object} Safety stop annotation configuration
 */
function createSafetyStopAnnotation() {
    return {
        safetyStop: {
            type: 'line',
            yMin: 5,
            yMax: 5,
            borderColor: 'rgba(40, 167, 69, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
                content: 'Safety Stop (3min @ 5m recommended)',
                position: 'end',
                backgroundColor: 'rgba(40, 167, 69, 0.7)',
                font: {
                    size: 10
                }
            }
        }
    };
}

/**
 * Create a pie chart for gas consumption visualization
 * @param {Object} gasData - Gas consumption data
 * @param {string} canvasId - The ID of the canvas element
 */
function drawGasConsumptionChart(gasData, canvasId) {
    // Get the canvas
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }
    
    // Check if a chart instance already exists
    let chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create data for the chart
    const data = {
        labels: [
            'Descent',
            'Bottom Time',
            'Ascent',
            'Safety Reserve',
            'Remaining Gas'
        ],
        datasets: [{
            data: [
                gasData.descentConsumption,
                gasData.bottomConsumption,
                gasData.ascentConsumption,
                gasData.safetyReserve,
                gasData.safeRemainingVolume
            ],
            backgroundColor: [
                'rgba(40, 167, 69, 0.7)',    // Descent - Green
                'rgba(255, 193, 7, 0.7)',    // Bottom - Yellow
                'rgba(23, 162, 184, 0.7)',   // Ascent - Cyan
                'rgba(220, 53, 69, 0.7)',    // Safety Reserve - Red
                'rgba(0, 123, 255, 0.7)'     // Remaining - Blue
            ],
            borderColor: [
                'rgba(40, 167, 69, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(23, 162, 184, 1)',
                'rgba(220, 53, 69, 1)',
                'rgba(0, 123, 255, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    // Create the chart
    new Chart(canvas, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value.toFixed(1)} L (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/**
 * Draw a bar chart comparing multiple tanks
 * @param {Array} tanksData - Array of tank consumption data
 * @param {string} canvasId - The ID of the canvas element
 */
function drawTanksComparisonChart(tanksData, canvasId) {
    // Get the canvas
    const canvas = document.getElementById(canvasId);
    
    if (!canvas) {
        console.error('Canvas element not found:', canvasId);
        return;
    }
    
    // Check if a chart instance already exists
    let chartInstance = Chart.getChart(canvas);
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Prepare data arrays
    const labels = tanksData.map((tank, index) => `Tank ${index + 1}`);
    const initialVolumes = tanksData.map(tank => tank.tankVolume);
    const consumedVolumes = tanksData.map(tank => tank.totalConsumption);
    const safetyReserves = tanksData.map(tank => tank.safetyReserve);
    const remainingVolumes = tanksData.map(tank => tank.safeRemainingVolume);
    
    // Create the chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Consumed',
                    data: consumedVolumes,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Safety Reserve',
                    data: safetyReserves,
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Remaining',
                    data: remainingVolumes,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Gas Volume (liters)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            // Get tank for this index
                            const tank = tanksData[context.dataIndex];
                            const percentage = Math.round((value / tank.tankVolume) * 100);
                            return `${label}: ${value.toFixed(1)} L (${percentage}% of tank)`;
                        }
                    }
                }
            }
        }
    });
}
