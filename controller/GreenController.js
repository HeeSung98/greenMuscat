//* import
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Member, ProfileImage, Room } = require('../models')
const SECRET = 'mySecretKey'

// 쿠키 설정
// const cookieConfig = {
//   httpOnly: true,
//   maxAge: 60 * 1000, //1분
// }
// const SECRET = 'mySecret'

//* GET
// 로그인 전 메인 페이지 (홈 화면)
const main = (req, res) => {
  res.render('main')
}
// 회원 가입 페이지
const signUp = (req, res) => {
  res.render('signup')
}
// 로그인 페이지
const signIn = (req, res) => {
  res.render('signin')
}
//TODO 로그아웃
// const signOut = (req, res) => {}
//TODO 게시글 페이지
const board = (req, res) => {
  res.render('board')
}
//TODO 내 프로필
// 토큰을 찾고 그 토큰에 해당하는 유저의 마이페이지
// sign으로
const profile = (req, res) => {
  const email = req.params.email
  const token = jwt.sign({ email }, SECRET)
  Member.findOne({
    where: { email },
  }).then((result) => {
    res.render('profile', { data: result })
  })
}
//TODO 방 선택
const select = (req, res) => {
  res.render('select')
}
//TODO 선택한 방의 메인 페이지
const room = (req, res) => {
  // findOne ?
  res.render('room')
}
//TODO 선택한 방의 게시물 페이지 (board)

//TODO 관리자 페이지 (개인 정보, 수정 버튼, 참여한 전체 학생들 리스트)
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

//* POST
//* 회원가입
const postSignUp = async (req, res) => {
  try {
    const { email, name, nickname, password, point, fromSocial } = req.body
    const hash = bcryptPassword(password) // 비밀번호 암호화
    const result = await Member.create({
      email,
      name,
      nickname,
      password,
      password: hash,
      point,
      fromSocial,
    })
    if (result) res.json({ result: true, message: '회원 가입 성공' })
  } catch (error) {
    console.log(error)
  }
}

//* 로그인
const postSignIn = async (req, res) => {
  try {
    const { email, password } = req.body
    // 사용자 조회
    const result = Member.findOne({
      where: { email },
    })
    console.log('email: ', result)
    if (!result) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
    }
    // 비밀번호 확인
    const compare = await comparePassword(password, result.password)
    if (compare) {
      // 비밀번호 일치
      // res.cookie('isLoggin', true, cookieConfig);
      // req.session.userInfo = { name: user.name, id: user.id };
      const token = jwt.sign({ email }, SECRET) // email에 해당하는 token 발급
      res.json({ result: true, token, data: compare })
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다' })
    }
  } catch (err) {
    console.log(err)
  }
}

//TODO 게시물
const postBoard = (req, res) => {}

//TODO 관리자
const postAdmin = (req, res) => {}

//* PATCH
// 회원 정보 수정
const editProfile = (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.json({ result: false, message: '인증 정보가 필요합니다.' })
    return
  }

  const [bearer, token] = authHeader.split(' ')
  if (bearer !== 'Bearer') {
    res.json({ result: false, message: '인증 방식이 틀렸습니다.' })
    return
  }

  const { profileImage, nickname, password } = req.body
  //토큰 검증
  try {
    const decodedToken = jwt.verify(token, SECRET)
    console.log(decodedToken)
    // email이 일치한 하나의 member 찾아서 해당 member 회원 정보 수정.
    Member.findOne({ where: { email: decodedToken.email } }).then((member) => {
      member
        .update({ profileImage, nickname, password })
        .then(() => {
          res.json({ result: true, message: '회원 정보 수정 성공' })
        })
        .catch((error) => {
          console.log(error)
          res.json({ result: false, message: '회원 정보 수정 실패' })
        })
    })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: '토큰 검증 실패' })
  }
}

//* DELETE
// 회원 탈퇴
const deleteProfile = (req, res) => {
  console.log('확인')
  const { email } = req.body
  Member.destroy({ where: { email } }).then(() => {
    // res.clearCookie('testCookie')
    // req.session.destroy()
    res.json({ result: true, message: '회원 탈퇴 성공' })
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
