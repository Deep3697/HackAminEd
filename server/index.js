require('dotenv').config();
const app = require('./src/server'); // This points to your engine

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Telos ERP is running on port ${PORT}`);
});