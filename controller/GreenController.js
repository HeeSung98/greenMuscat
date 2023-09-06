//* import
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  mMember,
  mProfileImage,
  mPost,
  mRoom,
  mMembersInRoom,
  mReply,
} = require('../models')
const SECRET = 'mySecretKey'

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

//TODO 게시글 페이지(스레드 페이지)
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
  try {
    const authHeader = req.headers.authorization
    const [bearer, token] = authHeader.split(' ')
    if (!authHeader) {
      res.json({ result: false, message: '인증 정보가 필요합니다.' })
      return
    }
    const decodedToken = jwt.verify(token, SECRET)
    if (bearer !== 'Bearer') {
      res.json({ result: false, message: '인증 방식이 틀렸습니다.' })
      return
    }
    const memberProfile = await mMember.findOne({
      where: { email: decodedToken.email },
    })
    if (memberProfile !== null) {
      // res.render('profile', { data: memberProfile })
      res.json({ result: memberProfile })
      console.log('회원 정보 조회 성공', memberProfile)
    } else {
      return res.json({
        result: false,
        message: '회원 정보를 찾을 수 없습니다.',
      })
    }
  } catch (error) {
    console.log(error)
    return res.json({
      result: false,
      message: '오류가 발생했습니다.',
    })
  }
}

//* 방 생성하는 페이지
const roomAdd = (req, res) => {
  res.render('roomadd')
}

//* 방 선택하는 페이지
const select = (req, res) => {
  res.render('select', { roomLists: mRoom })
  console.log('room list: ', roomLists)
}
//TODO 선택한 방의 메인 페이지
const room = (req, res) => {
  res.render('room')
}

//TODO 전체 댓글 보기
const reply = async (req, res) => {
  const { POST_pNo, ROOM_rNo } = req.params
  try {
    const allReply = await mReply.findAll({
      where: { POST_pNo, ROOM_rNo },
    })
    if (allReply) {
      console.log(allReply)
    }
  } catch (error) {
    console.log(error)
  }
}

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
    const user = await mMember.findOne({
      where: { email },
    })
    if (!user) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
    }
    // 비밀번호 확인
    const compare = await comparePassword(password, user.password)
    console.log(compare)
    if (compare) {
      // 비밀번호 일치
      // res.cookie('isLoggin', true, cookieConfig);
      // req.session.userInfo = { name: user.name, id: user.id };
      const token = jwt.sign({ email }, SECRET, { expiresIn: '3d' }) // email에 해당하는 token 발급. 3일 유효
      // 해당 유저에게 token 할당 후 저장
      user.token = token
      user.save((error, user) => {
        if (error) return res.status(400).json({ error: 'something wrong' })
      })
      // db에 토큰 저장한 후에는 cookie에 토큰 저장하여 이용자 식별
      return res
        .cookie('x_auth', user.token, {
          // 3일간 유지
          maxAge: 1000 * 60 * 60 * 24 * 3,
          httpOnly: true,
        })
        .status(200)
        .json({ loginSuccess: true, token })
      // res.json({ result: true, token, data: compare })
    } else {
      return res
        .status(403)
        .json({ loginSuccess: false, message: '비밀번호가 일치하지 않습니다' })
    }
  } catch (err) {
    console.log(err)
  }
}

//* 로그아웃
// 로그아웃 버튼 누르면 생성되었던 토큰 사라지게 ""
const postSignOut = (req, res) => {
  res.cookie('x_auth', '').json({ logoutSuccess: true })
}

//* 방 생성
const postRoomAdd = async (req, res) => {
  console.log(
    'ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ'
  )
  console.log('postRoomAdd req.body : ', req.body)
  const { rTitle, code, email } = req.body
  try {
    const createdRoom = await mRoom.create({
      rTitle,
      code,
    })
    console.log('createdRoom.rNo:', createdRoom.rNo)
    console.log('createdRoom.rTitle:', createdRoom.rTitle)

    const createdMIR = await mMembersInRoom.create({
      role: 'admin',
      ROOM_rNo: createdRoom.rNo,
      ROOM_rTitle: createdRoom.rTitle,
      ROOM_code: createdRoom.code,
      MEMBER_email: email,
    })
    res.json({ result: true })
  } catch (error) {
    res.json({ error })
  }
}

// 방 입장
const postRoomEntrance = async (req, res) => {
  console.log('--------------방 입장--------------')
  const { code, email } = req.body
  try {
    const findedRoom = await mRoom.findOne({
      code,
    })
    const createdMIR = await mMembersInRoom.create({
      role: 'member',
      ROOM_rTitle: findedRoom.rTitle,
      ROOM_code: findedRoom.code,
      ROOM_rNo: findedRoom.rNo,
      MEMBER_email: email,
    })
    res.json({ result: true })
  } catch (error) {
    res.json({ error })
  }
}

// 방 목록
const postRoomLists = async (req, res) => {
  console.log('--------------방 목록--------------')
  const { email } = req.body
  try {
    await mMembersInRoom.findAll({
      attributes: ['ROOM_rTitle'],
      where: { MEMBER_email: email },
    })
  } catch (error) {
    res.json({ error })
  }
}

//* 게시물 업로드
const postBoardRegister = async (req, res) => {
  console.log(req.body)
  try {
    const { pTitle, pContent, ROOM_rNo } = req.body
    const result = await mPost.create({
      pTitle,
      pContent,
      ROOM_rNo,
    })
    if (result) res.json({ result: true, message: '게시물 업로드 성공' })
  } catch (error) {
    console.log(error)
  }
}

//TODO 댓글 정보
const postReply = async (req, res) => {
  const { POST_pNo } = req.body
  const allReply = await mReply.findAll({ where: { POST_pNo } })
  if (allReply) {
    console.log(allReply)
    res.json(allReply)
  }
}

//* 댓글 달기
const postReplyRegister = async (req, res) => {
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const { text, POST_pNo } = req.body
  try {
    const decodedToken = jwt.verify(token, SECRET)
    const user = await mMember.findOne({ where: { email: decodedToken.email } })
    const reply = await mReply.create({
      text,
      MEMBER_email: user.email,
      POST_pNo,
    })
    if (reply) {
      console.log({ nickname: user.nickname, reply })
      // res.redirect('/')
    }
  } catch (error) {
    console.log(error)
  }
}

//TODO 댓글 수정
const editReply = async (req, res) => {}

//TODO 관리자
const postAdmin = (req, res) => {}

//* PATCH
//* 회원 정보 수정
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

// 게시글 수정
const modifyBoard = async (req, res) => {}

//* DELETE
//* 회원 탈퇴
const deleteProfile = async (req, res) => {
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  if (!authHeader) {
    res.json({ result: false, message: '인증 정보가 필요합니다.' })
    return
  }
  const decodedToken = jwt.verify(token, SECRET)
  if (bearer !== 'Bearer') {
    res.json({ result: false, message: '인증 방식이 틀렸습니다.' })
    return
  }
  await mMember.destroy({ where: { email: decodedToken.email } }).then(() => {
    res.clearCookie('x_auth')
    // req.session.destroy()
    res.json({ result: true, message: '회원 탈퇴 성공' })
  })
}

// 게시글 삭제
const removeBoard = async (req, res) => {}

module.exports = {
  main,
  signUp,
  signIn,
  postSignOut,
  profile,
  board,
  reply,
  postReply,
  postReplyRegister,
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
  postRoomEntrance,
  postRoomLists,
  removeBoard,
  modifyBoard,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
