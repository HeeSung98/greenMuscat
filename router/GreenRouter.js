const express = require('express')
const router = express.Router()
const controller = require('../controller/GreenController')

// 메인 페이지
router.get('/', controller.main)

// 회원가입 (SignUp)
router.get('/signup', controller.signUp)
router.post('/signup', controller.postSignUp)

// 로그인 (SignIn)
router.get('/signin', controller.signIn)
router.post('/signin', controller.postSignIn)

// 로그아웃 (SignOut)
router.post('/signout', controller.postSignOut)

// 방 생성 페이지(roomadd)
router.get('/roomadd', controller.roomAdd)
router.post('/roomadd', controller.postRoomAdd)

// 스레드 페이지 (board)
router.get('/board', controller.board)

// 게시글 업로드 페이지 (BoardRegister)
router.get('/board/register', controller.BoardRegister)
router.post('/board/register', controller.postBoardRegister)

//공지사항 작성 (notice)
router.get('/notice', controller.notice)
router.post('/postNotice', controller.postNotice)

// 마이 페이지 (Profile)
router.get('/profile', controller.profile)

// 회원 정보 수정
router.patch('/profile/edit', controller.editProfile)

// 방 선택 페이지 (Select)
router.get('/select', controller.select)

// 방 메인 페이지 (Room)
router.get('/room:id', controller.room)

// 회원 탈퇴
router.delete('/destroy', controller.deleteProfile)

// 관리자 페이지
router.get('/admin', controller.admin)
router.post('/admin', controller.postAdmin)

module.exports = router
