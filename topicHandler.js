
const topicToEventMap = {
  '/gps/fix': 'gps-update',
  '/imu/data': 'imu-update',
};

function handleTopicData(io, data) {
  if (!data || typeof data.topic === 'undefined') {
    console.warn('トピック名が含まれていないデータを受信しました:', data);
    return;
  }

  // 対応表からトピック名に合うイベント名を探す
  const eventName = topicToEventMap[data.topic];

  if (eventName) {
    // 対応するイベント名が見つかった場合、そのイベント名でデータを送信
    io.emit(eventName, data);
    console.log(`データ転送: トピック '${data.topic}' -> イベント '${eventName}'`);
  } else {
    /* console.warn(`未定義のトピックを受信しました: ${data.topic}`); */
  }
}

module.exports = { handleTopicData };
