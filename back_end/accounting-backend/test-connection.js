const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'accounting_system'
});

console.log('正在測試 MySQL 連線...');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '3306'}`);
console.log(`Database: ${process.env.DB_DATABASE || 'accounting_system'}`);
console.log('---');

connection.connect((err) => {
  if (err) {
    console.error('❌ 連線失敗:', err.message);
    console.error('\n請檢查:');
    console.error('1. MySQL 是否在 port 3306 運行');
    console.error('2. .env 檔案中的資料庫設定是否正確');
    console.error('3. 資料庫 accounting_system 是否已建立');
    process.exit(1);
  }

  console.log('✅ MySQL 連線成功!');
  console.log(`已連接到資料庫: ${process.env.DB_DATABASE || 'accounting_system'}`);

  connection.end();
  process.exit(0);
});
