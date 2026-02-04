// ============ VARIÁVEIS GLOBAIS ============
let usuarios = JSON.parse(localStorage.getItem('crudUsuarios')) || [];
let proximoId = usuarios.length > 0 
  ? Math.max(...usuarios.map(u => u.id)) + 1 
  : 1;

let usuarioEmEdicao = null;
let acaoConfirmacao = null;

// ============ FUNÇÕES DE CONTROLE DE TELA ============
function irParaProcurar() {
  document.getElementById('telaCadastro').classList.remove('ativa');
  document.getElementById('telaProcurar').classList.add('ativa');
  carregarTabela();
}

function voltarParaCadastro() {
  document.getElementById('telaProcurar').classList.remove('ativa');
  document.getElementById('telaCadastro').classList.add('ativa');
  limparFormulario();
  resetarModoEdicao();
}

// 🔥 NOVA FUNÇÃO: Ir para cadastro SEM limpar (para edição)
function irParaCadastroParaEdicao() {
  document.getElementById('telaProcurar').classList.remove('ativa');
  document.getElementById('telaCadastro').classList.add('ativa');
  // NÃO chama limparFormulario() aqui!
}

// ============ RESETAR MODO EDIÇÃO ============
function resetarModoEdicao() {
  usuarioEmEdicao = null;
  const botao = document.querySelector('.botao-principal');
  botao.innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Usuário';
  botao.classList.remove('modo-edicao');
}

// ============ FUNÇÕES DO FORMULÁRIO ============
function mostrarSenha(idCampo) {
  const campo = document.getElementById(idCampo);
  const botao = campo.parentNode.querySelector('.botao-olho');
  const icone = botao.querySelector('i');
  
  if (campo.type === 'password') {
    campo.type = 'text';
    icone.classList.remove('fa-eye');
    icone.classList.add('fa-eye-slash');
  } else {
    campo.type = 'password';
    icone.classList.remove('fa-eye-slash');
    icone.classList.add('fa-eye');
  }
}

function buscarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  
  if (cep.length !== 8) return;
  
  // Mostrar loading
  document.getElementById('rua').value = '...';
  document.getElementById('bairro').value = '...';
  document.getElementById('cidade').value = '...';
  document.getElementById('uf').value = '...';
  document.getElementById('ibge').value = '...';
  
  // Buscar via ViaCEP
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (!data.erro) {
        document.getElementById('rua').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('uf').value = data.uf || '';
        document.getElementById('ibge').value = data.ibge || '';
        mostrarNotificacao('CEP encontrado! Endereço preenchido.', 'sucesso');
      } else {
        limparEndereco();
        mostrarNotificacao('CEP não encontrado', 'erro');
      }
    })
    .catch(() => {
      limparEndereco();
      mostrarNotificacao('Erro ao buscar CEP', 'erro');
    });
}

function limparEndereco() {
  document.getElementById('rua').value = '';
  document.getElementById('bairro').value = '';
  document.getElementById('cidade').value = '';
  document.getElementById('uf').value = '';
  document.getElementById('ibge').value = '';
}

// ============ CRUD - ADICIONAR/ATUALIZAR ============
function adicionarOuAtualizarUsuario() {
  // Coletar dados
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const repetesenha = document.getElementById('repetesenha').value;
  
  // Validar
  if (!nome || !email || !senha) {
    mostrarNotificacao('Preencha nome, email e senha!', 'erro');
    return;
  }
  
  if (senha !== repetesenha) {
    mostrarNotificacao('As senhas não coincidem!', 'erro');
    return;
  }
  
  // Coletar endereço
  const endereco = {
    cep: document.getElementById('cep').value,
    rua: document.getElementById('rua').value,
    bairro: document.getElementById('bairro').value,
    cidade: document.getElementById('cidade').value,
    uf: document.getElementById('uf').value,
    numero: document.getElementById('numero').value,
    complemento: document.getElementById('complemento').value,
    ibge: document.getElementById('ibge').value
  };
  
  const enderecoCompleto = "CEP: " + endereco.cep + " - " +
    "RUA: " + endereco.rua + " - " +
    "BAIRRO: " + endereco.bairro + " - " +
    "CIDADE: " + endereco.cidade + " - " +
    "UF: " + endereco.uf + " - " +
    "N°: " + endereco.numero + " - " +
    "COMPLEMENTO: " + endereco.complemento + " - " +
    "IBGE: " + endereco.ibge;
  
  console.log(enderecoCompleto);

  if (usuarioEmEdicao) {
    // 🔥 ATUALIZAR USUÁRIO EXISTENTE
    const indice = usuarios.findIndex(u => u.id === usuarioEmEdicao);
    if (indice !== -1) {
      usuarios[indice] = {
        ...usuarios[indice],
        id: usuarioEmEdicao,
        name: nome,
        email,
        senha,
        endereco: enderecoCompleto,
        enderecoDetalhado: endereco,
        dataAtualizacao: new Date().toISOString()
      };
      
      salvarNoLocalStorage();
      mostrarNotificacao('Usuário atualizado com sucesso!', 'sucesso');
      
      // 🔥 LIMPAR E RESETAR APÓS SALVAR
      limparFormulario();
      resetarModoEdicao();
      
      // Ir para tela de busca automaticamente
      setTimeout(() => {
        irParaProcurar();
      }, 800);
    }
  } else {
    // ADICIONAR NOVO USUÁRIO
    const novoUsuario = {
      id: proximoId++,
      name: nome,
      email,
      senha,
      endereco: enderecoCompleto,
      enderecoDetalhado: endereco,
      dataCadastro: new Date().toISOString()
    };
    
    usuarios.push(novoUsuario);
    salvarNoLocalStorage();
    mostrarNotificacao('Usuário cadastrado com sucesso!', 'sucesso');
    limparFormulario();
  }
}

// 🔥 FUNÇÃO DE EDIÇÃO CORRIGIDA (VERSÃO DEFINITIVA)
function editarUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return;

  // Preencher dados básicos
  document.getElementById('nome').value = usuario.name;
  document.getElementById('email').value = usuario.email;
  document.getElementById('senha').value = usuario.senha;
  document.getElementById('repetesenha').value = usuario.senha;

  // Preencher endereço detalhado
  const end = usuario.enderecoDetalhado || {};
  document.getElementById('cep').value = end.cep || '';
  document.getElementById('rua').value = end.rua || '';
  document.getElementById('bairro').value = end.bairro || '';
  document.getElementById('cidade').value = end.cidade || '';
  document.getElementById('uf').value = end.uf || '';
  document.getElementById('numero').value = end.numero || '';
  document.getElementById('complemento').value = end.complemento || '';
  document.getElementById('ibge').value = end.ibge || '';

  // Marca usuário em edição
  usuarioEmEdicao = id;

  // Atualiza botão principal (UX)
  const botao = document.querySelector('.botao-principal');
  botao.innerHTML = '<i class="fas fa-save"></i> Atualizar Usuário';
  botao.classList.add('modo-edicao');

  // Vai para tela de cadastro SEM limpar
  irParaCadastroParaEdicao();

  // Garante foco no topo
  window.scrollTo(0, 0);
  
  // Notificação de edição
  mostrarNotificacao(`Editando: ${usuario.name}`, 'info');
}

// ============ FUNÇÃO DE EXCLUSÃO ============
function excluirUsuario(id) {
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return;
  
  acaoConfirmacao = () => {
    // Remover do array
    usuarios = usuarios.filter(u => u.id !== id);
    
    // Salvar no localStorage
    salvarNoLocalStorage();
    
    // Atualizar tabela
    carregarTabela();
    
    // Mostrar notificação
    mostrarNotificacao(`Usuário "${usuario.name}" excluído com sucesso!`, 'sucesso');
  };
  
  // Mostrar modal de confirmação
  document.getElementById('mensagemModal').textContent = 
    `Tem certeza que deseja excluir o usuário "${usuario.name}"?\n\nEsta ação não pode ser desfeita e removerá também do CSV.`;
  document.getElementById('modalConfirmacao').style.display = 'flex';
}

// ============ PRODURAR USUÁRIOS ============
function procurarUsuarios() {
  const termo = document.getElementById('nomeProcurado').value.toLowerCase().trim();
  
  if (!termo) {
    carregarTabela();
    return;
  }
  
  const resultados = usuarios.filter(u => 
    u.name.toLowerCase().includes(termo) || 
    u.email.toLowerCase().includes(termo)
  );
  
  mostrarTabela(resultados);
  
  // Feedback visual
  if (resultados.length === 0) {
    mostrarNotificacao('Nenhum usuário encontrado', 'aviso');
  } else {
    mostrarNotificacao(`Encontrados ${resultados.length} usuário(s)`, 'info');
  }
}

// ============ RENDERIZAR TABELA ============
function carregarTabela() {
  mostrarTabela(usuarios);
}

function mostrarTabela(lista) {
  const corpoTabela = document.getElementById('corpoTabela');
  const mensagemVazia = document.getElementById('mensagemVazia');
  
  if (lista.length === 0) {
    corpoTabela.innerHTML = '';
    mensagemVazia.style.display = 'block';
    return;
  }
  
  mensagemVazia.style.display = 'none';
  
  let html = '';
  lista.forEach(usuario => {
    // Mostrar senha mascarada
    const senhaMascarada = '*'.repeat(Math.min(usuario.senha.length, 8));
    
    // Limitar tamanho do endereço
    const enderecoCurto = usuario.endereco.length > 30 
      ? usuario.endereco.substring(0, 30) + '...' 
      : usuario.endereco;
    
    // Formatar data (se existir)
    const dataFormatada = usuario.dataAtualizacao 
      ? `Editado: ${new Date(usuario.dataAtualizacao).toLocaleDateString('pt-BR')}`
      : `Criado: ${new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')}`;
    
    html += `
      <tr>
        <td>${usuario.id.toString().padStart(3, '0')}</td>
        <td>
          ${usuario.name}
          <br><small style="color:#7f8c8d; font-size:0.8rem;">${dataFormatada}</small>
        </td>
        <td>${usuario.email}</td>
        <td>${senhaMascarada}</td>
        <td title="${usuario.endereco}">${enderecoCurto}</td>
        <td>
          <button onclick="editarUsuario(${usuario.id})" class="botao-tabela botao-editar">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button onclick="excluirUsuario(${usuario.id})" class="botao-tabela botao-apagar">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </td>
      </tr>
    `;
  });
  
  corpoTabela.innerHTML = html;
}

// ============ CSV ============
function baixarPlanilha() {
  if (usuarios.length === 0) {
    mostrarNotificacao('Não há dados para exportar!', 'erro');
    return;
  }
  
  // Cabeçalho do CSV
  let csv = 'ID,Nome,Email,Senha,Endereço,CEP,Rua,Bairro,Cidade,Estado,Número,Complemento,IBGE,Data Cadastro,Data Atualização\n';
  
  // Adicionar cada usuário
  usuarios.forEach(usuario => {
    const end = usuario.enderecoDetalhado || {};
    const linha = [
      usuario.id,
      `"${usuario.name}"`,
      `"${usuario.email}"`,
      `"${usuario.senha}"`,
      `"${usuario.endereco}"`,
      `"${end.cep || ''}"`,
      `"${end.rua || ''}"`,
      `"${end.bairro || ''}"`,
      `"${end.cidade || ''}"`,
      `"${end.uf || ''}"`,
      `"${end.numero || ''}"`,
      `"${end.complemento || ''}"`,
      `"${end.ibge || ''}"`,
      `"${new Date(usuario.dataCadastro).toLocaleString('pt-BR')}"`,
      `"${usuario.dataAtualizacao ? new Date(usuario.dataAtualizacao).toLocaleString('pt-BR') : ''}"`
    ].join(',');
    
    csv += linha + '\n';
  });
  
  // Criar e baixar arquivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  mostrarNotificacao('Planilha baixada com sucesso!', 'sucesso');
}

// ============ LOCALSTORAGE ============
function salvarNoLocalStorage() {
  localStorage.setItem('crudUsuarios', JSON.stringify(usuarios));
}

// ============ UTILITÁRIOS ============
function limparFormulario() {
  document.getElementById('nome').value = '';
  document.getElementById('email').value = '';
  document.getElementById('senha').value = '';
  document.getElementById('repetesenha').value = '';
  document.getElementById('cep').value = '';
  document.getElementById('rua').value = '';
  document.getElementById('bairro').value = '';
  document.getElementById('cidade').value = '';
  document.getElementById('uf').value = '';
  document.getElementById('numero').value = '';
  document.getElementById('complemento').value = '';
  document.getElementById('ibge').value = '';
}

function mostrarNotificacao(mensagem, tipo = 'info') {
  const notificacao = document.getElementById('notificacao');
  const texto = document.getElementById('textoNotificacao');
  
  texto.textContent = mensagem;
  
  // Cor baseada no tipo
  switch(tipo) {
    case 'sucesso':
      notificacao.style.background = '#4CAF50';
      break;
    case 'erro':
      notificacao.style.background = '#f44336';
      break;
    case 'aviso':
      notificacao.style.background = '#ff9800';
      break;
    default:
      notificacao.style.background = '#2196F3';
  }
  
  notificacao.style.display = 'flex';
  
  // Esconder após 3 segundos
  setTimeout(() => {
    notificacao.style.display = 'none';
  }, 3000);
}

function confirmarAcao(confirmado) {
  document.getElementById('modalConfirmacao').style.display = 'none';
  
  if (confirmado && acaoConfirmacao) {
    acaoConfirmacao();
  }
  
  acaoConfirmacao = null;
}

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', function() {
  // Carregar dados do localStorage
  usuarios = JSON.parse(localStorage.getItem('crudUsuarios')) || [];
  proximoId = usuarios.length > 0 
    ? Math.max(...usuarios.map(u => u.id)) + 1 
    : 1;

  // 🔥 LINHA ESSENCIAL: Carrega a tabela ao iniciar
  carregarTabela();

  // Fechar modal ao clicar fora
  document.getElementById('modalConfirmacao').addEventListener('click', function(e) {
    if (e.target === this) {
      confirmarAcao(false);
    }
  });
  
  // Fechar modal com ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      confirmarAcao(false);
    }
  });
  
  // Se houver usuários em edição ao recarregar, reseta
  if (usuarioEmEdicao) {
    resetarModoEdicao();
  }
  
  console.log(`Sistema iniciado com ${usuarios.length} usuários cadastrados.`);
});