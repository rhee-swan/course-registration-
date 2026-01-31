# Vercel 배포 가이드

## 🎯 배포 전 준비사항

### 1. MongoDB Atlas 설정 (무료)

1. **MongoDB Atlas 계정 생성**
   - https://www.mongodb.com/cloud/atlas/register 접속
   - 무료 계정 생성 (이메일 또는 Google 로그인)

2. **클러스터 생성**
   - "Create a New Cluster" 클릭
   - **FREE Tier** 선택 (M0 Sandbox)
   - Region: **AWS / Seoul (ap-northeast-2)** 선택
   - Cluster Name: `course-registration` (또는 원하는 이름)
   - "Create Cluster" 클릭 (생성에 3-5분 소요)

3. **데이터베이스 사용자 생성**
   - 왼쪽 메뉴에서 "Database Access" 클릭
   - "Add New Database User" 클릭
   - Username과 Password 입력 (기억해두세요!)
   - User Privileges: **Read and write to any database**
   - "Add User" 클릭

4. **네트워크 액세스 설정**
   - 왼쪽 메뉴에서 "Network Access" 클릭
   - "Add IP Address" 클릭
   - **"Allow Access from Anywhere"** 선택 (0.0.0.0/0)
   - "Confirm" 클릭

5. **연결 문자열 복사**
   - "Database" 메뉴로 돌아가기
   - "Connect" 버튼 클릭
   - "Connect your application" 선택
   - **Connection String** 복사
   - 예시: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - `<password>` 부분을 실제 비밀번호로 교체
   - 데이터베이스 이름 추가: `.../myDatabase?retryWrites=true&w=majority`

### 2. JWT Secret 생성

터미널에서 실행:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

이 명령어로 생성된 랜덤 문자열을 복사해두세요.

---

## 🚀 Vercel 배포

### 1. Vercel CLI 설치 (선택사항)

```bash
npm install -g vercel
```

### 2. Vercel 웹사이트에서 배포 (권장)

1. **GitHub 레포지토리 생성**
   ```bash
   cd /Users/swanleemacbook/m-test1
   git init
   git add .
   git commit -m "Initial commit"
   # GitHub에서 레포지토리 생성 후
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - https://vercel.com 접속 및 로그인
   - "New Project" 클릭
   - GitHub 레포지토리 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수 추가:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | MongoDB Atlas 연결 문자열 |
   | `JWT_SECRET` | 생성한 JWT Secret |
   | `NODE_ENV` | `production` |

4. **배포**
   - "Deploy" 클릭
   - 배포 완료 후 URL 확인

### 3. CLI로 배포

```bash
cd /Users/swanleemacbook/m-test1

# Vercel 로그인
vercel login

# 환경 변수 설정
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV

# 프로덕션 배포
vercel --prod
```

---

## 🔧 배포 후 관리자 계정 생성

배포가 완료된 후, 관리자 계정을 생성해야 합니다.

### 방법 1: MongoDB Atlas 웹 인터페이스

1. MongoDB Atlas 대시보드에서 "Collections" 클릭
2. "Insert Document" 클릭
3. 다음 JSON 입력 (패스워드는 bcrypt로 해싱된 "admin123"):

```json
{
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "name": "관리자",
  "role": "admin",
  "enrolledCourse": null,
  "createdAt": { "$date": "2024-01-31T00:00:00.000Z" }
}
```

### 방법 2: Vercel CLI로 스크립트 실행

```bash
# createAdmin.js를 serverless function으로 실행
vercel dev
# 별도 터미널에서
node backend/createAdmin.js
```

---

## 📝 주요 파일 설명

- `vercel.json`: Vercel 배포 설정
- `api/index.js`: Express 앱을 Vercel Serverless Function으로 래핑
- `package.json` (루트): 백엔드 의존성
- `frontend/`: React 앱 소스코드

---

## 🔍 트러블슈팅

### 배포 실패 시

1. **빌드 로그 확인**: Vercel 대시보드에서 빌드 로그 확인
2. **환경 변수 확인**: 모든 환경 변수가 올바르게 설정되었는지 확인
3. **MongoDB 연결**: MongoDB Atlas IP 화이트리스트 확인

### API 연결 오류

- 브라우저 개발자 도구 (F12) → Network 탭에서 API 요청 확인
- `/api/auth/login` 등의 엔드포인트가 정상 응답하는지 확인

### 관리자 로그인 실패

- MongoDB Atlas에서 users 컬렉션에 admin 계정이 있는지 확인
- 패스워드가 올바르게 해싱되었는지 확인

---

## 🎉 배포 완료!

배포가 성공하면 Vercel이 제공하는 URL로 접속하여 애플리케이션을 사용할 수 있습니다.

예시: `https://your-project.vercel.app`
