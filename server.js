const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// --- CONFIGURAÇÃO: Permitir JSON e Site ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname))); // Serve os arquivos do site (HTML, CSS)

// --- ID DA SUA PLANILHA ---
const SPREADSHEET_ID = '15TvWPyk3UOnk37XK1pIHjLaxA7zE9LYuDuFyibcCNCg'; 

// --- CARREGAMENTO DE CREDENCIAIS (Blindado) ---
let credenciais;
const caminhoLocal = './credenciais.json';
const caminhoRender = '/etc/secrets/credenciais.json';

console.log("--- INICIANDO SISTEMA ---");

if (fs.existsSync(caminhoRender)) {
    console.log("✅ Modo Nuvem (Render): Arquivo secreto encontrado.");
    credenciais = require(caminhoRender);
} else if (fs.existsSync(caminhoLocal)) {
    console.log("✅ Modo Local (PC): Arquivo local encontrado.");
    credenciais = require(caminhoLocal);
} else {
    console.error("❌ ERRO GRAVE: Nenhuma credencial encontrada!");
    console.error("Verifique se o arquivo 'credenciais.json' existe na pasta ou nos Secrets do Render.");
}

// --- FUNÇÕES DE CONEXÃO ---
async function getDoc() {
    if (!credenciais) throw new Error("Credenciais não carregadas no servidor.");
    
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

// ==========================================================
// ==================== SUAS ROTAS (API) ====================
// ==========================================================

// --- REGISTROS DIÁRIOS ---
app.get('/api/registros', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('REGISTROS');
        const rows = await sheet.getRows();
        const dataFiltro = req.query.data; 
        
        let registros = rows.map((row, index) => ({
            id: index, 
            data: row.get('Data'),
            procedimento: row.get('Procedimento'),
            paciente: row.get('Paciente'),
            valor: row.get('Valor'),
            pagamento: row.get('Pagamento'),
            tipo: row.get('Tipo'),
            statusRecibo: row.get('StatusRecibo') || 'Pendente'
        }));

        if (dataFiltro) registros = registros.filter(r => r.data === dataFiltro);
        registros.reverse(); 
        res.json(registros);
    } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.post('/api/registros', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('REGISTROS');
        await sheet.addRow({
            Data: req.body.data,
            Procedimento: req.body.procedimento,
            Paciente: req.body.paciente,
            Valor: req.body.valor,
            Pagamento: req.body.pagamento,
            Tipo: req.body.tipo,
            StatusRecibo: 'Pendente'
        });
        res.json({ message: "Registro salvo!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ROTA DE EDIÇÃO DE PACIENTE ---
app.put('/api/pacientes', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('PACIENTES');
        const rows = await sheet.getRows();
        
        // Procura a linha usando o NOME ANTIGO (antes da edição)
        const nomeOriginal = req.body.nomeOriginal; 
        const linha = rows.find(r => r.get('Nome') === nomeOriginal);

        if (linha) {
            // Atualiza todos os campos
            linha.set('Nome', req.body.nome);
            linha.set('DataNascimento', req.body.dataNascimento);
            linha.set('CPF', req.body.cpf);
            linha.set('CPFResponsavel', req.body.cpfResponsavel);
            linha.set('Telefone', req.body.telefone);
            linha.set('Endereco', req.body.endereco);
            
            await linha.save(); // Salva no Google Sheets
            res.json({ message: "Cadastro atualizado!" });
        } else {
            res.status(404).json({ error: "Paciente não encontrado para edição." });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.patch('/api/registros/status', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('REGISTROS');
        const rows = await sheet.getRows();
        const id = Number(req.body.id);
        if (rows[id]) {
            rows[id].set('StatusRecibo', req.body.novoStatus);
            await rows[id].save();
            res.json({ message: "Status atualizado!" });
        } else {
            res.status(404).json({ error: "Linha não encontrada." });
        }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/registros', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('REGISTROS');
        const rows = await sheet.getRows();
        const linha = rows.find(r => 
            r.get('Data') === req.body.data && 
            r.get('Paciente') === req.body.paciente &&
            r.get('Procedimento') === req.body.procedimento
        );
        if (linha) { await linha.delete(); res.json({ message: "Deletado!" }); }
        else { res.status(404).json({ error: "Não encontrado" }); }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PACIENTES ---
app.get('/api/pacientes', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('PACIENTES');
        const rows = await sheet.getRows();
        res.json(rows.map(row => ({
            nome: row.get('Nome'),
            dataNascimento: row.get('DataNascimento'),
            cpf: row.get('CPF'),
            cpfResponsavel: row.get('CPFResponsavel'),
            telefone: row.get('Telefone'),
            endereco: row.get('Endereco')
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/pacientes', async (req, res) => {
    try {
        const sheet = await acessarPlanilha('PACIENTES');
        const rows = await sheet.getRows();
        const novoNome = req.body.nome.trim();
        const novoCPF = req.body.cpf ? req.body.cpf.trim() : "";
        const pExiste = rows.find(r => 
            r.get('Nome').trim().toLowerCase() === novoNome.toLowerCase() || 
            (novoCPF && r.get('CPF') === novoCPF)
        );
        if(pExiste) return res.status(409).json({error: "Paciente já cadastrado."});
        await sheet.addRow({
            Nome: req.body.nome,
            DataNascimento: req.body.dataNascimento,
            CPF: req.body.cpf,
            CPFResponsavel: req.body.cpfResponsavel,
            Telefone: req.body.telefone,
            Endereco: req.body.endereco
        });
        res.json({ message: "Salvo" }); 
    } catch(e){ res.status(500).json({error: e.message}); }
});

app.delete('/api/pacientes', async (req, res) => {
    try { 
        const sheet = await acessarPlanilha('PACIENTES'); 
        const rows = await sheet.getRows();
        const linha = rows.find(r => r.get('Nome') === req.body.nome);
        if(linha){ await linha.delete(); res.json({message: "Deletado"}); } else res.status(404).json({error: "404"});
    } catch(e){ res.status(500).json({error: e.message}); }
});

// --- AGENDA ---
app.get('/api/agenda', async (req, res) => {
    try { const s = await acessarPlanilha('AGENDA'); const r = await s.getRows(); res.json(r.map(x => ({data: x.get('Data'), hora: x.get('Hora'), paciente: x.get('Paciente'), procedimento: x.get('Procedimento')}))); } catch(e){res.status(500).json({error: e.message});}
});
app.post('/api/agenda', async (req, res) => {
    try { const s = await acessarPlanilha('AGENDA'); await s.addRow({Data: req.body.data, Hora: req.body.hora, Paciente: req.body.paciente, Procedimento: req.body.procedimento, Status: 'confirmado'}); res.json({message:"ok"}); } catch(e){res.status(500).json({error:e.message});}
});
app.delete('/api/agenda', async (req, res) => {
    try { const s = await acessarPlanilha('AGENDA'); const r = await s.getRows(); const l = r.find(x => x.get('Data') === req.body.data && x.get('Hora') === req.body.hora); if(l) {await l.delete(); res.json({message:"ok"});} else res.status(404); } catch(e){res.status(500).json({error:e.message});}
});

// --- PREÇOS ---
app.get('/api/precos', async (req, res) => {
    try{ const s = await acessarPlanilha('PRECOS'); const r = await s.getRows(); res.json(r.map(x=>({procedimento:x.get('Procedimento'), valor:x.get('Valor')})));}catch(e){res.status(500).json({error:e.message});}
});
app.post('/api/precos', async (req, res) => {
    try{const s=await acessarPlanilha('PRECOS'); await s.addRow({Procedimento:req.body.procedimento, Valor:req.body.valor}); res.json({message:"ok"});}catch(e){res.status(500).json({error:e.message});}
});
app.delete('/api/precos', async (req, res) => {
    try{const s=await acessarPlanilha('PRECOS'); const r=await s.getRows(); const l=r.find(x=>x.get('Procedimento')===req.body.procedimento); if(l){await l.delete();res.json({message:"ok"});}else res.status(404);}catch(e){res.status(500).json({error:e.message});}
});

// --- NOTAS (Histórico - Opcional) ---
app.get('/api/notas', async (req, res) => {
    try { const sheet = await acessarPlanilha('NOTAS'); const rows = await sheet.getRows(); res.json(rows.map((r, i) => ({ id: i, data: r.get('Data'), paciente: r.get('Paciente'), cpf: r.get('CPF'), procedimento: r.get('Procedimento'), valor: r.get('Valor'), status: r.get('Status') }))); } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================================
// --- ROTA FINAL (CATCH-ALL) ---
// Qualquer rota não definida acima devolve o index.html (para o site funcionar)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});