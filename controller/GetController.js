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

// 게시글 페이지
const board = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  try {
    //post테이블에 값 불러오기

    const pNo = 1 //임시로 고정값 지정
    const posts = await mPost.findAll({
      //postImage에 등록된 사진도 함께 가져오기 위해 테이블 join
      include: [
        //이미지 테이블과 조인
        {
          model: mPostImage,
          required: false,
          where: { POST_pNo: pNo },
        },
        //댓글테이블
        {
          // 시퀄라이즈 조인은 기본 inner join
          model: mReply, // join할 모델
          required: false, // outer join으로 설정
          where: { POST_pNo: pNo }, // select해서
        },
      ],
    })
    console.log(posts)
    console.log(
      ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ post DB에서 가져온 값 담기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
    )
    //조인한 테이블에서 필요한 값 정의
    //게시물 내용
    const contentdata = posts.map((post) => post.dataValues.pContent)
    //게시물 이미지
    const imagedata = posts.map((post) =>
      post.dataValues.POST_IMAGEs.map((image) => image.path)
    )
    //게시물 댓글
    const replydata = posts.map((post) =>
      post.dataValues.REPLies.map((reply) => reply.text)
    )
    console.log('pContent :', contentdata)
    console.log('imagedata :', imagedata)
    console.log('replydata :', replydata)
    res.render('board', { data: contentdata })
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

// 방 생성하는 페이지
const roomAdd = (req, res) => {
  res.render('select')
}

// 방 선택하는 페이지
const select = (req, res) => {
  res.render('select', { roomLists: mRoom })
  console.log('room list: ', roomLists)
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

//TODO 관리자 페이지 (개인 정보, 수정 버튼, 참여한 전체 학생들 리스트)
const admin = (req, res) => {
  // findOne?
  res.render('admin')
}

module.exports = {
  // main
  main,
  // 회원
  signUp,
  signIn,
  profile,
  // 메인
  select,
  roomAdd,
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
