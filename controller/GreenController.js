//* import

//* GET
//? 로그인 전 메인 페이지 (홈 화면)
const main = (req, res) => {
  res.render('Main')
}
//? 회원 가입 페이지
const signUp = (req, res) => {
  res.render('SignUp')
}
//? 로그인 페이지
const signIn = (req, res) => {
  res.render('SignIn')
}
//? 게시글 페이지
const aPost = (req, res) => {
  res.render('POST')
}
//? 내 프로필
const profile = (req, res) => {
  // findOne ?
  res.render('Profile')
}
//? 방 선택
const select = (req, res) => {
  res.render('Select')
}
//? 선택한 방의 메인 페이지
const room = (req, res) => {
  // findOne ?
  res.render('Room')
}
//? 관리자 페이지
const admin = (req, res) => {
  // findOne?
  res.render('Admin')
}

//* POST

//* PATCH

//* DELETE
