document.addEventListener('DOMContentLoaded', function() {
 
    // Elementos do Calendário
    const tituloMesAno = document.getElementById('titulo-mes-ano');
    const containerDosDias = document.getElementById('container-dos-dias');
    const botaoAnterior = document.getElementById('botao-anterior');
    const botaoProximo = document.getElementById('botao-proximo');
    const botaoHoje = document.getElementById('botao-hoje');
    const themeToggleButton = document.getElementById('theme-toggle');
    
    // Elementos do Modal (a caixinha de anotações)
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const statusButtons = document.querySelectorAll('.status-btn');

    // Elementos para a Seleção Rápida de Data
    const seletorDataForm = document.getElementById('seletor-data-form');
    const seletorMes = document.getElementById('seletor-mes');
    const seletorAno = document.getElementById('seletor-ano');
    const irParaDataBtn = document.getElementById('ir-para-data-btn');


    // --- VARIÁVEIS DE ESTADO ---
    let dataAtual = new Date();
    let dadosSalvos = JSON.parse(localStorage.getItem('calendarioDados')) || {};
    let currentlyEditingKey = null;


    // --- FUNÇÕES DO CALENDÁRIO E MODAL ---
    // Esta função desenha o calendário na tela. É a função mais importante.
    function gerarCalendario() {
        containerDosDias.innerHTML = '';
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        const mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        tituloMesAno.textContent = mesesDoAno[mes] + ' ' + ano;

        const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

        for (let i = 0; i < primeiroDiaDaSemana; i++) {
            containerDosDias.appendChild(document.createElement('div'));
        }

        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const divDia = document.createElement('div');
            divDia.textContent = dia;
            divDia.classList.add('dia');
            const chaveData = ano + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
            divDia.dataset.chave = chaveData; 
            const hoje = new Date();
            if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                divDia.classList.add('dia-de-hoje');
            }
            const dayData = dadosSalvos[chaveData];
            if (dayData) {
                if (dayData.state) {
                    divDia.classList.add(dayData.state);
                }
                if (dayData.note) {
                    divDia.classList.add('dia-com-anotacao');
                }
            }
            divDia.addEventListener('click', function() {
                openModalForDay(chaveData);
            });
            containerDosDias.appendChild(divDia);
        }
    }
    
    // Função para ABRIR o modal e preencher com as informações do dia clicado
    function openModalForDay(chaveData) {
        currentlyEditingKey = chaveData;
        const dayData = dadosSalvos[chaveData] || {};
        const [ano, mes, dia] = chaveData.split('-');
        modalTitle.textContent = "Anotação para " + dia + "/" + mes + "/" + ano;
        noteInput.value = dayData.note || '';
        for (let i = 0; i < statusButtons.length; i++) {
            const btn = statusButtons[i];
            btn.classList.remove('active');
            if (btn.dataset.status === dayData.state) {
                btn.classList.add('active');
            }
        }
        modalContainer.classList.add('visible');
    }

    // Função para FECHAR o modal
    function closeModal() {
        modalContainer.classList.remove('visible');
        currentlyEditingKey = null;
    }

    // Função para SALVAR as informações do modal
    function handleSaveNote() {
        const activeStatusBtn = document.querySelector('.status-btn.active');
        let state = 'none';
        if (activeStatusBtn) {
            state = activeStatusBtn.dataset.status;
        }
        const note = noteInput.value.trim();
        if (state === 'none' && !note) {
            delete dadosSalvos[currentlyEditingKey];
        } else {
            dadosSalvos[currentlyEditingKey] = {
                state: state !== 'none' ? state : null,
                note: note
            };
        }
        salvarDados();
        gerarCalendario();
        closeModal();
    }

    // Função para salvar no localStorage
    function salvarDados() {
        localStorage.setItem('calendarioDados', JSON.stringify(dadosSalvos));
    }

    // --- NOVO: FUNÇÕES PARA O SELETOR DE DATA ---

    // 1. Função para popular os menus <select> com meses e anos
    function popularSeletores() {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        seletorMes.innerHTML = '';
        for (let i = 0; i < meses.length; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = meses[i];
            seletorMes.appendChild(option);
        }
        const anoAtual = new Date().getFullYear();
        seletorAno.innerHTML = '';
        for (let i = anoAtual - 10; i <= anoAtual + 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            seletorAno.appendChild(option);
        }
    }

    // 2. Função para mostrar ou esconder o formulário de seleção
    function alternarVisualizacaoSeletor() {
        tituloMesAno.classList.toggle('escondido');
        seletorDataForm.classList.toggle('escondido');
    }

    // 3. Função para atualizar o calendário com a data escolhida
    function irParaData() {
        const novoMes = parseInt(seletorMes.value);
        const novoAno = parseInt(seletorAno.value);
        dataAtual = new Date(novoAno, novoMes, 1);
        gerarCalendario();
        alternarVisualizacaoSeletor(); // Esconde os seletores e mostra o título novamente
    }

    // Aqui dizemos o que fazer quando cada botão é clicado.

    botaoAnterior.addEventListener('click', function() {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        gerarCalendario();
    });

    botaoProximo.addEventListener('click', function() {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        gerarCalendario();
    });

    botaoHoje.addEventListener('click', function() {
        dataAtual = new Date();
        gerarCalendario();
    });
    
    themeToggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggleButton.innerHTML = '☀️';
        } else {
            themeToggleButton.innerHTML = '🌙';
        }
    });

    // Eventos dos botões do modal
    saveNoteBtn.addEventListener('click', handleSaveNote);
    cancelBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', function(evento) {
        if (evento.target === modalContainer) {
            closeModal();
        }
    });
    
    for (let i = 0; i < statusButtons.length; i++) {
        const btn = statusButtons[i];
        btn.addEventListener('click', function() {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                return;
            }
            for (let j = 0; j < statusButtons.length; j++) {
                statusButtons[j].classList.remove('active');
            }
            btn.classList.add('active');
        });
    }

    // NOVO: Event Listeners para o seletor de data
    tituloMesAno.addEventListener('click', function() {
        seletorMes.value = dataAtual.getMonth();
        seletorAno.value = dataAtual.getFullYear();
        alternarVisualizacaoSeletor();
    });
    irParaDataBtn.addEventListener('click', irParaData);


    popularSeletores();
    gerarCalendario();
});