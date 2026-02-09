const isProduction = import.meta.env.PROD;

// สังเกตตรงนี้: ต้องมีคำว่า export const และชื่อต้องเป็น BACKEND_ORIGIN เป๊ะๆ
export const BACKEND_ORIGIN = isProduction
  ? 'https://jame-shop-backend.onrender.com'
  : 'http://localhost:3000';

// ถ้ามีบรรทัด export default ... ให้ลบทิ้ง หรือคอมเมนต์ปิดไปเลยครับcd ..cd ..