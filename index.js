// 1. Instale as dependências:
// npm install whatsapp-web.js node-cron qrcode-terminal

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const client = new Client({
    authStrategy: new LocalAuth(), // salva a sessão localmente
    puppeteer: { headless: true }
});

// Mostra o QR Code para conectar na primeira vez
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code com seu WhatsApp!');
});

client.on('ready', () => {
    console.log('✅ Bot conectado!');

    // Agende o horário desejado: minuto hora * * *
    // Exemplo abaixo: todos os dias às 08:00 (horário de Brasília = UTC-3)
    cron.schedule('*/5 * * * *', async () => {
        await enviarMensagemGrupo();
    }, {
        timezone: "America/Sao_Paulo"
    });
});

async function enviarMensagemGrupo() {
    try {
        const chats = await client.getChats();

        // Filtra pelo nome exato do grupo
        const grupo = chats.find(chat => 
            chat.isGroup && chat.name === 'Teste'
        );

        if (!grupo) {
            console.log('❌ Grupo não encontrado!');
            return;
        }

        const mensagem = `Bom dia! 🌅\nMensagem automática de ${new Date().toLocaleDateString('pt-BR')}`;
        
        await grupo.sendMessage(mensagem);
        console.log(`✅ Mensagem enviada às ${new Date().toLocaleTimeString('pt-BR')}`);

    } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
    }
}

client.initialize();