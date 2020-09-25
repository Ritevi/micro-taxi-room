const Sequelize = require("sequelize");
const sequelize = require("../libs/sequelize");
const paramError = require("../error/paramError");
const DbError = require("../error/DbError");
const TryCatchWrapper = require("../libs/TryCatchWrapper");

class User extends Sequelize.Model {}

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



exports.User = User;