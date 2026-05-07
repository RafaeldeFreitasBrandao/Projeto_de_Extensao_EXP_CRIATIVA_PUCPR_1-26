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