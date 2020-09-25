const Room = require("../models/Room").Room;

exports.post = async function (channel,msg) {
  const { title, description, StartTime, userId } = JSON.parse(msg.content);
  try {
    let room = await Room.createRoom(title, description, StartTime, userId);
    await channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(await room.getJSON())),
        {correlationId: msg.properties.correlationId}
    )
    await channel.ack(msg);
  } catch (err) {
    msg.next();
  }
};

exports.get = async function (channel,msg) {
  try {
    const { closed, offset, limit } = JSON.parse(msg.content);

    let rooms = await Room.getRooms(limit, offset, closed);
    let result = await Promise.all(
      rooms.map(async (room) => {
        return room.getJSON();
      })
    );
    await channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(result)),
          {correlationId: msg.properties.correlationId}
        )
    await channel.ack(msg);
  } catch (err) {
    msg.next();
  }
};
