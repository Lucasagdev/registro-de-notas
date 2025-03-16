// Variável para armazenar o estado do filtro
let filtroAtual = {
    nome: '',
    disciplina: ''
};

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    // Verifica se o usuário está logado e é um administrador
    if (!usuarioLogado || tipoUsuario !== 'admin') {
        window.location.href = '/frontend/index.html';
        return;
    }

    // Carrega os registros e nomes dos alunos
    await carregarRegistros(1); // Carrega a primeira página por padrão
    await carregarNomesAlunos();

    // Adiciona os eventos de filtro
    const filtroNome = document.getElementById('filtroNome');
    const filtroDisciplina = document.getElementById('filtroDisciplina');

    if (filtroNome) {
        filtroNome.addEventListener('input', () => aplicarFiltro(1)); // Filtra a partir da primeira página
    }

    if (filtroDisciplina) {
        filtroDisciplina.addEventListener('change', () => aplicarFiltro(1)); // Filtra a partir da primeira página
    }

    // Adiciona o evento de limpar filtro
    const botaoLimparFiltro = document.getElementById('limparFiltro');
    if (botaoLimparFiltro) {
        botaoLimparFiltro.addEventListener('click', limparFiltro);
    }
});

// Função para carregar os registros
async function carregarRegistros(page) {
    try {
        // Monta a URL da API com base no filtro atual
        let url = `/api/registros?page=${page}`;
        if (filtroAtual.nome) {
            url += `&aluno=${encodeURIComponent(filtroAtual.nome)}`;
        }
        if (filtroAtual.disciplina) {
            url += `&materia=${encodeURIComponent(filtroAtual.disciplina)}`;
        }

        console.log('URL da API:', url); // Verifica a URL

        const response = await fetch(url);
        console.log('Resposta da API:', response); // Verifica a resposta da API

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados da API:', data); // Verifica os dados retornados

        if (data.success) {
            const registros = data.registros;
            const tabela = document.getElementById('lista-registros');
            tabela.innerHTML = '';

            if (registros.length === 0) {
                // Se nenhum registro for encontrado, exibe uma mensagem na tabela
                const mensagemLinha = document.createElement('tr');
                mensagemLinha.innerHTML = `
                    <td colspan="4" style="text-align: center;">Nenhum registro encontrado.</td>`;
                tabela.appendChild(mensagemLinha);
            } else {
                // Preenche a tabela com os registros encontrados
                registros.forEach(registro => {
                    const novaLinha = document.createElement('tr');
                    novaLinha.innerHTML = `
                        <td>${registro.nome_usuario}</td>
                        <td>${registro.disciplina}</td>
                        <td>${registro.nota}</td>
                        <td>
                            <button class="botao-editar" onclick="editarRegistro('${registro.id}', '${registro.nome_usuario}', '${registro.disciplina}', '${registro.nota}')">Editar</button>
                            <button class="botao-excluir" onclick="excluirRegistro('${registro.id}')">Excluir</button>
                        </td>`;
                    tabela.appendChild(novaLinha);
                });
            }

            // Atualiza a paginação
            if (data.paginacao) {
                atualizarPaginacao(data.paginacao);
            } else {
                console.error('Propriedade "paginacao" não encontrada na resposta:', data);
            }
        } else {
            // Exibe uma mensagem de erro na tabela
            const tabela = document.getElementById('lista-registros');
            tabela.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">Erro ao carregar registros.</td>
                </tr>`;
        }
    } catch (error) {
        console.error('Erro ao carregar registros:', error);
        // Exibe uma mensagem de erro na tabela
        const tabela = document.getElementById('lista-registros');
        tabela.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center;">Erro ao carregar registros: ${error.message}</td>
            </tr>`;
    }
}

function atualizarPaginacao(paginacao) {
    const paginacaoContainer = document.getElementById('paginacao');
    paginacaoContainer.innerHTML = ''; // Limpa o conteúdo atual da paginação

    const { paginaAtual, totalPaginas } = paginacao;

    // Define o número máximo de páginas a serem exibidas
    const maxPaginasExibidas = 5;

    // Botão "Anterior"
    if (paginaAtual > 1) {
        const botaoAnterior = document.createElement('button');
        botaoAnterior.textContent = 'Anterior';
        botaoAnterior.addEventListener('click', () => carregarRegistros(paginaAtual - 1));
        paginacaoContainer.appendChild(botaoAnterior);
    }

    // Lógica para exibir as páginas
    let inicio = 1;
    let fim = totalPaginas;

    // Se o total de páginas for maior que 20, exibe apenas as 5 últimas páginas ao redor da página atual
    if (totalPaginas > 20) {
        inicio = Math.max(1, paginaAtual - 2); // Mostra 2 páginas antes da atual
        fim = Math.min(totalPaginas, paginaAtual + 2); // Mostra 2 páginas depois da atual

        // Garante que sempre sejam exibidas 5 páginas
        if (fim - inicio + 1 < maxPaginasExibidas) {
            if (paginaAtual < 3) {
                fim = maxPaginasExibidas;
            } else {
                inicio = totalPaginas - maxPaginasExibidas + 1;
            }
        }

        // Botão para a primeira página
        if (inicio > 1) {
            const botaoPrimeiraPagina = document.createElement('button');
            botaoPrimeiraPagina.textContent = '1';
            botaoPrimeiraPagina.addEventListener('click', () => carregarRegistros(1));
            paginacaoContainer.appendChild(botaoPrimeiraPagina);

            // Adiciona "..." se necessário
            if (inicio > 2) {
                const span = document.createElement('span');
                span.textContent = '...';
                paginacaoContainer.appendChild(span);
            }
        }
    }

    // Botões das páginas
    for (let i = inicio; i <= fim; i++) {
        const botaoPagina = document.createElement('button');
        botaoPagina.textContent = i;
        if (i === paginaAtual) {
            botaoPagina.disabled = true; // Desabilita o botão da página atual
        } else {
            botaoPagina.addEventListener('click', () => carregarRegistros(i));
        }
        paginacaoContainer.appendChild(botaoPagina);
    }

    // Botão para a última página (se necessário)
    if (totalPaginas > 20 && fim < totalPaginas) {
        // Adiciona "..." se necessário
        if (fim < totalPaginas - 1) {
            const span = document.createElement('span');
            span.textContent = '...';
            paginacaoContainer.appendChild(span);
        }

        const botaoUltimaPagina = document.createElement('button');
        botaoUltimaPagina.textContent = totalPaginas;
        botaoUltimaPagina.addEventListener('click', () => carregarRegistros(totalPaginas));
        paginacaoContainer.appendChild(botaoUltimaPagina);
    }

    // Botão "Próximo"
    if (paginaAtual < totalPaginas) {
        const botaoProximo = document.createElement('button');
        botaoProximo.textContent = 'Próximo';
        botaoProximo.addEventListener('click', () => carregarRegistros(paginaAtual + 1));
        paginacaoContainer.appendChild(botaoProximo);
    }
}

async function carregarNomesAlunos() {
    try {
        const response = await fetch('/api/usuarios');
        const data = await response.json();

        if (data.success) {
            const datalist = document.getElementById('nomes-alunos');
            datalist.innerHTML = '';

            data.usuarios.forEach(usuario => {
                const option = document.createElement('option');
                option.value = usuario.usuario;
                datalist.appendChild(option);
            });
        } else {
            console.error('Erro ao carregar nomes dos alunos:', data.message);
        }
    } catch (error) {
        console.error('Erro ao carregar nomes dos alunos:', error);
    }
}

// Função para aplicar o filtro
function aplicarFiltro(page) {
    // Atualiza o filtro atual com os valores dos campos de filtro
    filtroAtual.nome = document.getElementById('filtroNome').value.trim();
    filtroAtual.disciplina = document.getElementById('filtroDisciplina').value.trim();

    // Carrega os registros com o filtro aplicado
    carregarRegistros(page);
}

// Função para limpar o filtro
function limparFiltro() {
    console.log('Botão "Limpar Filtros" clicado.'); // Verifica se a função está sendo chamada
    // Reseta o filtro atual
    filtroAtual.nome = '';
    filtroAtual.disciplina = '';

    // Limpa os campos de filtro
    document.getElementById('filtroNome').value = '';
    document.getElementById('filtroDisciplina').value = '';

    // Recarrega os registros sem filtro
    carregarRegistros(1);
}

// Variável para armazenar o ID do registro em edição
let registroEditandoId = null;

function editarRegistro(id, nomeUsuario, disciplina, nota) {
    // Preenche os campos do formulário com os dados do registro selecionado
    document.getElementById('nome').value = nomeUsuario;
    document.getElementById('disciplina').value = disciplina;
    document.getElementById('nota').value = nota;

    // Armazena o ID do registro em edição
    registroEditandoId = id;

    // Altera o texto do botão "Adicionar" para "Atualizar"
    const botaoAdicionar = document.getElementById('botao-adicionar');
    if (botaoAdicionar) {
        botaoAdicionar.textContent = 'Atualizar';
        botaoAdicionar.onclick = atualizarRegistro;
    } else {
        console.error('Botão "Adicionar" não encontrado.');
    }

    // Rola a página para o topo ao editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function atualizarRegistro() {
    const nome = document.getElementById('nome').value.trim();
    const disciplina = document.getElementById('disciplina').value.trim();
    const nota = document.getElementById('nota').value.trim();

    if (!nome || !disciplina || !nota) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch(`/api/registros/${registroEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, disciplina, nota }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Registro atualizado com sucesso!');

            // Mantém o filtro atual após a atualização
            document.getElementById('filtroNome').value = filtroAtual.nome;
            document.getElementById('filtroDisciplina').value = filtroAtual.disciplina;

            // Recarrega os registros com o filtro atual
            await carregarRegistros(1);
            limparFormulario();
        } else {
            alert(data.message || 'Erro ao atualizar registro.');
        }
    } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        alert('Erro ao atualizar registro.');
    }
}

function limparFormulario() {
    // Limpa os campos do formulário
    document.getElementById('nome').value = '';
    document.getElementById('disciplina').value = '';
    document.getElementById('nota').value = '';

    // Restaura o texto do botão para "Adicionar"
    const botaoAdicionar = document.getElementById('botao-adicionar');
    if (botaoAdicionar) {
        botaoAdicionar.textContent = 'Adicionar';
        botaoAdicionar.onclick = adicionarRegistro;
    } else {
        console.error('Botão "Adicionar" não encontrado.');
    }

    // Limpa o ID do registro em edição
    registroEditandoId = null;
}

async function adicionarRegistro() {
    const nome = document.getElementById('nome').value.trim();
    const disciplina = document.getElementById('disciplina').value.trim();
    const nota = document.getElementById('nota').value.trim();

    if (!nome || !disciplina || !nota) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('/api/registros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, disciplina, nota }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Registro adicionado com sucesso!');

            // Verifica se a paginação está presente na resposta
            if (data.paginacao && data.paginacao.paginaAtual) {
                await carregarRegistros(data.paginacao.paginaAtual); // Recarrega os registros na página atual
            } else {
                await carregarRegistros(1); // Recarrega os registros na primeira página por padrão
            }

            limparFormulario();
        } else {
            alert(data.message || 'Erro ao adicionar registro.');
        }
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        alert('Erro ao adicionar registro.');
    }
}

async function excluirRegistro(id) {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;

    try {
        const response = await fetch(`/api/registros/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
            alert('Registro excluído com sucesso!');
            await carregarRegistros(1); // Recarrega os registros após excluir
        } else {
            alert(data.message || 'Erro ao excluir registro.');
        }
    } catch (error) {
        console.error('Erro ao excluir registro:', error);
        alert('Erro ao excluir registro.');
    }
}

function voltarAoPortal() {
    window.location.href = 'portal-admin.html';
}