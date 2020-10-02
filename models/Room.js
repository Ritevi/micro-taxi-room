const Sequelize = require("sequelize");
const sequelize = require("../libs/sequelize");
const User = require("./User").User;
const error = require("../error/DbError");
const paramError = require("../error/paramError");
const { Op } = require("sequelize");
const TryCatchWrapper = require("../libs/TryCatchWrapper");
const {RoomConstants,RoomException} = require("./Constants");


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
    timestamps: false
  }
);

//todo Add Hooks after last subscribed removed to destroy room

Room.hasOne(User, {
  as: "owner",
  foreignKey:"ownerRoom"
});


Room.hasMany(User, {
  as: "sub"
});

Room.createRoom = async function (options) {
  let{title, description = "", StartTime, userId} = options;
  if(!title) title="newRoom Time : "+new Date(StartTime).getDate().toString();
  try {
    const result = await sequelize.transaction(async (t)=>
    {
      StartTime = +StartTime;

      if (!userId) return new paramError(RoomConstants.name, RoomConstants.noUserId);
      if(await User.isOwnerInSomeRoom(userId)) throw new error("Room","OWNER_HAS_ROOM");
      if (!StartTime)
        throw new paramError("Room", "NO_START_TIME", "add start time to room");
      let room = await Room.create(
          {
            title: title,
            description: description,
            StartTime: StartTime,
          },
          {transaction: t}
      );
      if (room) {
        let [user, result] = await User.findOrCreate({
          where: {
            userId:userId
          },
          transaction:t
        });
        await room.setOwner(user.userId, {transaction: t});
        await room.addSub(user.userId, {transaction: t});
        return room;
      } else {
        throw new error("Room", "ROOM_NOT_CREATED");
      }
    })

    return result;
  } catch (e) {
    throw error.SeqInDbError(e);
  }
};

Room.prototype.getJSON = async function () {
  let json = this.toJSON();
  let subs = await this.getSub();
  let owner = await this.getOwner();
  json.Owner = !!owner?await owner.getJSON():[];
  json.Subs =!!subs? await Promise.all(await subs.map(async (user) => {
    return user.getJSON();
  })):[];
  return json;
};

Room.findRoom = async function (roomId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");

  const room = await Room.findByPk(roomId);
  if (room) {
    return room;
  } else {
    throw new error("Room", "NO_ROOM");
  }
};


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
//
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

Room.prototype.subscribe = async function(userId){
  if(!userId) throw new paramError("Room","NO_USER_ID");
  if ((await this.countSub()) > this.maxSub)
    throw new error("Room", "MAX_COUNT_OF_SUB");

  let user = await User.findById(userId);
  if(await user.isSubInSomeRoom()){
    let oldRoomId = await user.getSubRoom();
    await Room.unsubscribe(oldRoomId,userId);
  }
  await this.addSub(userId);
  return User.findById(userId);
}



Room.subscribe = async function (roomId, userId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  if(!userId) throw new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  return room.subscribe(userId);
};

Room.prototype.unsubscribe = async function(userId){
    if(!userId) throw new paramError("Room","NO_USER_ID");
    if(await this.hasSub(userId)){
      if(await this.isOwner(userId)){
        if(await this.countSub()===1){
          let roomId = await User.getOwnerRoom(userId);
          await Room.deleteRoom(roomId);
        } else {
          let newOwner = await this.findAnotherOwner();
          await this.changeOwner(newOwner.getUserId());
        }

      }
      await this.removeSub(userId);
      return User.findById(userId);
    }else {
      throw new error("Room","NOT_SUBSCRIBED");
    }

}



Room.unsubscribe = async function (roomId, userId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  if(!userId) throw new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId); //without findOrCreate because user should be already be
  return room.unsubscribe(userId);
};

Room.prototype.findAnotherOwner = async function(){
  let subs = await this.getSub();
  let Owner = await this.getOwner();
    for (let sub of subs) {
      if(sub.userId!==Owner.userId){
        return sub;
      }
    }
}

Room.findAnotherOwner = async function(roomId){
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  const room = await Room.findRoom(roomId);
  return await room.findAnotherOwner();
}


Room.getSubs = TryCatchWrapper(async function (roomId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  return await room.getSub();
});

Room.deleteRoom = async function (roomId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  return await room.destroy();
  // no subs and owner in res
};


Room.prototype.isOwner = async function(userId){
  if(!userId) throw new paramError("Room","NO_USER_ID");

  const Owner = await this.getOwner();
  return Number(Owner.userId) === Number(userId);
}

Room.isOwner = async function (roomId, userId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  if(!userId) throw new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  return room.isOwner(userId);
};

Room.getRooms = async function (limit = 10, offset = 0, Closed = null) {
    let options = {
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
      where: {
        Closed: {
          [Op.or]: Closed == null ? [true, false] : [Closed],
        },
      },
      offset: Number(offset),
    };
    const rooms = await Room.findAll(options);
    return rooms;
};

Room.prototype.changeOwner = async function(userId){
  if(!userId) throw new paramError("Room","NO_USER_ID");
  await this.setOwner(userId);
  return this.getOwner();
}


Room.changeOwner = async function (roomId, userId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  if(!userId) throw new paramError("Room","NO_USER_ID");

  const room = await Room.findRoom(roomId);
  return room.changeOwner(userId);
};

Room.getOwnerByRoomID = async function (roomId) {
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");

  const room = await Room.findRoom(roomId);
  return room.getOwner();
};

Room.hasSub = async function(roomId, userId){
  if(!roomId) throw new paramError("Room","NO_ROOM_ID");
  if(!userId) throw new paramError("Room","NO_USER_ID");

  let room = await Room.findRoom(roomId);
  return room.hasSub(userId);
}

Room.FindNearRoom = async function(options){
  const {time,timeRange} = options;
  if(!time) throw new paramError(RoomConstants.name,RoomException.noTime);



}

Room.prototype.getRoomId = function (){
  return this.roomId;
}




exports.Room = Room;
