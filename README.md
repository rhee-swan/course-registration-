# 수강신청 시스템 (Course Registration System)

C레벨 대상 멤버십 프로그램을 위한 수강신청 시스템

## 주요 기능

### 관리자
- 강의 생성, 수정, 삭제
- 강의별 수강생 목록 확인
- 강의 정보 관리 (날짜, 시간, 정원, 신청 기간)

### 수강생
- 회원가입 및 로그인
- 강의 목록 조회
- 강의 신청 (1인 1강의 제한)
- 신청한 강의 확인 및 취소
- 패스워드 재설정

## 기술 스택

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT 인증
- bcryptjs (패스워드 해싱)

### Frontend
- React 18
- React Router v6
- Axios
- Context API (상태 관리)
- CSS Modules

## 설치 및 실행

### 사전 요구사항
- Node.js (v14 이상)
- MongoDB (로컬 또는 클라우드)

### 1. MongoDB 설치 및 실행

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows/Linux:**
MongoDB 공식 사이트에서 다운로드 및 설치
https://www.mongodb.com/try/download/community

### 2. Backend 설정

```bash
cd m-test1/backend

# 의존성 설치
npm install

# .env 파일 확인 (이미 생성됨)
# MongoDB URI와 JWT Secret 확인

# 서버 실행
npm start

# 또는 개발 모드 (nodemon 사용)
npm run dev
```

Backend 서버는 http://localhost:5000 에서 실행됩니다.

### 3. Frontend 설정

새 터미널을 열고:

```bash
cd m-test1/frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

Frontend는 http://localhost:3000 에서 실행됩니다.

## 초기 관리자 계정 생성

MongoDB에 직접 관리자 계정을 추가해야 합니다.

### MongoDB Shell 사용:

```bash
mongosh

use course-registration

# 패스워드를 해싱한 후 사용 (bcrypt로 "admin123" 해싱한 값 예시)
db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Tk7VqDqUqVJqTqXGVqVJqRQzqUqRQ",
  name: "관리자",
  role: "admin",
  enrolledCourse: null,
  createdAt: new Date()
})
```

### 또는 Node.js 스크립트 사용:

`backend` 폴더에 `createAdmin.js` 파일 생성:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const createAdmin = async () => {
  await connectDB();

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new User({
    email: 'admin@example.com',
    password: hashedPassword,
    name: '관리자',
    role: 'admin'
  });

  await admin.save();
  console.log('관리자 계정이 생성되었습니다.');
  console.log('이메일: admin@example.com');
  console.log('패스워드: admin123');
  process.exit(0);
};

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
```

실행:
```bash
cd backend
node createAdmin.js
```

## 사용 방법

### 1. 관리자 로그인
1. http://localhost:3000/admin-login 접속
2. 관리자 계정으로 로그인
3. 강의 생성 및 관리

### 2. 학생 회원가입 및 로그인
1. http://localhost:3000/signup 에서 회원가입
2. http://localhost:3000/login 에서 로그인
3. 강의 목록에서 강의 신청
4. 신청한 강의 확인 및 취소

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 학생 로그인
- `POST /api/auth/admin-login` - 관리자 로그인
- `POST /api/auth/reset-password` - 패스워드 변경
- `GET /api/auth/me` - 현재 사용자 정보

### 강의 관리 (관리자)
- `GET /api/courses` - 모든 강의 조회
- `POST /api/courses` - 강의 생성
- `GET /api/courses/:id` - 특정 강의 조회
- `PUT /api/courses/:id` - 강의 수정
- `DELETE /api/courses/:id` - 강의 삭제

### 수강 신청 (학생)
- `GET /api/enrollment/courses` - 강의 목록 조회
- `POST /api/enrollment/enroll/:courseId` - 강의 신청
- `DELETE /api/enrollment/cancel` - 강의 취소
- `GET /api/enrollment/my-course` - 내 강의 조회

## 비즈니스 로직

### 강의 신청 제약사항
1. **1인 1강의**: 한 학생은 하나의 강의만 신청 가능
2. **정원 제한**: 강의 최대 인원 초과 시 신청 불가
3. **신청 기간**: 신청 시작/종료 시간 내에만 신청 가능

### 보안
- 패스워드는 bcrypt로 해싱하여 저장
- JWT 토큰 기반 인증
- 관리자/학생 권한 분리

## 프로젝트 구조

```
m-test1/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   └── Course.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   └── enrollment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── admin.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Admin/
    │   │   ├── Student/
    │   │   └── common/
    │   ├── services/
    │   ├── context/
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## 개발자 노트

- Frontend는 proxy 설정으로 `/api` 요청을 backend로 전달
- JWT 토큰은 localStorage에 저장
- 모든 날짜는 ISO 8601 형식으로 저장
- 한국 시간(KST)으로 표시

## 라이센스

ISC
