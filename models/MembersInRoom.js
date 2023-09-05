const { DataTypes } = require('sequelize')

const MEMBERS_IN_ROOM = (sequelize) => {
  return sequelize.define(
    'MEMBERS_IN_ROOM',
    {
      mirNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      role: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mirPoint: {
        type: DataTypes.BIGINT(20),
        defaultValue: 0,
      },
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = MEMBERS_IN_ROOM
