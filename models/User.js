const Sequelize = require("sequelize");
const sequelize = require("../libs/sequelize");
const TryCatchWrapper = require("../libs/TryCatchWrapper");

class User extends Sequelize.Model {}

User.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
        },
        UserId:{
            type: Sequelize.INTEGER
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        sequelize,
        modelName: "User",
        timestamps: false,
    }
);


exports.User = User;