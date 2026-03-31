document.addEventListener('DOMContentLoaded', () => {

    // Intersection Observer for the sections
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If it contains staggered items, animate them sequentially
                const staggeredItems = entry.target.querySelectorAll('.staggered-fade');
                staggeredItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, index * 100); // 100ms delay between items
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with .slide-up
    const slideElements = document.querySelectorAll('.slide-up');
    slideElements.forEach(el => sectionObserver.observe(el));

    // -- GOOGLE-TIER DASHBOARD LOGIC --
    const startDemoBtn = document.getElementById('startDemoBtn');
    const latencyIndicator = document.getElementById('latencyIndicator');
    const logContainer = document.getElementById('interventionLog');
    
    // Telemetry Elements
    const hudSpeed = document.getElementById('hudSpeed');
    const hudGForce = document.getElementById('hudGForce');
    const hudGForceVert = document.getElementById('hudGForceVert');
    const hudOvertake = document.getElementById('hudOvertake');
    const overallStatus = document.getElementById('overallStatus');
    const visionSvg = document.getElementById('visionSvg');

    // Panel 1: Live Kerala Map (Leaflet)
    let vehicleLat = 10.0270; // Starting near Edappally, Kochi
    let vehicleLng = 76.3080;
    const map = L.map('cityMap').setView([vehicleLat, vehicleLng], 15);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const vehicleIcon = L.divIcon({
        html: '<div style="font-size: 24px; animation: pulse 1.5s infinite;">🚘</div>',
        className: 'vehicle-marker',
        iconSize: [24, 24]
    });
    const vehicleMarker = L.marker([vehicleLat, vehicleLng], {icon: vehicleIcon}).addTo(map);

    // --- Simulator Variables ---
    let hudInterval, visionInterval;
    let currentSpeed = 65; let targetSpeed = 65;
    let currentGForce = 0.05; let targetGForce = 0.05;
    let currentGForceVert = 1.0; let targetGForceVert = 1.0;
    let currentOvertake = 85; let targetOvertake = 85;
    let geofenceTriggered = false;
    let potholeTriggered = false;

    // Create the Ghost Path Line
    const ghostPath = L.polyline([], {color: '#00F0FF', weight: 4, dashArray: '5, 10'}).addTo(map);

    // Helper: Draw SVG Bounding Boxes
    function drawVisionBox(isHazard = false) {
        visionSvg.innerHTML = ''; // Clear old

        const boxWidth = isHazard ? 200 : 80 + Math.random() * 50;
        const boxHeight = isHazard ? 200 : 80 + Math.random() * 50;
        const left = 20 + Math.random() * 40; // Percentage
        const top = 30 + Math.random() * 30;

        const color = isHazard ? "#FF3366" : "#0F9D58";
        const label = isHazard ? "HAZARD: Collision Vector" : `Object ${Math.floor(Math.random()*100)}`;

        const svgContent = `
            <rect x="${left}%" y="${top}%" width="${boxWidth}" height="${boxHeight}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="4" />
            <rect x="${left}%" y="calc(${top}% - 25px)" width="${boxWidth}" height="25" fill="${color}" />
            <text x="calc(${left}% + 5px)" y="calc(${top}% - 8px)" fill="#FFF" font-size="14" font-family="monospace">${label}</text>
        `;
        
        visionSvg.innerHTML = svgContent;

        if (!isHazard) {
            setTimeout(() => { visionSvg.innerHTML = ''; }, 600); // Clear after a moment
        }
    }

    if (startDemoBtn) {
        startDemoBtn.addEventListener('click', () => {
            if (startDemoBtn.classList.contains('active')) return;
            startDemoBtn.classList.add('active');
            startDemoBtn.textContent = '⚫ Simulating Live Route...';
            startDemoBtn.style.backgroundColor = '#111';
            latencyIndicator.style.opacity = '1';

            // Latency Ping
            setInterval(() => {
                latencyIndicator.innerText = `Latency: ${Math.floor(Math.random() * 8) + 4} ms (Edge TPU)`;
            }, 500);

            // Normal Vision Tracking Loop
            visionInterval = setInterval(() => {
                if (!geofenceTriggered) drawVisionBox(false);
            }, 1200);

            // Fast Telemetry & Route Driver Loop
            hudInterval = setInterval(() => {
                // Smooth Lerp
                currentSpeed += (targetSpeed - currentSpeed) * 0.1;
                hudSpeed.innerHTML = `${Math.round(currentSpeed)} <small>km/h</small>`;

                currentGForce += (targetGForce - currentGForce) * 0.1;
                hudGForce.innerHTML = `${currentGForce.toFixed(2)} G`;

                currentGForceVert += (targetGForceVert - currentGForceVert) * 0.15;
                hudGForceVert.innerHTML = `${currentGForceVert.toFixed(2)} G`;

                currentOvertake += (targetOvertake - currentOvertake) * 0.1;
                hudOvertake.innerHTML = `${Math.round(currentOvertake)}%`;
                
                // Colorize overtake based on safety
                if(currentOvertake > 65) hudOvertake.style.color = "#00FF66";
                else if(currentOvertake > 30) hudOvertake.style.color = "#FFCC00";
                else hudOvertake.style.color = "#FF3366";

                // Drive Down NH66
                vehicleLat -= 0.00008; // Moving South
                vehicleLng += 0.00004; // Moving slightly East
                vehicleMarker.setLatLng([vehicleLat, vehicleLng]);
                map.panTo([vehicleLat, vehicleLng], {animate: false});

                // Ghost Path Prediction (Project 5 seconds out)
                let predictedLat = vehicleLat - (0.00008 * 50);
                let predictedLng = vehicleLng + (0.00004 * 50);
                ghostPath.setLatLngs([[vehicleLat, vehicleLng], [predictedLat, predictedLng]]);
                
                // If projected path hits "Black Spot" (10.0220), turn red early
                if(predictedLat <= 10.0220 && !geofenceTriggered) {
                    ghostPath.setStyle({color: '#FF3366'});
                    targetOvertake = 0; // Drop overtake entirely
                } else if (!geofenceTriggered) {
                    ghostPath.setStyle({color: '#00F0FF'});
                }

                // POTHOLE EVENT TRIGGER (Happens exactly at 10.0245)
                if (vehicleLat <= 10.0245 && !potholeTriggered) {
                    potholeTriggered = true;
                    targetGForceVert = 2.8; // Massive vertical spike
                    
                    // Drop a pothole pin
                    const potholeIcon = L.divIcon({ html: '<div style="font-size: 24px;">🕳️</div>', className: 'vehicle-marker', iconSize: [24,24] });
                    L.marker([vehicleLat, vehicleLng], {icon: potholeIcon}).addTo(map)
                        .bindPopup("<b>V2X Pothole Alert</b><br>Logged to Kerala PWD").openPopup();
                        
                    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
                    logContainer.innerHTML = `<div class="log-item" style="border-color:#FFCC00;"><span style="color:#888;">[${time}]</span> 🚧 Crowdsourcing NH66 Road Defect (Pothole Logged).</div>` + logContainer.innerHTML;
                    
                    setTimeout(() => { targetGForceVert = 1.0; }, 800);
                }

                // GEOFENCE TRIGGER: Edappally High Traffic Zone
                if (vehicleLat <= 10.0220 && !geofenceTriggered) {
                    geofenceTriggered = true;
                    
                    // 1. Telemetry Spikes (Harsh Braking / Swerving)
                    targetSpeed = 45; 
                    currentGForce = 1.2; // Massive G-Force lateral spike
                    
                    overallStatus.innerText = "CRITICAL HAZARD EVASION";
                    overallStatus.style.color = "#FF3366";
                    overallStatus.parentElement.style.borderColor = "rgba(255, 51, 102, 0.5)";
                    overallStatus.parentElement.style.background = "rgba(255, 51, 102, 0.1)";

                    // 2. Vision Feed locks onto hazard
                    drawVisionBox(true);

                    // 3. Map Drops V2X Risk Beacon
                    const circle = L.circle([vehicleLat, vehicleLng], {
                        color: '#FF3366', fillColor: '#FF3366', fillOpacity: 0.5, radius: 150
                    }).addTo(map);
                    circle.bindPopup("<b>Invisible Hazard Detected!</b><br>Broadcasting to V2X Mesh.").openPopup();

                    // 4. API Event Trigger
                    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
                    logContainer.innerHTML = `<div class="log-item" style="border-color:#4285F4;"><span style="color:#888;">[${time}]</span> 📡 Initiating Google Edge API Ping...</div>`;

                    fetch('/api/alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            vehicleId: 'KL-07-DEMO',
                            rtoEmail: 'kerala-rto@predictivesafety.inc',
                            ownerEmail: 'owner-live@predictivesafety.inc',
                            riskType: 'Geofenced High-Risk Evasion & Harsh Braking',
                            riskScore: 98
                        })
                    }).then(res => res.json()).then(result => {
                        if (result.success) {
                            const successItem = document.createElement('div');
                            successItem.className = 'log-item';
                            successItem.innerHTML = `<span style="color:#0F9D58;">[API]</span> ✅ Live Alerts Delivered!<br>
                            <a href="${result.rtoPreviewUrl}" target="_blank" style="color: #4285F4;">[View RTO Email]</a> | 
                            <a href="${result.ownerPreviewUrl}" target="_blank" style="color: #4285F4;">[View Owner Email]</a>`;
                            logContainer.prepend(successItem);
                        }
                    }).catch(e => console.error(e));

                    // Cool off after 4 seconds
                    setTimeout(() => {
                        targetSpeed = 65;
                        overallStatus.innerText = "SAFE (Cruising)";
                        overallStatus.style.color = "#0F9D58";
                        overallStatus.parentElement.style.borderColor = "rgba(15, 157, 88, 0.3)";
                        overallStatus.parentElement.style.background = "rgba(15, 157, 88, 0.05)";
                        geofenceTriggered = false; 
                    }, 5000);
                }

                // Random target adjustments if not triggered
                if (!geofenceTriggered && Math.random() > 0.95) {
                    targetSpeed = Math.max(55, Math.min(85, targetSpeed + (Math.random() * 10 - 5)));
                    targetGForce = Math.max(0.01, Math.min(0.1, targetGForce + (Math.random() * 0.04 - 0.02)));
                    targetGForceVert = Math.max(0.9, Math.min(1.1, targetGForceVert + (Math.random() * 0.1 - 0.05)));
                    // Only increase overtake probability if we are decently far from the hazard zone
                    if (vehicleLat - (0.00008 * 50) > 10.0220) {
                        targetOvertake = Math.max(60, Math.min(95, targetOvertake + (Math.random() * 20 - 10)));
                    }
                }

            }, 100);

        });
    }

});
