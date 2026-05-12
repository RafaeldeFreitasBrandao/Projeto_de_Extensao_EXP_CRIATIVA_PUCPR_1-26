import { buscarMinhaConta, verificaSenha, atualizarMinhaConta } from "./api.js";

//Adiciona os dados do usuário quando a página carregar
window.addEventListener('load', async () => {

    const dados = await buscarMinhaConta();

    if(dados.erro) {
        document.getElementById('msg-info').textContent = dados.erro;
        return;
    }

    //Preenche os campos com os dados vindos do backend
    document.getElementById('user-name').value = dados.nome;
    document.getElementById('user-cpf').value = dados.CPF;
    document.getElementById('email').value = dados.email;
    document.getElementById('phone').value = dados.telefone;
    document.getElementById('ocuppation').value = dados.profissao;
    document.getElementById('local-unit').value = dados.unidade;
    

    //Campos bloqueados 
    document.getElementById('user-cpf').disabled = true;
    document.getElementById('ocuppation').disabled = true;

    // Campos bloqueados até a verificação da senha 
    document.getElementById('user-name').disabled = true;
    document.getElementById('email').disabled = true;
    document.getElementById('phone').disabled = true;
    document.getElementById('local-unit').disabled = true;
    document.getElementById('password').disabled = true;

});

let modoEdicao = false;

document.getElementById('edit-button').addEventListener('click', async() => {

    const msg = document.getElementById('msg-info');
    const btn = document.getElementById('edit-button');

    //Salva os dados editados, no Banco de Dados (aciona a função atualizarMinhaConta, dentro do users_controllers.js)

    if (modoEdicao) {
        const dados = {

            nome:       document.getElementById('user-name').value,
            email:      document.getElementById('email').value,
            telefone:   document.getElementById('phone').value,
            unidade:    document.getElementById('local-unit').value,
            senha:      document.getElementById('password').value,

        };

        const resposta = await atualizarMinhaConta(dados);

        if (resposta.erro) {

            msg.textContent = resposta.erro;
            return;

        }

        msg.textContent = 'Dados atualizados com sucesso!';
        btn.textContent = 'Editar'
        modoEdicao = false;

        document.getElementById('user-name').disabled  = true;
        document.getElementById('email').disabled      = true;
        document.getElementById('phone').disabled      = true;
        document.getElementById('local-unit').disabled = true;
        document.getElementById('password').disabled   = true;
        return;

    }

    // Verifica a senha e permite a edição (aciona o verficarSenha dentro do users_controllers.js)
    const senhaAtual = prompt('Digite sua senha atual para editar seus dados:');

    if (!senhaAtual)
        return;

    const resultado = await verificaSenha(senhaAtual);

    if (resultado.erro) {

        msg.textContent = resultado.erro;
        return;

    }

    document.getElementById('user-name').disabled  = false;
    document.getElementById('email').disabled      = false;
    document.getElementById('phone').disabled      = false;
    document.getElementById('local-unit').disabled = false;
    document.getElementById('password').disabled   = false;
    document.getElementById('password').value      = resultado.senha;

    btn.textContent = 'Salvar';
    modoEdicao = true;

});

