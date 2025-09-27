
const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const BOT_TOKEN = '7223314836:AAEUHr6yHUM-RnNn3tTN9PpuFeRc9I10VH0';
const CHAT_ID = '1023307031';

app.post('/api/quick-order', async (req, res) => {
  const { name, phone, product, selectedVariant } = req.body;

  if (!name || !phone || !product || !selectedVariant) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const message = `
*⚡️ Быстрый заказ!*

*Имя:* ${name}
*Телефон:* ${phone}

*Товар:*
Название: ${product.name}
Артикул: ${product.article}
Цвет: ${selectedVariant.color}
Размер: ${selectedVariant.size}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    if (result.ok) {
      res.status(200).json({ success: true });
    } else {
      throw new Error(result.description);
    }
  } catch (error) {
    console.error('Telegram API error:', error);
    res.status(500).json({ error: 'Failed to send message to Telegram' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
