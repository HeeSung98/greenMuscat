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

// 게시글 페이지
const board = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.query:', req.query)

  try {
    //post테이블에 값 불러오기
    const posts = await mPost.findAll({
      //postImage에 등록된 사진도 함께 가져오기 위해 테이블 join
      where: { ROOM_rNo: 1 },
      include: [
        //이미지 테이블과 조인
        {
          model: mPostImage,
          required: false,
          // where: { POST_pNo: pNo },
        },
        //댓글테이블
        {
          // 시퀄라이즈 조인은 기본 inner join
          model: mReply, // join할 모델
          required: false, // outer join으로 설정
          //where: { POST_pNo: pNo }, // select해서
        },
      ],
    })

    //조인한 테이블에서 필요한 값 정의
    //게시물 닉네임
    const nicknamedata = posts.map((post) => post.dataValues.MEMBER_email)
    //게시물 작성일
    const datedata = posts.map((post) => {
      const createdAt = new Date(post.dataValues.createdAt)
      const now = new Date()
      const timeDiff = Math.floor((now - createdAt) / 1000) // 초 단위로 시간 차이 계산

      if (timeDiff < 60) {
        return `${timeDiff}초 전`
      } else if (timeDiff < 3600) {
        const minutes = Math.floor(timeDiff / 60)
        return `${minutes}분 전`
      } else if (timeDiff < 86400) {
        const hours = Math.floor(timeDiff / 3600)
        return `${hours}시간 전`
      } else {
        const days = Math.floor(timeDiff / 86400)
        return `${days}일 전`
      }
    })

    //게시물 내용
    const contentdata = posts.map((post) => post.dataValues.pContent)
    //게시물 이미지
    const imagedata = posts.map((post) =>
      post.dataValues.POST_IMAGEs.map((image) => image.path)
    )
    //게시물 댓글
    const replydata = posts.map((post) =>
      post.dataValues.REPLies.map((reply) => {
        reply.text, reply.nickname
      })
    )
    console.log('pContent :', contentdata)
    console.log('imagedata :', imagedata)
    console.log('replydata :', replydata)
    res.render('board', {
      data: { nicknamedata, datedata, contentdata, imagedata, replydata },
    })
  } catch (error) {
    console.log(error)
  }
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
  board,
  boardRegister,
  // 댓글
  reply,
  // 공지사항
  notice,
  // 관리자
  admin,
}
