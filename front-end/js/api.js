const BASE = 'http://localhost:3000/api';

export async function login(nome_usuario, senha) {
    const resposta = await fetch(
        `${BASE}/auth/login`,{
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({nome_usuario, senha})  
        });
    return resposta.json();
    
}

function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    };
}


export async function buscarMinhaConta() {
    const resposta = await fetch(`${BASE}/usuarios/minha-conta`, {
        method: 'GET',
        headers: getHeaders()
    });

    return resposta.json();
}

export async function verificaSenha(senha) {
    const resposta = await fetch(`${BASE}/usuarios/verificar-senha`, {
        method: 'POST',
        headers:getHeaders(),
        body: JSON.stringify({senha})
    });
    return resposta.json();
}

export async function atualizarMinhaConta(dados) {
    const resposta = await fetch (`${BASE}/usuarios/minha-conta`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    return resposta.json();
}