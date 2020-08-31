const Room = require("../models/Room").Room;

exports.get = async function (req, res, next) {
  const roomId = req.params.roomId;
  try {
    let room = await Room.findRoom(roomId);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

exports.delete = async function (req, res, next) {
  const roomId = req.params.roomId;
  try {
    let room = await Room.deleteRoom(roomId);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};
