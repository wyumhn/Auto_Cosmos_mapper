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

/**
 * @param {Set<string>} topics
 * @param {HTMLElement} container
 */

function getTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    const time = `${hours}:${minutes}:${seconds}:${milliseconds}`;
    return time;
}

function renderTopicList(topics, container, raw) {
    if (!container) {
        console.error("renderTopicList was called with a null container for topics:", topics);
        return;
    }

    const sortedTopics = Array.from(topics).sort();
    const time = getTime()
    const html = `
        ${sortedTopics.map(topic => `
            <li id="topic-${topic}">
                <span>${topic}</span><span>${time}</span>
                <a href="#"></a>
                <div id="topic-${topic}-info" class="modal-box">
                    <button class="close-btn">&times;</button>
                    <h3>${topic}</h3>
                    <pre id="topic-${topic}-raw"><code class="language-yaml"></code></pre>
                </div>
            </li>
            `).join('')}
    `;
    container.innerHTML = html;
}

/**
 * @param {string} topic
 */

function updateTopicTimestamp(topic, raw) {
    const topicId = `topic-${topic}`;
    const topicElement = document.getElementById(topicId);

    const topicRawId = `topic-${topic}-raw`;
    const topicRawElement = document.getElementById(topicRawId);

    if (topicElement) {

        const timeElement = topicElement.querySelector('span:last-child');
        if (timeElement) {
            timeElement.textContent = getTime();
        }

        topicElement.classList.remove('topic-highlight');
        void topicElement.offsetWidth;
        topicElement.classList.add('topic-highlight');

        topicElement.addEventListener('animationend', () => {
            topicElement.classList.remove('topic-highlight');
        }, { once: true });

    }

    if (topicRawElement) {
        const codeElement = topicRawElement.querySelector('code');
        if (codeElement) {
            codeElement.textContent = raw;
            hljs.highlightElement(codeElement);
        }

    }

}

function updateImage(height, width, encoding, imageData, container) {

    if (!container) {
        console.error(`id="${container}" の要素が見つかりません。`);
        return; // コンテナがなければ処理を中断
    }
    // 1. 画像のフォーマットを決定
    //    Pythonハンドラで圧縮された場合は'jpeg'が送られてくるので、それを優先
    //    それ以外の場合は、一般的なPNGとして扱う
    const imageFormat = (encoding === 'jpeg') ? 'jpeg' : 'png';

    // 2. ブラウザが画像を認識できる「Data URI」形式の文字列を作成
    const imageUrl = `data:image/${imageFormat};base64,${imageData}`;

    // 更新
    let imgElement = container.querySelector('img');

    if (imgElement) {
        imgElement.src = imageUrl;
    } else {
        imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = 'ROS Image Stream';

        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';
        imgElement.style.display = 'block';
        container.appendChild(imgElement);
    }
}