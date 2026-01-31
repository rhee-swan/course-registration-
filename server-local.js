require('dotenv').config();
const app = require('./api/index');

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`✅ Supabase connected`);
});
