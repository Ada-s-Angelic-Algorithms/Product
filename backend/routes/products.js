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
      const query = `SELECT id, name, slogan, description, category, default_price FROM Products LIMIT ?, ?`;
      const rows = await conn.query(query, [offset, count]);
      res.header("Access-Control-Allow-Origin", "*");
      res.json(rows);
    } catch (err) {
      console.error('Error retrieving products: ', err);
      res.header("Access-Control-Allow-Origin", "*");
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
    const query = 'SELECT id, name, slogan, description, category, default_price, features FROM Products WHERE id = ?';
    var rows = await conn.query(query, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    function transformObject(obj) {
      let transformedObj = {
        id: obj.id,
        name: obj.name,
        slogan: obj.slogan,
        description: obj.description,
        category: obj.category,
        default_price: obj.default_price,
        features: []
      };

      for (const key in obj.features) {
        transformedObj.features.push({
          feature: key,
          value: obj.features[key]
        });
      }
      return transformedObj;
    }

    rows = transformObject(rows[0])

    res.header("Access-Control-Allow-Origin", "*");

    res.json(rows);
  } catch (err) {
    console.error('Error retrieving product: ', err);
    res.header("Access-Control-Allow-Origin", "*");
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
    const rows = await conn.query('SELECT GetStylesWithSkusForProduct(?) AS result', [productId]);
    res.header("Access-Control-Allow-Origin", "*");
    res.json(JSON.parse(rows[0].result));
  } catch (err) {
    console.error('Error retrieving styles: ', err);
    res.header("Access-Control-Allow-Origin", "*");
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
    const query = 'SELECT relatedID FROM Related WHERE productID = ?';
    const rows = await conn.query(query, [productId]);
    res.header("Access-Control-Allow-Origin", "*");

    res.json(rows.map(obj => obj.relatedID));
  } catch (err) {
    console.error('Error retrieving related products: ', err);
    res.header("Access-Control-Allow-Origin", "*");
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