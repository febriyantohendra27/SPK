// Data storage
let crimeData = [];
let crimeChart = null;
let predictionChart = null;
let poldaChart = null;
let regionalPredictionChart = null;

// POLDA coordinate positions for map (relative percentages)
const poldaCoordinates = {
    'polda-metro-jaya': { x: 55, y: 72 },
    'polda-jawa-barat': { x: 48, y: 70 },
    'polda-jawa-tengah': { x: 50, y: 65 },
    'polda-jawa-timur': { x: 53, y: 60 },
    'polda-sumatera-utara': { x: 35, y: 25 },
    'polda-sumatera-selatan': { x: 42, y: 45 },
    'polda-bali': { x: 53, y: 58 },
    'polda-kalimantan-barat': { x: 60, y: 40 },
    'polda-sulawesi-selatan': { x: 75, y: 45 },
    'polda-aceh': { x: 30, y: 15 }
};

// POLDA display names
const poldaNames = {
    'polda-metro-jaya': 'Polda Metro Jaya',
    'polda-jawa-barat': 'Polda Jawa Barat',
    'polda-jawa-tengah': 'Polda Jawa Tengah',
    'polda-jawa-timur': 'Polda Jawa Timur',
    'polda-sumatera-utara': 'Polda Sumatera Utara',
    'polda-sumatera-selatan': 'Polda Sumatera Selatan',
    'polda-bali': 'Polda Bali',
    'polda-kalimantan-barat': 'Polda Kalimantan Barat',
    'polda-sulawesi-selatan': 'Polda Sulawesi Selatan',
    'polda-aceh': 'Polda Aceh'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    updateUI();
    updatePoldaMap();
    updatePoldaAnalysis();
});

// Load data from localStorage
function loadStoredData() {
    const storedData = localStorage.getItem('crimeData');
    if (storedData) {
        crimeData = JSON.parse(storedData);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('crimeData', JSON.stringify(crimeData));
}

// Add new data
function addData() {
    const poldaRegion = document.getElementById('poldaRegion').value;
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const crimeCount = document.getElementById('crimeCount').value;
    
    if (!crimeCount || crimeCount < 0) {
        alert('Masukkan jumlah kejahatan yang valid');
        return;
    }
    
    // Check if data already exists for this combination
    const exists = crimeData.some(item => 
        item.poldaRegion === poldaRegion && 
        item.year === year && 
        item.month === month
    );
    
    if (exists) {
        alert('Data untuk wilayah, bulan, dan tahun ini sudah ada');
        return;
    }
    
    crimeData.push({
        poldaRegion: poldaRegion,
        year: parseInt(year),
        month: parseInt(month),
        count: parseInt(crimeCount),
        date: new Date(parseInt(year), parseInt(month) - 1)
    });
    
    saveData();
    updateUI();
    updatePoldaMap();
    updatePoldaAnalysis();
    
    // Reset form
    document.getElementById('crimeCount').value = '';
}

// Delete data
function deleteData(index) {
    crimeData.splice(index, 1);
    saveData();
    updateUI();
    updatePoldaMap();
    updatePoldaAnalysis();
}

// Load sample yearly data
function loadSampleDataYearly() {
    crimeData = [];
    const regions = Object.keys(poldaCoordinates);
    
    for (let year = 2021; year <= 2023; year++) {
        regions.forEach(region => {
            const baseCount = Math.floor(Math.random() * 50) + 50; // Random base count
            crimeData.push({
                poldaRegion: region,
                year: year,
                month: 6, // Sample month
                count: baseCount + Math.floor(Math.random() * 30), // Random count variation
                date: new Date(year, 5) // June
            });
        });
    }
    
    saveData();
    updateUI(); // Ensure UI is updated after loading sample data
    updatePoldaMap(); // Update the map with new data
    updatePoldaAnalysis(); // Update the analysis with new data
}

// Load sample monthly data
function loadSampleDataMonthly() {
    crimeData = [];
    const regions = Object.keys(poldaCoordinates);
    
    for (let year = 2021; year <= 2023; year++) {
        for (let month = 1; month <= 12; month++) {
            regions.forEach(region => {
                const baseCount = Math.floor(Math.random() * 50) + 50; // Random base count
                crimeData.push({
                    poldaRegion: region,
                    year: year,
                    month: month,
                    count: baseCount + Math.floor(Math.random() * 30), // Random count variation
                    date: new Date(year, month - 1) // Month is 0-indexed
                });
            });
        }
    }
    
    saveData();
    updateUI(); // Ensure UI is updated after loading sample data
    updatePoldaMap(); // Update the map with new data
    updatePoldaAnalysis(); // Update the analysis with new data
}

// Load sample POLDA data with realistic patterns
function loadSamplePoldaData() {
    crimeData = [];
    const regions = Object.keys(poldaCoordinates);
    const regionalPatterns = {
        'polda-metro-jaya': { base: 200, variation: 50 },
        'polda-jawa-barat': { base: 150, variation: 40 },
        'polda-jawa-tengah': { base: 120, variation: 35 },
        'polda-jawa-timur': { base: 180, variation: 45 },
        'polda-sumatera-utara': { base: 90, variation: 30 },
        'polda-sumatera-selatan': { base: 80, variation: 25 },
        'polda-bali': { base: 70, variation: 20 },
        'polda-kalimantan-barat': { base: 60, variation: 20 },
        'polda-sulawesi-selatan': { base: 85, variation: 25 },
        'polda-aceh': { base: 50, variation: 15 }
    };
    
    for (let year = 2021; year <= 2023; year++) {
        for (let month = 1; month <= 12; month++) {
            regions.forEach(region => {
                const pattern = regionalPatterns[region];
                const seasonalFactor = Math.sin((month - 1) * Math.PI / 6) * 20; // Seasonal variation
                const randomFactor = Math.random() * pattern.variation - pattern.variation / 2; // Random variation
                
                crimeData.push({
                    poldaRegion: region,
                    year: year,
                    month: month,
                    count: Math.max(10, Math.round(pattern.base + seasonalFactor + randomFactor)), // Ensure non-negative
                    date: new Date(year, month - 1) // Month is 0-indexed
                });
            });
        }
    }
    
    saveData();
    updateUI(); // Ensure UI is updated after loading sample data
    updatePoldaMap(); // Update the map with new data
    updatePoldaAnalysis(); // Update the analysis with new data
}

// Update UI
function updateUI() {
    updateTable(); // Update the data table
    updateStats(); // Update statistics
    updateChart(); // Update the main crime chart
    updatePoldaMap(); // Update the POLDA map
    updatePoldaAnalysis(); // Update the POLDA analysis
    
    // Show/hide empty data message
    document.getElementById('emptyDataMessage').style.display = 
        crimeData.length === 0 ? 'block' : 'none';
        
    // Show/hide prediction button message
    const uniqueRegions = new Set(crimeData.map(item => item.poldaRegion));
    document.getElementById('noDataMessage').style.display = 
        uniqueRegions.size < 3 ? 'block' : 'none';
}

// Update data table
function updateTable() {
    const tableBody = document.getElementById('crimeDataTable');
    tableBody.innerHTML = '';
    
    // Sort data by date
    crimeData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return a.poldaRegion.localeCompare(b.poldaRegion);
    });
    
    crimeData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${poldaNames[item.poldaRegion]}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.year}</td>
            <td class="px-6 py-4 whitespace-nowrap">${getMonthName(item.month)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.count}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="deleteData(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

    
    saveData();
    updateUI();
    updatePoldaMap();
    updatePoldaAnalysis();
    // ...kurung kurawal penutup dihapus...

// Update UI
function updateUI() {
    updateTable();
    updateStats();
    updateChart();
    updatePoldaAnalysis();
    
    // Show/hide empty data message
    document.getElementById('emptyDataMessage').style.display = 
        crimeData.length === 0 ? 'block' : 'none';
        
    // Show/hide prediction button message
    const uniqueRegions = new Set(crimeData.map(item => item.poldaRegion));
    document.getElementById('noDataMessage').style.display = 
        uniqueRegions.size < 3 ? 'block' : 'none';
}

// Update data table
function updateTable() {
    const tableBody = document.getElementById('crimeDataTable');
    tableBody.innerHTML = '';
    
    // Sort data by date
    crimeData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return a.poldaRegion.localeCompare(b.poldaRegion);
    });
    
    crimeData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${poldaNames[item.poldaRegion]}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.year}</td>
            <td class="px-6 py-4 whitespace-nowrap">${getMonthName(item.month)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.count}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button onclick="deleteData(${index})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Get month name
function getMonthName(month) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
}

// Update statistics
function updateStats() {
    if (crimeData.length === 0) {
        document.getElementById('totalData').textContent = '0';
        document.getElementById('totalRegions').textContent = '0';
        document.getElementById('monthlyAvg').textContent = '0';
        document.getElementById('trend').textContent = 'Stabil';
        return;
    }
    
    const total = crimeData.reduce((sum, item) => sum + item.count, 0);
    const avg = Math.round(total / crimeData.length);
    const uniqueRegions = new Set(crimeData.map(item => item.poldaRegion));
    
    document.getElementById('totalData').textContent = crimeData.length;
    document.getElementById('totalRegions').textContent = uniqueRegions.size;
    document.getElementById('monthlyAvg').textContent = avg;
    
    // Simple trend analysis
    if (crimeData.length >= 2) {
        const last = crimeData[crimeData.length - 1].count;
        const prev = crimeData[crimeData.length - 2].count;
        const trend = last > prev ? 'Naik' : last < prev ? 'Turun' : 'Stabil';
        document.getElementById('trend').textContent = trend;
    }
}

// Update chart
function updateChart() {
    const ctx = document.getElementById('crimeChart').getContext('2d');
    
    if (crimeChart) {
        crimeChart.destroy();
    }
    
    if (crimeData.length === 0) {
        return;
    }
    
    // Prepare data for chart - aggregate by month
    const monthlyData = {};
    crimeData.forEach(item => {
        const key = `${item.year}-${item.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = 0;
        }
        monthlyData[key] += item.count;
    });
    
    const labels = Object.keys(monthlyData).map(key => {
        const [year, month] = key.split('-');
        return `${getMonthName(parseInt(month)).substring(0,3)} ${year}`;
    });
    
    const data = Object.values(monthlyData);
    
    crimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Kejahatan Nasional',
                data: data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Kejahatan'
                    }
                }
            }
        }
    });
}

// Update POLDA Map
function updatePoldaMap() {
    const hotspotsContainer = document.getElementById('poldaHotspots');
    hotspotsContainer.innerHTML = '';
    
    if (crimeData.length === 0) {
        return;
    }
    
    // Calculate average crime count per POLDA
    const poldaStats = {};
    crimeData.forEach(item => {
        if (!poldaStats[item.poldaRegion]) {
            poldaStats[item.poldaRegion] = { total: 0, count: 0 };
        }
        poldaStats[item.poldaRegion].total += item.count;
        poldaStats[item.poldaRegion].count++;
    });
    
    // Create markers for each POLDA
    Object.keys(poldaCoordinates).forEach(poldaKey => {
        const coords = poldaCoordinates[poldaKey];
        const stats = poldaStats[poldaKey];
        
        if (stats) {
            const avgCrime = Math.round(stats.total / stats.count);
            let colorClass = '';
            
            if (avgCrime <= 50) colorClass = 'bg-green-400';
            else if (avgCrime <= 100) colorClass = 'bg-yellow-400';
            else if (avgCrime <= 200) colorClass = 'bg-orange-400';
            else colorClass = 'bg-red-500';
            
            const marker = document.createElement('div');
            marker.className = `polda-marker ${colorClass}`;
            marker.style.left = `${coords.x}%`;
            marker.style.top = `${coords.y}%`;
            marker.onmouseover = () => showTooltip(marker, poldaNames[poldaKey], avgCrime);
            marker.onmouseout = hideTooltip;
            
            hotspotsContainer.appendChild(marker);
        }
    });
}

// Show tooltip for POLDA marker
function showTooltip(marker, poldaName, crimeCount) {
    const tooltip = document.createElement('div');
    tooltip.className = 'polda-tooltip';
    tooltip.innerHTML = `<strong>${poldaName}</strong><br>Rata-rata: ${crimeCount} kasus`;
    tooltip.style.left = marker.style.left;
    tooltip.style.top = `calc(${marker.style.top} - 40px)`;
    
    document.getElementById('poldaHotspots').appendChild(tooltip);
    tooltip.id = 'current-tooltip';
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.getElementById('current-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Update POLDA Analysis
function updatePoldaAnalysis() {
    const filterValue = document.getElementById('poldaFilter').value;
    updatePoldaChart(filterValue);
    updatePoldaRanking();
}

// Update POLDA Chart
function updatePoldaChart(filter) {
    const ctx = document.getElementById('poldaChart').getContext('2d');
    
    if (poldaChart) {
        poldaChart.destroy();
    }
    
    if (crimeData.length === 0) {
        return;
    }
    
    let filteredData = crimeData;
    if (filter !== 'all') {
        filteredData = crimeData.filter(item => item.poldaRegion === filter);
    }
    
    // Aggregate data by POLDA
    const poldaData = {};
    filteredData.forEach(item => {
        if (!poldaData[item.poldaRegion]) {
            poldaData[item.poldaRegion] = { total: 0, count: 0 };
        }
        poldaData[item.poldaRegion].total += item.count;
        poldaData[item.poldaRegion].count++;
    });
    
    const labels = Object.keys(poldaData).map(key => poldaNames[key]);
    const data = Object.values(poldaData).map(stats => Math.round(stats.total / stats.count));
    
    poldaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata Kejahatan per Bulan',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Kejahatan'
                    }
                }
            }
        }
    });
}

// Update POLDA Ranking
function updatePoldaRanking() {
    const rankingContainer = document.getElementById('poldaRanking');
    rankingContainer.innerHTML = '';
    
    if (crimeData.length === 0) {
        return;
    }
    
    // Calculate average per POLDA
    const poldaStats = {};
    crimeData.forEach(item => {
        if (!poldaStats[item.poldaRegion]) {
            poldaStats[item.poldaRegion] = { total: 0, count: 0 };
        }
        poldaStats[item.poldaRegion].total += item.count;
        poldaStats[item.poldaRegion].count++;
    });
    
    // Create ranking array
    const ranking = Object.keys(poldaStats).map(poldaKey => ({
        name: poldaNames[poldaKey],
        avg: Math.round(poldaStats[poldaKey].total / poldaStats[poldaKey].count),
        key: poldaKey
    }));
    
    // Sort by average crime (descending)
    ranking.sort((a, b) => b.avg - a.avg);
    
    // Display ranking
    ranking.forEach((item, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'ranking-item';
        
        let rankColor = 'bg-gray-400';
        if (index === 0) rankColor = 'bg-red-500';
        else if (index === 1) rankColor = 'bg-orange-500';
        else if (index === 2) rankColor = 'bg-yellow-500';
        
        rankItem.innerHTML = `
            <div class="flex items-center">
                <div class="ranking-number ${rankColor} mr-3">${index + 1}</div>
                <span>${item.name}</span>
            </div>
            <span class="font-semibold">${item.avg} kasus/bulan</span>
        `;
        
        rankingContainer.appendChild(rankItem);
    });
}

// Calculate prediction
function calculatePrediction() {
    const uniqueRegions = new Set(crimeData.map(item => item.poldaRegion));
    if (uniqueRegions.size < 3) {
        alert('Minimal data dari 3 wilayah POLDA diperlukan untuk prediksi');
        return;
    }
    
    // Simple linear regression for overall prediction
    const sortedData = [...crimeData].sort((a, b) => a.date - b.date);
    
    const startDate = new Date(sortedData[0].year, sortedData[0].month - 1);
    const xValues = sortedData.map(item => {
        const currentDate = new Date(item.year, item.month - 1);
        return (currentDate - startDate) / (30 * 24 * 60 * 60 * 1000);
    });
    
    const yValues = sortedData.map(item => item.count);
    
    // Linear regression calculation
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 12 months
    const lastX = xValues[xValues.length - 1];
    const predictions = [];
    
    for (let i = 1; i <= 12; i++) {
        const nextX = lastX + i;
        const prediction = Math.round(slope * nextX + intercept);
        predictions.push(Math.max(0, prediction));
    }
    
    // Calculate prediction scenarios
    const avgPrediction = Math.round(predictions.reduce((a, b) => a + b, 0) / predictions.length);
    const highPrediction = Math.round(avgPrediction * 1.3);
    const lowPrediction = Math.round(avgPrediction * 0.7);
    
    // Update UI with predictions
    document.getElementById('highPrediction').textContent = highPrediction;
    document.getElementById('mediumPrediction').textContent = avgPrediction;
    document.getElementById('lowPrediction').textContent = lowPrediction;
    
    // Generate regional predictions and recommendations
    generateRegionalPredictions();
    generateRegionalRecommendations(avgPrediction);
    
    // Update prediction charts
    updatePredictionChart(predictions);
    updateRegionalPredictionChart();
    
    // Show prediction result
    document.getElementById('predictionResult').classList.remove('hidden');
    document.getElementById('noDataMessage').classList.add('hidden');
}

// Generate regional predictions
function generateRegionalPredictions() {
    // This would be more complex in a real system
    // For now, we'll use a simplified approach
    console.log('Generating regional predictions...');
}

// Generate regional recommendations
function generateRegionalRecommendations(avgPrediction) {
    const recommendationsContainer = document.getElementById('regionalRecommendations');
    let html = '';
    
    // Calculate regional statistics
    const poldaStats = {};
    crimeData.forEach(item => {
        if (!poldaStats[item.poldaRegion]) {
            poldaStats[item.poldaRegion] = { total: 0, count: 0 };
        }
        poldaStats[item.poldaRegion].total += item.count;
        poldaStats[item.poldaRegion].count++;
    });
    
    // Generate recommendations for each region
    Object.keys(poldaStats).forEach(poldaKey => {
        const avgCrime = Math.round(poldaStats[poldaKey].total / poldaStats[poldaKey].count);
        const poldaName = poldaNames[poldaKey];
        
        let recommendation = '';
        if (avgCrime > 150) {
            recommendation = `
                <div class="bg-red-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold text-red-800 mb-2">🚨 ${poldaName} - Prioritas Tinggi</h4>
                    <p>Rata-rata ${avgCrime} kasus/bulan memerlukan intervensi segera.</p>
                    <ul class="list-disc list-inside mt-2 ml-4">
                        <li>Tambahkan pos pengamanan</li>
                        <li>Tingkatkan patroli malam</li>
                        <li>Kerjasama dengan masyarakat</li>
                    </ul>
                </div>
            `;
        } else if (avgCrime > 100) {
            recommendation = `
                <div class="bg-orange-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold text-orange-800 mb-2">⚠️ ${poldaName} - Prioritas Sedang</h4>
                    <p>Rata-rata ${avgCrime} kasus/bulan memerlukan monitoring ketat.</p>
                    <ul class="list-disc list-inside mt-2 ml-4">
                        <li>Optimalkan patroli rutin</li>
                        <li>Program pencegahan komunitas</li>
                        <li>Sistem pengawasan tambahan</li>
                    </ul>
                </div>
            `;
        } else {
            recommendation = `
                <div class="bg-green-50 p-4 rounded-lg mb-4">
                    <h4 class="font-semibold text-green-800 mb-2">✅ ${poldaName} - Kondisi Stabil</h4>
                    <p>Rata-rata ${avgCrime} kasus/bulan menunjukkan kondisi terkendali.</p>
                    <ul class="list-disc list-inside mt-2 ml-4">
                        <li>Pertahankan strategi saat ini</li>
                        <li>Fokus pada pencegahan</li>
                        <li>Monitoring berkelanjutan</li>
                    </ul>
                </div>
            `;
        }
        
        html += recommendation;
    });
    
    recommendationsContainer.innerHTML = html;
}

// Update prediction chart
function updatePredictionChart(predictions) {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    
    if (predictionChart) {
        predictionChart.destroy();
    }
    
    const sortedData = [...crimeData].sort((a, b) => a.date - b.date);
    const last12Actual = sortedData.slice(-12);
    const actualLabels = last12Actual.map(item => `${getMonthName(item.month).substring(0,3)} ${item.year}`);
    const actualData = last12Actual.map(item => item.count);
    
    // Generate prediction labels
    const lastDate = new Date(last12Actual[last12Actual.length - 1].year, last12Actual[last12Actual.length - 1].month - 1);
    const predictionLabels = [];
    
    for (let i = 1; i <= 12; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + i);
        predictionLabels.push(`${getMonthName(nextDate.getMonth() + 1).substring(0,3)} ${nextDate.getFullYear()}`);
    }
    
    const allLabels = [...actualLabels, ...predictionLabels];
    const allData = [...actualData, ...predictions];
    
    predictionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allLabels,
            datasets: [
                {
                    label: 'Data Aktual',
                    data: [...actualData, ...Array(12).fill(null)],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Prediksi',
                    data: [...Array(actualData.length).fill(null), ...predictions],
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                               y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Kejahatan'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Update regional prediction chart
function updateRegionalPredictionChart() {
    const ctx = document.getElementById('regionalPredictionChart').getContext('2d');
    
    if (regionalPredictionChart) {
        regionalPredictionChart.destroy();
    }
    
    // Calculate average crime per POLDA
    const poldaStats = {};
    crimeData.forEach(item => {
        if (!poldaStats[item.poldaRegion]) {
            poldaStats[item.poldaRegion] = { total: 0, count: 0 };
        }
        poldaStats[item.poldaRegion].total += item.count;
        poldaStats[item.poldaRegion].count++;
    });
    
    const labels = Object.keys(poldaStats).map(key => poldaNames[key]);
    const currentData = Object.values(poldaStats).map(stats => Math.round(stats.total / stats.count));
    
    // Simple prediction: increase by 10% for demo purposes
    const predictedData = currentData.map(value => Math.round(value * 1.1));
    
    regionalPredictionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Rata-rata Saat Ini',
                    data: currentData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                },
                {
                    label: 'Prediksi Tahun Depan',
                    data: predictedData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Kejahatan'
                    }
                }
            }
        }
    });
}

// Export data function
function exportData() {
    if (crimeData.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8,"
        + "POLDA,Tahun,Bulan,Jumlah Kejahatan\n"
        + crimeData.map(item => 
            `${poldaNames[item.poldaRegion]},${item.year},${getMonthName(item.month)},${item.count}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_kejahatan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Print report function
function printReport() {
    window.print();
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Utility function to get color based on crime level
function getCrimeLevelColor(crimeCount) {
    if (crimeCount <= 50) return 'green';
    if (crimeCount <= 100) return 'yellow';
    if (crimeCount <= 200) return 'orange';
    return 'red';
}

// Utility function to get crime level description
function getCrimeLevelDescription(crimeCount) {
    if (crimeCount <= 50) return 'Rendah';
    if (crimeCount <= 100) return 'Sedang';
    if (crimeCount <= 200) return 'Tinggi';
    return 'Sangat Tinggi';
}

// Initialize date filters
function initializeDateFilters() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('year');
    yearSelect.innerHTML = '';
    
    for (let year = currentYear - 3; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

// Filter data by date range
function filterByDateRange() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Masukkan tanggal yang valid');
        return;
    }
    
    const filteredData = crimeData.filter(item => {
        const itemDate = new Date(item.year, item.month - 1);
        return itemDate >= startDate && itemDate <= endDate;
    });
    
    // Create temporary filtered view
    const tempData = [...filteredData];
    const originalData = [...crimeData];
    crimeData = tempData;
    updateUI();
    updatePoldaMap();
    updatePoldaAnalysis();
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Filter';
    resetButton.className = 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md mt-4';
    resetButton.onclick = () => {
        crimeData = originalData;
        updateUI();
        updatePoldaMap();
        updatePoldaAnalysis();
        resetButton.remove();
    };
    
    const filterSection = document.querySelector('#analysis');
    if (!document.querySelector('#resetFilterButton')) {
        resetButton.id = 'resetFilterButton';
        filterSection.appendChild(resetButton);
    }
}

// Add event listeners for additional functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add export and print buttons
    const addUtilityButtons = () => {
        const analysisSection = document.querySelector('#analysis');
        if (analysisSection && !document.querySelector('#utilityButtons')) {
            const buttonContainer = document.createElement('div');
            buttonContainer.id = 'utilityButtons';
            buttonContainer.className = 'flex space-x-4 mt-6';
            
            buttonContainer.innerHTML = `
                <button onclick="exportData()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
                    <i class="fas fa-download mr-2"></i>Ekspor Data
                </button>
                <button onclick="printReport()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                    <i class="fas fa-print mr-2"></i>Cetak Laporan
                </button>
            `;
            
            analysisSection.appendChild(buttonContainer);
        }
    };
    
    // Add date filter functionality
    const addDateFilter = () => {
        const analysisSection = document.querySelector('#analysis');
        if (analysisSection && !document.querySelector('#dateFilter')) {
            const today = new Date();
            const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
            
            const filterHTML = `
                <div id="dateFilter" class="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h3 class="text-xl font-semibold mb-4">Filter Berdasarkan Tanggal</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
                            <input type="date" id="startDate" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   value="${oneYearAgo.toISOString().split('T')[0]}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
                            <input type="date" id="endDate" class="w-full px-3 py-2 border border-gray-300 rounded-md" 
                                   value="${today.toISOString().split('T')[0]}">
                        </div>
                        <div class="flex items-end">
                            <button onclick="filterByDateRange()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full">
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            analysisSection.insertAdjacentHTML('beforeend', filterHTML);
        }
    };
    
    // Initialize additional features
    setTimeout(() => {
        addUtilityButtons();
        addDateFilter();
        initializeDateFilters();
    }, 1000);
});

// Hotkey support
document.addEventListener('keydown', function(e) {
    // Ctrl+E for export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
    // Ctrl+P for print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printReport();
    }
});

// Responsive adjustments
function checkScreenSize() {
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

window.addEventListener('resize', checkScreenSize);
checkScreenSize();

