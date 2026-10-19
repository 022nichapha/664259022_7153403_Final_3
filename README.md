# ระบบจัดการวารสาร

เว็บแอปสำหรับจัดเก็บและจัดการข้อมูลวารสาร พัฒนาด้วย React, Express, Sequelize และ PostgreSQL

## ขอบเขตงาน

- แสดงรายการวารสารและดูรายละเอียดรายรายการ
- เพิ่ม แก้ไข และลบข้อมูลวารสาร
- ค้นหาจากชื่อและกรองตามหมวดหมู่ผ่าน API
- ตรวจสอบข้อมูลก่อนบันทึก เช่น ชื่อ ผู้จัดพิมพ์ หมวดหมู่ วันที่เผยแพร่ และสถานะ
- แสดงสถานะกำลังโหลด ผลการทำงาน และข้อความข้อผิดพลาดบนหน้าเว็บ

## โครงสร้างโครงการ

```text
backend/
  config/database.js          ตั้งค่าการเชื่อมต่อ PostgreSQL
  controller/                 ตรวจสอบข้อมูลและจัดการคำขอ API
  model/Journal.js             Sequelize model ของวารสาร
  router/journalRouter.js     เส้นทาง CRUD ของวารสาร
  index.js                    เริ่ม Express และเชื่อมต่อฐานข้อมูล
frontend/
  components/JournalForm.jsx   ฟอร์มเพิ่มและแก้ไข
  pages/JournalsPage.jsx       หน้ารายการ รายละเอียด และการจัดการ
  src/services/               เรียกใช้งาน API ด้วย Axios
```

## เครื่องมือที่ใช้

- Node.js และ npm
- PostgreSQL; ใช้ Docker สำหรับสร้างฐานข้อมูลได้
- Backend: Express, Sequelize, `pg`, `cors`, `dotenv`, Nodemon
- Frontend: React, Vite, Axios, Lucide React, ESLint

## เตรียมเครื่อง

ติดตั้ง Node.js รุ่น LTS และ Docker Desktop (หากต้องการรัน PostgreSQL ด้วย Docker) จากนั้นเปิด Terminal ที่โฟลเดอร์โครงการนี้

## สร้างฐานข้อมูล

PostgreSQL ใช้ฐานข้อมูล `product_db`, ผู้ใช้ `dev_user` และพอร์ต host `5433` ตามค่าพัฒนาใน `backend/.env` ตัวอย่างต่อไปนี้สร้าง Docker volume เพื่อเก็บข้อมูลให้คงอยู่แม้ container หยุดทำงาน:

```powershell
docker volume create journals_pgdata
docker run --name express_postgres_container -e POSTGRES_USER=dev_user -e POSTGRES_PASSWORD=dev_password -e POSTGRES_DB=product_db -p 5433:5432 -v journals_pgdata:/var/lib/postgresql/data -d postgres:16
```

ถ้ามี container ชื่อนี้อยู่แล้ว ไม่ต้องสั่ง `docker run` ซ้ำ ให้เริ่ม container เดิมแทน:

```powershell
docker start express_postgres_container
```

ตรวจสถานะฐานข้อมูล:

```powershell
docker ps
```

ตาราง `journals` จะถูกสร้างโดย Sequelize เมื่อเริ่ม backend หากยังไม่มี โดย `Journal.sync()` ไม่ลบตารางหรือข้อมูลเดิม

## ตั้งค่า environment

ไฟล์ `backend/.env` ใช้เชื่อมต่อฐานข้อมูลจาก Node.js ที่รันบนเครื่อง host:

```dotenv
DB_HOST=localhost
DB_PORT=5433
DB_NAME=product_db
DB_USER=dev_user
DB_PASSWORD=dev_password
PORT=5000
```

ค่าผู้ใช้และรหัสผ่านในตัวอย่างมีไว้สำหรับพัฒนาในเครื่องเท่านั้น ควรเปลี่ยนเมื่อใช้กับสภาพแวดล้อมอื่น Backend รองรับ `DATABASE_URL` เพื่อใช้ URL เชื่อมต่อแทนค่าฐานข้อมูลแยกช่องได้

ไฟล์ `frontend/.env` ใช้กำหนด URL ของ API:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Vite ใช้พอร์ต `5173` เป็นค่าเริ่มต้น หากพอร์ตไม่ว่าง Vite จะเลือกพอร์ตถัดไป เช่น `5174` และ backend อนุญาต origin สำหรับ localhost ที่พอร์ต `5173` และ `5174`

## ติดตั้งและเริ่มระบบ

ให้เปิด Terminal แยก 2 หน้าต่าง โดยเริ่มฐานข้อมูลก่อน

Terminal แรก เริ่ม backend:

```powershell
cd backend
npm install
npm run dev
```

Backend จะเริ่มที่ `http://localhost:5000` ตรวจสอบได้ที่ `http://localhost:5000/`

Terminal ที่สอง เริ่ม frontend:

```powershell
cd frontend
npm install
npm run dev
```

เปิด URL ที่ Vite แสดงใน Terminal โดยทั่วไปคือ `http://localhost:5173/`

## API หลัก

| Method | Endpoint | หน้าที่ |
| --- | --- | --- |
| `GET` | `/api/journals` | แสดงรายการ รองรับ `search` และ `category` |
| `GET` | `/api/journals/:id` | ดูรายละเอียดวารสาร |
| `POST` | `/api/journals` | เพิ่มวารสาร |
| `PUT` | `/api/journals/:id` | แก้ไขวารสาร |
| `DELETE` | `/api/journals/:id` | ลบวารสาร |

ตัวอย่างค้นหาและกรอง:

```text
GET http://localhost:5000/api/journals?search=วารสาร&category=วิจัย
```

หมวดหมู่ที่รองรับคือ `วิชาการ`, `วิจัย` และ `ทั่วไป` ข้อมูลวารสารประกอบด้วย `title`, `publisher`, `category`, `publishedDate`, `description` และ `status`

## ตรวจสอบโค้ด

```powershell
cd frontend
npm run lint
npm run build
```

ตรวจ syntax backend ได้จากโฟลเดอร์ `backend`:

```powershell
node --check index.js
node --check controller/journalController.js
```