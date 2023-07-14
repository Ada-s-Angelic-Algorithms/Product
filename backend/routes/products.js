const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // GET /products
  router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 5;
    const offset = (page - 1) * count;

    let conn;
    try {
      conn = await pool.getConnection();
      const query = `SELECT * FROM Products LIMIT ?, ?`;
      const rows = await conn.query(query, [offset, count]);
      res.json(rows);
    } catch (err) {
      console.error('Error retrieving products: ', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  });

 // GET /products/:product_id
 router.get('/:product_id', async (req, res) => {
  const productId = req.params.product_id;

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'SELECT * FROM Products WHERE id = ?';
    const rows = await conn.query(query, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error retrieving product: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

router.get('/:product_id/styles', async (req, res) => {
  const productId = req.params.product_id;

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'SELECT * FROM Styles WHERE product_id = ?';
    const rows = await conn.query(query, [productId]);

    res.json(rows);
  } catch (err) {
    console.error('Error retrieving styles: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

 // GET /products/:product_id/related
 router.get('/:product_id/related', async (req, res) => {
  const productId = req.params.product_id;

  let conn;
  try {
    conn = await pool.getConnection();
    const query = 'SELECT * FROM Related WHERE product_id = ?';
    const rows = await conn.query(query, [productId]);

    res.json(rows);
  } catch (err) {
    console.error('Error retrieving related products: ', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

// ... other route handlers ...

return router;
};