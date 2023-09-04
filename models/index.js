'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
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
db.member.hasOne(db.profileImage, {
  foreignKey: {
    name: 'MEMBER_email',
    unique: true, // 고유(unique) 외래 키 설정
  },
  sourceKey: 'email',
})
db.profileImage.belongsTo(db.member, {
  foreignKey: {
    name: 'MEMBER_email',
    unique: true, // 고유(unique) 외래 키 설정
  },
  sourceKey: 'email',
})

// 방과 MIR의 연관관계
db.room.hasMany(db.membersInRoom, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
})
db.membersInRoom.belongsTo(db.room, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
})

// 멤버와 MIR의 연관관계
db.member.hasMany(db.membersInRoom, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})
db.membersInRoom.belongsTo(db.member, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 멤버와 게시글의 연관관계
db.member.hasMany(db.post, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})
db.post.belongsTo(db.member, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 멤버와 댓글의 연관관계
db.member.hasMany(db.reply, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})
db.reply.belongsTo(db.member, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 방과 게시글의 연관관계
db.room.hasMany(db.post, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
})
db.post.belongsTo(db.room, {
  foreignKey: 'ROOM_rNo',
  sourceKey: 'rNo',
})

// 게시글과 댓글의 연관관계
db.post.hasMany(db.reply, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})
db.reply.belongsTo(db.post, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})

//게시글과 게시글이미지의 연관관계
db.post.hasMany(db.postImage, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
