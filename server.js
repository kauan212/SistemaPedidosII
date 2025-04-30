require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações básicas
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Configuração do e-mail (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rota de teste
app.get('/test', (req, res) => {
  res.send('Servidor funcionando! ✅');
});

// Rota principal (enviar pedido)
app.post('/enviar-pedido', async (req, res) => {
  try {
    const { revendedor, ...produtos } = req.body;

    // Validação
    if (!revendedor) {
      return res.status(400).json({ error: 'Nome do revendedor é obrigatório!' });
    }

    // Formata o e-mail
    const listaProdutos = Object.entries(produtos)
      .filter(([_, quantidade]) => quantidade > 0)
      .map(([nome, quantidade]) => `${nome.replace('produto', 'Produto ')}: ${quantidade}`)
      .join('\n');

    // Envia o e-mail
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'kauanoliveiradesouza2016@gmail.com',
      subject: `📦 Pedido de ${revendedor}`,
      text: `Revendedor: ${revendedor}\n\nItens:\n${listaProdutos}`
    });

    res.json({ success: true, message: 'Pedido enviado!' });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});