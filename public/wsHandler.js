const latestTopicData = {};

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
                addTopicList(receivedTopics, topicListElement, raw);
            }
            else {
                topicUpdateHandler(topic, raw, latestTopicData);
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


    socket.on('mic1-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic1');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic1-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic1');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic1-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic1');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic2-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic2');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic3-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic3');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic4-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic4');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic5-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic5');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic6-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic6');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic7-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic7');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
    });

    socket.on('mic8-update', data => {
        const { data1, data2, data3, data4, data5, data6, data7, data8 } = data;
        const container = document.getElementById('mic8');

        updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container);
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