//* import
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { mMember, mProfileImage, mRoom, mPost } = require('../models')
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
//TODO 게시글 페이지(스레드페이지)
const board = async (req, res) => {
  console.log('게시글 호출')
  // try {
  const result = await mPost.findall({})
  console.log(result)
  //   await mPost.findall({}).then((result) => {
  //     console.log(result)
  //     res.render('board', { data: result })
  //   })
  // } catch (error) {
  //   console.log(error)
  // }
}

//TODO 내 프로필
// 토큰을 찾고 그 토큰에 해당하는 유저의 마이페이지
// sign으로
const profile = async (req, res) => {
  const decodedToken = jwt.verify(token, SECRET)
  try {
    await mMember
      .findOne({
        where: { email: decodedToken.email },
      })
      .then((result) => {
        res.render('profile', { data: result })
      })
  } catch (error) {
    console.log(error)
  }
}

// 방 생성하는 페이지
const roomAdd = (req, res) => {
  res.render('roomadd')
}

// 방 선택하는 페이지
const select = (req, res) => {
  res.render('select', { roomLists: Room })
  console.log('room list: ', roomLists)
}
//TODO 선택한 방의 메인 페이지
const room = (req, res) => {
  // findOne ?
  res.render('room')
}
//TODO 선택한 방의 게시물 작성 페이지 (BoardRegister)
const BoardRegister = (req, res) => {}
//TODO 관리자 페이지 (개인 정보, 수정 버튼, 참여한 전체 학생들 리스트)
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

/* ---------------------------------------------------------- */
//* POST
//* 회원가입
const postSignUp = async (req, res) => {
  try {
    const { email, name, nickname, password, point, fromSocial } = req.body
    const hash = await bcryptPassword(password) // 비밀번호 암호화
    const result = await mMember.create({
      email,
      name,
      nickname,
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
    const result = await mMember.findOne({
      where: { email },
    })
    if (!result) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
    }
    // 비밀번호 확인
    const compare = await comparePassword(password, result.password)
    console.log(compare)
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

// 방 생성하는 페이지
const postRoomAdd = (req, res) => {
  console.log('roomadd: ', req.body)
  const { rtitle, code } = req.body
  mRoom
    .create({
      rtitle,
      code,
    })
    .then(() => {
      res.json({ result: true })
    })
    .catch((error) => {
      console.log('room add 에러: ', error)
    })
}

// 게시물 업로드
const postBoardRegister = async (req, res) => {
  console.log(req.body)
  try {
    const { pTitle, pContent } = req.body
    const result = await mPost.create({
      pTitle,
      pContent,
    })
    if (result) res.json({ result: true, message: '게시물 업로드 성공' })
  } catch (error) {
    console.log(error)
  }
}

//TODO 관리자
const postAdmin = (req, res) => {}

//* PATCH
// 회원 정보 수정
const editProfile = async (req, res) => {
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
  // 토큰 검증
  try {
    const decodedToken = jwt.verify(token, SECRET)
    console.log(decodedToken)

    // email이 일치한 하나의 member 찾아서 해당 member 회원 정보 수정.
    const member = await mMember.findOne({
      where: { email: decodedToken.email },
    })
    if (!member) {
      res.json({ result: false, message: '회원을 찾을 수 없습니다.' })
      return
    }
    await member.update({ profileImage, nickname, password })
    res.json({ result: true, message: '회원 정보 수정 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: '토큰 검증 실패' })
  }
}

//* DELETE
// 회원 탈퇴
const deleteProfile = (req, res) => {
  const { email } = req.body
  mMember.destroy({ where: { email } }).then(() => {
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
  BoardRegister,
  select,
  room,
  roomAdd,
  admin,
  postSignUp,
  postSignIn,
  postBoardRegister,
  editProfile,
  deleteProfile,
  postAdmin,
  postRoomAdd,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
