const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserProfile = sequelize.define("UserProfile", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return UserProfile;
};
