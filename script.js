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

    // Aqui guardamos os dados que mudam com o tempo.

    let dataAtual = new Date();
    let dadosSalvos = JSON.parse(localStorage.getItem('calendarioDados')) || {};
    let currentlyEditingKey = null;


    // Esta função desenha o calendário na tela. É a função mais importante.
    function gerarCalendario() {
        containerDosDias.innerHTML = '';
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        const mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        tituloMesAno.textContent = mesesDoAno[mes] + ' ' + ano;

        const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

        // Cria os espaços vazios no início do mês
        for (let i = 0; i < primeiroDiaDaSemana; i++) {
            containerDosDias.appendChild(document.createElement('div'));
        }

        // Cria um por um os dias do mês
        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const divDia = document.createElement('div');
            divDia.textContent = dia;
            divDia.classList.add('dia');

            const chaveData = ano + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
            divDia.dataset.chave = chaveData; 

            // Verifica se é o dia de hoje
            const hoje = new Date();
            if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                divDia.classList.add('dia-de-hoje');
            }
        
            // Pega os dados salvos para este dia específico
            const dayData = dadosSalvos[chaveData];
            if (dayData) {
                // Se houver um estado (tomado/pausa), adiciona a classe de cor
                if (dayData.state) {
                    divDia.classList.add(dayData.state);
                }
                // Se houver uma anotação, adiciona a classe do pontinho
                if (dayData.note) {
                    divDia.classList.add('dia-com-anotacao');
                }
            }

            // Adiciona o evento de clique em cada dia para ABRIR o modal
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

        // Atualiza o título do modal
        const [ano, mes, dia] = chaveData.split('-');
        modalTitle.textContent = "Anotação para " + dia + "/" + mes + "/" + ano;

        // Preenche a área de texto com a anotação salva
        noteInput.value = dayData.note || '';
        
        // Marca o botão de status correto (Pílula, Pausa ou Nenhum)
        for (let i = 0; i < statusButtons.length; i++) {
            const btn = statusButtons[i];
            btn.classList.remove('active');
            if (btn.dataset.status === dayData.state) {
                btn.classList.add('active');
            }
        }
        
        // Torna o modal visível
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

        // Se o usuário limpou tudo (sem estado e sem nota), apagamos o registro do dia
        if (state === 'none' && !note) {
            delete dadosSalvos[currentlyEditingKey];
        } else {
            // Caso contrário, salvamos o estado e a nota
            dadosSalvos[currentlyEditingKey] = {
                state: state !== 'none' ? state : null,
                note: note
            };
        }

        salvarDados(); // Salva no localStorage
        gerarCalendario(); // Redesenha o calendário para mostrar as mudanças
        closeModal(); // Fecha o modal
    }

    // Função para salvar no localStorage
    function salvarDados() {
        localStorage.setItem('calendarioDados', JSON.stringify(dadosSalvos));
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
            closeModal(); // Fecha o modal se o clique for no fundo escuro
        }
    });
    
    // Evento para os botões de status (Pílula, Pausa, Nenhum)
    for (let i = 0; i < statusButtons.length; i++) {
        const btn = statusButtons[i];
        btn.addEventListener('click', function() {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                return;
            }
            // Tira a classe 'active' de todos os outros botões
            for (let j = 0; j < statusButtons.length; j++) {
                statusButtons[j].classList.remove('active');
            }
            // Adiciona a classe 'active' apenas no botão que foi clicado
            btn.classList.add('active');
        });
    }


    gerarCalendario(); // Chama a função principal para desenhar o calendário pela primeira vez.
});