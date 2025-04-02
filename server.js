const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Adicionar para manipular caminhos de arquivos

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS para permitir todos os domínios
app.use(cors()); // Permite todos os domínios

// Middleware para analisar os dados do corpo
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve arquivos estáticos da raiz, onde o 'index.html' está localizado
app.use(express.static(path.join(__dirname))); // Serve os arquivos na raiz do projeto

// Configurar o transporte de e-mail (usando o Gmail como exemplo)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pedidosgaleano@gmail.com',  // Seu e-mail
        pass: 'xalg mfko jakr hbve'  // Senha de aplicativo gerada
    },
    tls: {
        rejectUnauthorized: false  // Desativa verificação de certificado (ajuda a evitar alguns erros de SSL)
    }
});

// Rota GET para a raiz ("/") - Agora você não precisa mais dessa rota, pois a static serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve o arquivo index.html da raiz
});

// Rota para receber os pedidos
app.post('/enviar-pedido', (req, res) => {
    const {
        revendedor,
        produto1, produto2, produto3, produto4, produto5, produto6, produto7, produto8, produto9, produto10, produto11, produto12, produto13, produto14, produto15, produto16, produto17, produto18, produto19, produto20, produto21, produto22, produto23, produto24, produto25, produto26, produto27, produto28, produto29, produto30, produto31
    } = req.body;

    const mailOptions = {
        from: 'pedidosgaleano@gmail.com',
        to: 'kauanoliveiradesouza2016@gmail.com',  // Seu e-mail de destino
        subject: `Novo Pedido Recebido de ${revendedor}`,
        text: `Pedido recebido de ${revendedor}:\n
Brigadeiro: ${produto1} unidades\n
Beijinho: ${produto2} unidades\n
Paçoca: ${produto3} unidades\n
Pé de Moça: ${produto4} unidades\n
Casadinho: ${produto5} unidades\n
Olho de Sogra: ${produto6} unidades\n
Cajuzinho: ${produto7} unidades\n
Coco Queimado: ${produto8} unidades\n
Ninho Com Nutella: ${produto9} unidades\n
Nesquik Com Nutella: ${produto10} unidades\n
Churros: ${produto11} unidades\n
M&M: ${produto12} unidades\n
Charge Com Nutella: ${produto13} unidades\n
Chocoball: ${produto14} unidades\n
Bombom de Nozes: ${produto15} unidades\n
Camafeu: ${produto16} unidades\n
Rocher Branco: ${produto17} unidades\n
Rocher: ${produto18} unidades\n
Maracuja: ${produto19} unidades\n
Damasco: ${produto20} unidades\n
Laka: ${produto21} unidades\n
Amarula: ${produto22} unidades\n
Cacau 50: ${produto23} unidades\n
Cafe: ${produto24} unidades\n
Castanha: ${produto25} unidades\n
Rum: ${produto26} unidades\n
Prestigio: ${produto27} unidades\n
Morango Preto: ${produto28} unidades\n
Morango Branco: ${produto29} unidades\n
Uva: ${produto30} unidades\n
Cereja: ${produto31} unidades`
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar o e-mail:', error);
            return res.status(500).json({ status: 'error', message: 'Erro ao enviar o e-mail.' });
        }
        console.log('E-mail enviado:', info);
        res.status(200).json({ status: 'success', message: 'Pedido enviado com sucesso!' });
    });
});

// Iniciar o servidor apenas uma vez, usando a porta correta
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});