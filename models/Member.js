const { DataTypes } = require('sequelize')
// const { sequelize } = require('.')

const Member = (sequelize) => {
  return sequelize.define('member', {
    //컬럼 정의
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    point: {
      type: DataTypes.BIGINT(20),
    },
    fromSocial: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
    },
  })
}

module.exports = Member
