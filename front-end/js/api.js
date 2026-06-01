const BASE = 'http://localhost:3000/api';

//Funções para página do login

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


//Funções para a página da conta

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


//Funções para a página dos responsáveis

export async function listarResponsaveis() {
    const resposta = await fetch(`${BASE}/responsaveis`, {
        method: 'GET',
        headers: getHeaders(),
    });
    return resposta.json();
}

export async function criarResponsavel(dados) {
    const resposta = await fetch(`${BASE}/responsaveis`,{
        method: 'POST',
        headers: getHeaders(),
        body:JSON.stringify(dados)
    });
    return resposta.json();
}

export async function editarResponsavel(id,dados) {
    const resposta = await fetch(`${BASE}/responsaveis/${id}`, {
        method:'PUT',
        headers: getHeaders(),
        body:JSON.stringify(dados)
    });
    return resposta.json();
}

//Funções para a página dos pacientes

export async function listarPacientes() {
    const resposta = await fetch(`${BASE}/pacientes`, {
        method:'GET',
        headers:getHeaders()
    });
    return resposta.json();
}

export async function criarPaciente(dados) {
    const resposta = await fetch(`${BASE}/pacientes`, {
        method: 'POST',
        headers:getHeaders(),
        body:JSON.stringify(dados)
    });
    return resposta.json();
}

export async function editarPaciente(id,dados) {
    const resposta = await fetch(`${BASE}/pacientes/${id}`, {
        method:"PUT",
        headers:getHeaders(),
        body:JSON.stringify(dados)
    });
    return resposta.json();
}

export async function detalharPaciente(id) {
    const r = await fetch(`${BASE}/pacientes/${id}`, {
        method: 'GET', headers: getHeaders()
    });
    return r.json();
}

//Funções para os formulários 

export async function listarFormularios() {
    const resposta = await fetch(`${BASE}/formularios`, {
        method: 'GET',
        headers: getHeaders(),
    });
    return resposta.json();
}

export async function detalharFormulario(id) {
    const resposta = await fetch(`${BASE}/formularios/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    });
    return resposta.json();
}

export async function editarFormulario(id, dados) {
    const resposta = await fetch(`${BASE}/formularios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(dados)
    });
    return resposta.json();
}

export async function deletarFormulario(id) {
    const resposta = await fetch(`${BASE}/formularios/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return resposta.json();
}

//Funções para os comportamentos 

export async function listarComportamentos() {
    const resposta = await fetch(`${BASE}/comportamentos`, {
        method = 'GET',
        headers:getHeaders()
    });
    return resposta.json();
}