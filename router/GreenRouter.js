const express = require('express')
const router = express.Router()
const controller = require('../controller/GreenController')

// 메인 페이지
router.get('/', controller.main)

// 회원가입 (SignUp)
router.get('/signup', controller.signUp)
router.post('/signup', controller.postSignUp)

// 로그인 (SignIn)
<<<<<<< HEAD
router.get('/signIn', controller.signIn)
router.post('/signIn', controller.postSignIn)
// 로그아웃
// router.get('/signOut', controller.signOut)
=======
router.get('/signin', controller.signIn)
router.post('/signin', controller.postSignIn)

// 방 생성 페이지(roomadd)
router.get('/roomadd', controller.roomAdd)
router.post('/roomadd', controller.postRoomAdd)

>>>>>>> ju
// 업로드 페이지 (Post)
router.get('/board:rno', controller.board)
router.post('/board:rno', controller.postBoard)

// 마이 페이지 (Profile)
<<<<<<< HEAD
router.get('/profile', controller.profile)
// 회원 정보 수정
router.patch('/edit', controller.editProfile)
=======
router.get('/profile:id', controller.profile)

// 회원 정보 수정
router.patch('/profile/edit', controller.editProfile)

>>>>>>> ju
// 방 선택 페이지 (Select)
router.get('/select', controller.select)

// 방 메인 페이지 (Room)
<<<<<<< HEAD
router.get('/room', controller.room)
=======
router.get('/room:id', controller.room)

>>>>>>> ju
// 회원 탈퇴
router.delete('/destroy', controller.deleteProfile)

// 관리자 페이지
router.get('/admin', controller.admin)
router.post('/admin', controller.postAdmin)

module.exports = router
