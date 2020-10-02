const Sequelize = require("sequelize");
const sequelize = require("../libs/sequelize");
const paramError = require("../error/paramError");
const DbError = require("../error/DbError");
const TryCatchWrapper = require("../libs/TryCatchWrapper");
const Room = require("./Room").Room;

class User extends Sequelize.Model {
}

User.init(
    {
        userId:{
            allowNull: false,
            primaryKey: true,
            type: Sequelize.INTEGER
        }
    },
    {
        sequelize,
        modelName: "User",
        timestamps: false,
    }
);

User.prototype.getJSON = async function (){
    let {userId} = this.toJSON();
    return {userId};
}

User.findById = async function (userId){
    if(!userId) throw new paramError("User","NO_USER_ID");
    let user =  await User.findByPk(userId);
    if(user){
        return user;
    } else {
        throw new DbError("User", "USER_NOT_FOUND")
    }
}

User.prototype.isOwner = function (roomId){
    return this.getOwnerRoom()===roomId;
}


User.prototype.isOwnerInSomeRoom = function (){
    return !!this.getOwnerRoom();
}

User.isOwnerInSomeRoom = async function(userId){
    let user = await User.findById(userId);
    return await user.isOwnerInSomeRoom();
}

User.prototype.getOwnerRoom = function (){
    return this.ownerRoom;
}

User.getOwnerRoom =async function (userId){
    let user = await User.findById(userId);
    return await user.getOwnerRoom();
}

User.prototype.isSub = function (roomId){
    return this.getSubRoom()===roomId;
}

User.prototype.isSubInSomeRoom = function (){
    return !!this.getSubRoom();
}

User.isSubInSomeRoom = async function(userId){
    let user = User.findById(userId);
    return await user.isSubInSomeRoom();
}

User.prototype.getSubRoom = function (){
    return this.RoomId;
}

User.getSubRoom =async function (userId){
    let user = await User.findById(userId);
    return await user.getSubRoom();
}

User.prototype.getUserId = function (){
    return this.userId;
}

exports.User = User;