const Room = require("../models/Room").Room;

exports.post = async function (req, res, next) {
  try {
    let room = await Room.createRoom(req.body);
    res.json(await room.getJSON());
  } catch (err) {
    next(err);
  }
};

exports.get = async function (req, res, next) {
  const { closed, offset, limit } = req.query;
  try {
    let rooms = await Room.getRooms(limit, offset, closed);
    let jsonRooms = await Promise.all(
      rooms.map(async (room) => {
        return room.getJSON();
      })
    );
    let response = {
      rooms:jsonRooms,
      size:jsonRooms.length
    }
    res.json(response);
  } catch (err) {
    next(err);
  }
};
