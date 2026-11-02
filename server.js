// เซิร์ฟเวอร์ Express ของระบบสั่งอาหารออนไลน์ (npm start แล้วเปิด http://localhost:3000)
const path = require("path");
const express = require("express");
const { pool } = require("./db");
const { port } = require("./config");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// รายการเมนูทั้งหมด
app.get("/api/menu", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu_items ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// รายการคำสั่งซื้อ พร้อมยอดรวม
app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.customer_name, o.status, o.created_at,
             COALESCE(SUM(oi.quantity * m.price), 0) AS total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items m ON m.id = oi.menu_item_id
      GROUP BY o.id
      ORDER BY o.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// สร้างคำสั่งซื้อใหม่ body: { customer_name, items: [{ menu_item_id, quantity }] }
app.post("/api/orders", async (req, res) => {
  const { customer_name, items } = req.body;
  if (!customer_name || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "กรุณาระบุชื่อและเลือกเมนูอย่างน้อย 1 รายการ" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query("INSERT INTO orders (customer_name) VALUES (?)", [customer_name]);
    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)",
        [result.insertId, item.menu_item_id, item.quantity]
      );
    }
    await conn.commit();
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// เปลี่ยนสถานะคำสั่งซื้อ body: { status }
app.patch("/api/orders/:id/status", async (req, res) => {
  const allowed = ["pending", "preparing", "delivered", "cancelled"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
  }
  try {
    const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "ไม่พบคำสั่งซื้อ" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => console.log(`เปิดเว็บได้ที่ http://localhost:${port}`));
}

module.exports = app;
