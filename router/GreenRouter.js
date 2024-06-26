const getController = require('../controller/GetController')
const postController = require('../controller/PostController')
const patchController = require('../controller/PatchController')
const deleteController = require('../controller/DeleteController')
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
        'profile-' + Date.now().toString() + '-' + file.originalname
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
      callback(null, 'room-' + Date.now().toString() + '-' + file.originalname)
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
      callback(
        null,
        'post-' + Date.now().toString().substring(5) + '-' + file.originalname
      )
    },
  }),
})

// 메인 페이지
router.get('/', getController.index)

//!--------- 회원 정보 관련 ---------
// 회원가입 (SignUp)
router.get('/main', getController.main)
router.get('/main/signup', getController.signUp)
router.post('/main/signup', postController.postSignUp)
// 로그인 (SignIn)
router.get('/main/signin', getController.signIn)
router.post('/main/signin', postController.postSignIn)
// 로그아웃 (SignOut)
router.post('/main/signout', postController.postSignOut)
// 회원 정보 수정
router.patch(
  '/room/profile/edit',
  uploadProfile.single('file'),
  patchController.editProfile
)

// 회원 탈퇴
router.delete('/room/profile/destroy', deleteController.deleteProfile)
// 마이 페이지 (Profile)
router.get('/room/profile', getController.profile)
//? 프로필 정보 보내기
router.post('/room/profile', postController.postProfile)

//!--------- 메인 페이지 관련 ---------
// 방 생성 페이지(roomadd)
router.post('/main/add', uploadRoom.single('file'), postController.postRoomAdd)
// 방 목록 불러오기
router.post('/main', postController.postRoomList)

//!--------- 방 페이지 관련 ---------
// 방 탐색
router.post('/room/find', postController.postRoomFind)
// 방 입장
router.post('/room', postController.postRoom)
// 방 게시물 목록 페이지 (Board)
router.post('/room/board', postController.postBoard)
router.post('/room/board/like', postController.postLike)
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
// router.get('/main/room/board/reply', controller.reply)
// 댓글 정보 보내기
router.post('/room/board/reply', postController.postReply)
// 댓글 달기
router.post('/room/board/reply/register', postController.postRegisterReply)
// 댓글 수정
router.patch('/room/board/reply/edit', patchController.editReply)
// 댓글 삭제
router.delete('/room/board/reply/destroy', deleteController.deleteReply)

//!--------- 공지사항 관련 ---------
//공지사항 작성 (notice)
router.get('/room/notice', getController.notice)
router.patch('/room/notice', patchController.editNotice)

//!---------- 관리자 관련 ----------
// 관리자 페이지
router.get('/admin', getController.admin)
router.post('/admin', postController.postAdmin)

module.exports = router
