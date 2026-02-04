// ============ SISTEMA DE CSV - SALVA TUDO EM PLANILHA ============

// ============ ADICIONAR PESSOA NO CSV ============
function adicionarAoCsv(pessoa) {
  // Separa as partes do endereço
  const partesEndereco = pessoa.endereco.split(' - ');
  const cep = partesEndereco[0]?.replace('CEP: ', '') || '';
  const rua = partesEndereco[1]?.replace('RUA: ', '') || '';
  const bairro = partesEndereco[2]?.replace('BAIRRO: ', '') || '';
  const cidade = partesEndereco[3]?.replace('CIDADE: ', '') || '';
  const uf = partesEndereco[4]?.replace('UF: ', '') || '';
  const numero = partesEndereco[5]?.replace('N°: ', '') || '';
  const complemento = partesEndereco[6]?.replace('COMPLEMENTO: ', '') || '';
  const ibge = partesEndereco[7]?.replace('IBGE: ', '') || '';
  
  const dataCadastro = new Date().toLocaleString('pt-BR');
  
  // Monta a linha do CSV
  const linhaCsv = [
    pessoa.id,
    `"${pessoa.nome}"`,
    `"${pessoa.email}"`,
    `"${pessoa.senha}"`,
    `"${pessoa.endereco}"`,
    `"${cep}"`,
    `"${rua}"`,
    `"${bairro}"`,
    `"${cidade}"`,
    `"${uf}"`,
    `"${numero}"`,
    `"${complemento}"`,
    `"${ibge}"`,
    `"${dataCadastro}"`
  ].join(',');
  
  // Verifica se já tem essa pessoa
  const jaExiste = dadosCSV.split('\n').find(linha => 
    linha.startsWith(pessoa.id + ',')
  );
  
  if (!jaExiste) {
    dadosCSV += linhaCsv + '\n';
    localStorage.setItem('meuCSV', dadosCSV);
    atualizarInfoCsv();
  }
}

// ============ SALVAR TUDO NO CSV ============
function salvarNoCSV() {
  if (pessoas.length === 0) {
    mostrarAviso("Não tem ninguém pra salvar ainda!", 'aviso');
    return;
  }
  
  // Pra cada pessoa, adiciona no CSV
  pessoas.forEach(pessoa => {
    adicionarAoCsv(pessoa);
  });
  
  mostrarAviso('✅ Todo mundo foi salvo no CSV!', 'sucesso');
}

// ============ BAIXAR O CSV ============
function baixarCSV() {
  if (dadosCSV === 'ID,Nome,Email,Senha,Endereço,CEP,Rua,Bairro,Cidade,Estado,Número,Complemento,IBGE,Data\n') {
    mostrarAviso("O CSV tá vazio ainda!", 'aviso');
    return;
  }
  
  const blob = new Blob([dadosCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // Internet Explorer
    navigator.msSaveBlob(blob, `pessoas_${Date.now()}.csv`);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = `pessoas_${Date.now()}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  mostrarAviso('📥 CSV baixado com sucesso!', 'sucesso');
}

// ============ VER O CSV ============
function verCSV() {
  const janela = document.getElementById('janelaCSV');
  const conteudo = document.getElementById('conteudoCSV');
  
  // Formata bonitinho
  const linhas = dadosCSV.split('\n');
  let formatado = '';
  
  linhas.forEach((linha, indice) => {
    if (indice === 0) {
      // Cabeçalho com destaque
      formatado += `<span style="color: #2c3e50; font-weight: bold;">${linha}</span>\n`;
    } else if (linha.trim()) {
      // Dados normais
      const colunas = linha.split(',');
      formatado += colunas.map(col => col.padEnd(20)).join(' | ') + '\n';
    }
  });
  
  conteudo.innerHTML = formatado || 'CSV vazio...';
  janela.style.display = 'block';
}

// ============ FECHAR JANELA DO CSV ============
function fecharJanelaCSV() {
  document.getElementById('janelaCSV').style.display = 'none';
}

// ============ APAGAR TUDO DO CSV ============
function apagarCSV() {
  if (confirm('⚠️ CUIDADO! Isso vai APAGAR TUDO do CSV. Tem certeza mesmo?')) {
    dadosCSV = 'ID,Nome,Email,Senha,Endereço,CEP,Rua,Bairro,Cidade,Estado,Número,Complemento,IBGE,Data\n';
    localStorage.removeItem('meuCSV');
    atualizarInfoCsv();
    mostrarAviso('🗑️ CSV foi totalmente limpo!', 'aviso');
  }
}

// ============ COPIAR CSV ============
function copiarCSV() {
  const conteudo = document.getElementById('conteudoCSV').textContent;
  navigator.clipboard.writeText(conteudo)
    .then(() => {
      mostrarAviso('📋 CSV copiado!', 'sucesso');
    })
    .catch(err => {
      mostrarAviso('❌ Não deu pra copiar', 'erro');
    });
}

// ============ BAIXAR DA JANELA ============
function baixarDaJanela() {
  baixarCSV();
  fecharJanelaCSV();
}

// ============ ATUALIZAR INFORMAÇÕES DO CSV ============
function atualizarInfoCsv() {
  const estatisticas = document.getElementById('estatisticasCSV');
  const linhas = dadosCSV.split('\n').length - 1; // -1 pro cabeçalho
  const tamanho = Math.round(dadosCSV.length / 1024 * 100) / 100;
  
  if (linhas === 0) {
    estatisticas.textContent = 'CSV vazio';
  } else {
    estatisticas.textContent = `${linhas} pessoa(s) | ${tamanho} KB`;
  }
}

// ============ QUANDO CLICA FORA DA JANELA ============
document.getElementById('janelaCSV').addEventListener('click', function(e) {
  if (e.target === this) {
    fecharJanelaCSV();
  }
});