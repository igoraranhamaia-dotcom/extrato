const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('extrato.db');

// Cria a tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS lancamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    tipo TEXT NOT NULL
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Busca todos os lançamentos
app.get('/lancamentos', (req, res) => {
  const rows = db.prepare('SELECT * FROM lancamentos ORDER BY id ASC').all();
  res.json(rows);
});

// Cria novo lançamento
app.post('/lancamentos', (req, res) => {
  const { descricao, valor, tipo } = req.body;

  if (!descricao || !valor || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
  }

  const stmt = db.prepare(
    'INSERT INTO lancamentos (data, descricao, valor, tipo) VALUES (?, ?, ?, ?)'
  );

  const result = stmt.run(
    new Date().toISOString(),
    descricao,
    parseFloat(valor),
    tipo
  );

  const novo = db.prepare('SELECT * FROM lancamentos WHERE id = ?').get(result.lastInsertRowid);
  res.json(novo);
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});