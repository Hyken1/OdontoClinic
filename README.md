🦷 OdontoClinic - Sistema de Gestão Odontológica

Um sistema completo de gestão para clínicas odontológicas focado em usabilidade, controle financeiro automatizado e organização de agenda. Desenvolvido para digitalizar processos manuais de um consultório real, otimizando o fluxo de trabalho da recepção e a administração financeira.


O Problema: O consultório precisava de uma transição do controle em papel/planilhas para um sistema web integrado que gerenciasse desde o agendamento de pacientes até o cálculo complexo de comissões semanais para dentistas parceiros.
A Solução: Uma aplicação web full-stack ágil, com interface amigável (Glassmorphism), banco de dados em nuvem e relatórios automatizados que economizam horas de fechamento de caixa.

Funcionalidades Principais
📅 Agenda Multi-Profissional Inteligente:

Gestão de horários com suporte a múltiplos dentistas.

Sistema de "Encaixe" manual para flexibilidade de horários fora do padrão.

Validação para evitar choques de horários.

Módulo Financeiro e Livro Caixa:

Lançamento de pagamentos diários sincronizados com a tabela de procedimentos da clínica.

Emissão de recibos filtrada automaticamente (ignora procedimentos de R$ 0,00 como avaliações gratuitas).

📊 Dashboard e Relatórios (Business Intelligence):

Divisão automática de comissões parametrizada (Ex: 60% Clínica / 40% Dentista Parceiro).

Filtros dinâmicos por mês e por semanas exatas do mês, facilitando o repasse semanal de pagamentos.

Gráficos interativos de faturamento por profissional.

👥 Gestão de Pacientes e Retorno:

Prontuário digital e histórico clínico de atendimentos.

Máscaras de formatação automática (CPF e Telefone) e capitalização inteligente de nomes (UX/UI).

Alerta Automático de Manutenção: Identifica pacientes sem retorno há mais de 30 dias e gera um link direto para o WhatsApp Web com uma mensagem de cobrança pré-configurada.

🛠️ Tecnologias Utilizadas
Front-end:

HTML5, CSS3 & JavaScript (Vanilla): Sem dependência exagerada de frameworks pesados, focando em performance.

Bootstrap 5: Para responsividade e estrutura de grids.

Chart.js: Para a renderização gráfica de dados financeiros.

UI/UX: Design focado em Glassmorphism (efeito de vidro) com paleta de cores terrosas adaptada à identidade visual da clínica.

Back-end & Infraestrutura:

Node.js & Express: Servidor robusto para roteamento da API RESTful.

Google Sheets API: Utilização criativa do Google Sheets como Banco de Dados relacional, permitindo backup fácil e acesso direto aos dados crus, se necessário.

google-auth-library: Autenticação segura via Service Accounts.

Lógica de Repasses (60/40): O sistema identifica programaticamente a proprietária da clínica e os dentistas parceiros. Com base no nome inserido, ele calcula em tempo real o lucro da clínica e o pagamento devido ao parceiro, entregando o valor "mastigado" no front-end.

Filtro Semanal Dinâmico: Para gerar relatórios, o JavaScript calcula dinamicamente os dias úteis/semanas de um determinado mês selecionado, filtrando o array de dados do banco para fechar folhas de pagamento semanais precisas.

Data Cleaning Front-end: Implementação de regras de formatação (Regex para telefones e CPFs) e padronização (Title Case) diretamente no evento onblur dos inputs, garantindo a integridade dos dados antes de chegarem ao banco.

------------------------------------------------------------------------------------------------------------------------------------------

💻 Como Rodar o Projeto Localmente
Clone o repositório:

Bash
git clone https://github.com/SeuUsuario/odontoclinic.git
Instale as dependências:

Bash
npm install
Configure as credenciais:

Crie um arquivo credenciais.json na raiz do projeto contendo as chaves da conta de serviço do Google Cloud.

Adicione o ID da planilha no arquivo server.js.

Inicie o servidor:

Bash
npm start
Acesse no navegador: http://localhost:3000

------------------------------------------------------------------------------------------------------------------------------------------
👨‍💻 Sobre o Desenvolvedor
Projeto desenvolvido com o objetivo de aplicar conhecimentos acadêmicos em engenharia de software e desenvolvimento web na resolução de um problema real de gestão e logística de um consultório odontológico.

Contato: mauriciols1@outlook.com

------------------------------------------------------------------------------------------------------------------------------------------

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
*Desenvolvido com dedicação para otimizar o tempo de quem cuida de sorrisos.*
