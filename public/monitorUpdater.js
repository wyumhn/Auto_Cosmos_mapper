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

function addTopicList(topics, container, raw) {
    if (!container) {
        console.error("renderTopicList was called with a null container for topics:", topics);
        return;
    }

    const sortedTopics = Array.from(topics).sort();
    const time = getTime()
    const html = `
        ${sortedTopics.map(topic => `
            <li id="topic-${topic}">
                <span>${topic}</span><span id="topic-${topic}-time">${time}</span>
                <a href="#"></a>
                <div id="topic-${topic}-info" class="modal-box">
                    <button class="close-btn">&times;</button>
                    <h3>${topic}</h3>
                    <div class="code-container">
                        <button class="copy-button">コピー</button>
                        <pre id="topic-${topic}-raw" class="code-container"><code class="language-yaml"></code></pre>
                    </div>
                </div>
            </li>
            `).join('')}
    `;
    container.innerHTML = html;
}

/**
 * @param {string} topic
 */

function topicUpdateHandler(topic, raw, latestTopicData) {

    if (raw !== undefined) {
        latestTopicData[topic] = raw;
    }

    const topicId = `topic-${topic}`;
    const topicElement = document.getElementById(topicId);

    const topicTimeId = `topic-${topic}-time`;
    const topicTimeElement = document.getElementById(topicTimeId);

    const topicRawId = `topic-${topic}-raw`;
    const topicRawElement = document.getElementById(topicRawId);

    if (!topicElement) return;

    if (topicTimeElement) {
        topicTimeElement.textContent = getTime();
    }

    topicElement.classList.remove('topic-highlight');
    void topicElement.offsetWidth;
    topicElement.classList.add('topic-highlight');

    topicElement.addEventListener('animationend', () => {
        topicElement.classList.remove('topic-highlight');
    }, { once: true });

    const modal = document.getElementById(`topic-${topic}-info`);

    // モーダルに .is-visible クラスが付いている
    if (modal && modal.classList.contains('is-visible')) {
        // もし開いていれば、モーダルの中身もリアルタイムで更新
        updateModalContent(topic, latestTopicData);
    }
}

function updateModalContent(topic, latestTopicData) {
    const topicRawElement = document.getElementById(`topic-${topic}-raw`);
    const codeElement = topicRawElement.querySelector('code');

    const rawData = latestTopicData[topic];

    if (codeElement && rawData !== undefined) {
        let formattedContent = rawData;
        try {
            const jsonObj = (typeof rawData === 'string') ? JSON.parse(rawData) : rawData;
            formattedContent = JSON.stringify(jsonObj, null, 2);
        } catch (e) {
            // console.warn("受信データをJSONとして整形できませんでした。そのまま表示します", e);
        }

        codeElement.textContent = formattedContent;

        delete codeElement.dataset.highlighted;
        hljs.highlightElement(codeElement);
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

function updateCubeRotation(roll, pitch, yaw, cube) {
    cube.style.transform = `
        rotateX(${roll}deg)
        rotateY(calc(${pitch}deg + 135deg))
        rotateZ(${yaw}deg)
    `;
}

function updateMic(data1, data2, data3, data4, data5, data6, data7, data8, container) {
    // コンテナ要素の存在を確認
    if (!container) {
        console.error("エラー: 'container' 要素が見つかりません。有効なHTMLElementを渡してください。");
        return; // コンテナがなければ処理を中断
    }

    // 渡されたデータを配列にまとめる
    const values = [data1, data2, data3, data4, data5, data6, data7, data8];

    const graphs = container.querySelectorAll('.mic-graph');

    // 子要素の数が期待通りか確認
    if (graphs.length !== 8) {
        console.error(`エラー: 指定されたコンテナ内に '.mic-graph' クラスを持つ子要素が8つ見つかりません。見つかった数: ${graphs.length}`);
        return;
    }

    values.forEach((value, index) => {
        // 値が -1.0 から 1.0 の範囲内にあるか確認
        if (typeof value !== 'number' || value < -1.0 || value > 1.0) {
            console.warn(`警告: インデックス ${index} の値 (${value}) は -1.0 から 1.0 の範囲外です。`);
            // 範囲外の場合でも、絶対値は計算されます
        }

        const heightInRem = Math.abs(value); // 絶対値を取得
        graphs[index].style.height = `${heightInRem}rem`;
    });
}