const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const credenciais = require('./credenciais.json');
const cors = require('cors');
const path = require('path'); // Novo módulo

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO PARA SERVIR O SITE (FRONTEND) ---
// O servidor agora entrega os arquivos HTML, CSS e imagens
app.use(express.static(path.join(__dirname)));

// --- ID DA PLANILHA ---
const SPREADSHEET_ID = '15TvWPyk3UOnk37XK1pIHjLaxA7zE9LYuDuFyibcCNCg'; 

async function getDoc() {
    const serviceAccountAuth = new JWT({
        email: credenciais.client_email,
        key: credenciais.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

async function acessarPlanilha(nomeAba) {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[nomeAba] || doc.sheetsByTitle[nomeAba.toUpperCase()];
    if (!sheet) throw new Error(`Aba '${nomeAba}' não encontrada.`);
    return sheet;
}

// ================= ROTAS DA API (MANTIDAS IGUAIS) =================
// (Vou resumir as rotas aqui para economizar espaço, mas MANTENHA AS SUAS ROTAS ANTIGAS AQUI)
// ... COPIE E COLE TODAS AS SUAS ROTAS (app.get, app.post...) AQUI ...
// ... DO 'app.get('/api/registros'...' ATÉ O FINAL DAS ROTAS ...

// EXEMPLO RÁPIDO SÓ PRA LEMBRAR ONDE COLOCAR:
app.get('/api/registros', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('REGISTROS');
        const rows = await sheet.getRows();
        // ... sua lógica normal ...
        const dataFiltro = req.query.data; 
        let registros = rows.map((row, index) => ({
            id: index, data: row.get('Data'), procedimento: row.get('Procedimento'), paciente: row.get('Paciente'), valor: row.get('Valor'), pagamento: row.get('Pagamento'), tipo: row.get('Tipo'), statusRecibo: row.get('StatusRecibo') || 'Pendente'
        }));
        if (dataFiltro) registros = registros.filter(r => r.data === dataFiltro);
        registros.reverse(); 
        res.json(registros);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
// ... REPITA PARA TODAS AS OUTRAS ROTAS (pacientes, agenda, status, etc) ...
// ... SE TIVER DÚVIDA, USE O CÓDIGO DO PASSO ANTERIOR, SÓ MUDE O INÍCIO E O FIM ...


// ================= FIM DAS ROTAS DA API =================

// ROTA PARA ENTREGAR O SITE SE NÃO ACHAR API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- INICIAR SERVIDOR (PORTA DINÂMICA) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}...`);
});