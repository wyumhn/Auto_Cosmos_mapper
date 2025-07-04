document.addEventListener('DOMContentLoaded', () => {

    const socket = io();

    /*
    *
    * トピックリストの更新
    *
    */

    const receivedTopics = new Set();
    const topicListElement = document.getElementById('topic-list');
    // console.log('DOM Content Loaded. topicListElement is:', topicListElement);
    socket.onAny((eventName, data) => {
        // console.log(`イベント '${eventName}' を受信:`, data);

        if (data && typeof data.topic === 'string') {
            const topic = data.topic;
            const raw = data.raw_message;

            if (!receivedTopics.has(topic)) {
                receivedTopics.add(topic);
                renderTopicList(receivedTopics, topicListElement, raw);
            }
            else {
                updateTopicTimestamp(topic, raw);
            }
        }
    });

    /*
    *
    * 画像情報の更新
    *
    */

    socket.on('flir-camera-update', data => {
        const { height, width, encoding, data: imageData } = data;
        const container = document.getElementById('flir-camera');

        updateImage(height, width, encoding, imageData, container);
    });

    socket.on('sonar-update', data => {
        const { height, width, encoding, data: imageData } = data;
        const container = document.getElementById('sonar-camera');

        updateImage(height, width, encoding, imageData, container);
    });

    socket.on('thermal-camera-update', data => {
        const { height, width, encoding, data: imageData } = data;
        const container = document.getElementById('thermo-camera');

        updateImage(height, width, encoding, imageData, container);
    });

    socket.on('imu-update', data => {
        const { magnitude, azimuth, elevation } = data.acceleration_spherical;
        const acceleration = document.getElementById('imu-acceleration-cube');
        updateCubeRotation(0, elevation, azimuth, acceleration);

        const { roll, pitch, yaw } = data.euler_angles;
        const gradient = document.getElementById('imu-gradient-cube');
        updateCubeRotation(roll, pitch, yaw, gradient);
    });
    /*
    *
    * GPS情報の更新（マーカーを地図上に追加）
    *
    */

    socket.on('gps-update', data => {

        const { id, lat, lon } = data;

        // gpsHistory.push({ id, lat, lon, timestamp: Date.now() });
        // updateGpsHistoryList();

        const icon = iconMap[id] || iconMap.default;
        updateOrCreateDevice(id, lat, lon, icon);

        const markerA = devices['A']?.marker;
        const markerB = devices['B']?.marker;

        if (!markerA || !markerB) return;

        arrowLayerGroup.clearLayers();

        const latlngA = markerA.getLatLng();
        const latlngB = markerB.getLatLng();

        const distance = latlngA.distanceTo(latlngB);
        const midLat = (latlngA.lat + latlngB.lat) / 2;
        const midLng = (latlngA.lng + latlngB.lng) / 2;

        const label = L.marker([midLat, midLng], {
            icon: L.divIcon({
                className: 'distance-label',
                html: `${distance.toFixed(1)} m`,
                iconSize: [100, 20],
                iconAnchor: [50, 10]
            })
        }).addTo(arrowLayerGroup);

        const line = L.polyline([latlngA, latlngB], { color: 'purple' }).addTo(arrowLayerGroup);

        const decorator = L.polylineDecorator(line, {
            patterns: [
                {
                    offset: '50%',
                    repeat: 0,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 15,
                        polygon: true,
                        pathOptions: {
                            color: 'purple',
                            fillOpacity: 0.5,
                            opacity: 0.5
                        }
                    })
                }
            ]
        }).addTo(arrowLayerGroup);

        updateOrCreateDevice(id, lat, lon, icon);
        const simplified = extractDeviceInfo(devices);
        renderDeviceList(simplified);
    });
});