const { DataTypes } = require('sequelize')
// const { sequelize } = require('.')

const Member = (sequelize) => {
  return sequelize.define(
    'MEMBER',
    {
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
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
    }
  )
}

module.exports = Member
