app.post('/enviar-pedido', async (req, res) => {
  try {
    console.log("Dados recebidos:", req.body); // 👈 Log para debug

    const { revendedor, ...produtos } = req.body;

    if (!revendedor?.trim()) {
      return res.status(400).json({ error: "Nome do revendedor é obrigatório!" });
    }

    // Configuração do transporter COM tratamento de erro
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // Verificação SMTP
    await transporter.verify();

    // Processa itens (ignora zerados)
    const itensPedido = Object.entries(produtos)
      .filter(([_, qtd]) => qtd > 0)
      .map(([nome, qtd]) => `${nome.replace('produto', 'Produto ')}: ${qtd}`);

    await transporter.sendMail({
      from: `Sistema de Pedidos <${process.env.EMAIL_USER}>`,
      to: "kauanoliveiradesouza2016@gmail.com",
      subject: `📦 Pedido de ${revendedor}`,
      text: `Revendedor: ${revendedor}\nItens:\n${itensPedido.join("\n") || "Nenhum item selecionado"}`,
    });

    res.json({ success: true, message: "Pedido enviado!" });

  } catch (error) {
    console.error("ERRO DETALHADO:", {
      message: error.message,
      stack: error.stack,
      response: error.response,
    });
    res.status(500).json({ 
      error: "Erro ao enviar pedido",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});
