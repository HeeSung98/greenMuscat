// import
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
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

// 회원 정보 수정
const editProfile = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원 정보 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file', req.file)
  let location
  try {
    location = req.file.location
  } catch (err) {
    location = null
  }
  const { nickname, password } = req.body
  const authHeader = req.headers.authorization
  const hash = await bcryptPassword(password) // 비밀번호 암호화

  if (!authHeader) {
    res.json({ result: false, message: '인증 정보가 필요합니다.' })
    return
  }
  const [bearer, token] = authHeader.split(' ')
  if (bearer !== 'Bearer') {
    res.json({ result: false, message: '인증 방식이 틀렸습니다.' })
    return
  }

  try {
    const decodedToken = jwt.verify(token, SECRET)

    const findedUser = await mMember.findOne({
      where: { email: decodedToken.email },
    })
    console.log('findedUser:', findedUser)

    let updatedUser
    if (nickname) {
      updatedUser = await findedUser.update({
        nickname,
      })
    }
    if (password) {
      updatedUser = await findedUser.update({
        password: hash,
      })
    }
    if (location) {
      updatedUser = await findedUser.update({
        mImg: location,
      })
    }
    console.log('updatedUser:', updatedUser)

    res.json({
      result: true,
      message: '회원 정보 수정 성공',
      updatedUser,
    })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: string(error) })
  }
}

// 댓글 수정
const editReply = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const { text, reNo } = req.body
  try {
    const decodedToken = jwt.verify(token, SECRET)
    // token에 들어있는 email인 멤버 조회
    const user = await mMember.findOne({ where: { email: decodedToken.email } })
    const reply = await mReply.findOne({
      where: { MEMBER_email: decodedToken.email, reNo },
    })
    // 조회 되면 댓글 수정
    const edit_reply = await reply.update({
      text,
    })
    if (edit_reply) {
      console.log(`${user.nickname}님 댓글 수정 완료`, edit_reply)
      res.json({ result: true, message: '댓글 수정 완료', edit_reply })
      // res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    console.log({ result: false })
  }
}

// 공지사항 업로드
const editNotice = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 공지사항 업로드 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log(req.body)
  const { rNo, notice } = req.body
  try {
    const findedRoom = await mRoom.findOne({
      where: { rNo },
    })
    const updatedRoom = await mRoom.update(
      { notice: notice },
      { where: { rNo: rNo } }
    )
    console.log('updatedRoom:', updatedRoom)

    console.log(' findedRoom: ', findedRoom)

    if (updatedRoom)
      res.json({
        result: true,
        message: '공지사항 업로드 성공',
        findedRoom,
      })
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  // 프로필
  editProfile,
  // 댓글
  editReply,
  // 공지사항
  editNotice,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}
