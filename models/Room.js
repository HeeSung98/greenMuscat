const { DataTypes } = require('sequelize')

const Room = (sequelize) => {
  return sequelize.define(
    'ROOM',
    {
      rNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      rTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      totalPoint: {
        type: DataTypes.BIGINT(20),
        defaultValue: 0,
      },
      muscatTitle: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      muscatLength: {
        type: DataTypes.INTEGER(10),
        defaultValue: null,
      },
      notice: {
        type: DataTypes.STRING(255),
        defaultValue: null,
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
Room.associate = (models) => {
  Room.belongsTo(models.Member, {
    foreignKey: 'member_email',
    sourceKey: 'email',
  })
}
module.exports = Room
