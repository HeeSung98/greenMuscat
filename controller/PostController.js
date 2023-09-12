// import
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const {
  mMember,
  mRoom,
  mMembersInRoom,
  mPost,
  mReply,
  mPostImage,
} = require('../models')

dotenv.config()
const SECRET = process.env.SECRET_KEY

// 유저의 토큰을 찾고 해당 유저의 마이페이지로 이동
const postProfile = async (req, res) => {
  console.log(req.headers.authorization)
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 프로필 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    const authHeader = req.headers.authorization
    const [bearer, token] = authHeader.split(' ')
    const decodedToken = jwt.verify(token, SECRET)
    const memberProfile = await mMember.findOne({
      where: { email: decodedToken.email },
    })
    if (memberProfile !== null) {
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

// 회원가입
const postSignUp = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    const { email, name, nickname, password, fromSocial } = req.body
    const hash = await bcryptPassword(password) // 비밀번호 암호화
    const createUser = await mMember.create({
      email,
      name,
      nickname,
      password: hash,
      fromSocial,
    })
    if (createUser) res.json({ result: true, message: '회원 가입 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

// 로그인
const postSignIn = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    const { email, password } = req.body
    // 사용자 조회
    const user = await mMember.findOne({
      where: { email },
    })
    if (!user) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
      return
    }
    // 비밀번호 확인
    const compare = await comparePassword(password, user.password)
    console.log(compare)
    if (compare) {
      // 비밀번호 일치
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
        .json({ result: true, token, user })
    } else {
      return res
        .status(403)
        .json({ result: false, message: '비밀번호가 일치하지 않습니다' })
    }
  } catch (err) {
    console.log(err)
    res.json({ result: false })
  }
}

// 로그아웃
const postSignOut = (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 로그아웃 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  // 로그아웃 버튼 누르면 생성되었던 토큰 사라지게 ""
  res.cookie('x_auth', '').json({ logoutSuccess: true })
}

// 방 목록
const postRoomList = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 방 목록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log(' req.body : ', req.body)
  const { email } = req.body
  try {
    // 입장된 방 이름, 역할, 코드 조회
    const roomList = await mMembersInRoom.findAll({
      attributes: ['ROOM_rTitle', 'role', 'ROOM_code'],
      where: { MEMBER_email: email },
    })
    console.log('roomList: ', roomList)
    if (roomList.length > 0) {
      res.json({ result: true, message: '방 목록 조회 성공', rooms: roomList })
    } else {
      res.json({ result: false, message: '입장된 방이 없습니다.' })
    }
  } catch (error) {
    res.json({ error })
  }
}

// 방 생성
const postRoomAdd = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 방 생성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file', req.file)
  let location
  try {
    location = req.file.location
  } catch (err) {
    location = null
  }
  const { rTitle, code, email } = req.body
  try {
    // ROOM 모델에 추가
    const createdRoom = await mRoom.create({
      rTitle,
      code,
      rImg: location,
    })
    console.log('createdRoom:', createdRoom)

    // MIR 모델에 추가 (관리자)
    const createdMIR = await mMembersInRoom.create({
      role: 'admin',
      ROOM_rNo: createdRoom.rNo,
      ROOM_rTitle: createdRoom.rTitle,
      ROOM_code: createdRoom.code,
      MEMBER_email: email,
    })
    res.json({
      result: true,
      message: '방 생성 완료',
      location,
      createdRoom,
    })
  } catch (error) {
    console.log('err:', error)
    res.json({ result: false, message: '중복된 방 코드입니다' })
  }
}

// 방 입장
const postRoom = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 방 입장 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  const { code, email } = req.body
  try {
    // 입력한 code 방 존재 여부 조회
    const findedRoom = await mRoom.findOne({
      where: { code },
    })
    console.log(' findedRoom: ', findedRoom)

    // 방이 없으면
    if (!findedRoom) {
      res.json({ result: false, message: '방이 존재하지 않습니다.' })
    }

    // 입력한 방 입장 여부
    const findedMIR = await mMembersInRoom.findAll({
      where: {
        ROOM_code: code,
        MEMBER_email: email,
      },
    })
    console.log('findedMIR:', findedMIR)

    // 이미 입장되어 있고 방장이 아닐 경우
    if (findedMIR.length != 0 && findedMIR[0].role != 'admin') {
      if (findedMIR.role != 'admin') {
        throw new Error('이미 입장되어 있습니다')
      }
    }

    // 모델에 추가 (멤버)
    if (findedMIR.role != 'admin') {
      const createdMIR = await mMembersInRoom.create({
        role: 'member',
        ROOM_rTitle: findedRoom.rTitle,
        ROOM_code: findedRoom.code,
        ROOM_rNo: findedRoom.rNo,
        MEMBER_email: email,
      })
    }

    res.render('room', {
      result: true,
      message: '방 입장 완료',
      findedRoom,
    })
  } catch (error) {
    console.log('err:', error)
    res.json({ result: false, message: error })
  }
}

// 게시물 업로드
const postBoardRegister = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 업로드 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file', req.file)
  let location
  try {
    location = req.file.location
  } catch (err) {
    location = null
  }

  try {
    const { pContent, MEMBER_email, ROOM_rNo } = req.body
    const createdPost = await mPost.create({
      pContent,
      MEMBER_email,
      ROOM_rNo,
    })
    console.log('createdPost:', createdPost)

    // 게시물 이미지 테이블에 레코드 추가하기
    for (var i = 0; i < req.files.length; i++) {
      const createdPostImage = await mPostImage.create({
        uuid: files[i].key,
        path: files[i].location,
        POST_pNo: createdPost.pNo,
      })
      console.log(`createdPostImage${i}:`, createdPostImage)
    }

    res.json({ result: true, message: '게시물 업로드 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

// 댓글 정보 보내기
const postReply = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )

  const { POST_pNo } = req.body
  // Reply db에서 게시물 번호에 해당하는 모든 댓글들 조회
  try {
    const allReply = await mReply.findAll({
      // where: { POST_pNo },
      include: [
        {
          model: mMember,
          // attributes: ['nickname'],
        },
      ],
    })
    const pReply = allReply.map((reply) => ({
      text: reply.text,
      nickname: reply.dataValues.MEMBER
        ? reply.dataValues.MEMBER.dataValues.nickname
        : 'Guest',
    }))
    console.log('----------')

    // console.log(pReply.nickname)
    if (pReply) {
      console.log(pReply)
      res.json({ result: true, pReply })
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

// 댓글 작성
const postRegisterReply = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글 등록 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const { text, POST_pNo } = req.body
  try {
    const decodedToken = jwt.verify(token, SECRET)
    // token에 들어있는 email인 멤버 조회
    const user = await mMember.findOne({ where: { email: decodedToken.email } })
    console.log('User', user)
    // 조회 되면 댓글 작성
    const reply = await mReply.create({
      text,
      MEMBER_email: user.email,
      POST_pNo,
    })
    if (reply) {
      console.log({ nickname: user.nickname, reply })
      res.json({ result: true, data: reply, nickname: user.nickname })
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

//TODO 관리자
const postAdmin = (req, res) => {}

module.exports = {
  // 회원
  postSignUp,
  postSignIn,
  postSignOut,
  // 프로필
  postProfile,
  // 메인
  postRoomAdd,
  postRoomList,
  // 방 및 게시글
  postRoom,
  postBoardRegister,
  // 댓글
  postReply,
  postRegisterReply,
  // 관리자
  postAdmin,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
