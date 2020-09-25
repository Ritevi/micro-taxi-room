const Room = require("../models/Room").Room;

exports.post = async function (req, res, next) {
  const { title, description, StartTime, userId } = req.body;
  try {
    let room = await Room.createRoom(title, description, StartTime, userId);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

exports.get = async function (req, res, next) {
  const { closed, offset, limit } = req.query;
  try {
    let rooms = await Room.getRooms(limit, offset, closed);
    let result = await Promise.all(
      rooms.map(async (room) => {
        return room.getJSON();
      })
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};
