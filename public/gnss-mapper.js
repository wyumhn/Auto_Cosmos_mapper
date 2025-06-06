const map = L.map('map').setView([window.START_X, window.START_Y], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const devices = {};
const arrowLayerGroup = L.layerGroup().addTo(map);

// 受信履歴を保存する配列
// const gpsHistory = [];
// const gpsHistoryBody = document.getElementById('gps-history-body');

//
// 色別アイコン生成
//

const createColoredIcon = (color) => L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

//
// アイコンの定義
//

const iconMap = {
    A: createColoredIcon('red'),
    B: createColoredIcon('blue'),
    default: createColoredIcon('green')
};

//
// ポップアップの定義
//

function generatePopupContent(id, lat, lon) {
    return `
        <div>
            <h3>Device ${id}</h3>
            <table>
                <tr><td>Lat</td><td>${lat.toFixed(6)}</td></tr>
                <tr><td>Lng</td><td>${lon.toFixed(6)}</td></tr>
            </table>
        </div>
    `;
}

//
// 履歴リスト
//

function updateGpsHistoryList() {

    let tableRowsHtml = '';

    for (let i = 0; i < gpsHistory.length; i++) {
        const entry = gpsHistory[i];
        const time = new Date(entry.timestamp).toLocaleTimeString();
        tableRowsHtml += `
            <div class="gps-history-grid">
                <div class="gps-history-grid-child gps-history-grid-time">${time}</div>
                <div class="gps-history-grid-child gps-history-grid-id">${entry.id}</div>
                <div class="gps-history-grid-child gps-history-grid-lat">${entry.lat.toFixed(6)}</div>
                <div class="gps-history-grid-child gps-history-grid-lon">${entry.lon.toFixed(6)}</div>
            </div>
        `;
    }

    gpsHistoryBody.innerHTML = tableRowsHtml;
}

//
// デバイスマーカーリスト
//

function updateOrCreateDevice(id, lat, lon, icon) {
    // 初回のみマーカー作成
    if (!devices[id]) {
        const marker = L.marker([lat, lon], { icon }).addTo(map);
        marker.bindPopup(generatePopupContent(id, lat, lon));

        const path = [[lat, lon]];
        const polyline = L.polyline(path, {
            color: icon.options.iconUrl.includes('red') ? 'red' :
                    icon.options.iconUrl.includes('blue') ? 'blue' : 'green'
        }).addTo(map);

        devices[id] = {
            marker,
            path,
            polyline
        };
    } else {
        // マーカーとポップアップ更新
        devices[id].marker.setLatLng([lat, lon]);
        if (devices[id].marker.isPopupOpen()) {
            devices[id].marker.getPopup().setContent(generatePopupContent(id, lat, lon));
        }

        devices[id].path.push([lat, lon]);
        devices[id].polyline.setLatLngs(devices[id].path);
    }
}

function extractDeviceInfo(devices) {
    const simplified = {};

    Object.entries(devices).forEach(([id, dev]) => {
        const latlng = dev.marker.getLatLng();

        // アイコンURLから色名を抽出
        const iconUrl = dev.marker.options.icon?.options?.iconUrl || '';
        const colorMatch = iconUrl.match(/marker-icon-2x-([a-z]+)\.png$/);
        const color = colorMatch ? colorMatch[1] : 'unknown';

        simplified[id] = {
            id,
            lat: latlng.lat,
            lon: latlng.lng,
            color
        };
    });

    return simplified;
}

const socket = io();

socket.on('gps-update', data => {

    const { id, lat, lon } = data;

    /* gpsHistory.push({ id, lat, lon, timestamp: Date.now() }); */
    /* updateGpsHistoryList(); */

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


let userMarker = null;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        position => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            updateOrCreateDevice('あなた', userLat, userLon, iconMap.default);
        },
        error => {
            console.error('ユーザー位置の追跡に失敗しました: ', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 5000
        }
    );
}

