const mysql2 = require('mysql2')

// mysql2 연결
// const conn = mysql2.createPool({
//     host: "localhost",
//     user: "user",
//     password: "1234",
//     database: "",
//     port: 3306,
//     connectionLimit: 10,
//   });

//* 회원가입 정보 DB
const db_signUp = (data, cb) => {
  const query =
    'INSERT INTO member (email, name, nickname, password, profileimage, point, fromsocial) VALUES (?,?,?,?,?,?,?)'
  conn.query(
    query,
    [
      data.email,
      data.name,
      data.nickname,
      data.password,
      data.profileimage,
      data.point,
      data.fromsocial,
    ],
    (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('db_signUp', rows)
      cb()
    }
  )
}
//* 사용자 로그인 정보 조회
const db_signIn = (data, cb) => {
  const query = 'SELECT * FROM member WHERE email = ? AND password = ?'
  conn.query(query, [data.email, data.password], (err, rows) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('db_signIn', rows)
    cb(rows)
  })
}

//* 사용자 프로필 조회
const db_profile = (data, cb) => {
  const query = 'SELECT * FROM member WHERE email = ?'
  conn.query(query, [data.email], (err, rows) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('db_profile', rows)
    cb(rows)
  })
}

//* 프로필 수정
const db_editProfile = (data, cb) => {
  const query =
    'UPDATE member SET profileimage=?, nickname=?, password=? WHERE email=? '
  conn.query(
    query,
    [data.profileimage, data.nickname, data.password, data.email],
    (err, rows) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('db_editProfile', rows)
      cb()
    }
  )
}

//* 회원 정보 삭제
const db_deleteProfile = (data, cb) => {
  const query = 'DELETE FROM member WHERE email=?'
  conn.query(query, [data.email], (err, rows) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('db_deleteProfile', rows)
    cb()
  })
}

module.exports = {
  db_signUp,
  db_signIn,
  db_profile,
  db_editProfile,
  db_deleteProfile,
}
