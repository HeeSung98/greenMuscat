const { DataTypes } = require('sequelize')

const ProfileImage = (sequelize) => {
  return sequelize.define(
    'PROFILE_IMAGE',
    {
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
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = ProfileImage
