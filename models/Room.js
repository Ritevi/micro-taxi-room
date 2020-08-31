const Sequelize = require("sequelize");
const sequelize = require("../libs/sequelize");
const User = require("./User").User;
const error = require("../error/DbError");
const paramError = require("../error/paramError");
const { Op } = require("sequelize");
const TryCatchWrapper = require("../libs/TryCatchWrapper");

class Room extends Sequelize.Model {}

Room.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    maxSub: {
      type: Sequelize.INTEGER,
      defaultValue: 4,
      validate: {
        max: 5, //check
      },
    },
    StartTime: {
      type: Sequelize.DATE,
    },
    Closed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    instaInvite: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    title: {
      type: Sequelize.STRING(64),
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: Sequelize.TEXT,
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: "Room",
    timestamps: false,
  }
);


//todo переделать users and subscribers
Room.belongsTo(User, {
  foreignKey: {
    unique: true,
  },
  as: "Owner",
  hooks: true,
});

User.belongsTo(Room, {
  through: "Subscribe", //{ model: , unique: true }
  as: "SubRoom",
  constraints: false,
});
Room.belongsToMany(User, {
  through: "Subscribe", //{ model: , unique: true }
  as: "Subscriber",
});
//todo чекни трай кетчи и обработку SeqInHttp
//todo переделать транзакции через автоматический роллбэк при ошибке like this const result = await sequelize.transaction(async (t) => {
Room.createRoom = async function (title, description = "", StartTime, userId) {
  const t = await sequelize.transaction();
  StartTime = +StartTime;
  try {
    if (!userId) return new paramError("Room", "NO_USERID");
    if (!StartTime)
      return new paramError("Room", "NO_START_TIME", "add start time to room");
    let room = await Room.create(
      {
        title: title,
        description: description,
        StartTime: StartTime,
      },
      { transaction: t }
    );
    if (room) {
      await room.setOwner(userId, { transaction: t });
      await room.addSubscriber(userId, { transaction: t });
      await t.commit();
      return room;
    } else {
      return new error("Room", "ROOM_NOT_CREATED");
    }
  } catch (e) {
    t.rollback();
    throw error.SeqInDbError(e);
  }
};

Room.prototype.getJSON = TryCatchWrapper(async function (Attr = []) {
  const UsersAttr = Attr;
  const json = await this.toJSON();
  json.Subs = await this.getSubscriber().map((user) => {
    return user.getJSON(UsersAttr);
  });
  return json;
});

Room.findRoom = TryCatchWrapper(async function (roomId) {
  if(!roomId) return paramError("Room","NO_ROOM_ID");

  const room = await Room.findByPk(roomId);
  if (room) {
    return room;
  } else {
    throw new error("Room", "NO_ROOM");
  }
});

//
// Room.InviteFromRoom = TryCatchWrapper(async function (roomId, userId) {
//   const room = await Room.findRoom(roomId);
//   await room.addUserInviteFrom(userId);
//   return await User.getUserById(userId);
// });
//
// Room.RemoveInviteFromRoom = TryCatchWrapper(async function (roomId, userId) {
//   const room = await Room.findRoom(roomId);
//   await room.removeUserInviteFrom(userId);
//   return await User.getUserById(userId);
// });
//
// Room.getInvitesFromRoom = TryCatchWrapper(async function (roomId) {
//   const room = await Room.findRoom(roomId);
//   return await room.getUserInviteFrom();
// });

//
// //todo add apply invite
// User.InviteToRoom = TryCatchWrapper(async function (roomId, userId) {
//   const room = await Room.findRoom(roomId);
//   await room.addUserInviteTo(userId);
//   return await User.getUserById(userId);
// });
//
// User.RemoveInviteToRoom = TryCatchWrapper(async function (roomId, userId) {
//   const room = await Room.findRoom(roomId);
//   await room.removeUserInviteTo(userId);
//   return await User.getUserById(userId);
// });
//
// User.getInvitesToRoom = TryCatchWrapper(async function (roomId) {
//   const room = await Room.findRoom(roomId);
//   return await room.getUserInviteTo();
// });

Room.subscribe = TryCatchWrapper(async function (roomId, userId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");
  if(!userId) return new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  if ((await room.countSubscriber()) > room.maxSub)
    throw new error("Room", "MAX_COUNT_OF_SUB");
  await room.addSubscriber(userId);
  return await User.getUserById(userId);
});

Room.unsubscribe = TryCatchWrapper(async function (roomId, userId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");
  if(!userId) return new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  await room.removeSubscriber(userId);
  return await User.getUserById(userId);
});

Room.getSubs = TryCatchWrapper(async function (roomId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  return await room.getSubscriber();
});

Room.deleteRoom = TryCatchWrapper(async function (roomId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  await room.destroy();
  return room;
});

Room.isOwner = TryCatchWrapper(async function (roomId, userId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");
  if(!userId) return new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  const Owner = await room.getOwner();
  return Owner.id === Number(userId);
});

Room.getRooms = TryCatchWrapper(async function (limit, offset, Closed = null) {
  if(!limit) return new paramError("Room","GET_NO_LIMIT");
  if(!offset) return new paramError("Room","GET_NO_OFFSET");

  let options = {
    limit: limit ? Number(limit) : undefined,
    order: [["createdAt", "DESC"]],
    where: {
      Closed: {
        [Op.or]: Closed == null ? [true, false] : [Closed],
      },
    },
    offset: offset ? Number(offset) : undefined,
  };
  const rooms = await Room.findAndCountAll(options);
  return rooms.rows;
});

Room.changeOwner = TryCatchWrapper(async function (roomId, userId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");
  if(!userId) return new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  await room.setOwner(userId);
  return room.getOwner();
});

Room.getOwnerByRoomID = TryCatchWrapper(async function (roomId) {
  if(!roomId) return new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  return room.getOwner();
});

exports.Room = Room;
