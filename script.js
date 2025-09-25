document.addEventListener('DOMContentLoaded', function() {
 
    // --- SELEÇÃO DE ELEMENTOS ---
    const tituloMesAno = document.getElementById('titulo-mes-ano');
    const containerDosDias = document.getElementById('container-dos-dias');
    const botaoAnterior = document.getElementById('botao-anterior');
    const botaoProximo = document.getElementById('botao-proximo');
    const botaoHoje = document.getElementById('botao-hoje');
    const themeToggleButton = document.getElementById('theme-toggle');
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const statusButtons = document.querySelectorAll('.status-btn');
    const seletorDataForm = document.getElementById('seletor-data-form');
    const seletorMes = document.getElementById('seletor-mes');
    const seletorAno = document.getElementById('seletor-ano');
    const irParaDataBtn = document.getElementById('ir-para-data-btn');
    const statTomadas = document.getElementById('stat-tomadas');
    const statPausa = document.getElementById('stat-pausa');
    const statAnotacoes = document.getElementById('stat-anotacoes');

    // --- VARIÁVEIS DE ESTADO ---
    let dataAtual = new Date();
    let dadosSalvos = JSON.parse(localStorage.getItem('calendarioDados')) || {};
    let currentlyEditingKey = null;

    // --- FUNÇÕES ---
    function gerarCalendario() {
        containerDosDias.innerHTML = '';
        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth();

        const mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        tituloMesAno.textContent = mesesDoAno[mes] + ' ' + ano;

        const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

        const previsao = calcularCicloEPrever(); // Chama a função de previsão

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
                if (dayData.periodo) {
                    divDia.classList.add('dia-periodo');
                } else if (dayData.pilula) {
                    divDia.classList.add(dayData.pilula);
                }
                if (dayData.note) {
                    divDia.classList.add('dia-com-anotacao');
                }
            }
            
            if (previsao.proximoCiclo.includes(chaveData)) {
                divDia.classList.add('dia-previsao');
            }

            divDia.addEventListener('click', function() {
                openModalForDay(chaveData);
            });
            containerDosDias.appendChild(divDia);
        }
        atualizarEstatisticas();
    }
    
    function openModalForDay(chaveData) {
        currentlyEditingKey = chaveData;
        const dayData = dadosSalvos[chaveData] || {};
        const [ano, mes, dia] = chaveData.split('-');
        modalTitle.textContent = "Anotação para " + dia + "/" + mes + "/" + ano;
        noteInput.value = dayData.note || '';
        
        statusButtons.forEach(function(btn){
            btn.classList.remove('active');
        });

        if (dayData.pilula) {
            document.querySelector(`.status-btn[data-status="${dayData.pilula}"]`).classList.add('active');
        }
        if (dayData.periodo) {
            document.querySelector('.status-btn[data-status="dia-periodo"]').classList.add('active');
        }
        
        modalContainer.classList.add('visible');
    }

    function closeModal() {
        modalContainer.classList.remove('visible');
        currentlyEditingKey = null;
    }

    function handleSaveNote() {
        const note = noteInput.value.trim();
        let pilulaStatus = null;
        let periodoStatus = false;

        statusButtons.forEach(function(btn) {
            if (btn.classList.contains('active')) {
                const status = btn.dataset.status;
                if (status === 'dia-periodo') {
                    periodoStatus = true;
                } else if (status !== 'none' && status !== 'dia-periodo') {
                    pilulaStatus = status;
                }
            }
        });

        if (!pilulaStatus && !periodoStatus && !note) {
            delete dadosSalvos[currentlyEditingKey];
        } else {
            dadosSalvos[currentlyEditingKey] = {
                pilula: pilulaStatus,
                periodo: periodoStatus,
                note: note
            };
        }
        salvarDados();
        gerarCalendario();
        closeModal();
    }

    function salvarDados() {
        localStorage.setItem('calendarioDados', JSON.stringify(dadosSalvos));
    }

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

    function alternarVisualizacaoSeletor() {
        tituloMesAno.classList.toggle('escondido');
        seletorDataForm.classList.toggle('escondido');
    }

    function irParaData() {
        const novoMes = parseInt(seletorMes.value);
        const novoAno = parseInt(seletorAno.value);
        dataAtual = new Date(novoAno, novoMes, 1);
        gerarCalendario();
        alternarVisualizacaoSeletor();
    }
    
    function atualizarEstatisticas() {
        const anoAtual = dataAtual.getFullYear();
        const mesAtual = dataAtual.getMonth() + 1;
        let contagemTomadas = 0;
        let contagemPausa = 0;
        let contagemAnotacoes = 0;
        for (const chave in dadosSalvos) {
            const [ano, mes] = chave.split('-');
            if (parseInt(ano) === anoAtual && parseInt(mes) === mesAtual) {
                const dayData = dadosSalvos[chave];
                if (dayData.pilula === 'dia-tomado') { // ATUALIZADO
                    contagemTomadas++;
                }
                if (dayData.pilula === 'dia-pausa') { // ATUALIZADO
                    contagemPausa++;
                }
                if (dayData.note) {
                    contagemAnotacoes++;
                }
            }
        }
        statTomadas.textContent = contagemTomadas;
        statPausa.textContent = contagemPausa;
        statAnotacoes.textContent = contagemAnotacoes;
    }

    function calcularCicloEPrever() {
        const iniciosDeCiclo = [];
        const todasAsChaves = Object.keys(dadosSalvos).sort();
        
        todasAsChaves.forEach(chave => {
            if (dadosSalvos[chave].periodo) {
                const data = new Date(chave + 'T12:00:00');
                const diaAnterior = new Date(data);
                diaAnterior.setDate(data.getDate() - 1);
                const chaveAnterior = `${diaAnterior.getFullYear()}-${String(diaAnterior.getMonth() + 1).padStart(2, '0')}-${String(diaAnterior.getDate()).padStart(2, '0')}`;
                if (!dadosSalvos[chaveAnterior] || !dadosSalvos[chaveAnterior].periodo) {
                    iniciosDeCiclo.push(chave);
                }
            }
        });

        let duracaoMedia = 28;
        if (iniciosDeCiclo.length >= 2) {
            let somaDiferencas = 0;
            for (let i = 1; i < iniciosDeCiclo.length; i++) {
                const dataFim = new Date(iniciosDeCiclo[i] + 'T12:00:00');
                const dataInicio = new Date(iniciosDeCiclo[i - 1] + 'T12:00:00');
                const diferencaEmMs = dataFim - dataInicio;
                const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));
                somaDiferencas += diferencaEmDias;
            }
            duracaoMedia = Math.round(somaDiferencas / (iniciosDeCiclo.length - 1));
        }
        
        const previsao = { duracaoMedia: duracaoMedia, proximoCiclo: [] };

        if (iniciosDeCiclo.length > 0) {
            const ultimoInicio = new Date(iniciosDeCiclo[iniciosDeCiclo.length - 1] + 'T12:00:00');
            const proximoInicio = new Date(ultimoInicio);
            proximoInicio.setDate(ultimoInicio.getDate() + duracaoMedia);

            for (let i = 0; i < 5; i++) {
                const diaPrevisto = new Date(proximoInicio);
                diaPrevisto.setDate(proximoInicio.getDate() + i);
                const chavePrevista = `${diaPrevisto.getFullYear()}-${String(diaPrevisto.getMonth() + 1).padStart(2, '0')}-${String(diaPrevisto.getDate()).padStart(2, '0')}`;
                previsao.proximoCiclo.push(chavePrevista);
            }
        }
        return previsao;
    }

    // --- EVENT LISTENERS ---
    botaoAnterior.addEventListener('click', function() { dataAtual.setMonth(dataAtual.getMonth() - 1); gerarCalendario(); });
    botaoProximo.addEventListener('click', function() { dataAtual.setMonth(dataAtual.getMonth() + 1); gerarCalendario(); });
    botaoHoje.addEventListener('click', function() { dataAtual = new Date(); gerarCalendario(); });
    themeToggleButton.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        themeToggleButton.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
    saveNoteBtn.addEventListener('click', handleSaveNote);
    cancelBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', function(evento) { if (evento.target === modalContainer) { closeModal(); } });
    
    statusButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            const status = btn.dataset.status;
            if (status === 'dia-tomado' || status === 'dia-pausa') {
                const outroStatus = status === 'dia-tomado' ? 'dia-pausa' : 'dia-tomado';
                document.querySelector(`.status-btn[data-status="${outroStatus}"]`).classList.remove('active');
            }
            btn.classList.toggle('active');
        });
    });

    tituloMesAno.addEventListener('click', function() {
        seletorMes.value = dataAtual.getMonth();
        seletorAno.value = dataAtual.getFullYear();
        alternarVisualizacaoSeletor();
    });
    irParaDataBtn.addEventListener('click', irParaData);

    // --- INICIALIZAÇÃO ---
    popularSeletores();
    gerarCalendario();
});