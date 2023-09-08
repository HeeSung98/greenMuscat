//* import
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

// DELETE
// 회원 탈퇴
const deleteProfile = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원 탈퇴 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const decodedToken = jwt.verify(token, SECRET)
  try {
    // token에 들어있던 email과 일치하는 곳의 cookie 없앰
    await mMember.destroy({ where: { email: decodedToken.email } }).then(() => {
      res.clearCookie('x_auth')
      // req.session.destroy()
      res.json({ result: true, message: '회원 탈퇴 성공' })
    })
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

// 게시글 삭제
const removeBoard = async (req, res) => {
  const { pNo } = req.body
  console.log(pNo)
  try {
    const delete_board = await mPost.destroy({ where: { pNo: pNo } })
    if (delete_board) {
      console.log('yes')
      res.json({ result: true, message: '게시물 삭제 완료' })
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

// 댓글 삭제
const deleteReply = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글 삭제 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const { text, reNo } = req.body
  try {
    const decodedToken = jwt.verify(token, SECRET)
    // token에 들어있는 email인 멤버 조회
    const user = await mMember.findOne({ where: { email: decodedToken.email } })
    const reply = await mReply.findOne({
      where: { MEMBER_email: decodedToken.email },
    })
    // 조회 되면 댓글 삭제
    const delete_reply = await reply.destroy({ where: reNo })
    if (delete_reply) {
      console.log(`${user.nickname}님 댓글 삭제 완료`, delete_reply)
      res.json({ result: true, message: '댓글 삭제 완료' })
      // res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

module.exports = {
  // 프로필 삭제
  deleteProfile,
  // 게시글 삭제
  removeBoard,
  // 댓글 삭제
  deleteReply,
}
