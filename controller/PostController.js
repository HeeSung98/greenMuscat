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
const { SharedIniFileCredentials } = require('aws-sdk')

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
  console.log('req.body:', req.body)
  const { email, name, nickname, password, fromSocial } = req.body
  const hash = await bcryptPassword(password) // 비밀번호 암호화

  try {
    const findedUser = await mMember.findOne({
      where: { email },
    })
    console.log('findedUser:', findedUser)

    if (findedUser) {
      throw new Error('이미 가입된 회원입니다')
    }

    const createdUser = await mMember.create({
      email,
      name,
      nickname,
      password: hash,
      fromSocial,
    })

    console.log('createdUser:', createdUser)
    res.json({ result: true, message: '회원 가입 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
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
      const token = jwt.sign({ email }, SECRET, { expiresIn: '1d' }) // email에 해당하는 token 발급. 3일 유효
      // 해당 유저에게 token 할당 후 저장
      user.token = token
      user.save((error, user) => {
        if (error) return res.status(400).json({ error: 'something wrong' })
      })
      // db에 토큰 저장한 후에는 cookie에 토큰 저장하여 이용자 식별
      res
        .cookie('x_auth', user.token, {
          // 3일간 유지
          // maxAge: 1000 * 60 * 60 * 24 * 3,
          // httpOnly: true,

          // 30분간 유지
          MaxAge: 1000 * 60 * 30,
          httpOnly: true,
        })
        .status(200)
        .json({ result: true, token, user })
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다' })
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
  console.log('req.body:', req.body)
  const { email } = req.body
  try {
    // 입장된 방 이름, 역할, 코드 조회
    const findedMir = await mMembersInRoom.findAll({
      attributes: ['ROOM_rTitle', 'role', 'ROOM_code'],
      where: { MEMBER_email: email },

      include:
        //방 테이블과 조인, 시퀄라이즈 조인은 기본 inner join
        {
          model: mRoom, // join할 모델
          required: false, // outer join으로 설정
          attributes: ['rImg'],
        },
    })
    console.log('findedMir: ', findedMir)

    const roomList = findedMir.map((room) => ({
      ROOM_rTitle: room.dataValues.ROOM_rTitle,
      ROOM_code: room.dataValues.ROOM_code,
      role: room.dataValues.role,
      ROOM_rImg: room.dataValues.ROOM.rImg,
    }))
    console.log('roomList:', roomList)

    res.render('main', { result: true, roomList })
  } catch (error) {
    res.render('404', { result: false, error })
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
    console.log(createdMIR)

    res.json({
      result: true,
      message: '방 생성 완료',
      location,
      createdRoom,
    })
  } catch (error) {
    console.log('err:', error)
    res.json({ result: false, message: error })
  }
}

const postRoomFind = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 방 탐색 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { code, email } = req.body
  try {
    // 입력한 code 방 존재 여부 조회
    const findedRoom = await mRoom.findOne({
      where: { code },
    })
    console.log('findedRoom:', findedRoom)

    // 방이 없으면
    if (findedRoom == null) {
      throw new Error('잘못된 코드입니다')
    }

    // 입력한 방 입장 여부
    const findedMIR = await mMembersInRoom.findAll({
      where: {
        ROOM_code: code,
        MEMBER_email: email,
      },
    })
    console.log('findedMIR:', findedMIR)

    // 멤버가 입장되어 있는 경우
    if (findedMIR.length && findedMIR[0].role != 'admin') {
      res.json({
        result: true,
        message: '입장되어 있습니다',
        findedRoom,
      })
    } else {
      res.json({
        result: true,
        message: '입장되어 있지 않습니다',
        findedRoom,
      })
    }
  } catch (error) {
    console.log('err:', error)
    res.json({ result: false, message: String(error) })
  }
}

// 방 입장
const postRoom = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 방 입장 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { code, email } = req.body
  firstEntrance = Boolean(req.body.firstEntrance)
  try {
    // 입력한 code 방 존재 여부 조회
    const findedRoom = await mRoom.findOne({
      where: { code },
    })
    console.log('findedRoom:', findedRoom)

    // 방이 없으면
    if (findedRoom == null) {
      throw new Error('잘못된 코드입니다')
    }

    // 입력한 방 입장 여부
    const findedMIR = await mMembersInRoom.findAll({
      where: {
        ROOM_code: code,
        MEMBER_email: email,
      },
    })
    console.log('findedMIR:', findedMIR)

    // 멤버가 입장되어 있는 경우
    if (findedMIR.length && findedMIR[0].role != 'admin') {
      throw new Error('이미 입장되어 있습니다')
    }

    // 모델에 추가 (멤버)
    if (!findedMIR.length) {
      const createdMIR = await mMembersInRoom.create({
        role: 'member',
        ROOM_rTitle: findedRoom.rTitle,
        ROOM_code: findedRoom.code,
        ROOM_rNo: findedRoom.rNo,
        MEMBER_email: email,
      })
      console.log('createdMIR:', createdMIR)

      res.render({ result: true, message: '방 입장 완료', findedRoom })
    } else {
      res.render('room', {
        result: true,
        message: '방 입장 완료',
        findedRoom,
      })
    }
  } catch (error) {
    console.log('err:', error)
    res.json({ result: false, message: String(error) })
  }
}

// 게시물 업로드
const postBoardRegister = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 업로드 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file', req.files)
  let location
  try {
    location = req.files.location
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
        uuid: req.files[i].key,
        path: req.files[i].location,
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

const postBoard = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { rNo } = req.body

  try {
    //post테이블에 값 불러오기
    const findedPost = await mPost.findAll({
      //postImage에 등록된 사진도 함께 가져오기 위해 테이블 join
      where: { ROOM_rNo: rNo },
      include: [
        //이미지 테이블과 조인, 시퀄라이즈 조인은 기본 inner join
        {
          model: mPostImage, // join할 모델
          required: false, // outer join으로 설정
        },
        {
          model: mMember,
          required: false,
        },
      ],
    })

    //게시물 번호
    const pNoList = findedPost.map((post) => post.dataValues.pNo)
    //게시물 내용
    const contentList = findedPost.map((post) => post.dataValues.pContent)
    //게시물 작성자
    const writerList = findedPost.map((post) => post.dataValues.MEMBER_email)
    //게시물 작성자 프로필 사진
    const profileList = findedPost.map((post) => post.dataValues.MEMBER.mImg)
    //게시물 작성일
    const date = findedPost.map((post) => {
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
    //게시물 이미지
    const imagePathList = findedPost.map((post) =>
      post.dataValues.POST_IMAGEs.map((image) => image.path)
    )
    //게시물 승인 여부
    const approvedList = findedPost.map((post) => post.dataValues.approved)

    console.log('pNoList :', pNoList)
    console.log('contentList :', contentList)
    console.log('writerList :', writerList)
    console.log('profileList:', profileList)
    console.log('imagePathList:', imagePathList)
    console.log('approvedList:', approvedList)
    console.log('date:', date)
    res.render('board', {
      data: {
        pNoList,
        contentList,
        writerList,
        profileList,
        imagePathList,
        approvedList,
        date,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

// 좋아요
const postLike = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 좋아요 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { pNo } = req.body
  const likeFlag = Boolean(req.body.likeFlag)
  const isAdmin = Boolean(req.body.isAdmin)

  try {
    const findedPost = await mPost.findOne({
      where: { pNo },
    })
    console.log('findedPost:', findedPost)

    const findedRoom = await mRoom.findOne({
      where: { rNo: findedPost.dataValues.ROOM_rNo },
    })
    console.log('findedRoom:', findedRoom)

    // 좋아요를 누르지 않은 상황
    if (!likeFlag) {
      await findedPost.update({
        like: findedPost.like + 1,
      })
    }
    // 좋아요를 이미 누른 상황
    else {
      await findedPost.update({
        like: findedPost.like - 1,
      })
    }

    if (isAdmin) {
      if (!likeFlag) {
        await findedPost.update({
          approved: true,
        })
        await findedRoom.update({
          muscatTotal: findedRoom.muscatTotal + 1,
        })
      } else {
        await findedPost.update({
          approved: false,
        })
        await findedRoom.update({
          muscatTotal: findedRoom.muscatTotal - 1,
        })
      }
    }

    const updatedPost = await mPost.findOne({
      where: { pNo },
    })
    const updatedRoom = await mRoom.findOne({
      where: { rNo: findedPost.dataValues.ROOM_rNo },
    })
    console.log('updatedPost:', updatedPost)
    console.log('updatedRoom:', updatedRoom)

    res.json({ result: true, updatedPost, updatedRoom })
  } catch (err) {
    res.json({ result: false, message: String(err) })
  }
}

// 댓글 정보 보내기
const postReply = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 댓글 조회 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { POST_pNo } = req.body
  // Reply db에서 게시물 번호에 해당하는 모든 댓글들 조회
  try {
    const findedReplys = await mReply.findAll({
      where: { POST_pNo },
      include: [
        {
          model: mMember,
        },
      ],
    })
    const replyList = findedReplys.map((reply) => ({
      text: reply.text,
      nickname: reply.dataValues.MEMBER
        ? reply.dataValues.MEMBER.dataValues.nickname
        : 'Guest',
    }))
    console.log('replyList:', replyList)

    if (replyList) {
      res.json({ result: true, replyList })
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
  console.log('req.body:', req.body)
  const authHeader = req.headers.authorization
  const [bearer, token] = authHeader.split(' ')
  const { text, POST_pNo } = req.body
  try {
    const decodedToken = jwt.verify(token, SECRET)
    // token에 들어있는 email인 멤버 조회
    const findedUser = await mMember.findOne({
      where: { email: decodedToken.email },
    })
    console.log('findedUser:', findedUser)

    // 조회 되면 댓글 작성
    const createdReply = await mReply.create({
      text,
      MEMBER_email: findedUser.email,
      POST_pNo,
    })
    console.log('createdReply:', createdReply)

    if (createdReply) {
      res.json({
        result: true,
        data: createdReply,
        nickname: findedUser.nickname,
      })
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
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
  postRoomFind,
  postRoom,
  postBoard,
  postBoardRegister,
  postLike,
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
