# 빠른 시작 가이드

## 1단계: MongoDB 실행

### Mac
```bash
brew services start mongodb-community
```

### Windows/Linux
MongoDB를 백그라운드 서비스로 실행

## 2단계: Backend 실행

```bash
cd m-test1/backend
npm install
node createAdmin.js  # 관리자 계정 생성
npm start
```

✅ Backend 서버가 http://localhost:5000 에서 실행됩니다.

## 3단계: Frontend 실행 (새 터미널)

```bash
cd m-test1/frontend
npm install
npm start
```

✅ Frontend가 http://localhost:3000 에서 실행됩니다.

## 4단계: 테스트

### 관리자로 로그인
1. http://localhost:3000/admin-login
2. 이메일: `admin@example.com`
3. 패스워드: `admin123`
4. 강의 생성 및 관리

### 학생 계정 생성 및 테스트
1. http://localhost:3000/signup
2. 회원가입 후 로그인
3. 강의 신청/취소 테스트

## 주요 URL

- **학생 로그인**: http://localhost:3000/login
- **회원가입**: http://localhost:3000/signup
- **관리자 로그인**: http://localhost:3000/admin-login
- **강의 목록** (학생): http://localhost:3000/courses
- **강의 관리** (관리자): http://localhost:3000/admin/courses

## 문제 해결

### MongoDB 연결 오류
```bash
# MongoDB가 실행 중인지 확인
brew services list  # Mac
# 또는
sudo systemctl status mongod  # Linux
```

### 포트 충돌
- Backend: `.env` 파일에서 PORT 변경
- Frontend: `package.json`의 proxy 설정 확인

### 의존성 설치 오류
```bash
# 캐시 삭제 후 재설치
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```
