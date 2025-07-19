
const topicToEventMap = {
  '/gps/fix': 'gps-update',
  '/wamv/sensors/gps/gps/fix': 'gps-update',
  '/imu/data': 'imu-update',
  '/wamv/sensors/imu/imu/data': 'imu-update',
  '/filter/quaternion': 'velocity-update',
  '/flir_camera/image_raw': 'flir-camera-update',
  '/image_color/compressed': 'flir-camera-update',
  '/wamv/sensors/cameras/front_left_camera_sensor/image_raw': 'flir-camera-update',
  '/image_raw/compressed': 'sonar-update',
  '/image_raw': 'sonar-update',
  '/mic1/audio/compressed': 'mic1-update',
  '/mic2/audio/compressed': 'mic2-update',
  '/mic3/audio/compressed': 'mic3-update',
  '/mic4/audio/compressed': 'mic4-update',
  '/mic5/audio/compressed': 'mic5-update',
  '/mic6/audio/compressed': 'mic6-update',
  '/mic7/audio/compressed': 'mic7-update',
  '/mic8/audio/compressed': 'mic8-update',
  '/thermal_image': 'thermal-camera-update',
  '/thermal_image/compressed': 'thermal-camera-update',
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
