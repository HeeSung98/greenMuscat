const { DataTypes } = require('sequelize')

const Room = (sequelize) => {
  return sequelize.define('room', {
    rno: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    rtitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    totalPoint: {
      type: DataTypes.BIGINT(20),
    },
    muscatTitle: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    muscatLength: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    notice: {
      type: DataTypes.STRING(255),
    },
  })
}
Room.associate = (models) => {
  Room.belongsTo(models.Member, {
    foreignKey: 'member_email',
    sourceKey: 'email',
  })
}
module.exports = Room
