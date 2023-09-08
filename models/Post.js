const { DataTypes } = require('sequelize')

const POST = (sequelize) => {
  return sequelize.define(
    'POST',
    {
      pNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      pContent: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      like: {
        type: DataTypes.STRING(255),
        defaultValue: 0,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = POST
