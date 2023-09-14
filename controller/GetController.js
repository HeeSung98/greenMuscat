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

// 로그인 전 페이지 (홈 화면)
const index = (req, res) => {
  res.render('index')
}
// 로그인 후 메인 페이지 (메인 화면)
const main = (req, res) => {
  res.render('main', {
    header: 'Header.ejs', // 헤더
    footer: 'footer.ejs', // 풋터
  })
}
// 회원 가입 페이지
const signUp = (req, res) => {
  res.render('signup')
}
// 로그인 페이지
const signIn = (req, res) => {
  res.render('signin')
}

// 게시물 업로드 페이지 이동
const boardRegister = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ register 페이지 이동 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.query:', req.query)
  const { MEMBER_email, ROOM_rNo } = req.query
  res.render('register', { MEMBER_email, ROOM_rNo })
}

// 공지사항
const notice = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 공지사항 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    //room테이블 공지사항 값들 불러오기
    const rooms = await mRoom.findAll({
      attributes: ['notice'],
    })
    //! 렌더링 페이지 다시 확인
    res.render('room', { data: rooms })
  } catch (error) {
    console.log(error)
  }
}

const profile = (req, res) => {
  res.render('profile')
}

// 선택한 방의 메인 페이지
const room = async (req, res) => {
  const rNo = 1
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 공지사항 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    //room테이블 해당 방과 같은 rNo의 공지사항 값들 불러오기
    const rooms = await mRoom.findAll({
      attributes: ['notice'],
      where: {
        rNo: rNo,
      },
    })
    console.log(
      ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 불러오기 값 확인ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
    )
    const noticedata = rooms.map((post) => post.dataValues.notice)
    console.log('noticedata :', noticedata)

    //! 렌더링 페이지 다시 확인
    res.render('room', { data: noticedata })
  } catch (error) {
    console.log(error)
  }
}

// 전체 댓글 보기
const reply = async (req, res) => {
  const { POST_pNo, ROOM_rNo } = req.params
  try {
    // 방 번호와 게시물 번호가 일치하는 댓글들 찾음
    const allReply = await mReply.findAll({
      where: { POST_pNo, ROOM_rNo },
    })
    if (allReply) {
      console.log(allReply)
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false })
  }
}

//TODO 관리자 페이지
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

module.exports = {
  index,
  // main
  main,
  // 회원
  signUp,
  signIn,
  profile,
  // 방 및 게시글
  room,
  boardRegister,
  // 댓글
  reply,
  // 공지사항
  notice,
  // 관리자
  admin,
}
