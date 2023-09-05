const express = require('express')
const router = express.Router()
const controller = require('../controller/GreenController')

// 메인 페이지
router.get('/main', controller.main)

// 회원가입 (SignUp)
router.get('/main/signup', controller.signUp)
router.post('/main/signup', controller.postSignUp)

// 로그인 (SignIn)
router.get('/main/signin', controller.signIn)
router.post('/main/signin', controller.postSignIn)

// 로그아웃 (SignOut)
router.post('/signout', controller.postSignOut)

// 마이 페이지 (Profile)
router.get('/main/profile', controller.profile)

// 회원 정보 수정
router.patch('/main/profile/edit', controller.editProfile)

// 회원 탈퇴
router.delete('/main/profile/destroy', controller.deleteProfile)

// 방 생성 페이지(roomadd)
router.get('/main/add', controller.roomAdd)
router.post('/main/add', controller.postRoomAdd)

// 방 입장 (RoomEntrance)
router.post('/main/entrance')

// 스레드 페이지 (get)
router.get('/board', controller.board)

// 게시글 업로드 페이지
router.get('/board/register', controller.boardRegister)
router.post('/board/register', controller.postBoardRegister)

// 댓글 페이지
router.get('/board/reply', controller.reply)
// 댓글 정보 보내기
router.post('/board/reply', controller.postReply)
// 댓글 달기
router.post('/board/replyregister', controller.postReplyRegister)

// 방 선택 페이지 (Select)
router.get('/select', controller.select)

// 방 메인 페이지 (Room)
router.get('/room:id', controller.room)

// 방 게시물 목록 페이지 (Board)
router.get('/room/board', controller.room)

// 게시물 업로드 페이지 (Post)
router.get('/room/board/register', controller.board)
router.post('/room/board/register', controller.postBoard)

// 게시물 수정 페이지 (Post)
router.get('/room/board/register', controller.board)
router.post('/room/board/register', controller.postBoard)

// 게시물 삭제 페이지 (Post)
router.post('/room/board/register', controller.postBoard)

// 관리자 페이지
router.post('/admin', controller.postAdmin)

module.exports = router
