require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ======================
// CONFIGURAÇÕES INICIAIS
// ======================
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Debug: Verifica variáveis de ambiente
console.log("[DEBUG] Variáveis carregadas:", {
  EMAIL_USER: process.env.EMAIL_USER ? "***" : "NÃO ENCONTRADA",
  PORT: PORT
});

// ==================
// CONFIGURAÇÃO EMAIL
// ==================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

// Testa conexão SMTP ao iniciar
transporter.verify()
  .then(() => console.log("[SMTP] Conexão verificada com sucesso!"))
  .catch(err => console.error("[SMTP ERRO]", err));

// ============
// ROTAS
// ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/enviar-pedido', async (req, res) => {
  try {
    console.log("[DEBUG] Recebido:", req.body);

    const { revendedor, ...produtos } = req.body;

    // Validação
    if (!revendedor?.trim()) {
      return res.status(400).json({ error: "Nome do revendedor é obrigatório!" });
    }

    // Processa itens (filtra zerados)
    const itensPedido = Object.entries(produtos)
      .filter(([_, qtd]) => qtd > 0)
      .map(([nome, qtd]) => `${nome.replace('produto', 'Produto ')}: ${qtd}`);

    // Envia e-mail
    const info = await transporter.sendMail({
      from: `Sistema de Pedidos <${process.env.EMAIL_USER}>`,
      to: "kauanoliveiradesouza2016@gmail.com",
      subject: `📦 Pedido de ${revendedor}`,
      text: `Revendedor: ${revendedor}\nItens:\n${itensPedido.join("\n") || "Nenhum item selecionado"}`,
      html: `
        <h1>Novo Pedido</h1>
        <p><strong>Revendedor:</strong> ${revendedor}</p>
        ${itensPedido.length > 0 
          ? `<ul>${itensPedido.map(i => `<li>${i}</li>`).join("")}</ul>`
          : "<p>Nenhum item selecionado</p>"}
      `
    });

    console.log("[SUCESSO] E-mail enviado! ID:", info.messageId);
    res.json({ success: true, message: "Pedido enviado!" });

  } catch (error) {
    console.error("[ERRO]", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: "Erro ao enviar pedido",
      details: process.env.NODE_ENV === "development" ? error.message : null
    });
  }
});

// ============
// INICIA SERVIDOR
// ============
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error("❌ Falha ao iniciar:", err.message);
});
