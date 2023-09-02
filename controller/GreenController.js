//* import

//* GET
//? 로그인 전 메인 페이지 (홈 화면)
const main = (req, res) => {
  res.render('main')
}
//? 회원 가입 페이지
const signup = (req, res) => {
  res.render('signup')
}
//? 로그인 페이지
const signin = (req, res) => {
  res.render('signin')
}
//? 게시글 페이지
const board = (req, res) => {
  res.render('board')
}
//? 내 프로필
const profile = (req, res) => {
  // findOne ?
  res.render('profile')
}
//? 방 선택
const select = (req, res) => {
  res.render('select')
}
//? 선택한 방의 메인 페이지
const room = (req, res) => {
  // findOne ?
  res.render('room')
}
//? 관리자 페이지
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

//* POST
const postSignin = async (req, res) => {
  model.db_signin(req.body, (result) => {
    if (result.length > 0) {
      res.json({ result: true, data: result[0] })
    } else {
      res.json({ result: false })
    }
  })
}
//* PATCH

//* DELETE

//----------------------------------------------------
//비교
const compareFunc = (password, dbpass) => bcrypt.compare(password, dbpass)
