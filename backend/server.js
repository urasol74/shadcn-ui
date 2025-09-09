const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
// const dbPath = path.join(__dirname, '../instance-db/der-db.db');
const dbPath = '/home/ubuntu/baf_test/instance/der-db.db';
const db = new sqlite3.Database(dbPath);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
// Простое middleware для управления заголовками кеширования для API
app.use((req, res, next) => {
  try {
    if (req.path && req.path.startsWith('/api/')) {
      // По умолчанию не кешируем API-ответы
      // Для некоторых эндпоинтов ставим короткий TTL и stale-while-revalidate
      if (req.path === '/api/product') {
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      } else if (req.path === '/api/products') {
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=30');
      } else if (req.path === '/api/categories') {
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      } else if (req.path === '/api/products/random') {
        // Часто меняющиеся случайные подборки — не кешировать
        res.set('Cache-Control', 'no-store');
      } else if (req.path === '/api/search') {
        // Поиск должен быть всегда свежим
        res.set('Cache-Control', 'no-store');
      } else {
        res.set('Cache-Control', 'no-store');
      }
    }
  } catch (e) {
    // не ломаем обработку запроса из-за заголовков
  }
  next();
});
app.post('/api/query', (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string' || !sql.trim().toLowerCase().startsWith('select')) {
    return res.status(400).json({ error: 'Только SELECT-запросы разрешены' });
  }
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// Поиск товаров по части артикула
app.get('/api/search', (req, res) => {
  const article = req.query.article;
  if (!article || article.length < 2) return res.json([]);
  db.all(
    `SELECT p.id as product_id, p.article, p.name, p.gender, p.category_id, c.name as category_name
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE LOWER(p.article) LIKE LOWER(?) OR LOWER(p.name) LIKE LOWER(?) LIMIT 10`,
    [`%${article}%`, `%${article}%`],
    (err, products) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(products);
    }
  );
});

// Получить случайные товары (count штук)
app.get('/api/products/random', (req, res) => {
  const count = parseInt(req.query.count) || 5;
  db.all(
    `SELECT p.id as product_id, p.article, p.name, p.gender, p.category_id, c.name as category_name
     FROM products p
     JOIN categories c ON p.category_id = c.id
     ORDER BY RANDOM() LIMIT ?`,
    [count],
    (err, products) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!products.length) return res.json([]);
      // Получаем variants для всех товаров
      const productIds = products.map(p => p.product_id);
      const placeholders = productIds.map(() => '?').join(',');
      db.all(
        `SELECT * FROM variants WHERE product_id IN (${placeholders}) AND stock > 0`,
        productIds,
        (err2, variants) => {
          if (err2) return res.status(500).json({ error: err2.message });
          // Для каждого товара берём первый variant (только с positive stock); если таких нет — исключаем товар
          const result = products.map(product => {
            const v = variants.find(v => v.product_id === product.product_id);
            if (!v) return null;
            return {
              ...product,
              purchase_price: v.purchase_price || null,
              sale_price: v.sale_price || null,
              discount: v.discount || null,
            };
          }).filter(Boolean);
          res.json(result);
        }
      );
    }
  );
});

// Получить товар и варианты по article
app.get('/api/product', (req, res) => {
  const article = req.query.article;
  if (!article) return res.status(400).json({ error: 'article обязателен' });
  db.get(
    `SELECT p.id as product_id, p.article, p.name, p.season, p.gender, p.category_id, c.name as category_name
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.article = ?`,
    [article],
    (err, product) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!product) return res.json({ product: null, variants: [] });
      db.all(
        `SELECT * FROM variants WHERE product_id = ?`,
        [product.product_id],
        (err2, variants) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ product, variants });
        }
      );
    }
  );
});

// Получить категории по gender
app.get('/api/categories', (req, res) => {
  const gender = req.query.gender;
  db.all(
    `SELECT DISTINCT c.id, c.name
     FROM categories c
     JOIN products p ON p.category_id = c.id
     WHERE p.gender = ?`,
    [gender],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Получить продукты по gender и categoryId, сгруппировать по name, дублировать по sale_price из variants
app.get('/api/products', (req, res) => {
  const gender = req.query.gender;
  const categoryId = req.query.categoryId;
  if (!gender || !categoryId) {
    return res.status(400).json({ error: 'gender и categoryId обязательны' });
  }
  // Получаем товары с нужным gender и categoryId
  db.all(
    `SELECT p.id as product_id, p.article, p.name, p.gender, p.category_id, c.name as category_name
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.gender = ? AND p.category_id = ?`,
    [gender, categoryId],
    (err, products) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!products.length) return res.json([]);

      // Получаем все варианты для найденных товаров
      const productIds = products.map(p => p.product_id);
      const placeholders = productIds.map(() => '?').join(',');
      db.all(
        `SELECT * FROM variants WHERE product_id IN (${placeholders}) AND stock > 0`,
        productIds,
        (err2, variants) => {
          if (err2) return res.status(500).json({ error: err2.message });

          // Группируем варианты по product_id и sale_price
          const result = [];
          products.forEach(product => {
            const productVariants = variants.filter(v => v.product_id === product.product_id);
            // Для каждого уникального sale_price создаём отдельный товар
            const seen = new Set();
            productVariants.forEach(variant => {
              const key = variant.sale_price;
              if (!seen.has(key)) {
                seen.add(key);
                result.push({
                  ...product,
                  purchase_price: variant.purchase_price,
                  sale_price: variant.sale_price,
                  discount: variant.discount,
                  variant_id: variant.id
                });
              }
            });
          });
          res.json(result);
        }
      );
    }
  );
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
