# สรุปเนื้อหาเตรียมสอบปลายภาค 88736065 API for Back-End Development

สรุปจากเอกสารสัปดาห์ที่ 9–14 และแนวข้อสอบปลายภาค (final-exam-guideline)

---

## 1. ข้อมูลการสอบ

- วันสอบ: วันอังคารที่ 3 พฤศจิกายน 2569 (ตรวจวันและเวลาตามประกาศของคณะอีกครั้ง)
- เวลา: 180 นาที (ข้อสอบออกแบบให้ทำจริงประมาณ 2 ชั่วโมง)
- คะแนนเต็ม: 30 คะแนน

| ส่วน | รูปแบบ | คะแนน | เอกสารที่เปิดได้ |
|---|---|---|---|
| ส่วนที่ 1 | ปรนัย 30 ข้อ ข้อละ 0.5 คะแนน (ตัวเลือก 4 ข้อ, ไม่หักคะแนนเมื่อตอบผิด) | 15 | ไม่อนุญาต |
| ส่วนที่ 2 | ปฏิบัติ Express + MySQL + Jest (โจทย์ 3 ข้อ: 6 / 4 / 5 คะแนน) | 15 | เอกสารบรรยายและปฏิบัติการสัปดาห์ที่ 5–12 (open-book) |

- ข้อสอบทั้งสองส่วน ไม่อนุญาตให้ใช้ AI ช่วยตอบหรือเขียนโค้ด และห้ามคัดลอกโค้ดจากผู้อื่น
- ส่วนที่ 1 ปรนัยครอบคลุมสัปดาห์ที่ 9–14 แบ่งเป็น 6 กลุ่ม กลุ่มละ 5 ข้อ
- ส่วนที่ 2 ส่งตามรูปแบบที่กำหนดในข้อสอบ ไม่ต้องส่งไฟล์ `.env` และโฟลเดอร์ `node_modules`

---

## 2. สัปดาห์ที่ 9: Unit & Integration Testing

**Testing Pyramid**
- Unit Testing: ทดสอบฟังก์ชันเดียวแยกอิสระ เร็วที่สุด (เช่น `hashPassword` ใน `auth-helpers.js`)
- Integration Testing: ทดสอบหลายส่วนทำงานร่วมกัน เช่น route + middleware + database
- E2E Testing: ทดสอบทั้งระบบตั้งแต่ client ถึง database ช้าที่สุด
- ปัญหาของการทดสอบด้วยมือ (Postman อย่างเดียว): ต้องคลิกซ้ำ, ไม่บันทึกว่าเคยทดสอบอะไร, ผลขึ้นกับผู้ทดสอบ

**Jest**
- ติดตั้ง: `npm install --save-dev jest` และเพิ่มใน `package.json` เช่น `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`
- Jest หาไฟล์ที่ลงท้ายด้วย `.test.js` หรืออยู่ในโฟลเดอร์ `__tests__`
- โครงสร้าง **Arrange-Act-Assert**: เตรียมข้อมูล (Arrange) → เรียกโค้ดที่ทดสอบ (Act) → ตรวจผล (Assert)
- Matcher ที่ใช้บ่อย:
  - `toBe(value)` เทียบค่าแบบ `===` (primitive)
  - `toEqual(value)` เทียบ object/array แบบ deep equality
  - `toBeNull()`, `toBeGreaterThan(n)`, `toContain(item)`
  - `toThrow()` ฟังก์ชันโยน error
  - `rejects.toThrow()` Promise ที่ reject พร้อม error
- Hooks:
  - `beforeEach` / `afterEach` ทำงาน **ก่อน/หลังทุก test** ใน describe (ใช้เมื่อต้องการ test isolation)
  - `beforeAll` / `afterAll` ทำงาน **ครั้งเดียว** ก่อน test แรก/หลัง test สุดท้าย (ใช้กับงานต้นทุนสูง เช่น เปิด/ปิดการเชื่อมต่อฐานข้อมูล)

**Supertest (ทดสอบ HTTP endpoint)**
- ติดตั้ง: `npm install --save-dev supertest`
- ต้องแยก `app.js` (ประกาศ Express app และ route) ออกจาก `server.js` (เรียก `app.listen()` เท่านั้น) เพื่อให้ Supertest import app ได้โดยไม่เปิดพอร์ตจริง
- ตัวอย่าง: `request(app).post("/api/v1/auth/register").send({...})` แล้วตรวจ `status` และ `body.error.code`
  - `POST /register` สำเร็จ → 201 ; ไม่ส่ง password → 400 `VALIDATION_ERROR`
  - `GET /me` ไม่มี Authorization header → 401 `NO_TOKEN`
- การเขียน test แบบนี้ครอบคลุม middleware และ route handler จึงเป็น Integration Testing

**ปัญหาของการทดสอบกับฐานข้อมูลจริง**
- ข้อมูลทดสอบสะสมทุกครั้งที่รัน (รันซ้ำแล้วชน UNIQUE constraint)
- Test พึ่งพาฐานข้อมูลต้องเปิดอยู่เสมอ (รันบน CI ไม่ได้ถ้าไม่มีฐาน)
- ทุก test ต้อง round-trip ไปฐานข้อมูล ทำให้ช้า
- ทางแก้: (1) ใช้ฐานข้อมูลทดสอบแยก เช่น `student_api_test` ร่วมกับ `beforeAll`/`afterAll` ล้างข้อมูล (2) ใช้ Mocking ตัดการพึ่งพาฐานข้อมูลออกไป

**Mocking**
- `jest.fn()` สร้าง mock function ตรวจการเรียกได้ เช่น `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`
- `mockReturnValue()` (sync), `mockResolvedValue()` / `mockResolvedValueOnce()` (async/Promise)
- `jest.mock("./db")` แทน module ทั้งไฟล์ ต้องเขียน **ระดับบนสุดของไฟล์** เพราะ Jest จะยก (hoist) ขึ้นไปทำงานก่อน `require`/`import`
- ตัวอย่าง: mock `pool.query` ด้วย `mockResolvedValueOnce([[ {...user} ]])` เพื่อทดสอบ `POST /api/v1/auth/login`
  - มี user → 200 และมี `token`
  - ไม่พบ user (`[[]]`) → 401 `INVALID_CREDENTIALS`

**เมื่อใดควร/ไม่ควร Mock**
| สถานการณ์ | คำแนะนำ |
|---|---|
| ทดสอบ logic ล้วน ๆ ไม่เกี่ยวกับ I/O | ไม่จำเป็นต้อง mock |
| ทดสอบ route ที่เรียกฐานข้อมูล แต่ต้องการความเร็ว/รันได้โดยไม่มีฐานข้อมูล | ควร mock database layer |
| ทดสอบว่าระบบเชื่อมต่อฐานข้อมูลจริงได้ถูกต้องตาม schema | ไม่ควร mock (เป็น Integration Test กับฐานจริง) |
| ทดสอบการเรียก External API ระหว่างพัฒนา | ควร mock |

**Test Coverage**
- มิติ: Statement, Branch (if/else, switch), Function, Line
- คำสั่ง `npm run test:coverage` ; คอลัมน์ `Uncovered Line #s` บอกบรรทัดที่ยังไม่มี test ครอบคลุม
- **Coverage สูงไม่ได้แปลว่า test ดี** เพราะ coverage 100% บอกแค่ว่าโค้ดถูก "เรียกทำงาน" แต่ไม่ได้ยืนยันว่าผลลัพธ์ถูกต้อง (ต้องมี `expect`)
- แนวทางที่เหมาะ: ใช้ coverage ค้นหาจุดที่ขาดการทดสอบ แล้วพิจารณาความสำคัญทางธุรกิจ ไม่ไล่ตัวเลข 100%

---

## 3. สัปดาห์ที่ 10: OpenAPI / Swagger & Developer Experience (DX)

**DX (Developer Experience)**
- ประสบการณ์ของนักพัฒนาคนอื่นที่ต้องเรียกใช้ API ที่เราสร้าง
- API ที่ DX ดีมีลักษณะ: เอกสารตรงกับโค้ดจริง, มีตัวอย่างใช้งานพร้อมทดสอบได้ทันที, error message สื่อความหมาย (เช่น 400 + `{"error":{"code":"VALIDATION_ERROR","message":"..."}}`), มี versioning (`/api/v1/`)
- DX ไม่ดีทำให้เกิดต้นทุน: เวลาพัฒนา Client ล่าช้า, Client เข้าใจ schema ผิดเกิด bug (contract mismatch), ผู้พัฒนา API กลายเป็นคอขวด

**OpenAPI Specification 3.0**
- เป็นมาตรฐานเปิดสำหรับอธิบายโครงสร้าง RESTful API เขียนด้วย YAML หรือ JSON ทั้งมนุษย์และเครื่องอ่านได้
- ส่วนหลักของไฟล์:
  - `info` ชื่อ คำอธิบาย version
  - `servers` URL ของ server (แยก dev/prod)
  - `paths` endpoint, method, parameter, request body, response
  - `components.schemas` นิยาม data model ที่ใช้ซ้ำ อ้างอิงด้วย `$ref`
  - `components.securitySchemes` วิธียืนยันตัวตน เช่น `bearerAuth` (http, bearer, JWT)
- หลักการสำคัญ: ใช้ `$ref` อ้างอิง schema จาก `components.schemas` แทนการเขียนซ้ำในทุก endpoint
- **ต้องระบุ response ให้ครบทุกกรณี** ไม่ใช่แค่ 200/201 เช่น 400 (validation), 401 (ไม่ได้ยืนยันตัวตน), 403 (ไม่มีสิทธิ์ RBAC), 404 (ไม่พบ), 409 (ข้อมูลซ้ำ)
- ตัวอย่าง endpoint ในหัวข้อ 2.3 (Student API):
  - `GET /students` มี query `page` (default 1), `limit` (default 10) ตอบ 200 `StudentListResponse` (มี `data` และ `pagination`), 401
  - `POST /students` requestBody `StudentInput` (required: name, major, email) ตอบ 201 `StudentResponse`, 400 ; มี `security: - bearerAuth: []`
  - `GET /students/{id}` path parameter `id` (integer, required) ตอบ 200, 404
  - `DELETE /students/{id}` จำกัดเฉพาะ role admin ต้องระบุ 403 ด้วย ไม่ใช่แค่ 200 และ 404

**Swagger UI**
- ปัญหาเอกสารแยกจากโค้ด: เอกสารล้าสมัย (stale documentation)
- ติดตั้ง: `npm install swagger-ui-express js-yaml`
- Mount ใน `app.js`: อ่าน `openapi.yaml` ด้วย `YAML.load(fs.readFileSync(...))` แล้ว `app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiDocument))`
- เปิด `http://localhost:3000/api-docs` เพื่อดูเอกสารและกด **Try it out** ได้ทันที
- **Security:** ไม่ควร expose `/api-docs` บน production โดยไม่มีการป้องกัน ควรใส่เงื่อนไข `if (process.env.NODE_ENV !== "production")` หรือใส่ authentication middleware

**แนวทางรักษาความสอดคล้องระหว่างเอกสารกับโค้ด**
- ปรับปรุง `openapi.yaml` ทุกครั้งที่เพิ่ม/แก้ endpoint (กำหนดเป็นส่วนหนึ่งของ Definition of Done)
- ตรวจด้วยตัวเองก่อน commit โดยเปิด `/api-docs` เปรียบเทียบกับพฤติกรรมจริง
- Code review ตรวจว่า `openapi.yaml` อัปเดตพร้อมกับ route ที่เปลี่ยน
- เครื่องมือขั้นสูง: contract testing ด้วย `express-openapi-validator`

**Postman Collection และการจัดการ**
- ปัญหาการเรียก request ทีละตัว → รวมเป็น Collection เดียว ที่แชร์ได้ พร้อม environment variable
- โครงสร้าง Collection แนะนำ: `Auth` (POST Register, POST Login, GET Me) และ `Students` (GET List with pagination, POST Create, PUT Update, DELETE Remove)
- **Environment Variable:** `{{baseUrl}}` = `http://localhost:3000/api/v1`, `{{authToken}}` ค่าได้จาก response ของ login
- ตั้งค่า token อัตโนมัติใน Tests tab ของ `POST /auth/login`:
  ```javascript
  const response = pm.response.json();
  pm.environment.set("authToken", response.token);
  ```
  แล้วตั้ง Header ของ request อื่นเป็น `Authorization: Bearer {{authToken}}`
- **Test Script** ใน Tests tab: `pm.test("Status code is 200", function () { pm.response.to.have.status(200); });` และ `pm.expect(body).to.have.property("pagination");`
- ทุก request ควรมี test อย่างน้อยตรวจ status code และ request กรณีผิดพลาด (เช่น `GET /students/{id}` ด้วย id ที่ไม่มี ต้องได้ 404)
- **Export ต้องทำสองไฟล์คู่กัน:** `postman_collection.json` (request + test script) และ `environment.json` (ค่าตัวแปร เช่น baseUrl)
- **Newman** (Command-line Collection Runner): `npm install -g newman` แล้ว `newman run postman_collection.json -e environment.json`

**API-First Design**
- ทั้ง Backend และ Frontend ตกลงกันด้วย OpenAPI Specification ก่อนเริ่มพัฒนา (เรียกว่า "สัญญา / contract")
- ใช้ mock server จาก OpenAPI เช่น Prism: `npx @stoplight/prism-cli mock openapi.yaml`
- Frontend ไม่ต้องรอ Backend เสร็จ

---

## 4. สัปดาห์ที่ 11: External API Integration & Resilience

**หลักการ:** ระบบต้องไม่ล่มตามบริการภายนอก (Graceful Degradation) และต้องออกแบบ **Resilience** คือความสามารถทำงานต่อได้แม้บางส่วนล้มเหลว

**ความเสี่ยงจากการพึ่งพาบริการภายนอก**
- Downtime → request ค้างหรือได้ error 500 โดยไม่ทราบสาเหตุ
- Transient network error → request ล้มเหลวทั้งที่บริการพร้อมใช้งาน
- บริการตอบสนองช้า → connection และ memory ค้างไว้ (event loop ไม่ถูก block แต่ทรัพยากรถูกใช้ค้าง)
- บริการเปลี่ยน response โดยไม่แจ้ง → โค้ด parse ผิดพลาดหรือ crash

**Axios vs fetch**
- Axios มี option `timeout` ในตัว, แปลง JSON อัตโนมัติ (`response.data`), โยน error อัตโนมัติเมื่อ status ไม่ใช่ 2xx, มี interceptor
- fetch (built-in) ไม่มี timeout ในตัว (ต้องใช้ AbortController), ต้องเรียก `.json()` เอง, ไม่โยน error เมื่อ status ผิด ต้องตรวจ `response.ok` เอง
- บทเรียนนี้ใช้ Axios เป็นหลัก

**Error handling ของ Axios**
- เมื่อ server ตอบกลับมา (มี `error.response`) เช่น 404, 500 → ใช้ `error.response.status`
- เมื่อ timeout → `error.code === "ECONNABORTED"` และไม่มี `error.response`
- เมื่อ network error (DNS ผิด, connection refused) → ไม่มี `error.response`
- ต้องใช้ `try/catch` เสมอ และแยกประเภท error ให้ชัดเจนก่อนนำไป retry

**Retry Logic**
- ประเภท error ที่ควร retry: Network error (ECONNRESET, ECONNREFUSED), Timeout, 5xx (500, 502, 503), 429 Too Many Requests (ควรรอนานขึ้น)
- ไม่ควร retry: 400 Bad Request, 401 Unauthorized, 404 Not Found (ผิดซ้ำก็ได้ผลผิดซ้ำ)
- หลักการ: แยก **transient failure** (ชั่วคราว ควร retry) ออกจาก **permanent failure** (ถาวร ไม่ควร retry)
- **Fixed Delay**: หน่วงคงที่ เช่น 1 วินาที — เขียนง่าย แต่ client หลายตัวจะ retry พร้อมกัน
- **Exponential Backoff**: เพิ่มเวลาเป็นทวีคูณ `2^(attempt-1)` วินาที (1s, 2s, 4s) — ลดภาระบริการที่กำลังฟื้นตัว
- **Thundering Herd**: client จำนวนมาก fail พร้อมกันแล้ว retry ที่เวลาเดียวกัน ทำให้บริการล้มซ้ำ
- **Jitter**: สุ่มเวลาเพิ่มเข้าไปเพื่อกระจาย retry
  - Full Jitter: สุ่มระหว่าง 0 ถึง `baseBackoffMs`
  - **Equal Jitter** (ใช้ในรายวิชา): `baseBackoffMs / 2 + random(0 .. baseBackoffMs / 2)`
- ตัวอย่างโค้ดหลัก:
  ```javascript
  function isRetryable(error) {
    if (!error.response) return true;               // network error หรือ timeout
    const status = error.response.status;
    return status === 429 || (status >= 500 && status < 600);
  }
  async function fetchWithRetry(url, timeoutMs = 3000, maxRetries = 2) {
    let attempt = 0;
    while (true) {
      try {
        const response = await axios.get(url, { timeout: timeoutMs });
        return response.data;
      } catch (error) {
        attempt += 1;
        const canRetry = attempt <= maxRetries && isRetryable(error);
        if (!canRetry) throw error;
        const baseBackoffMs = 2 ** (attempt - 1) * 1000;
        const backoffMs = baseBackoffMs / 2 + Math.random() * (baseBackoffMs / 2);
        await delay(backoffMs);
      }
    }
  }
  ```
  - `maxRetries = 2` หมายถึงลองซ้ำ 2 ครั้งหลังความพยายามแรก รวมไม่เกิน 3 ครั้ง

**Timeout**
- ถ้าไม่กำหนด timeout การเรียก API ภายนอกอาจค้างไม่มีกำหนด → ผู้ใช้รอไม่รู้ว่าจะได้ผลเมื่อใด และ connection ค้าง
- Axios: `axios.get(url, { timeout: 3000 })` หน่วยเป็นมิลลิวินาที
- วิธีเลือกค่า:
  - Request ระหว่างผู้ใช้ (synchronous) → 2–5 วินาที
  - SLA ของบริการปกติ 500ms → ตั้งมากกว่านั้นพอสมควร แต่ไม่มากเกินไป
  - งาน background → ตั้งนานขึ้นได้
- **เวลารวมที่ผู้ใช้รอ** ≈ `timeout × จำนวนครั้งที่เรียก + ผลรวม backoff delay` ต้องคำนวณและออกแบบให้อยู่ในระดับที่ยอมรับได้

**Fallback**
- Fallback คือกลไกที่ระบบตอบสนองผู้ใช้อย่างมีเหตุผลเมื่อบริการภายนอกล้มเหลวแม้ retry ครบแล้ว
- หลักการ: **ระบบต้องไม่ปล่อยให้ request ค้างหรือคืนค่า error ที่ไม่มีความหมายต่อผู้ใช้**
- รูปแบบที่พบบ่อย:
  - ใช้ค่า Default (เช่น Weather API ไม่สำเร็จ แสดงข้อความ "ไม่สามารถตรวจสอบสภาพอากาศได้ในขณะนี้" แทนการ block การจอง)
  - ใช้ค่าจาก cache เดิม (stale-while-error) พร้อมระบุว่าข้อมูลอาจไม่ล่าสุด
  - แจ้งข้อความผิดพลาดที่ชัดเจน: 503 + `{"error":{"code":"EXTERNAL_SERVICE_UNAVAILABLE","message":"..."}}`
  - เลื่อนงานไปทำภายหลัง (deferred processing, นอกขอบเขตรายวิชา)
- ตัวอย่างนำ Retry + Timeout + Fallback มาประกอบกัน: `checkWeatherOrFallback(location)` ที่คืน `{source:"external", data}` หรือ `{source:"fallback", data:null, message}` แล้ว route `POST /bookings` ยังคืน **201** ได้เสมอ โดยแนบ `weatherAdvisory` เป็นข้อมูลเสริม (graceful degradation)

**Webhook เบื้องต้น**
- Outbound (ระบบเรียกออก) vs Inbound (บริการภายนอกเรียกเข้ามาที่ระบบ) — Webhook คือ inbound
- Endpoint รับ Webhook คือ route `POST` ปกติของ Express ที่มีข้อควรพิจารณาเพิ่ม:
  1. **ตอบกลับ 200 ให้เร็ว** แล้วค่อยประมวลผลแบบ asynchronous ต่างหาก
  2. **ตรวจสอบแหล่งที่มา (signature verification)** ด้วย HMAC
  3. **Idempotency** เพราะบริการภายนอกอาจส่ง event ซ้ำ (ตรวจ event ID ที่เคยประมวลผลแล้ว)
- **HMAC:** ผู้ส่งและผู้รับมี secret ร่วมกัน ผู้ส่งคำนวณ hash ของ payload แล้วส่งมาใน header ผู้รับคำนวณซ้ำแล้วเทียบ ถ้า payload หรือ secret เปลี่ยนแม้ 1 ตัวอักษร ค่า HMAC จะเปลี่ยนทันที
- โค้ดตรวจ signature (ตัวอย่าง):
  ```javascript
  router.post("/webhooks/payment", express.raw({ type: "application/json" }), (req, res) => {
    const signatureHeader = req.headers["x-webhook-signature"];
    const isValid = verifySignature(req.body, signatureHeader, process.env.PAYMENT_WEBHOOK_SECRET);
    if (!isValid) return res.status(401).json({ error: { code: "INVALID_SIGNATURE", message: "Signature ไม่ถูกต้อง" } });
    const event = JSON.parse(req.body);
    res.status(200).json({ received: true });
  });
  ```
  - ต้องใช้ `express.raw()` แทน `express.json()` เพราะ HMAC คำนวณจาก raw bytes
  - ใช้ `crypto.timingSafeEqual` แทน `===` เพื่อป้องกัน timing attack (ต้องเช็คความยาว buffer ก่อนเรียกทุกครั้ง มิฉะนั้นโยน RangeError)
  - ไม่มี header → ตอบ 401 ก่อนประมวลผล
- ข้อควรระวัง: การตรวจ signature อย่างเดียวยังไม่ป้องกัน **replay attack** ต้องตรวจ timestamp ร่วมด้วย (เช่น Stripe) ส่วน GitHub ไม่มี timestamp
- รูปแบบ signature ของผู้ให้บริการจริง (ต้องอ่านเอกสารของผู้ให้บริการก่อนนำไปใช้):

| ผู้ให้บริการ | Header | การเข้ารหัส | รวม timestamp |
|---|---|---|---|
| GitHub | `X-Hub-Signature-256` (`sha256=...`) | hex | ไม่ |
| Stripe | `Stripe-Signature` (`t=...,v1=...`) | hex | รวม |
| Slack | `X-Slack-Signature` (`v0=...`) + `X-Slack-Request-Timestamp` | hex | รวม |
| LINE | `x-line-signature` | **base64** | ไม่ |
| Shopify | `X-Shopify-Hmac-SHA256` | **base64** | ไม่ |

  - LINE และ Shopify ใช้ base64 ต้องเปลี่ยน `Buffer.from(sig, "hex")` เป็น `"base64"` และ `.digest("hex")` เป็น `.digest("base64")`
- เชื่อมกับ **OWASP A08: Software and Data Integrity Failures** (ระบบยอมรับข้อมูลจากภายนอกโดยไม่ตรวจความถูกต้อง)

---

## 5. สัปดาห์ที่ 12: Advanced Input Validation & Rate Limiting

**ช่องโหว่ของ input validation ที่ยังไม่ดี**
| ปัญหา | ตัวอย่าง | OWASP Top 10 |
|---|---|---|
| Mass assignment | ส่ง `{"role":"admin"}` ในฟอร์มสมัครสมาชิก แล้วฟิลด์ถูกบันทึกโดยไม่ตรวจ | A01 Broken Access Control |
| Type confusion | field `age` เป็นตัวเลข แต่รับ string `"25 OR 1=1"` แล้วส่งต่อ query | A05 Injection |
| Oversized payload | array ขนาดหลายหมื่น record ในคำขอเดียว | A06 Insecure Design |
| Credential stuffing / brute-force | บอทยิง `POST /auth/login` ซ้ำหลายพันครั้งต่อวินาที | A07 Authentication Failures |

- Zod แก้ปัญหา 3 ข้อแรก, Rate limiting แก้ข้อสุดท้าย (validation ตรวจรูปร่างข้อมูล แต่ตรวจ "จำนวนครั้ง" ไม่ได้)

**Zod: Schema Validation**
- ติดตั้ง `npm install zod`
- Schema พื้นฐาน:
  ```javascript
  const { z } = require("zod");
  const createStudentSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
    age: z.number().int().min(15).max(80),
  });
  ```
  - `z.object({...})` กำหนดรูปร่าง, แต่ละ field มีชนิดและเงื่อนไขของตัวเอง

**Cross-field validation ด้วย `.refine()`**
- ใช้เมื่อต้องเปรียบเทียบค่าระหว่าง field ใน object เดียวกัน เช่น `endDate` ต้องมาหลัง `startDate`
  ```javascript
  const enrollmentPeriodSchema = z.object({
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    error: "endDate ต้องมาหลัง startDate เสมอ",
    path: ["endDate"],
  });
  ```
- `refine` รับฟังก์ชันที่คืน `true`/`false` ; `path` ผูก error เข้ากับ field ที่ผิด

**Conditional validation ด้วย `.superRefine()`**
- ใช้เมื่อ "ถ้า field A เป็นค่า X แล้ว field B จำเป็นต้องมี" เช่น นิสิตต่างชาติต้องมี `passportNumber` ส่วนนิสิตไทยต้องมี `nationalId`
- ใช้ `z.enum(["local","international"])` และ field ที่เกี่ยวข้องเป็น `.optional()`
  ```javascript
  const registrationSchema = z.object({
    studentType: z.enum(["local", "international"]),
    passportNumber: z.string().optional(),
    nationalId: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.studentType === "international" && !data.passportNumber) {
      ctx.addIssue({ code: "custom", message: "ต้องระบุ passportNumber สำหรับนิสิตต่างชาติ", path: ["passportNumber"] });
    }
    if (data.studentType === "local" && !data.nationalId) {
      ctx.addIssue({ code: "custom", message: "ต้องระบุ nationalId สำหรับนิสิตไทย", path: ["nationalId"] });
    }
  });
  ```
- `superRefine` ได้ `ctx` เพิ่ม issue ได้หลายจุดในการตรวจครั้งเดียว (ต่างจาก `refine` ที่คืนได้ error เดียว)

**จำกัดขนาด payload และ array**
- `z.array(createStudentSchema).min(1).max(50)` จำกัดจำนวน record ใน array
- จำกัดขนาด body ที่ระดับ Express ด้วย option `limit` ของ `express.json()` เช่น `app.use(express.json({ limit: "10kb" }))` (ตั้งไว้ตั้งแต่สัปดาห์ที่ 4) และปรับขึ้นได้เมื่อ endpoint ต้องรับ bulk array ที่ใหญ่กว่าเดิม เช่น `limit: "100kb"`

**Middleware ห่อ Zod ให้ใช้ซ้ำได้**
```javascript
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
          details: result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
        },
      });
    }
    req.body = result.data;
    next();
  };
}
router.post("/students", validate(createStudentSchema), createStudent);
```
- `safeParse` ไม่โยน exception แต่คืน `{ success, data }` หรือ `{ success: false, error }`

**Rate Limiting กับ Throttling**
| ประเด็น | Rate Limiting | Throttling |
|---|---|---|
| พฤติกรรมเมื่อเกินโควตา | ปฏิเสธ request ทันทีด้วย `429 Too Many Requests` | หน่วงเวลาตอบสนอง (delay) แทนการปฏิเสธ |
| เหมาะกับ | ป้องกัน brute-force, DoS | ลดภาระ server แบบค่อยเป็นค่อยไป |
| ไลบรารีตัวอย่าง | `express-rate-limit` | `express-slow-down` |

- รายวิชาเน้น **Rate Limiting** เพราะต้องการให้ผู้โจมตี "ถูกตัด" ทันที

**express-rate-limit**
- ติดตั้ง `npm install express-rate-limit`
- ตัวอย่าง: `authLimiter` = `windowMs: 15*60*1000`, `max: 5`, `standardHeaders: "draft-7"`, `legacyHeaders: false` ; `generalLimiter` = `windowMs: 60*1000`, `max: 100`
- ใช้งาน: `app.use(generalLimiter)` ครอบทุก route ; `app.use("/auth/login", authLimiter)` ใช้ค่าเข้มกว่า
- ควรตั้ง `windowMs` / `max` แยกตามความเสี่ยงของ endpoint (login เสี่ยง brute-force มากกว่า `GET /students`)
- เมื่อเกินโควตา ตอบ `429` พร้อม header `RateLimit` ตามมาตรฐาน IETF draft-7 และ `message` แบบ JSON ที่กำหนดได้

**Key เริ่มต้นและผลกระทบเมื่ออยู่หลัง Proxy**
- ค่าเริ่มต้นนับตาม **IP address** ของผู้เรียก (`req.ip`)
- เมื่อ deploy หลัง reverse proxy (เช่น Nginx) `req.ip` จะเป็น IP ของ proxy ทำให้ผู้ใช้ทุกคนถูกนับรวมเป็นคนเดียว
- วิธีแก้: `app.set("trust proxy", 1)` และให้ proxy ส่ง header `X-Forwarded-For`
- ข้อจำกัด: express-rate-limit เก็บตัวนับใน memory ของ process เดียว
  - หลาย process (PM2 cluster mode, `pm2 start index.js -i 4`) หรือหลาย instance → แต่ละตัวมีตัวนับของตัวเอง ผู้ใช้จึงเข้าได้ `max × จำนวน process` ครั้ง
  - ทางแก้ระดับ production: เก็บตัวนับใน store ภายนอกที่ใช้ร่วมกันได้ เช่น **Redis** ผ่านแพ็กเกจ `rate-limit-redis`

**Rate limit แยกตามผู้ใช้ (Key Generator)**
- ใช้กับ endpoint ที่ยืนยันตัวตนแล้ว เพราะผู้ใช้หลายคนอาจอยู่หลัง NAT เดียวกัน (หอพัก, สำนักงาน)
  ```javascript
  const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
  const userLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req) => req.user?.id?.toString() || ipKeyGenerator(req.ip),
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  app.use("/api/v1/students", authenticateToken, userLimiter);
  ```
- ต้องรัน `authenticateToken` **ก่อน** `userLimiter` เพื่อให้มี `req.user.id`
- fallback ไป IP ต้องผ่าน `ipKeyGenerator` เพื่อ normalize IPv6 ให้ถูกต้อง

**ทดสอบด้วย Postman Collection Runner และ OWASP ZAP**
- จำลอง brute-force: เปิด Collection Runner ตั้ง Iterations สูง (เช่น 20) และ Delay (เช่น 0 ms) แล้วตรวจว่าหลัง request ที่ 5 ได้ `429` พร้อม `RateLimit: remaining=0`
- สังเกตว่า authLimiter นับทุก request ที่เข้ามา ไม่ว่าผลลัพธ์จะเป็น 200 หรือ 401 เพราะนับ "จำนวนครั้งที่เรียก"
- **OWASP ZAP** (Zed Attack Proxy): เครื่องมือ scan ช่องโหว่อัตโนมัติ
  - ตั้งค่า Automated Scan ชี้ไปที่ `http://localhost:3000`
  - ZAP ทำ Spider (crawl endpoint) แล้ว Active Scan (ยิง payload ทดสอบ)
  - ผลลัพธ์ระดับความเสี่ยง: High / Medium / Low / Informational
  - ที่มักพบ: Missing Anti-CSRF Tokens, Missing Security Headers, SQL Injection (หาก query ต่อ string ตรง ๆ)
  - ขอบเขตรายวิชา: ฝึก Automated Scan เท่านั้น (custom scan policy/authentication script นอกขอบเขต)

**เชื่อมโยงกับ OWASP Top 10:2025**
| หมวด | มาตรการในสัปดาห์นี้ | สัปดาห์ก่อนหน้า |
|---|---|---|
| A02 Security Misconfiguration | ตรวจ header ด้วย ZAP | Helmet.js (สัปดาห์ที่ 4) |
| A05 Injection | Zod ป้องกัน type confusion ก่อนถึง query | Parameterized query (สัปดาห์ที่ 5) |
| A06 Insecure Design | จำกัดขนาด array/payload ที่ระดับ schema | Middleware pattern (สัปดาห์ที่ 4) |
| A07 Authentication Failures | Rate limiting บน `/auth/login` | JWT + RBAC (สัปดาห์ที่ 6) |

---

## 6. สัปดาห์ที่ 13: Microservices Architecture

**Monolithic vs Microservices**
- Monolithic: Backend ทั้งหมดอยู่ใน codebase เดียว deploy เป็น process เดียว ใช้ฐานข้อมูลร่วมกัน (student-api ในรายวิชาเป็นตัวอย่าง)
- Microservices: แบ่งระบบเป็นบริการย่อยที่มีขอบเขตรับผิดชอบชัดเจน แต่ละบริการ deploy แยกกัน มีฐานข้อมูลของตัวเอง (database per service) สื่อสารกันผ่านเครือข่าย (API หรือ message queue)

| ประเด็น | Monolithic | Microservices |
|---|---|---|
| ความซับซ้อนเริ่มต้น | ต่ำ เหมาะกับทีมเล็กและ MVP | สูง ต้องจัดการเครือข่าย service discovery distributed data |
| การ Deploy | Deploy ทั้งระบบพร้อมกัน | Deploy แต่ละบริการแยกอิสระ |
| การ Scale | Scale ทั้งระบบแม้มีเพียงบางส่วนที่ต้องการ | Scale เฉพาะบริการที่โหลดสูงได้ |
| ความล้มเหลว | ส่วนใดส่วนหนึ่ง crash อาจกระทบทั้งระบบ | ความล้มเหลวของบริการหนึ่งไม่ควรให้ทั้งระบบล่ม (ต้องออกแบบ resilience) |
| ความสอดคล้องของข้อมูล | ทำได้ง่ายด้วย transaction เดียว | ซับซ้อน ต้องพิจารณา eventual consistency |
| การทดสอบ | End-to-end ได้ง่าย | ต้อง mock บริการอื่นหรือทำ integration test ข้ามบริการ |
| ทีมงานที่เหมาะสม | ทีมขนาดเล็กถึงกลาง | องค์กรขนาดใหญ่ที่มีหลายทีมดูแลคนละบริการ |

- **คำเตือน: Distributed Monolith** คือการแยกเป็นหลาย service แต่ยัง coupling กันแน่นเหมือน Monolithic เดิม จึงได้ข้อเสียของทั้งสองแนวทางพร้อมกัน
- ทีมเล็กควรเริ่มจาก **Modular Monolith** คือออกแบบขอบเขตภายในให้ชัดเจนก่อน แล้วจึงแยกเป็น Microservices เมื่อมีเหตุผลที่ชัดเจนรองรับ

**Service Decomposition (การแบ่งบริการ)**
- หลักการ: แบ่งตาม **Bounded Context** (แนวคิดจาก Domain-Driven Design) คือขอบเขตที่คำศัพท์และกฎทางธุรกิจมีความหมายสอดคล้องกันภายในขอบเขตนั้น
- **ไม่แบ่งตามชั้นทางเทคนิค** เช่น "Database Service", "Validation Service" เพราะจะทำให้ทุกคำขอต้องเรียกข้ามบริการจนกลายเป็น distributed monolith
- ตัวอย่างการแบ่ง student-api:
  - Auth Service: `POST /auth/register`, `POST /auth/login` (การลงทะเบียน เข้าสู่ระบบ ออก token การจัดการ role)
  - Student Service: `GET/POST/PUT/DELETE /students` (ข้อมูลนิสิต ประวัติการศึกษา)
  - Enrollment Service: การลงทะเบียนเรียนรายวิชา ตรวจสอบเงื่อนไข
  - Notification Service: แจ้งเตือนทางอีเมล/SMS รวมถึงการเรียก external API
- เกณฑ์ที่ใช้พิจารณาว่าควรแบ่งบริการ ณ จุดใด:
  - ความรับผิดชอบทางธุรกิจ (โมดูลนี้เปลี่ยนแปลงด้วยเหตุผลเดียวกันกับโมดูลอื่นหรือไม่)
  - อัตราการเปลี่ยนแปลง (rate of change)
  - ความต้องการด้าน scale (เช่น Notification ต้องรับ traffic พุ่งสูงช่วงประกาศผล)
  - ความเป็นเจ้าของข้อมูล (data ownership)
  - ทีมงาน

**API Gateway**
- จุดเข้าถึงเดียว (single entry point) ที่รับ request จาก client แล้วส่งต่อ (route) ไปยังบริการที่เหมาะสม
- ปัญหาเมื่อไม่มี Gateway: (1) client ต้องทราบ URL/port ของทุกบริการและอัปเดตทุกครั้งที่เปลี่ยน (2) เรื่องร่วม เช่น Authentication, Rate Limiting, Logging ต้องเขียนซ้ำในทุกบริการ (3) การ scale หรือปิดปรับปรุงบริการกระทบ client โดยตรง (4) ควบคุมความปลอดภัยยากเมื่อทุกบริการเปิด endpoint ให้ client เข้าถึงโดยตรง
- หน้าที่ของ Gateway: Routing, ตรวจ Authentication/Authorization ส่วนกลาง, Rate Limiting ส่วนกลาง, Logging และ Monitoring, Response Aggregation (รวมผลจากหลายบริการเป็น response เดียว)
- ตัวอย่าง Gateway แบบ mock ด้วย Express:
  - `authenticate` middleware ตรวจ `Bearer` token ด้วย `jwt.verify` คืน 401 `UNAUTHORIZED` ถ้าไม่มีหรือหมดอายุ
  - `app.use("/api/v1/students", authenticate, handler)` ส่งต่อด้วย Axios ไปยัง `http://localhost:4001` โดยตัด `/api/v1` ออกจาก `req.originalUrl` (บริการปลายทางไม่มี prefix นี้)
  - ถ้าบริการปลายทางไม่ตอบสนอง (ไม่มี `error.response`) Gateway คืน **503** `SERVICE_UNAVAILABLE` แทนการปล่อย error หลุดออกไป
- จุดสำคัญ: JWT ถูกตรวจที่ Gateway จุดเดียว บริการย่อยแต่ละตัวไม่ต้องตรวจซ้ำ (ตามที่อธิบายในสัปดาห์นี้)

**Inter-Service Communication (การสื่อสารระหว่างบริการ)**

**1) Synchronous (ตอบกลับทันที)**
- บริการหนึ่งเรียกอีกบริการโดยตรงผ่าน HTTP/REST (หรือ gRPC) แล้วรอผลลัพธ์ก่อนดำเนินการต่อ
- ตัวอย่าง: Enrollment Service เรียก `GET /students/:id` ของ Student Service ก่อนลงทะเบียน (blocking)
- ข้อดี: เข้าใจง่าย ได้ผลลัพธ์ทันที เหมาะกับการตัดสินใจขั้นตอนถัดไป
- ข้อเสีย: ผู้เรียกต้องรอบริการปลายทาง (coupling ด้านเวลา), ถ้าบริการปลายทางล่มหรือช้า จะกระทบผู้เรียกโดยตรง ต้องมี Retry/Timeout/Fallback เสมอ

**2) Asynchronous (ผ่าน Message Queue / Broker)**
- บริการผู้ส่งไม่เรียกโดยตรง แต่ส่ง message/event ไปยัง Message Broker (เช่น RabbitMQ, Apache Kafka) แล้วทำงานต่อได้ทันที
- ผู้รับ subscribe และประมวลผลเมื่อพร้อม
- ตัวอย่าง: Enrollment publish event `StudentEnrolled` → Notification Service ดึง event ไปส่งอีเมลภายหลัง โดยไม่ต้องรอ
- ข้อดี: decoupling ด้านเวลา ทนทานต่อความล้มเหลวของผู้รับได้ดีกว่า รองรับ traffic สูงได้ดีกว่า เหมาะกับงานที่ไม่ต้องการผลลัพธ์ทันที (ส่งอีเมล, บันทึก log, ประมวลผลวิดีโอ)
- ข้อเสีย: ระบบซับซ้อนขึ้น ต้องดูแล Message Broker, ไม่ได้ผลลัพธ์ทันที, ต้องออกแบบรับมือกับ **eventual consistency** และ **idempotency**

**Eventual Consistency**
- ข้อมูลในระบบแบบกระจายไม่จำเป็นต้องตรงกันทันทีในทุกจุดหลังการเปลี่ยนแปลง แต่รับประกันว่าหากไม่มีการเปลี่ยนแปลงเพิ่มเติม ข้อมูลทุกจุดจะตรงกันในที่สุด
- Enrollment บันทึกการลงทะเบียนเสร็จแล้ว แต่ Notification ยังไม่ได้ประมวลผล event จึงยังไม่ทันกันชั่วขณะ
- ต่างจาก Monolithic ที่ใช้ transaction เดียวบันทึกทุกอย่างพร้อมกัน

**Resilience ระหว่างบริการ**
- นำ Retry, Timeout, Fallback ของสัปดาห์ที่ 11 มาใช้กับการเรียกระหว่างบริการภายในได้เช่นเดียวกัน
- **Circuit Breaker**: หยุดส่ง request ไปยังบริการที่ล้มเหลวซ้ำ ๆ ชั่วคราว แทนที่จะ retry ต่อเนื่องจนกว่าบริการจะฟื้น
  - สถานะ **Closed** (ปล่อย request ตามปกติ) → เมื่อล้มเหลวเกินเกณฑ์ → **Open** (ปฏิเสธ request ทันที แบบ fail fast ไม่ส่งไปยังบริการปลายทาง)
  - เมื่อครบเวลาที่กำหนด (เช่น 30 วินาที) → **Half-Open** (ลองส่ง request ทดสอบจำนวนน้อย)
  - ทดลองสำเร็จ → กลับไป Closed ; ทดลองล้มเหลวอีก → กลับไป Open
- เป็นแนวคิดขั้นสูง อยู่นอกขอบเขตการฝึกปฏิบัติของรายวิชา

**ขอบเขตของโครงงาน**
- เป็นการฝึกออกแบบสถาปัตยกรรมเพื่อสร้างความเข้าใจแนวคิด ไม่ได้กำหนดให้ย้ายระบบจริงไปเป็น Microservices
- โครงงานหลักยังพัฒนาต่อเนื่องแบบ Monolithic ตามที่ออกแบบไว้ตั้งแต่โครงงานระยะที่ 1

---

## 7. สัปดาห์ที่ 14: Schema Evolution & Large-Scale Backend Design

**ปัญหาของการแก้ schema แบบไม่มีระบบ**
- แก้ตารางด้วยมือ (ALTER TABLE ตรง ๆ) ในฐานข้อมูลที่มีข้อมูลจริงแล้วจะเกิดปัญหา: เพิ่ม column `NOT NULL` โดยไม่มีค่า default ทำให้ query ล้มเหลวทันที, ลบ column ที่ endpoint อื่นยังอ้างอิง → endpoint พัง, ฐานข้อมูลของแต่ละคนไม่ตรงกัน → bug reproduce ไม่ได้, deploy schema โดยไม่มีแผนย้อนกลับ
- วิธีแก้: ใช้ **Migration** คือไฟล์สคริปต์ที่บันทึกการเปลี่ยนแปลง schema เป็นลำดับขั้น (version) มี 2 ทิศทาง:
  - `up` คำสั่งไปข้างหน้า (เพิ่ม column, สร้างตารางใหม่)
  - `down` คำสั่งย้อนกลับ (ลบ column ที่เพิ่งเพิ่ม)

**Knex.js**
- เครื่องมือ migration ที่ใช้ในรายวิชา ติดตั้ง `npm install knex mysql2` แล้ว `npx knex init` ได้ไฟล์ `knexfile.js`
- เหตุผลที่เลือก Knex: โปรเจกต์ student-api เขียน query ด้วย `mysql2` ตรง ๆ (ไม่ใช่ ORM) การเปลี่ยนไปใช้ Sequelize หรือ Prisma จะบังคับให้เขียน query ใหม่ทั้งหมด ส่วน db-migrate ไม่มี query builder และชุมชนเล็กกว่า
- ค่า `charset: "utf8mb4"` ใน knexfile จำเป็นเพื่อรองรับภาษาไทยและ emoji
- ตาราง `knex_migrations` บันทึกว่า migration ไหนรันไปแล้ว ทำให้รันซ้ำได้อย่างปลอดภัย (idempotent)

**คำสั่งสำคัญ**
| คำสั่ง | ความหมาย |
|---|---|
| `npx knex migrate:make add_phone_number_to_students` | สร้างไฟล์ใน `migrations/` ชื่อ `<timestamp>_add_phone_number_to_students.js` |
| `npx knex migrate:latest` | รัน migration ที่ยังไม่ได้รัน (batch ใหม่) |
| `npx knex migrate:rollback` | ย้อนกลับ batch ล่าสุด โดยเรียกฟังก์ชัน `down` ของแต่ละไฟล์ |

**ตัวอย่าง migration**
```javascript
// migrations/20260101120000_add_phone_number_to_students.js
exports.up = function (knex) {
  return knex.schema.alterTable("students", (table) => {
    table.string("phone_number", 20).nullable().defaultTo(null);
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable("students", (table) => {
    table.dropColumn("phone_number");
  });
};
```
- **คอลัมน์ใหม่ต้องเป็น `nullable()` หรือมี `defaultTo()`** เสมอเมื่อเพิ่มเข้าตารางที่มีข้อมูลอยู่แล้ว มิฉะนั้น migration จะล้มเหลวทันที
- `down` ต้องมีเสมอ และควรเป็นการทำให้กลับสู่สถานะเดิมจริง ๆ เช่น migration ที่ backfill ข้อมูลยังเขียน `down` ไม่ได้อย่างสมบูรณ์ ให้ใส่ comment อธิบายและใช้ `Promise.resolve()` แทน
- ตั้งชื่อไฟล์:
  - ห้ามแก้ไขหรือลบส่วน timestamp ที่ Knex สร้างให้ (ใช้เรียงลำดับการรัน)
  - รูปแบบกริยา + สิ่งที่เปลี่ยน + ตารางที่เกี่ยวข้อง เช่น `add_<column>_to_<table>`, `remove_<column>_from_<table>`, `create_<table>_table`, `change_<column>_type_in_<table>`, `add_index_to_<table>`
  - ไม่รวมหลายการเปลี่ยนแปลงที่ไม่เกี่ยวกันไว้ใน migration เดียว

**Backward-Compatible Migration: Expand-Contract Pattern**
- ใช้กับระบบที่มีผู้ใช้งานต่อเนื่อง (production) ที่ไม่สามารถหยุดระบบเพื่อแก้ schema ได้
- ตัวอย่าง: เปลี่ยนชื่อ column `email` เป็น `email_address`
  1. **Expand**: เพิ่ม column `email_address` คู่กับ `email` เดิม โดยไม่ลบของเดิม
  2. **Migrate**: deploy โค้ดให้เขียนลงทั้งสอง column พร้อมกัน แล้วค่อยย้ายการอ่านไปที่ `email_address` ; migration backfill ข้อมูลเดิมให้ครบทุกแถว
  3. **Contract**: เมื่อมั่นใจว่าไม่มีโค้ดส่วนใดอ้างอิง `email` แล้ว จึงลบ column เดิม
- รูปแบบนี้หลีกเลี่ยง downtime และป้องกันปัญหาที่ instance เก่าและใหม่ทำงานพร้อมกันระหว่าง rolling deployment

**Production Best Practice (6 ข้อ)**
1. **สำรองข้อมูลก่อนรัน** ด้วย `mysqldump -u root -p student_api_db > backup_before_migration_YYYYMMDD.sql`
2. **ทดสอบ migration บน staging** ที่มีข้อมูลจำลองใกล้เคียงของจริง ไม่ใช่แค่ฐานข้อมูลเปล่า
3. **ตรวจว่า `down` ใช้งานได้จริงก่อน deploy**
4. **ใช้ Expand-Contract** สำหรับการเปลี่ยนแปลงที่กระทบ column ที่โค้ดใช้งานอยู่
5. **รัน migration ก่อนเสมอ แล้วจึง deploy โค้ดที่ต้องใช้ schema นั้น** (migrate-then-deploy)
6. **รันในช่วงที่มีผู้ใช้งานน้อยที่สุด** และแจ้งแผนย้อนกลับให้ทีมรับทราบก่อน (rollback หรือ restore จาก backup)

**Scalability Patterns**

**Vertical Scaling (Scale Up)**
- เพิ่มทรัพยากรให้เครื่องเดิม (CPU, RAM, SSD ที่เร็วขึ้น)
- ข้อดี: ทำได้ง่าย ไม่ต้องแก้สถาปัตยกรรม ไม่ต้องจัดการ distributed system
- ข้อเสีย: มีเพดานจำกัด (ฮาร์ดแวร์ที่แรงที่สุดก็มีขีดจำกัด) มักมี downtime ช่วงอัปเกรด ต้นทุนต่อหน่วยประสิทธิภาพสูงขึ้นเรื่อย ๆ

**Horizontal Scaling (Scale Out)**
- เพิ่มจำนวน instance ที่รันแอปพลิเคชันเดียวกัน แล้วกระจายโหลดไปยังหลายเครื่อง
- ข้อดี: ขยายได้แทบไม่มีเพดาน ทนทานต่อความล้มเหลว รองรับ rolling deployment โดยไม่มี downtime
- ข้อเสีย: ต้องมี Load Balancer, แอปต้องออกแบบให้ **stateless** (ไม่เก็บ state ไว้ใน memory ของเครื่องเดียว), ฐานข้อมูลกลายเป็นจุดร่วมที่ต้องรองรับการเชื่อมต่อจากหลาย instance

**เมื่อใดควรเลือกแบบใด**
- ทีมขนาดเล็กมักเริ่มจาก Vertical Scaling ก่อน เพราะเร็วและไม่ต้องแก้สถาปัตยกรรม
- เมื่อถึงเพดานของ Vertical หรือต้องการ high availability จึงค่อยลงทุนออกแบบให้รองรับ Horizontal Scaling
- student-api ใช้ JWT (สัปดาห์ที่ 6) แทนการเก็บ session ใน memory ของ server → เป็น stateless จึงรองรับ Horizontal Scaling ได้

**ข้อจำกัดด้านฐานข้อมูลเมื่อ Scale แอปพลิเคชันแนวนอน (Connection Pool)**
- แต่ละ instance สร้าง connection pool ของตัวเอง (`connectionLimit: 10`)
- เมื่อมี 3 instance × 10 connections = 30 connections ; ถ้า MySQL `max_connections` ต่ำกว่านี้ จะได้ error `ER_CON_COUNT_ERROR`
- แนวทางแก้ไข:
  - เพิ่มค่า `max_connections` ของ MySQL (แก้ปัญหาได้ชั่วคราว ยังมีเพดานเหมือน Vertical)
  - ลด `connectionLimit` ต่อ instance
  - **Read Replica**: ทำสำเนาฐานข้อมูลสำหรับอ่านอย่างเดียวด้วย replication แล้วแยก query `SELECT` ไปที่ replica ส่วน `INSERT/UPDATE/DELETE` ยังไปที่ primary
  - ข้อจำกัด: ข้อมูลใน replica อาจล่าช้ากว่า primary (replication lag) เหมาะกับ endpoint ที่อ่านมากกว่าเขียนมาก และไม่ต้องการข้อมูลล่าสุดแบบ real-time
- หัวข้อ Read Replica และการตั้งค่า replication อยู่นอกขอบเขตของสัปดาห์นี้

**Load Balancing**
- Load Balancer คือองค์ประกอบที่อยู่หน้าเครื่องหลายเครื่อง ทำหน้าที่กระจาย request ไปยัง instance ที่เหมาะสม client เรียกผ่าน LB เสมอ ไม่เรียก instance โดยตรง
- อัลกอริทึม:
  | อัลกอริทึม | หลักการทำงาน | เหมาะกับ |
  |---|---|---|
  | Round Robin | ส่ง request ไปยัง instance ถัดไปตามลำดับวนซ้ำ | instance ทุกเครื่องมีสเปกเท่ากันและงานมีขนาดใกล้เคียงกัน |
  | Least Connections | ส่งไปยัง instance ที่มีจำนวนการเชื่อมต่อค้างอยู่น้อยที่สุด | งานที่แต่ละ request ใช้เวลาประมวลผลต่างกันมาก |
  | IP Hash | คำนวณ hash จาก IP ของ client แล้วส่งไปยัง instance เดิมเสมอ | กรณีที่ยังจำเป็นต้องใช้ session แบบผูกกับเครื่อง (sticky session) |
- ตัวอย่าง Nginx:
  ```nginx
  upstream student_api_backend {
      server 127.0.0.1:4001;
      server 127.0.0.1:4002;
      server 127.0.0.1:4003;
  }
  server {
      listen 80;
      location / {
          proxy_pass http://student_api_backend;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```
- **การตั้ง `X-Forwarded-For` ที่ Load Balancer สำคัญต่อ Rate Limiting ในสัปดาห์ที่ 12** เพราะถ้า Nginx ไม่ส่ง header นี้ `req.ip` ของ Express จะเป็น IP ของ Nginx ทำให้ผู้ใช้ทุกคนถูกนับรวมกัน

---

## 8. ภาพรวมเชื่อมโยงสัปดาห์ 9–14 (สำหรับตอบข้อสอบเชิงวิเคราะห์)

- **การทดสอบ (9) → การ mock (9)** ทำให้ unit test ไม่ต้องพึ่งฐานข้อมูล
- **OpenAPI (10) → contract** ให้ Frontend/Backend ทำงานคู่ขนานได้ และเป็นฐานของ contract testing
- **Resilience (11)** ใช้ได้ทั้งกับ API ภายนอกและการเรียกระหว่าง microservices
- **Validation + Rate Limiting (12)** คือด่านหน้าของ endpoint ทุกตัว และต้องตั้ง `trust proxy` / `X-Forwarded-For` ให้ถูกต้องเมื่ออยู่หลัง LB
- **Microservices + API Gateway (13)** รวมจุดตรวจ JWT, rate limit, logging ไว้ที่ Gateway
- **Migration + Scalability (14)** ทำให้การเปลี่ยน schema และการขยายระบบทำได้โดยไม่กระทบผู้ใช้ เช่น Stateless + Load Balancer + Expand-Contract

---

## 9. Checklist ก่อนวันสอบ (ชุดติดตั้ง final-exam-setup)

1. ติดตั้ง Docker Desktop และ Node.js
2. คัดลอก `.env.example` เป็น `.env` (ค่า `DB_PORT=3309`)
3. `docker compose up -d` รอประมาณ 20 วินาที
4. `npm install`
5. `npm run seed` (สร้างตาราง `menu_items`, `orders`, `order_items` และใส่ข้อมูล 22 เมนู)
6. `npm run check` ควรแสดง "เชื่อมต่อฐานข้อมูลได้ พบเมนู 22 รายการ"
7. `npm test` ควรผ่านทั้ง 3 เทสต์ (ฐานข้อมูล, Express กับ Supertest, JWT)
8. ถ้าพอร์ต 3309 ถูกใช้อยู่ ให้เปลี่ยน `DB_PORT` ใน `.env` และพอร์ตใน `docker-compose.yml` ให้ตรงกัน
9. หยุดฐานข้อมูลด้วย `docker compose down`

**ข้อควรระวัง**
- ในชุดติดตั้งมี `config.js` ที่มี JWT secret ค่า default ไว้ใช้ในการทดสอบเท่านั้น
- อย่าส่ง `.env` และ `node_modules` ตอนส่งงานส่วนที่ 2
- ส่วนที่ 1 ให้ทำใน Google Classroom

---

## 10. ข้อจำกัดของสรุปนี้

- สรุปนี้ครอบคลุมสัปดาห์ที่ 9–14 เท่านั้น ส่วนที่ 2 ของข้อสอบเปิดเอกสารสัปดาห์ที่ 5–12 ซึ่งสัปดาห์ที่ 5–8 ยังไม่ได้สรุป (ต้องดูจากเอกสารต้นฉบับ)
- ชุดติดตั้งเรียกใช้ Docker/MySQL จริงไม่ได้ในสภาพแวดล้อมนี้ การทดสอบจึงต้องทำบนเครื่องของผู้เรียนเอง
- ข้อสอบจริงอาจมีรายละเอียดต่างจากสรุป ให้ยึดเอกสารต้นฉบับและประกาศของอาจารย์เป็นหลัก

node -v
npm -v
เช็คnode