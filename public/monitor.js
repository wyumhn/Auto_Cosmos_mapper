function renderObjectToHtml(obj, seen = new WeakSet()) {
    if (obj === null) return `<em>null</em>`;
    if (typeof obj === 'undefined') return `<em>undefined</em>`;
    if (typeof obj === 'function') return `<em>[Function]</em>`;
    if (typeof obj !== 'object') return `${obj}`;

    if (seen.has(obj)) return `<em>[Circular]</em>`;
    seen.add(obj);

    if (Array.isArray(obj)) {
        return `<div>${obj.map(item => `<div>${renderObjectToHtml(item, seen)}</div>`).join('')}</div>`;
    }

    return `
        <div>
            ${Object.entries(obj).map(([key, value]) => `
                <div class="data-grid"><div>${key}</div><div class="semicolon">:</div><div>${renderObjectToHtml(value, seen)}</div></div>
            `).join('')}
        </div>
    `;
}

function renderDeviceList(devices, containerId = 'device_list') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Element #${containerId} not found.`);
        return;
    }

    const html = `
        <div class="device-list">
            ${Object.entries(devices).map(([id, device]) => {
                return `
                    <div class="device-entry">
                        <h4>${id}</h4>
                        ${renderObjectToHtml(device)}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = html;
}