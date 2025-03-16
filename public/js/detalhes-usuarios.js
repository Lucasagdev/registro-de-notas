async function mostrarUsuarios() {
    try {
        const response = await fetch('http://localhost:5000/api/usuarios');
        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        const data = await response.json();

        if (data.success) {
            // Ordena os usuários em ordem alfabética pelo campo 'usuario'
            const usuariosOrdenados = data.usuarios.sort((a, b) => {
                const nomeA = a.usuario.toLowerCase();
                const nomeB = b.usuario.toLowerCase();
                if (nomeA < nomeB) return -1;
                if (nomeA > nomeB) return 1;
                return 0;
            });

            const listaContainer = document.getElementById('usuarios-lista');
            listaContainer.innerHTML = '';

            // Exibe os usuários na lista
            usuariosOrdenados.forEach(usuario => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <span>${usuario.usuario} - ${usuario.tipo}</span>
                    <div class="botoes-container">
                        <button onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button onclick="excluirUsuario(${usuario.id})">Excluir</button>
                    </div>
                `;
                listaContainer.appendChild(item);
            });

            document.getElementById('lista-usuarios').style.display = 'block';
        } else {
            alert(data.message || 'Erro ao carregar usuários.');
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao carregar usuários. Tente novamente.');
    }
}

async function editarUsuario(id) {
    const novoNome = prompt('Digite o novo nome do usuário:');

    if (!novoNome) {
        alert('Nome inválido.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: novoNome }),
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const data = await response.json();

        if (data.success) {
            alert('Usuário atualizado com sucesso!');
            mostrarUsuarios(); // Atualiza a lista de usuários
        } else {
            alert(data.message || 'Erro ao atualizar usuário.');
        }
    } catch (error) {
        console.error('Erro ao editar usuário:', error);
        alert('Erro ao editar usuário. Tente novamente.');
    }
}

async function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
        const response = await fetch(`http://localhost:5000/api/usuarios/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const data = await response.json();

        if (data.success) {
            alert('Usuário excluído com sucesso!');
            mostrarUsuarios(); // Atualiza a lista de usuários
        } else {
            alert(data.message || 'Erro ao excluir usuário.');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Tente novamente.');
    }
}

async function registrarUsuario() {
    const novoUsuario = document.getElementById('novo-usuario').value.trim();
    const novaSenha = document.getElementById('nova-senha').value.trim();
    const tipoUsuario = document.querySelector('input[name="tipo-usuario"]:checked').value;

    // Validação dos campos
    if (!novoUsuario || novaSenha.length < 6 || !/[0-9]/.test(novaSenha) || !/[a-zA-Z]/.test(novaSenha)) {
        alert('Usuário ou senha inválidos.');
        return;
    }

    try {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: novoUsuario, senha: novaSenha, tipo: tipoUsuario }),
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const data = await response.json();

        if (data.success) {
            alert('Usuário registrado com sucesso!');
            mostrarUsuarios(); // Atualiza a lista de usuários
        } else {
            alert(data.message || 'Erro ao registrar usuário.');
        }
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        alert('Erro ao registrar usuário. Tente novamente.');
    }
}

function toggleSenha(id) {
    const campo = document.getElementById(id);
    campo.type = campo.type === "password" ? "text" : "password";
}

function voltarAoPortal() {
    window.location.href = 'portal-admin.html';
}