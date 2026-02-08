// ตรวจสอบว่ากำลังรันบนเซิร์ฟเวอร์จริง (Production) หรือเปล่า
const isProduction = import.meta.env.PROD;

// ถ้าใช่ ให้ใช้ลิงก์ Render, ถ้าไม่ใช่ ให้ใช้ localhost
const backendUrl = isProduction
  ? 'https://denchai-marketplace-dz9y.onrender.com'  // ☁️ ลิงก์สำหรับ Render
  : 'http://localhost:3000';                           // 🏠 ลิงก์สำหรับเครื่องเรา

export default backendUrl;