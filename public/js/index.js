async function fazerLogin() {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!usuario || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha }),
        });

        // Verifica se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Resposta inesperada do servidor: ${text}`);
        }

        const data = await response.json();

        if (data.success) {
            sessionStorage.setItem('usuarioLogado', data.usuario);
            sessionStorage.setItem('tipoUsuario', data.tipoUsuario);
            sessionStorage.setItem('usuarioId', data.usuarioId);

            if (data.tipoUsuario === 'admin') {
                console.log('Redirecionando para portal-admin.html');
                window.location.href = 'http://localhost:5000/portal-admin.html';
            } else {
                console.log('Redirecionando para usuario.html');
                window.location.href = 'http://localhost:5000/usuario.html';
            }
        } else {
            alert(data.message || 'Erro ao fazer login.');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro ao fazer login. Tente novamente.');
    }
}

async function registrarUsuario() {
    const novoUsuario = document.getElementById('novo-usuario').value.trim();
    const novaSenha = document.getElementById('nova-senha').value.trim();
    const tipoUsuario = document.querySelector('input[name="tipo-usuario"]:checked').value;

    if (!novoUsuario || novaSenha.length < 6 || !/[0-9]/.test(novaSenha) || !/[a-zA-Z]/.test(novaSenha)) {
        alert('Usuário ou senha inválidos.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: novoUsuario, senha: novaSenha, tipo: tipoUsuario }),
        });

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