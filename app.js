/* ============================================================
   ELETRICISTA PRO - NBR 5410  |  Versao 7.0
   Motor de calculo para dimensionamento eletrico
   ============================================================ */

// ===== CONSTANTES NBR 5410 =====

var CONDUTORES = [
  { secao: 1.5,  capacidade: 17.5 },
  { secao: 2.5,  capacidade: 24 },
  { secao: 4,    capacidade: 32 },
  { secao: 6,    capacidade: 41 },
  { secao: 10,   capacidade: 57 },
  { secao: 16,   capacidade: 76 },
  { secao: 25,   capacidade: 101 },
  { secao: 35,   capacidade: 125 },
  { secao: 50,   capacidade: 151 },
  { secao: 70,   capacidade: 192 },
  { secao: 95,   capacidade: 233 },
  { secao: 120,  capacidade: 269 }
];

var FCA = 0.80;
var RESISTIVIDADE_COBRE = 0.0229;
var QUEDA_MAX = 4;
var DISJUNTORES_COMERCIAIS = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125];
var SECAO_MIN_ILUMINACAO = 1.5;
var SECAO_MIN_FORCA = 2.5;

// ===== ESTADO =====
var state = {
  trocaCabo: { potencia: null, tensao: 220, fp: 1.0, distancia: 10 },
  disjuntor: { potencia: null, tensao: 220, disjuntorAtual: 32 },
  projeto: { tipo: 'mono', tensao: 220, circuitos: [], resultado: null },
  ultimoResultado: '',
  deferredPrompt: null
};

// ===== PERSISTENCIA LOCAL (localStorage) =====

function salvarProjetoLocal(nome, dados) {
  try {
    var projetos = carregarProjetosSalvos();
    projetos[nome] = {
      dados: dados,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR')
    };
    localStorage.setItem('eletricista_projetos', JSON.stringify(projetos));
    return true;
  } catch (e) {
    console.error('Erro ao salvar projeto:', e);
    return false;
  }
}

function carregarProjetosSalvos() {
  try {
    var dados = localStorage.getItem('eletricista_projetos');
    return dados ? JSON.parse(dados) : {};
  } catch (e) {
    return {};
  }
}

function carregarProjetoLocal(nome) {
  var projetos = carregarProjetosSalvos();
  return projetos[nome] || null;
}

function deletarProjetoLocal(nome) {
  var projetos = carregarProjetosSalvos();
  delete projetos[nome];
  localStorage.setItem('eletricista_projetos', JSON.stringify(projetos));
}

function salvarUltimoCalculo(tipo, dados) {
  try {
    localStorage.setItem('eletricista_ultimo_' + tipo, JSON.stringify(dados));
  } catch (e) {
    console.error('Erro ao salvar calculo:', e);
  }
}

function carregarUltimoCalculo(tipo) {
  try {
    var dados = localStorage.getItem('eletricista_ultimo_' + tipo);
    return dados ? JSON.parse(dados) : null;
  } catch (e) {
    return null;
  }
}

// ===== NAVEGACAO =====
function navigateTo(screenId) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }
  window.scrollTo(0, 0);
}

function showCalcTool(toolId) {
  navigateTo(toolId);
}

// ===== SELETORES =====
function selectQuickPower(btn, tool) {
  var parent = btn.closest('.tool-content');
  var btns = parent.querySelectorAll('.btn-quick');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('selected');
  btn.classList.add('selected');
  var value = parseInt(btn.dataset.value);
  if (tool === 'troca-cabo') {
    state.trocaCabo.potencia = value;
    document.getElementById('tc-potencia').value = value;
  } else {
    state.disjuntor.potencia = value;
    document.getElementById('dj-potencia').value = value;
  }
}

function selectVoltage(btn, tool) {
  var parent = btn.closest('.toggle-group');
  var btns = parent.querySelectorAll('.btn-toggle');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  var value = parseInt(btn.dataset.value);
  if (tool === 'troca-cabo') {
    state.trocaCabo.tensao = value;
  } else {
    state.disjuntor.tensao = value;
  }
}

function selectFP(btn) {
  var parent = btn.closest('.toggle-group');
  var btns = parent.querySelectorAll('.btn-toggle');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  state.trocaCabo.fp = parseFloat(btn.dataset.value);
}

function selectDisjuntor(btn) {
  var parent = btn.closest('.toggle-group');
  var btns = parent.querySelectorAll('.btn-toggle');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  state.disjuntor.disjuntorAtual = parseInt(btn.dataset.value);
}

// ===== MOTOR DE CALCULO =====

function calcularCorrente(potencia, tensao, tipo, fp) {
  if (!fp) fp = 1.0;
  if (tipo === 'tri') {
    return potencia / (Math.sqrt(3) * tensao * fp);
  }
  return potencia / (tensao * fp);
}

function encontrarSecaoPorCorrente(corrente, fca, secaoMinima) {
  if (!fca) fca = FCA;
  if (!secaoMinima) secaoMinima = 0;
  var correnteCorrigida = corrente / fca;
  for (var i = 0; i < CONDUTORES.length; i++) {
    if (CONDUTORES[i].capacidade >= correnteCorrigida && CONDUTORES[i].secao >= secaoMinima) {
      return CONDUTORES[i].secao;
    }
  }
  return 120;
}

function calcularQuedaTensao(corrente, distancia, secao, tensao) {
  var resistencia = (RESISTIVIDADE_COBRE * distancia) / secao;
  var quedaV = corrente * resistencia * 2;
  return (quedaV / tensao) * 100;
}

function encontrarSecaoPorQueda(corrente, distancia, tensao) {
  var vquedaMax = (QUEDA_MAX / 100) * tensao;
  var secaoNecessaria = (2 * RESISTIVIDADE_COBRE * distancia * corrente) / vquedaMax;
  for (var i = 0; i < CONDUTORES.length; i++) {
    if (CONDUTORES[i].secao >= secaoNecessaria) {
      return CONDUTORES[i].secao;
    }
  }
  return 120;
}

function selecionarDisjuntor(corrente) {
  for (var i = 0; i < DISJUNTORES_COMERCIAIS.length; i++) {
    if (DISJUNTORES_COMERCIAIS[i] >= corrente) {
      return DISJUNTORES_COMERCIAIS[i];
    }
  }
  return DISJUNTORES_COMERCIAIS[DISJUNTORES_COMERCIAIS.length - 1];
}

function capacidadeCorrigida(secao, fca) {
  if (!fca) fca = FCA;
  for (var i = 0; i < CONDUTORES.length; i++) {
    if (CONDUTORES[i].secao === secao) {
      return CONDUTORES[i].capacidade * fca;
    }
  }
  return 0;
}

function dimensionarCircuito(params) {
  var nome = params.nome;
  var potencia = params.potencia;
  var tensao = params.tensao;
  var tipo = params.tipo || 'mono';
  var distancia = params.distancia;
  var fp = params.fp || 1.0;
  var tipoCircuito = params.tipoCircuito || 'forca';

  var ib = calcularCorrente(potencia, tensao, tipo, fp);
  var secaoMin = tipoCircuito === 'iluminacao' ? SECAO_MIN_ILUMINACAO : SECAO_MIN_FORCA;
  var secaoCorrente = encontrarSecaoPorCorrente(ib, FCA, secaoMin);
  var secaoQueda = encontrarSecaoPorQueda(ib, distancia, tensao);
  var secaoFinal = Math.max(secaoCorrente, secaoQueda);

  if (secaoFinal < secaoMin) {
    secaoFinal = secaoMin;
  }

  var iz = capacidadeCorrigida(secaoFinal, FCA);
  var disjuntor = selecionarDisjuntor(ib);

  if (disjuntor > iz) {
    var secaoAjustada = encontrarSecaoPorCorrente(disjuntor, FCA, secaoMin);
    if (secaoAjustada > secaoFinal) {
      secaoFinal = secaoAjustada;
      iz = capacidadeCorrigida(secaoFinal, FCA);
    }
  }

  var quedaReal = calcularQuedaTensao(ib, distancia, secaoFinal, tensao);
  var curva = 'B';
  if (fp < 1.0) curva = 'C';

  var criterio = secaoQueda > secaoCorrente ? 'queda de tensao' : 'capacidade de conducao';

  return {
    nome: nome,
    potencia: potencia,
    tensao: tensao,
    tipo: tipo,
    distancia: distancia,
    fp: fp,
    ib: ib.toFixed(2),
    secao: secaoFinal,
    disjuntor: disjuntor,
    curva: curva,
    iz: iz.toFixed(1),
    queda: quedaReal.toFixed(2),
    secaoMinima: secaoMin,
    criterio: criterio
  };
}

// ===== CALCULADORA RAPIDA: TROCA DE CABO =====

function calcularTrocaCabo() {
  var potenciaInput = document.getElementById('tc-potencia').value;
  var distanciaInput = document.getElementById('tc-distancia').value;

  var potencia = parseFloat(potenciaInput) || state.trocaCabo.potencia;
  var distancia = parseFloat(distanciaInput) || 10;
  var tensao = state.trocaCabo.tensao;
  var fp = state.trocaCabo.fp;

  if (!potencia || potencia <= 0) {
    alert('Informe a potencia do equipamento em Watts.');
    return;
  }

  if (potencia > 100000) {
    alert('Potencia muito alta. Verifique o valor informado.');
    return;
  }

  var ib = calcularCorrente(potencia, tensao, 'mono', fp);
  var secaoCorrente = encontrarSecaoPorCorrente(ib, FCA, SECAO_MIN_FORCA);
  var secaoQueda = encontrarSecaoPorQueda(ib, distancia, tensao);
  var secaoFinal = Math.max(secaoCorrente, secaoQueda);
  if (secaoFinal < SECAO_MIN_FORCA) secaoFinal = SECAO_MIN_FORCA;

  var quedaReal = calcularQuedaTensao(ib, distancia, secaoFinal, tensao);
  var disjuntor = selecionarDisjuntor(ib);
  var iz = capacidadeCorrigida(secaoFinal, FCA);

  var diagnostico = '';
  if (ib > 32) {
    diagnostico = 'A fiação antiga provavelmente queimou porque a corrente de ' + ib.toFixed(1) + 'A é superior à capacidade de um cabo de 4mm² (32A). Cabos superaquecidos degradam o isolamento e podem causar curto-circuito.';
  } else if (ib > 24) {
    diagnostico = 'A corrente de ' + ib.toFixed(1) + 'A excede o limite de um cabo de 2,5mm² (24A). Isso causa aquecimento excessivo e queima do isolamento ao longo do tempo.';
  } else if (ib > 17.5) {
    diagnostico = 'A corrente de ' + ib.toFixed(1) + 'A ultrapassa o limite de um cabo de 1,5mm² (17,5A). Mesmo cabos de iluminação não suportam essa carga.';
  } else {
    if (distancia > 20) {
      diagnostico = 'A fiação antiga pode ter queimado por queda de tensão excessiva na distância de ' + distancia + 'm, causando sobrecorrente e aquecimento.';
    } else {
      diagnostico = 'A fiação antiga pode ter queimado por mau contato, emenda mal feita ou disjuntor com amperagem inadequada.';
    }
  }

  var criterio = secaoQueda > secaoCorrente ? 'queda de tensão' : 'capacidade de condução';

  var resultadoHTML =
    '<div class="result-title">Resultado do Dimensionamento</div>' +
    '<div class="result-detail">' +
      '<strong>Corrente de Projeto (Ib):</strong> ' + ib.toFixed(2) + ' A<br>' +
      '<strong>Critério predominante:</strong> ' + criterio +
    '</div>' +
    '<div class="result-highlight">' +
      'Use Cabo de ' + secaoFinal + ' mm²' +
    '</div>' +
    '<div class="result-detail">' +
      '<strong>Disjuntor recomendado:</strong> ' + disjuntor + 'A (Curva ' + (fp < 1.0 ? 'C' : 'B') + ')<br>' +
      '<strong>Capacidade do cabo (Iz):</strong> ' + iz.toFixed(1) + ' A<br>' +
      '<strong>Queda de tensão:</strong> ' + quedaReal.toFixed(2) + '% ' + (quedaReal > 4 ? '<span style="color:var(--danger)">(ACIMA DO LIMITE!)</span>' : '<span style="color:var(--success)">(OK)</span>') +
    '</div>' +
    '<div class="result-diag">' +
      '<strong>Diagnóstico:</strong><br>' +
      diagnostico +
    '</div>';

  var resultadoBox = document.getElementById('tc-resultado');
  resultadoBox.innerHTML = resultadoHTML;
  resultadoBox.style.display = 'block';
  resultadoBox.classList.remove('alerta');

  state.ultimoResultado = '*Dimensionamento de Cabo - NBR 5410*\n\n' +
    'Equipamento: ' + potencia + 'W / ' + tensao + 'V\n' +
    'Corrente (Ib): ' + ib.toFixed(2) + 'A\n' +
    'Distância: ' + distancia + 'm\n\n' +
    '*Cabo recomendado: ' + secaoFinal + ' mm²*\n' +
    'Disjuntor: ' + disjuntor + 'A (Curva ' + (fp < 1.0 ? 'C' : 'B') + ')\n' +
    'Queda de tensão: ' + quedaReal.toFixed(2) + '%\n\n' +
    'Diagnóstico: ' + diagnostico;

  salvarUltimoCalculo('troca_cabo', {
    potencia: potencia,
    tensao: tensao,
    distancia: distancia,
    fp: fp,
    resultado: state.ultimoResultado,
    data: new Date().toISOString()
  });
}

// ===== CALCULADORA RAPIDA: DISJUNTOR DESARMANDO =====

function calcularDisjuntor() {
  var potenciaInput = document.getElementById('dj-potencia').value;
  var potencia = parseFloat(potenciaInput) || state.disjuntor.potencia;
  var tensao = state.disjuntor.tensao;
  var disjuntorAtual = state.disjuntor.disjuntorAtual;

  if (!potencia || potencia <= 0) {
    alert('Informe a potencia do aparelho em Watts.');
    return;
  }

  if (potencia > 100000) {
    alert('Potencia muito alta. Verifique o valor informado.');
    return;
  }

  var ib = calcularCorrente(potencia, tensao, 'mono', 1.0);
  var desarma = ib > disjuntorAtual;
  var disjuntorIdeal = selecionarDisjuntor(ib);
  var secaoNecessaria = encontrarSecaoPorCorrente(disjuntorIdeal, FCA, SECAO_MIN_FORCA);
  var iz = capacidadeCorrigida(secaoNecessaria, FCA);

  var alertaHTML = '';

  if (desarma) {
    alertaHTML =
      '<div class="result-title">&#9888; Disjuntor Desarmando por Sobrecarga!</div>' +
      '<div class="result-detail">' +
        'O aparelho de <strong>' + potencia + 'W</strong> em <strong>' + tensao + 'V</strong> puxa <strong>' + ib.toFixed(2) + 'A</strong>.<br>' +
        'O disjuntor atual é de <strong>' + disjuntorAtual + 'A</strong>, que é <strong>menor</strong> que a corrente necessária.' +
      '</div>' +
      '<div class="result-highlight">' +
        'Troque por Disjuntor de ' + disjuntorIdeal + 'A (Curva B)' +
      '</div>' +
      '<div class="result-detail">' +
        '<strong>Cabo mínimo necessário:</strong> ' + secaoNecessaria + ' mm²<br>' +
        '<strong>Capacidade do cabo (Iz):</strong> ' + iz.toFixed(1) + ' A' +
      '</div>' +
      '<div class="result-diag">' +
        '<strong>&#128680; ALERTA DE SEGURANÇA:</strong><br>' +
        'O disjuntor de ' + disjuntorAtual + 'A desarma porque a carga puxa ' + ib.toFixed(1) + 'A. ' +
        'Troque por um disjuntor de ' + disjuntorIdeal + 'A (Curva B para chuveiros/resistivos), ' +
        'mas <strong>CERTIFIQUE-SE</strong> de que o cabo instalado seja de pelo menos ' +
        '<strong>' + secaoNecessaria + ' mm²</strong> para evitar incêndios.' +
        '<br><br>' +
        '<strong>NUNCA coloque um disjuntor maior sem verificar o cabo!</strong> ' +
        'Isso pode causar incêndio por superaquecimento da fiação.' +
      '</div>';
  } else {
    var secaoExistente = encontrarSecaoPorCorrente(disjuntorAtual, FCA, SECAO_MIN_FORCA);
    alertaHTML =
      '<div class="result-title">&#128269; Disjuntor Dimensionado Corretamente</div>' +
      '<div class="result-detail">' +
        'A corrente do aparelho é <strong>' + ib.toFixed(2) + 'A</strong> e o disjuntor é de <strong>' + disjuntorAtual + 'A</strong>.<br>' +
        'Teoricamente o disjuntor <strong>não deveria desarmar</strong> por sobrecarga.' +
      '</div>' +
      '<div class="result-diag">' +
        '<strong>Se o disjuntor continua desarmando, verifique:</strong><br>' +
        '1. <strong>Curto-circuito</strong> no aparelho ou na fiação<br>' +
        '2. <strong>Disjuntor defeituoso</strong> (desgaste mecânico)<br>' +
        '3. <strong>Emenda solta</strong> causando aquecimento<br>' +
        '4. <strong>Outros aparelhos</strong> no mesmo circuito somando carga<br>' +
        '5. <strong>Fio terra</strong> encostando na fase' +
        '<br><br>' +
        'Cabo mínimo para este circuito: <strong>' + secaoExistente + ' mm²</strong>' +
      '</div>';
  }

  var resultadoBox = document.getElementById('dj-resultado');
  resultadoBox.innerHTML = alertaHTML;
  resultadoBox.style.display = 'block';
  resultadoBox.classList.toggle('alerta', desarma);

  if (desarma) {
    state.ultimoResultado = '*Diagnóstico - Disjuntor Desarmando*\n\n' +
      'Aparelho: ' + potencia + 'W / ' + tensao + 'V\n' +
      'Corrente: ' + ib.toFixed(2) + 'A\n' +
      'Disjuntor atual: ' + disjuntorAtual + 'A\n\n' +
      '*Solução: Trocar disjuntor para ' + disjuntorIdeal + 'A (Curva B)*\n' +
      'Cabo mínimo necessário: ' + secaoNecessaria + ' mm²\n\n' +
      'NUNCA coloque disjuntor maior sem verificar o cabo!';
  } else {
    state.ultimoResultado = '*Diagnóstico - Disjuntor*\n\n' +
      'Aparelho: ' + potencia + 'W / ' + tensao + 'V\n' +
      'Corrente: ' + ib.toFixed(2) + 'A\n' +
      'Disjuntor atual: ' + disjuntorAtual + 'A\n\n' +
      'O disjuntor está dimensionado corretamente.\n' +
      'Se desarma, verifique: curto-circuito, disjuntor defeituoso, emenda solta ou outros aparelhos no mesmo circuito.';
  }

  salvarUltimoCalculo('disjuntor', {
    potencia: potencia,
    tensao: tensao,
    disjuntorAtual: disjuntorAtual,
    resultado: state.ultimoResultado,
    data: new Date().toISOString()
  });
}

// ===== PROJETO COMPLETO =====

var circuitoCount = 0;

function selectTipoInstalacao(btn) {
  var parent = btn.closest('.toggle-group');
  var btns = parent.querySelectorAll('.btn-toggle');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  state.projeto.tipo = btn.dataset.value;
}

function selectProjVoltage(btn) {
  var parent = btn.closest('.toggle-group');
  var btns = parent.querySelectorAll('.btn-toggle');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  state.projeto.tensao = parseInt(btn.dataset.value);
}

function nextStep(stepNum) {
  var steps = document.querySelectorAll('.step');
  for (var i = 0; i < steps.length; i++) steps[i].classList.remove('active');
  document.getElementById('step-' + stepNum).classList.add('active');
}

function addCircuito() {
  circuitoCount++;
  var lista = document.getElementById('circuitos-lista');
  var card = document.createElement('div');
  card.className = 'circuito-card';
  card.id = 'circ-' + circuitoCount;
  card.innerHTML =
    '<div class="circ-header">' +
      '<strong>Circuito ' + circuitoCount + '</strong>' +
      '<button class="btn-remove-circ" onclick="removeCircuito(' + circuitoCount + ')">&times;</button>' +
    '</div>' +
    '<label>Nome / Descrição</label>' +
    '<input type="text" class="circ-nome" placeholder="Ex: Chuveiro, Iluminação Sala" value="Circuito ' + circuitoCount + '">' +
    '<label>Potência (W)</label>' +
    '<input type="number" class="circ-potencia" placeholder="Ex: 5500" inputmode="numeric">' +
    '<label>Distância até o quadro (m)</label>' +
    '<input type="number" class="circ-distancia" placeholder="Ex: 15" inputmode="numeric" value="10">' +
    '<label>Tipo de Circuito</label>' +
    '<select class="circ-tipo">' +
      '<option value="forca">Tomada / Força (mín. 2,5mm²)</option>' +
      '<option value="iluminacao">Iluminação (mín. 1,5mm²)</option>' +
    '</select>' +
    '<label>Fator de Potência</label>' +
    '<select class="circ-fp">' +
      '<option value="1.0">Resistiva (Chuveiro, Torneira) - FP 1,0</option>' +
      '<option value="0.92">Indutiva (Motor, AC) - FP 0,92</option>' +
    '</select>';
  lista.appendChild(card);
}

function removeCircuito(id) {
  var card = document.getElementById('circ-' + id);
  if (card) card.remove();
}

function calcularProjeto() {
  var cards = document.querySelectorAll('.circuito-card');
  if (cards.length === 0) {
    alert('Adicione pelo menos um circuito.');
    return;
  }

  var resultados = [];
  var textoWhatsApp = '*Projeto Elétrico - NBR 5410*\n';
  var tipoTexto = state.projeto.tipo === 'mono' ? 'Monofásico' : (state.projeto.tipo === 'bi' ? 'Bifásico' : 'Trifásico');
  textoWhatsApp += 'Tipo: ' + tipoTexto + '\n';
  textoWhatsApp += 'Tensão: ' + state.projeto.tensao + 'V\n\n';

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var nome = card.querySelector('.circ-nome').value || ('Circuito ' + (i + 1));
    var potencia = parseFloat(card.querySelector('.circ-potencia').value);
    var distancia = parseFloat(card.querySelector('.circ-distancia').value) || 10;
    var tipoCircuito = card.querySelector('.circ-tipo').value;
    var fp = parseFloat(card.querySelector('.circ-fp').value);

    if (!potencia || potencia <= 0) {
      alert('Informe a potência do ' + nome + '.');
      return;
    }

    if (potencia > 100000) {
      alert('Potência muito alta no circuito: ' + nome);
      return;
    }

    var resultado = dimensionarCircuito({
      nome: nome,
      potencia: potencia,
      tensao: state.projeto.tensao,
      tipo: state.projeto.tipo,
      distancia: distancia,
      fp: fp,
      tipoCircuito: tipoCircuito
    });

    resultados.push(resultado);

    textoWhatsApp += '*' + resultado.nome + '*\n';
    textoWhatsApp += 'Potência: ' + resultado.potencia + 'W | Dist: ' + resultado.distancia + 'm\n';
    textoWhatsApp += 'Corrente: ' + resultado.ib + 'A\n';
    textoWhatsApp += 'Cabo: ' + resultado.secao + ' mm² | Disjuntor: ' + resultado.disjuntor + 'A (' + resultado.curva + ')\n';
    textoWhatsApp += 'Queda: ' + resultado.queda + '%\n\n';
  }

  state.projeto.resultado = resultados;
  state.ultimoResultado = textoWhatsApp;

  var resultadoDiv = document.getElementById('projeto-resultado');
  var html = '<div class="projeto-resumo">' +
    '<h3>Resumo do Projeto</h3>' +
    '<p><strong>Tipo:</strong> ' + tipoTexto + '</p>' +
    '<p><strong>Tensão:</strong> ' + state.projeto.tensao + 'V</p>' +
    '<p><strong>Circuitos:</strong> ' + resultados.length + '</p>' +
    '</div>';

  for (var j = 0; j < resultados.length; j++) {
    var r = resultados[j];
    html += '<div class="circuito-resultado">' +
      '<div class="circ-nome">' + r.nome + '</div>' +
      '<div class="circ-dados">' +
        '<span>Potência:</span> <strong>' + r.potencia + 'W</strong>' +
        '<span>Corrente (Ib):</span> <strong>' + r.ib + 'A</strong>' +
        '<span>Cabo:</span> <strong>' + r.secao + ' mm²</strong>' +
        '<span>Disjuntor:</span> <strong>' + r.disjuntor + 'A (' + r.curva + ')</strong>' +
        '<span>Cap. Cabo (Iz):</span> <strong>' + r.iz + 'A</strong>' +
        '<span>Queda:</span> <strong>' + r.queda + '%</strong>' +
        '<span>Critério:</span> <strong>' + r.criterio + '</strong>' +
        '<span>Distância:</span> <strong>' + r.distancia + 'm</strong>' +
      '</div>' +
      '</div>';
  }

  resultadoDiv.innerHTML = html;
  nextStep(4);

  salvarUltimoCalculo('projeto', {
    tipo: state.projeto.tipo,
    tensao: state.projeto.tensao,
    circuitos: resultados,
    resultado: state.ultimoResultado,
    data: new Date().toISOString()
  });
}

function novoProjeto() {
  state.projeto.circuitos = [];
  state.projeto.resultado = null;
  circuitoCount = 0;
  document.getElementById('circuitos-lista').innerHTML = '';
  nextStep(1);
}

// ===== WHATSAPP =====
function compartilharUltimoResultado() {
  if (!state.ultimoResultado) {
    alert('Faça um cálculo primeiro para compartilhar.');
    return;
  }
  var url = 'https://wa.me/?text=' + encodeURIComponent(state.ultimoResultado);
  window.open(url, '_blank');
}

function compartilharProjetoWhatsApp() {
  compartilharUltimoResultado();
}

// ===== PWA =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js')
      .then(function(reg) { console.log('SW OK:', reg.scope); })
      .catch(function(err) { console.log('SW erro:', err); });
  });
}

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  state.deferredPrompt = e;
  var banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
  console.log('PWA install prompt disponivel');
});

setTimeout(function() {
  var banner = document.getElementById('install-banner');
  if (!banner || banner.style.display !== 'flex') {
    var manual = document.getElementById('install-manual');
    if (manual) manual.style.display = 'block';
  }
}, 3000);

function installPWA() {
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.then(function(choice) {
      if (choice.outcome === 'accepted') {
        console.log('PWA instalado com sucesso');
        document.getElementById('install-banner').style.display = 'none';
      } else {
        document.getElementById('install-banner').style.display = 'none';
        document.getElementById('install-manual').style.display = 'block';
      }
      state.deferredPrompt = null;
    });
  } else {
    document.getElementById('install-banner').style.display = 'none';
    document.getElementById('install-manual').style.display = 'block';
  }
}

function dismissInstall() {
  document.getElementById('install-banner').style.display = 'none';
  setTimeout(function() {
    document.getElementById('install-manual').style.display = 'block';
  }, 500);
}

function dismissManualInstall() {
  document.getElementById('install-manual').style.display = 'none';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  navigateTo('screen-dashboard');
  console.log('Eletricista Pro v7.0 carregado com sucesso');
  console.log('CONDUTORES:', CONDUTORES.length, 'tipos');
});
