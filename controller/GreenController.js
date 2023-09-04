//* import
const bcrypt = require('bcrypt')
const { Member, ProfileImage, Room } = require('../models')

// 쿠키 설정
// const cookieConfig = {
//   httpOnly: true,
//   maxAge: 60 * 1000, //1분
// }
// const SECRET = 'mySecret'

//* GET
//? 로그인 전 메인 페이지 (홈 화면)
const main = (req, res) => {
  res.render('main')
}
//? 회원 가입 페이지
const signUp = (req, res) => {
  res.render('signup')
}
//? 로그인 페이지
const signIn = (req, res) => {
  res.render('signin')
}
//? 게시글 페이지
const board = (req, res) => {
  res.render('board')
}
//? 내 프로필
const profile = (req, res) => {
  Member.findOne({
    where: { id: req.params.id },
  }).then((result) => {
    res.render('profile', { data: result })
  })
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
//? 선택한 방의 게시물 페이지 (board)

//? 관리자 페이지 (개인 정보, 수정 버튼, 참여한 전체 학생들 리스트)
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

//* POST
//* 회원가입
const postSignUp = async (req, res) => {
  try {
    const { email, name, nickname, password, point, fromSocial } = req.body
    // const hash = bcryptPassword(password)
    const result = await Member.create({
      email,
      name,
      nickname,
      password,
      // password: hash,
      point,
      fromSocial,
    })
    if (result) res.json({ result: true })
  } catch (error) {
    console.log(error)
  }
}

//* 로그인
const postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body
    // 사용자 조회
    const result = await Member.findOne({
      where: { email },
    })
    console.log('user: ', result)
    if (!result) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
    }
    // 비밀번호 확인
    const compare = comparePassword(password, result.password)
    if (compare) {
      res.json({ result: true })
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다' })
    }
  } catch (err) {
    console.log(err)
  }
}

// 게시물
const postBoard = (req, res) => {}

// 관리자
const postAdmin = (req, res) => {}

//* PATCH
// 회원 정보 수정
const editProfile = (req, res) => {
  const [bearer, token] = req.headers.authorization.split(' ')
  const { profileImage, nickname, password } = req.body

  if (bearer === 'Bearer') {
    //토큰인증
    try {
      const result = jwt.verify(token, SECRET)

      const resultValue = Member.findOne({ where: { email: result.email } })
      console.log(result)
    } catch (error) {
      console.log(error)
      res.json({ result: false })
    }
  } else {
    res.json({ result: false, message: '인증방식이 틀렸습니다.' })
  }
}

//* DELETE
// 회원 탈퇴
const deleteProfile = (req, res) => {
  const { email } = req.body
  User.destroy({ where: { email } }).then(() => {
    // res.clearCookie('testCookie')
    // req.session.destroy()
    res.json({ result: true })
  })
}

module.exports = {
  main,
  signUp,
  signIn,
  profile,
  board,
  select,
  room,
  admin,
  postSignUp,
  postSignIn,
  postBoard,
  editProfile,
  deleteProfile,
  postAdmin,
}

const bcryptPassword = (password) => {
  return bcrypt.hashSync(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compareSync(password, db_password)
}
