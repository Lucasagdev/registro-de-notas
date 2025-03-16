document.addEventListener('DOMContentLoaded', async () => {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');

    // Verifica se o usuário está logado
    if (!usuarioLogado) {
        window.location.href = '/index.html';
        return;
    }

    // Exibe o nome do usuário logado
    document.getElementById('nomeUsuario').textContent = usuarioLogado;

    // Carrega os registros do usuário logado
    try {
        const response = await fetch(`/api/registros?usuario=${usuarioLogado}`);
        const data = await response.json();

        if (data.success) {
            const registros = data.registros;
            const tabela = document.getElementById('lista-registros');
            let contadorNotas = 0;

            tabela.innerHTML = '';

            registros.forEach(registro => {
                if (registro.nota !== 'Sem nota') contadorNotas++;
                const novaLinha = document.createElement('tr');
                novaLinha.innerHTML = `
                    <td>${registro.nome_usuario || 'Usuário Desconhecido'}</td>
                    <td>${registro.disciplina}</td>
                    <td>${registro.nota}</td>`;
                tabela.appendChild(novaLinha);
            });

            document.getElementById('contador-notas').innerHTML = `Total de disciplinas cursadas: ${contadorNotas}`;
        } else {
            alert(data.message || 'Erro ao carregar registros.');
        }
    } catch (error) {
        console.error('Erro ao carregar registros:', error);
        alert('Erro ao carregar registros.');
    }
});

function logout() {
    sessionStorage.removeItem('usuarioLogado');
    sessionStorage.removeItem('tipoUsuario');
    sessionStorage.removeItem('usuarioId'); // Remove o ID do usuário ao fazer logout
    window.location.href = '/index.html';
}