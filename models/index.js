'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'deploy'
const config = require(__dirname + '/../config/config.json')[env]
const db = {}

let sequelize
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )
}

db.mMember = require('./Member')(sequelize)
db.mProfileImage = require('./ProfileImage')(sequelize)
db.mRoom = require('./Room')(sequelize)
db.mMembersInRoom = require('./MembersInRoom')(sequelize)
db.mPost = require('./Post')(sequelize)
db.mPostImage = require('./PostImage')(sequelize)
db.mReply = require('./Reply')(sequelize)

// 멤버와 프로필 사진의 연관관계
db.mMember.hasOne(db.mProfileImage, {
  foreignKey: {
    name: 'MEMBER_email',
    unique: true, // 고유(unique) 외래 키 설정
  },
  sourceKey: 'email',
})
db.mProfileImage.belongsTo(db.mMember, {
  foreignKey: {
    name: 'MEMBER_email',
    unique: true, // 고유(unique) 외래 키 설정
  },
  sourceKey: 'email',
})

// 방과 MIR의 연관관계
db.mRoom.hasMany(db.mMembersInRoom, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
  allowNull: false,
})
db.mMembersInRoom.belongsTo(db.mRoom, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
  allowNull: false,
})

// 멤버와 MIR의 연관관계
db.mMember.hasMany(db.mMembersInRoom, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})
db.mMembersInRoom.belongsTo(db.mMember, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})

// 멤버와 게시글의 연관관계
db.mMember.hasMany(db.mPost, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})
db.mPost.belongsTo(db.mMember, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})

// 멤버와 댓글의 연관관계
db.mMember.hasMany(db.mReply, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})
db.mReply.belongsTo(db.mMember, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  allowNull: false,
})

// 방과 게시글의 연관관계
db.mRoom.hasMany(db.mPost, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
  allowNull: false,
})
db.mPost.belongsTo(db.mRoom, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
  allowNull: false,
})

// 게시글과 댓글의 연관관계
db.mPost.hasMany(db.mReply, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
  allowNull: false,
})
db.mReply.belongsTo(db.mPost, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
  allowNull: false,
})

//게시글과 게시글이미지의 연관관계
db.mPost.hasMany(db.mPostImage, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})
db.mPostImage.belongsTo(db.mPost, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
