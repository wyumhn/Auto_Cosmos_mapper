
const topicToEventMap = {
  '/gps/fix': 'gps-update',
  '/imu/data': 'imu-update',
  '/flir_camera/image_raw': 'flir-camera-update',
  '/image-raw': 'sonar-update',
  '/thermal_image': 'thermal-camera-update',
  '/chatter': 'chatter-update',
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
    const dynamicEventName = data.topic.substring(1).replace(/\//g, '-') + '-update';

    io.emit(dynamicEventName, data);
    console.log(`動的イベント生成: トピック '${data.topic}' -> イベント '${dynamicEventName}'`);
  }
}

module.exports = { handleTopicData };
