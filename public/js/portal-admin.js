function logout() {
    sessionStorage.clear();
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    const tipoUsuario = sessionStorage.getItem('tipoUsuario');

    if (!usuarioLogado || tipoUsuario !== 'admin') {
        window.location.href = '/index.html';
    }
});