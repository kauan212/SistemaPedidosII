require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Configuração do Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rotas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/enviar-pedido', async (req, res) => {
  try {
    const { revendedor, ...produtos } = req.body;

    // Validação do revendedor (única obrigatória)
    if (!revendedor || revendedor.trim() === '') {
      return res.status(400).json({ error: 'Nome do revendedor é obrigatório!' });
    }

    // Filtra apenas itens com quantidade > 0 para o e-mail
    const itensPedido = Object.entries(produtos)
      .filter(([_, quantidade]) => quantidade > 0) // 👈 Oculta itens zerados
      .map(([nome, quantidade]) => {
        const nomeFormatado = nome
          .replace('produto', '')
          .replace(/(\d+)/, ' ')
          .trim();
        return `${nomeFormatado}: ${quantidade}`;
      });

    // Monta o e-mail (só mostra itens selecionados)
    const textoEmail = `Revendedor: ${revendedor}\n\nItens:\n${itensPedido.join('\n') || 'Nenhum item selecionado'}`;
    const htmlEmail = `
      <h1>Novo Pedido</h1>
      <p><strong>Revendedor:</strong> ${revendedor}</p>
      <h2>Itens:</h2>
      ${itensPedido.length > 0 ? `<ul>${itensPedido.map(item => `<li>${item}</li>`).join('')}</ul>` : '<p>Nenhum item selecionado</p>'}
    `;

    await transporter.sendMail({
      from: `Sistema de Pedidos <${process.env.EMAIL_USER}>`,
      to: 'kauanoliveiradesouza2016@gmail.com',
      subject: `📦 Pedido de ${revendedor}`,
      text: textoEmail,
      html: htmlEmail
    });

    res.json({ success: true, message: 'Pedido enviado!' });

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar. Tente novamente.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
