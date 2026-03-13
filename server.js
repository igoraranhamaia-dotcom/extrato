const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function iniciarBanco() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id SERIAL PRIMARY KEY,
      data TEXT NOT NULL,
      descricao TEXT NOT NULL,
      valor REAL NOT NULL,
      tipo TEXT NOT NULL
    )
  `);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/lancamentos', async (req, res) => {
  const result = await pool.query('SELECT * FROM lancamentos ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/lancamentos', async (req, res) => {
  const { descricao, valor, tipo } = req.body;

  if (!descricao || !valor || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }

  const result = await pool.query(
    'INSERT INTO lancamentos (data, descricao, valor, tipo) VALUES ($1, $2, $3, $4) RETURNING *',
    [new Date().toISOString(), descricao, parseFloat(valor), tipo]
  );

  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;

iniciarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
```

Salva. Depois no PowerShell dentro da pasta extrato:
```
git add .
git commit -m "corrige server.js"
git push
