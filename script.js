document.addEventListener('DOMContentLoaded', function() {
 
    const tituloMesAno = document.getElementById('titulo-mes-ano');
    const containerDosDias = document.getElementById('container-dos-dias');
    const botaoAnterior = document.getElementById('botao-anterior');
    const botaoProximo = document.getElementById('botao-proximo');


    let dataAtual = new Date();
    
    let dadosSalvos = JSON.parse(localStorage.getItem('calendarioDados')) || {};

    function gerarCalendario() {
        containerDosDias.innerHTML = '';

        const ano = dataAtual.getFullYear();
        const mes = dataAtual.getMonth(); 

        const mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        tituloMesAno.textContent = mesesDoAno[mes] + ' ' + ano;

        const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
        const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

        for (let i = 0; i < primeiroDiaDaSemana; i++) {
            const divVazia = document.createElement('div');
            divVazia.classList.add('dia-outro-mes');
            containerDosDias.appendChild(divVazia);
        }

        for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
            const divDia = document.createElement('div');
            divDia.textContent = dia;
            divDia.classList.add('dia');

            let mesCorrigido = mes + 1;
            let mesFormatado = String(mesCorrigido);
            if (mesCorrigido < 10) {
                mesFormatado = '0' + mesCorrigido;
            }
            
            let diaFormatado = String(dia);
            if (dia < 10) {
                diaFormatado = '0' + dia;
            }
           
            const chaveData = ano + '-' + mesFormatado + '-' + diaFormatado;

            const hoje = new Date();
            if (dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                divDia.classList.add('dia-de-hoje');
            }
         
            if (dadosSalvos[chaveData]) {
                const estadoSalvo = dadosSalvos[chaveData];
                divDia.classList.add(estadoSalvo);
            }

            divDia.addEventListener('click', function() {
                marcarDia(chaveData, divDia);
            });

            containerDosDias.appendChild(divDia);
        }
    }
    
    function marcarDia(chaveData, elementoDiv) {
        if (elementoDiv.classList.contains('dia-tomado')) {
            elementoDiv.classList.remove('dia-tomado');
            elementoDiv.classList.add('dia-pausa');
            dadosSalvos[chaveData] = 'dia-pausa';
        } else if (elementoDiv.classList.contains('dia-pausa')) {
            elementoDiv.classList.remove('dia-pausa');
            delete dadosSalvos[chaveData];
        } else {
            elementoDiv.classList.add('dia-tomado');
            dadosSalvos[chaveData] = 'dia-tomado';
        }

        salvarDados();
    }

    function salvarDados() {
        localStorage.setItem('calendarioDados', JSON.stringify(dadosSalvos));
    }

    botaoAnterior.addEventListener('click', function() {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        gerarCalendario();
    });

    botaoProximo.addEventListener('click', function() {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        gerarCalendario();
    });

    gerarCalendario();

});