const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const BACKEND_ORIGIN = isLocal
  ? 'http://localhost:3000'
  : 'https://denchai-marketplace-dz9y.onrender.com';

// ถ้ามีบรรทัด export default ... ให้ลบทิ้ง หรือคอมเมนต์ปิดไปเลยครับcd ..cd ..