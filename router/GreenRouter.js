const getController = require('../controller/GreenController')
const postController = require('../controller/GreenController')
const patchController = require('../controller/GreenController')
const deleteController = require('../controller/GreenController')
const dotenv = require('dotenv')
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const express = require('express')
const router = express.Router()
dotenv.config()

aws.config.update({
  accessKeyId: process.env.S3_KEYID,
  secretAccessKey: process.env.S3_ACCESSKEY,
  region: process.env.S3_REGION,
  bucket: process.env.S3_BUCKET,
})

const s3 = new aws.S3()

const uploadProfile = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(
        null,
        'profile' + Date.now().toString() + '-' + file.originalname
      )
    },
  }),
})

const uploadRoom = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(null, 'room' + Date.now().toString() + '-' + file.originalname)
    },
  }),
})

const uploadPost = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(null, 'post' + Date.now().toString() + '-' + file.originalname)
    },
  }),
})

// 메인 페이지
router.get('/', getController.main)

//!--------- 회원 정보 관련 ---------
// 회원가입 (SignUp)
router.get('/main/signup', getController.signUp)
router.post('/main/signup', postController.postSignUp)
// 로그인 (SignIn)
router.get('/main/signin', getController.signIn)
router.post('/main/signin', postController.postSignIn)
// 로그아웃 (SignOut)
router.post('/main/signout', postController.postSignOut)
// 회원 정보 수정
router.patch(
  '/main/profile/edit',
  uploadProfile.array('files'),
  patchController.editProfile
)
// 회원 탈퇴
router.delete('/main/profile/destroy', deleteController.deleteProfile)
// 마이 페이지 (Profile)
router.get('/main/profile', getController.profile)
//? 프로필 정보 보내기
router.post('/main/profile', postController.postProfile)

//!--------- 메인 페이지 관련 ---------
// 방 생성 페이지(roomadd)
router.get('/main/add', getController.roomAdd)
router.post('/main/add', postController.postRoomAdd)
// 방 목록
router.post('/main/lists', postController.postRoomLists)
// 방 입장 (RoomEntrance)
router.post('/main/entrance', postController.postRoomEntrance)
// 방 선택 페이지 (Select)
router.get('/main/select', getController.select)

//!--------- 방 페이지 관련 ---------
// 방 메인 페이지 (Room)
router.get('/room/', getController.room)
// 방 이미지 수정 (Room)
router.get('/room/', getController.postRoom)
// 방 게시물 목록 페이지 (Board)
router.get('/room/board', getController.board)
// 게시물 업로드 페이지 (get)
router.get('/room/board/register', getController.boardRegister)
// 게시물 업로드(Post)
router.post(
  '/room/board/register',
  uploadPost.array('files'),
  postController.postBoardRegister
)
// 게시물 삭제 페이지 (Post)
router.delete('/room/board/remove', deleteController.removeBoard)

//!--------- 댓글 관련 ---------
// 댓글 페이지
// router.get('/room/board/reply', controller.reply)
// 댓글 정보 보내기
// router.post('/room/board/reply', controller.postReply)
// 댓글 달기
router.post('/room/board/reply/register', postController.postRegisterReply)
// 댓글 수정
router.patch('/room/board/reply/edit', patchController.editReply)
// 댓글 삭제
router.delete('/room/board/reply/destroy', deleteController.deleteReply)

//!--------- 공지사항 관련 ---------
//공지사항 작성 (notice)
router.get('/room/notice', getController.notice)
router.post('/room/notice', postController.postNotice)

//!--------- 관리자 관련 ---------
// 관리자 페이지
router.get('/admin', getController.admin)
router.post('/admin', postController.postAdmin)

module.exports = router
