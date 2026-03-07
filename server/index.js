require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./src/server'); // This points to your engine

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Telos ERP is running on port ${PORT}`);
});