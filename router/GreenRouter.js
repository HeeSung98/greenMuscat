const controller = require('../controller/GreenController')
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

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(null, Date.now().toString() + '-' + file.originalname)
    },
  }),
})

// 메인 페이지
router.get('/', controller.main)

//!--------- 회원 정보 관련 ---------
// 회원가입 (SignUp)
router.get('/main/signup', controller.signUp)
router.post('/main/signup', controller.postSignUp)
// 로그인 (SignIn)
router.get('/main/signin', controller.signIn)
router.post('/main/signin', controller.postSignIn)
// 로그아웃 (SignOut)
router.post('/main/signout', controller.postSignOut)
// 회원 정보 수정
router.patch('/main/profile/edit', controller.editProfile)
// 회원 탈퇴
router.delete('/main/profile/destroy', controller.deleteProfile)
// 마이 페이지 (Profile)
router.get('/main/profile', controller.profile)
//? 프로필 정보 보내기
router.post('/main/profile', controller.postProfile)

//!--------- 방 관련 ---------
// 방 생성 페이지(roomadd)
router.get('/main/add', controller.roomAdd)
router.post('/main/add', controller.postRoomAdd)
// 방 목록
router.post('/main/lists', controller.postRoomLists)
// 방 입장 (RoomEntrance)
router.post('/main/entrance', controller.postRoomEntrance)
// 방 선택 페이지 (Select)
router.get('/main/select', controller.select)
// 방 메인 페이지 (Room)
router.get('/main/room/:id', controller.room)

//!--------- 게시물 관련 ---------
// 방 게시물 목록 페이지 (Board)
router.get('/room/board', controller.board)
// 게시물 업로드 페이지 (get)
router.get('/room/board/register', controller.boardRegister)
// 게시물 업로드(Post)
router.post(
  '/room/board/register',
  upload.array('files'),
  controller.postBoardRegister
)
// 게시물 삭제 페이지 (Post)
router.delete('/room/board/remove', controller.removeBoard)

//!--------- 댓글 관련 ---------
// 댓글 페이지
// router.get('/room/board/reply', controller.reply)
// 댓글 정보 보내기
// router.post('/room/board/reply', controller.postReply)
// 댓글 달기
router.post('/room/board/reply/register', controller.postRegisterReply)
// 댓글 수정
router.patch('/room/board/reply/edit', controller.editReply)
// 댓글 삭제
router.delete('/room/board/reply/destroy', controller.deleteReply)

//!--------- 공지사항 관련 ---------
//공지사항 작성 (notice)
router.get('/room/notice', controller.notice)
router.post('/room/notice', controller.postNotice)

//!--------- 관리자 관련 ---------
// 관리자 페이지
router.get('/admin', controller.admin)
router.post('/admin', controller.postAdmin)

module.exports = router
