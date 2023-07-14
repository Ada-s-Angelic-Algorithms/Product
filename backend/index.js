// Import required modules
const express = require('express');
const mariadb = require('mariadb');
const productsRoutes = require('./routes/products');
require('dotenv').config()
// Create an instance of the Express application
const app = express();

console.log(process.env.DBUSER)
console.log(process.env.PASSWORD)
console.log(process.env.HOST)

// Set up MariaDB connection pool
const pool = mariadb.createPool({
  host: process.env.HOST, // Replace with your MariaDB server hostname
  user: process.env.DBUSER, // Replace with your MariaDB username
  port: process.env.PORT, // Replace with your MariaDB server port
  password: process.env.PASSWORD, // Replace with your MariaDB password
  database: process.env.DATABASE, // Replace with your MariaDB database name
  connectionLimit: 10
});
async function testConnection() {
let testConn;
try {
    testConn = await pool.getConnection();
    console.log('connected ! connection id is ' + testConn.threadId);
    testConn.release(); //release to pool
} catch (err) {
    console.log('not connected due to error: ' + err);
}
}
testConnection();
app.use('/products', productsRoutes(pool));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
