const { DataTypes } = require('sequelize')

const ProfileImage = (sequelize) => {
  return sequelize.define('profile_image', {
    inum: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      //   autoIncrement: true,
    },
    iname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  })
}

module.exports = ProfileImage
