const map = L.map('map').setView([window.START_X, window.START_Y], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const devices = {};
const arrowLayerGroup = L.layerGroup().addTo(map);

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

const socket = io();

socket.on('gps-update', data => {
    const { id, lat, lon } = data;

    if (!devices[id]) {
        const icon = iconMap[id] || iconMap.default;
        const marker = L.marker([lat, lon], { icon }).addTo(map);
        marker.bindPopup(generatePopupContent(id, lat, lon));

        const path = [[lat, lon]];
        const polyline = L.polyline(path, { color: icon.options.iconUrl.includes('red') ? 'red' : 'blue' }).addTo(map);

        devices[id] = {
            marker,
            path,
            polyline
        };
    } else {
        devices[id].marker.setLatLng([lat, lon]);
        if (devices[id].marker.isPopupOpen()) {
            devices[id].marker.getPopup().setContent(generatePopupContent(id, lat, lon));
        }
        devices[id].path.push([lat, lon]);
        devices[id].polyline.setLatLngs(devices[id].path);
    }

    const markerA = devices['A']?.marker;
    const markerB = devices['B']?.marker;

    if (!markerA || !markerB) return;

    arrowLayerGroup.clearLayers();

    const latlngA = markerA.getLatLng();
    const latlngB = markerB.getLatLng();

    //
    // 距離ラベルの表示
    //

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

    //
    // 2点間矢印の表示
    //

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

});