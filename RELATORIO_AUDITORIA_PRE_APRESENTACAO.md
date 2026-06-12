# Relatório de Auditoria Pré-Apresentação

**Projeto:** Sistema de apoio ao diagnóstico da Síndrome do X Frágil (Extensão PUCPR)
**Data da auditoria:** 11–12/06/2026
**Escopo:** Revisão completa do back-end (Node.js/Express + MySQL) e do front-end (HTML/CSS/JS) do projeto, com o objetivo de encontrar e corrigir, sem comprometer a estrutura existente, os principais problemas que poderiam aparecer durante a apresentação.

---

## 1. Resumo executivo

Foi feita uma revisão linha a linha de todos os controllers, rotas, middlewares e arquivos de configuração do back-end, além de todas as páginas HTML e scripts JS do front-end (usuário comum e administrador).

Foram encontrados e corrigidos **9 problemas** (listados na seção 2), todos de baixo risco estrutural — ou seja, nenhuma correção exigiu alterar o modelo de dados, as rotas existentes ou o fluxo geral do sistema. Além disso, a seção 4 lista **observações que NÃO foram corrigidas** (por serem cosméticas, sistêmicas demais para o prazo, ou de baixo impacto na apresentação), para que você esteja ciente delas caso apareçam durante a demonstração.

A seção 5 traz um roteiro de teste manual recomendado para rodar uma vez antes da apresentação.

**Importante:** todas as alterações foram aplicadas diretamente nos arquivos do projeto (conforme solicitado). Como o projeto está em um repositório git, você pode:
- Ver exatamente o que mudou em cada arquivo com `git diff`;
- Reverter qualquer alteração específica com `git checkout -- <arquivo>`, caso ela cause algum problema inesperado.

---

## 2. Problemas corrigidos

### 2.1 CPF/RG zerados ao editar um paciente

**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `editarPaciente`)

**Causa:** ao editar um paciente alterando apenas alguns campos (ex.: só o nome), os campos não enviados no `req.body` (como `cpf`, `rg`, `data_nascimento`, `sexo`) chegavam como `undefined`. O `UPDATE` estava sendo montado usando esses valores diretamente, o que fazia o MySQL sobrescrever CPF e RG existentes com `NULL`.

**Correção aplicada:** ao montar os valores do `UPDATE`, cada campo passou a usar o operador `??` (nullish coalescing) para manter o valor antigo quando o novo não for enviado:

```js
[
    nome ?? old.nome,
    cpf ?? old.CPF,
    rg ?? old.RG,
    dataNascimento ?? dataNascAntiga,
    sexo ?? old.sexo,
    id
]
```

**Por que importava para a apresentação:** sem essa correção, qualquer edição parcial de um paciente (por exemplo, só trocar o nome) apagaria o CPF e o RG dele, o que ficaria muito visível numa demonstração ao vivo.

---

### 2.2 Foto do paciente não podia ser atualizada pelo administrador

**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `atualizarFotoPaciente`)

**Causa:** a verificação de permissão checava apenas se `check[0].id_usuario_saude === id_usuario`, sem considerar o caso em que quem está logado é um **administrador** (que não tem `id_usuario_saude`). Com isso, o administrador recebia "Sem permissão" ao tentar trocar a foto de qualquer paciente.

**Correção aplicada:** a verificação passou a liberar o acesso quando `req.usuario.perfil === 'admin'`, seguindo o mesmo padrão de bypass de dono usado nas demais funções do controller (`detalharPaciente`, `editarPaciente`, `excluirPaciente`).

**Por que importava para a apresentação:** se a demonstração incluir o login como administrador trocando a foto de um paciente, sem essa correção a operação falharia com erro 403.

---

### 2.3 Excluir paciente deixava registros "órfãos" no banco

**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `excluirPaciente`)

**Causa:** ao excluir um paciente, o código apagava diretamente a linha de `pacientes`, sem remover antes os registros relacionados em `formulario_comportamento` e `resultado` (que referenciam `formularios`, que por sua vez referenciam o paciente). Dependendo das constraints do banco, isso podia gerar erro de chave estrangeira (impedindo a exclusão) ou deixar dados "fantasmas" associados a um paciente que não existe mais.

**Correção aplicada:** antes de excluir o paciente, o código agora remove em cascata, na ordem correta:

```js
await db.query(`DELETE FROM formulario_comportamento WHERE id_formulario IN (SELECT id_formulario FROM formularios WHERE id_paciente = ?)`, [id]);
await db.query(`DELETE FROM resultado WHERE id_formulario IN (SELECT id_formulario FROM formularios WHERE id_paciente = ?)`, [id]);
await db.query(`DELETE FROM formularios WHERE id_paciente = ?`, [id]);
```

(mesmo padrão já usado em `excluirResponsavel`)

**Por que importava para a apresentação:** evita que uma exclusão de paciente durante a demo retorne erro 500 (caso o banco tenha as constraints de FK ativas) ou deixe dados inconsistentes visíveis em outras telas.

---

### 2.4 Link "Detalhes" quebrado na lista de responsáveis (admin)

**Arquivo:** `front-end/js/guardian_dt_admin.js`

**Causa:** o link de retorno/redirecionamento apontava para `guardians_admin.html` (com "s" depois de "guardian"), mas o arquivo real da página de listagem se chama `guardian_admin.html` (sem "s"). Isso resultava em uma página 404 ao clicar em "Voltar"/"Detalhes" a partir da tela de detalhes de um responsável, no painel do administrador.

**Correção aplicada:** o caminho foi corrigido para `guardian_admin.html`, igualando ao nome real do arquivo.

**Por que importava para a apresentação:** um link quebrado levando a uma página "não encontrada" é um dos erros mais visíveis e fáceis de acontecer durante uma navegação ao vivo.

---

### 2.5 Pré-visualização da foto do paciente não funcionava

**Arquivos:** `front-end/js/pacient.js` e `front-end/js/pacient_admin.js`

**Causa:** havia uma inconsistência de nome entre o `id` usado no HTML (`fotoPreview`) e o identificador usado no JavaScript (`fotoPreviw`, com erro de digitação). Como `document.getElementById('fotoPreviw')` não encontrava nenhum elemento, a pré-visualização da imagem escolhida para o paciente nunca aparecia.

**Correção aplicada:** o identificador no JavaScript foi corrigido de `fotoPreviw` para `fotoPreview`, igualando ao `id` real do `<img>` no HTML.

**Por que importava para a apresentação:** ao demonstrar o cadastro de um paciente com foto, a pré-visualização da imagem simplesmente não apareceria, dando a impressão de que o recurso não funciona (mesmo que o upload em si funcionasse).

---

### 2.6 Links do menu lateral quebrados na página "Minha Conta" (admin)

**Arquivo:** `front-end/pages/pages_admin/account_admin.html`

**Causa:** os links do menu lateral apontavam para nomes de arquivo que não existem:
- `form_admin.html` → o arquivo correto é `forms_admin.html`
- `guardians_admin.html` → o arquivo correto é `guardian_admin.html`

**Correção aplicada:** os dois links foram corrigidos para apontar para os nomes de arquivo reais (`forms_admin.html` e `guardian_admin.html`).

**Por que importava para a apresentação:** esses são links de navegação principal, visíveis em praticamente toda página do painel admin — um clique neles durante a demo levaria a um 404.

---

### 2.7 CSS e scripts não carregavam em algumas páginas do admin

**Arquivos:** `front-end/pages/pages_admin/dashboard_admin.html` e `front-end/pages/pages_admin/logs_admin.html`

**Causa:** essas páginas referenciavam os arquivos de CSS/JS com caminhos absolutos (ex.: `/css/...`, `/js/...`), enquanto as demais páginas do projeto usam caminhos relativos (`../../css/...`, `../../js/...`). Como o front-end é servido como arquivos estáticos (sem um servidor configurado para resolver caminhos absolutos a partir da raiz do front-end), esses caminhos absolutos resultavam em folhas de estilo e scripts não encontrados — a página carregava sem estilo (ou com o script não executando).

**Correção aplicada:** os caminhos foram convertidos para o padrão relativo `../../` usado em todas as outras páginas do projeto.

**Por que importava para a apresentação:** o dashboard do administrador e a tela de logs são páginas centrais da demo — aparecerem "sem estilo" (ou sem funcionalidade JS) seria um problema visual imediato e perceptível por qualquer pessoa assistindo.

---

### 2.8 Bug G — CPF de responsável aparece como "undefined" ao cadastrar (some após recarregar a página)

**Arquivo:** `back-end/server/controllers/guardians_controller.js` (função `criarResponsavel`)

**Causa:** `listarResponsaveis` e `detalharResponsavel` devolvem o campo do CPF como `CPF` (maiúsculo, direto da coluna do banco), e é assim que `front-end/js/guardian.js` e `guardian_admin.js` leem o valor (`r.CPF`) ao montar a lista. Porém `criarResponsavel` devolvia esse mesmo dado como `cpf` (minúsculo, herdado do `req.body`). Como o item recém-criado é inserido na lista usando diretamente a resposta de `criarResponsavel` (sem recarregar a página), `r.CPF` ficava `undefined` para esse item — e só passava a aparecer corretamente depois de recarregar a página (quando os dados vêm de `listarResponsaveis`, com `CPF` maiúsculo).

**Correção aplicada:**

```js
// Antes:
res.status(201).json({
    ok:true,
    id_responsavel: result.insertId,
    nome, cpf, email, telefone, grau
});

// Depois:
res.status(201).json({
    ok:true,
    id_responsavel: result.insertId,
    nome, CPF: cpf, email, telefone, grau
});
```

Essa mudança corrige o problema tanto na tela de usuário de saúde (`guardian_user.html`) quanto na do administrador (`guardian_admin.html`), já que ambas chamam o mesmo endpoint e leem `r.CPF`.

---

### 2.9 Bug H — Dados do paciente aparecem como "undefined" ao cadastrar (some após recarregar a página)

**Arquivos:** `front-end/js/pacient.js` e `front-end/js/pacient_admin.js` (função `salvarPaciente`)

**Causa:** ao cadastrar um novo paciente, o item era inserido na lista usando diretamente a resposta de `criarPaciente`, que **não** contém todos os campos retornados por `listarPacientes`. Em particular:
- Na tela do administrador, `listarPacientes` retorna `nome_usuario` (quem cadastrou o paciente, via `JOIN` com `usuarios_saude`/`administradores`), mas `criarPaciente` não devolve esse campo — então a linha "Cadastrado por: ..." aparecia como `undefined` para o paciente recém-criado.
- De forma geral, qualquer diferença entre o formato da resposta de `criarPaciente` e o de `listarPacientes` faz com que o item recém-criado seja exibido com campos faltando/`undefined`, até a página ser recarregada (quando os dados passam a vir de `listarPacientes`, completos).

Esse é o mesmo padrão de causa do Bug G (2.8): a tela usa diretamente a resposta do "criar", que tem um formato diferente do "listar".

**Correção aplicada:** em vez de inserir a resposta de `criarPaciente` diretamente na lista, o front-end agora recarrega a lista completa do servidor (`listarPacientes`) após o cadastro ser confirmado, garantindo que o item novo apareça com exatamente os mesmos campos que apareceriam após recarregar a página:

```js
// Antes:
pacientes.push(resultado);
renderizarLista();
fecharFormulario();

// Depois:
const dados = await listarPacientes();
if (!dados.erro) {
    pacientes.length = 0;
    dados.forEach(r => pacientes.push(r));
} else {
    pacientes.push(resultado);
}
renderizarLista();
fecharFormulario();
```

Essa correção foi aplicada nas duas telas (usuário de saúde e administrador), pois ambas tinham o mesmo padrão de código.

**Observação:** foi feito também um teste isolado do envio do formulário (multipart/form-data com `multer`) confirmando que o campo `cpf` chega corretamente ao back-end e é salvo no banco normalmente — o problema era exclusivamente de exibição imediata na tela, não de perda de dados.

---

## 3. Verificação de sintaxe

Todos os arquivos editados foram verificados com `node --check` (sintaxe JavaScript válida). Como o ambiente de auditoria não tem acesso ao banco de dados MySQL configurado no `.env`, não foi possível executar um teste de ponta a ponta completo (login → cadastro → listagem → edição → exclusão) com banco real. Em vez disso:

- A lógica de cada correção foi revisada manualmente, comparando o comportamento "antes" e "depois" linha a linha;
- Para o Bug H, foi feito um teste isolado do middleware `multer`/`multipart-form-data` num servidor de teste, confirmando que o campo `cpf` chega corretamente em `req.body`.

**Recomendação:** rode o roteiro de teste manual da seção 5 localmente (com o banco conectado) ao menos uma vez antes da apresentação.

---

## 4. Observações que NÃO foram corrigidas

### 4.1 Senhas armazenadas em texto puro

Tanto `usuarios_saude` quanto `administradores` armazenam a senha em texto puro na coluna `senha_hash` (o nome da coluna sugere hash, mas a comparação é feita com `senha === rows[0].senha_hash`, ou seja, comparação direta de texto). Além disso, as telas de "Minha Conta" (`account.js`/`account_admin.js`) exibem essa senha em texto puro no campo de senha após verificar a senha atual.

**Por que não foi corrigido agora:** essa é uma mudança estrutural (exigiria hashing com `bcrypt`, migração dos dados existentes e ajuste do fluxo de login/verificação em vários controllers). É um problema sério de segurança, mas mudar isso a um dia da apresentação tem alto risco de quebrar o login. Recomenda-se tratar isso como item de melhoria futura, fora do prazo da entrega.

### 4.2 IDs duplicados em páginas de formulário

As páginas de formulário de comportamento têm elementos com IDs duplicados (`title_ppl`, `text_question`) repetidos para cada pergunta. Isso é tecnicamente inválido em HTML, mas como o JavaScript não depende desses IDs duplicados para funcionar (usa seletores por classe/posição), não há impacto funcional visível. Corrigir exigiria renomear todos os IDs e ajustar o CSS associado — risco desnecessário para o prazo.

### 4.3 Painel "Detalhes" sem funcionalidade nas páginas de responsáveis

Nas páginas de responsáveis existe um painel/seção de "Detalhes" que não está conectado a nenhuma ação (não busca nem exibe dados). Não chega a gerar erro — é apenas um elemento visualmente presente mas inerte. Pode ser ignorado ou ocultado via CSS se for notado durante a demo, mas não compromete o funcionamento das outras telas.

### 4.4 Campo "data_calculo" vazio nas páginas de detalhe de relatório

As páginas de detalhe de relatório possuem um campo `data_calculo` que aparece vazio/sem uso. Não gera erro, apenas não exibe nenhuma informação. Corrigir exigiria definir de onde esse dado deveria vir (não há essa informação no banco atualmente), o que está fora do escopo de uma correção pontual.

---

## 5. Roteiro de teste manual recomendado

Antes da apresentação, rode localmente (com o back-end conectado ao banco) o seguinte roteiro:

1. Fazer login como **usuário de saúde** (perfil comum).
2. Cadastrar um novo **responsável** e confirmar que o CPF aparece corretamente na lista imediatamente (sem precisar recarregar).
3. Cadastrar um novo **paciente**, com foto, e confirmar que:
   - A pré-visualização da foto aparece ao escolher o arquivo;
   - O item aparece na lista com CPF correto (sem `undefined`), sem precisar recarregar.
4. Editar esse paciente alterando **apenas o nome** e confirmar que o CPF e o RG continuam aparecendo corretamente depois.
5. Excluir esse paciente e confirmar que a exclusão funciona sem erro (mesmo que ele tenha formulários associados).
6. Fazer logout e login como **administrador**.
7. No painel do administrador, navegar pelo menu lateral a partir da tela "Minha Conta" e confirmar que todos os links abrem a página correta (sem 404).
8. Verificar que o **dashboard do administrador** e a tela de **logs** carregam com o estilo (CSS) aplicado corretamente.
9. Como administrador, trocar a foto de um paciente já existente e confirmar que a operação funciona (sem erro 403).
10. Cadastrar um novo paciente como administrador e confirmar que a linha "Cadastrado por: ..." aparece com o nome correto (não `undefined`), sem precisar recarregar.

---

## 6. Lista de arquivos alterados

| Arquivo | Correção |
|---|---|
| `back-end/server/controllers/pacients_controller.js` | 2.1 (CPF/RG = null ao editar paciente), 2.2 (foto — bypass admin), 2.3 (exclusão em cascata) |
| `front-end/js/guardian_dt_admin.js` | 2.4 (link "Detalhes" quebrado) |
| `front-end/js/pacient.js` | 2.5 (typo `fotoPreviw` → `fotoPreview`), 2.9 (Bug H — recarregar lista após cadastro) |
| `front-end/js/pacient_admin.js` | 2.5 (typo `fotoPreviw` → `fotoPreview`), 2.9 (Bug H — recarregar lista após cadastro) |
| `front-end/pages/pages_admin/account_admin.html` | 2.6 (links do menu lateral) |
| `front-end/pages/pages_admin/dashboard_admin.html` | 2.7 (caminhos CSS/JS relativos) |
| `front-end/pages/pages_admin/logs_admin.html` | 2.7 (caminhos CSS/JS relativos) |
| `back-end/server/controllers/guardians_controller.js` | 2.8 (Bug G — CPF "undefined" ao cadastrar responsável) |

Todas as alterações podem ser revisadas com `git diff` na raiz do projeto, e revertidas individualmente com `git checkout -- <arquivo>` caso necessário.

---

## 7. Conclusão

O sistema está bem estruturado: a separação entre controllers, rotas e middlewares é clara, e o padrão de "dupla titularidade" (usuário de saúde / administrador) é aplicado de forma consistente na maior parte do código. Os problemas encontrados foram pontuais e localizados — a maioria causada por pequenas inconsistências de nomes de campos/arquivos (diferenças de maiúsculas/minúsculas, nomes de arquivo, caminhos de CSS) — e nenhuma correção exigiu alterar a arquitetura geral do projeto.

Recomenda-se rodar o roteiro de teste manual da seção 5 ao menos uma vez antes da apresentação, para confirmar que tudo está funcionando com o banco real conectado.
