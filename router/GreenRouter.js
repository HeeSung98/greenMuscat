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
router.post('/main/signout', controller.postSignOut)

//공지사항 작성 (notice)
router.get('/notice', controller.notice)
router.post('/postNotice', controller.postNotice)

// 마이 페이지 (Profile)
router.get('/main/profile', controller.profile)

// 회원 정보 수정
router.patch('/main/profile/edit', controller.editProfile)

// 회원 탈퇴
router.delete('/main/profile/destroy', controller.deleteProfile)

// 방 생성 페이지(roomadd)
router.get('/main/add', controller.roomAdd)
router.post('/main/add', controller.postRoomAdd)

// 방 목록
router.post('/main/lists', controller.postRoomLists)

// 방 입장 (RoomEntrance)
router.post('/main/entrance', controller.postRoomEntrance)

// 방 선택 페이지 (Select)
router.get('/select', controller.select)

// 방 메인 페이지 (Room)
router.get('/room:id', controller.room)

// 방 게시물 목록 페이지 (Board)
router.get('/room/board', controller.room)

// 게시물 업로드 페이지 (Post)
router.get('/room/board/register', controller.board)
router.post('/room/board/register', controller.postBoardRegister)

// 게시물 수정 페이지 (Post)
router.get('/room/board/modify', controller.board)
router.patch('/room/board/modify', controller.modifyBoard)

// 게시물 삭제 페이지 (Post)
router.delete('/room/board/remove', controller.removeBoard)

// 댓글 페이지
// router.get('/room/board/reply', controller.reply)
// 댓글 정보 보내기
// router.post('/room/board/reply', controller.postReply)
// 댓글 달기
// router.post('/room/board/replyregister', controller.postReplyRegister)

// 관리자 페이지
router.post('/admin', controller.postAdmin)

module.exports = router
