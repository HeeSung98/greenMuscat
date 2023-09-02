const express = require('express')
const router = express.Router()
const controller = require('../controller/GreenController')

// 메인 페이지
router.get('/', controller.main)
// 회원가입 (SignUp)
router.get('/signUp', controller.signUp)
router.post('/signUp', controller.postSignUp)
// 로그인 (SignIn)
rotuer.get('/signIn', controller.signIn)
router.post('/signIn', controller.postSignIn)
// 업로드 페이지 (Post)
router.get('/aPost', controller.aPost)
router.post('/aPost', controller.postAPost)
// 마이 페이지 (Profile)
router.get('/profile:id', controller.profile)
// 회원 정보 수정
router.patch('/profile/edit', controller.editProfile)
// 방 선택 페이지 (Select)
router.get('/select', controller.select)
// 방 메인 페이지 (Room)
router.get('/room:id', controller.room)
// 회원 탈퇴
router.delete('/destroy', controller.destroy)
// 관리자 페이지
router.get('/admin:id', controller.admin)
router.post('/admin:id', controller.postAdmin)

module.exports = router
