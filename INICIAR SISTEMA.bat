@echo off
echo Iniciando o Sistema OdontoClinic...
echo Por favor, nao feche esta janela enquanto usar o sistema.

:: Entra na pasta onde este arquivo está salvo
cd /d "%~dp0"

:: Abre o navegador com o arquivo index.html (como se fosse dois cliques nele)
start index.html

:: Inicia o servidor backend
node server.js

pause