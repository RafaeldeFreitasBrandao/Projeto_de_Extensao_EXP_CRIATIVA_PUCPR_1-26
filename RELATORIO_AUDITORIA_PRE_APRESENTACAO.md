# Relatório de Auditoria Pré-Apresentação

**Projeto:** Sistema de apoio ao diagnóstico da Síndrome do X Frágil (Projeto de Extensão EXP CRIATIVA - PUCPR)
**Data da auditoria:** 11/06/2026
**Escopo:** Revisão completa de todos os arquivos do back-end (Node.js/Express/MySQL) e do front-end (HTML/CSS/JS) em busca de problemas que poderiam aparecer durante a apresentação.

---

## 1. Resumo executivo

Foi feita uma revisão linha a linha de:

- Todo o back-end: `server.js`, configuração de banco de dados, middlewares, rotas e **todos os controllers** (`pacientes`, `formulários`, `usuários`, `responsáveis`, `comportamentos`, `admin`).
- Todo o front-end: as 24 páginas HTML (área administrador e área usuário de saúde) e os respectivos scripts JS, verificando se os `id`s usados no HTML correspondem aos que o JavaScript espera, se os links de navegação apontam para arquivos que realmente existem, e se os caminhos de CSS/JS estão corretos.

No total foram encontrados e **corrigidos diretamente nos arquivos** 7 problemas (6 "bugs" identificados nesta etapa + 1 bug de CPF/RG já diagnosticado antes e agora aplicado). Todos são correções pequenas e localizadas — nenhuma tabela do banco, rota ou regra de negócio foi removida ou redesenhada, então o risco de algo "parar de funcionar" por causa dessas mudanças é baixo.

Além disso, foram identificados alguns pontos que **não foram alterados de propósito** (seção 4), por serem cosméticos, de baixo risco, ou por exigirem mudanças maiores demais para serem feitas com segurança a um dia da entrega.

> **Importante:** este projeto é um repositório Git. Para ver exatamente o que foi alterado em cada arquivo, basta rodar `git diff` na pasta do projeto. Se algo parecer estranho após as mudanças, qualquer arquivo individual pode ser revertido com `git checkout -- caminho/do/arquivo`.

---

## 2. Problemas corrigidos

### 2.1 Bug — CPF/RG aparecendo como "null" após editar um paciente
**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `editarPaciente`)

**Causa:** o `mysql2` converte valores `undefined` em `NULL` no banco. Como o `UPDATE` usava diretamente `cpf` e `rg` vindos do corpo da requisição, qualquer edição que não reenviasse esses campos apagava o CPF/RG do paciente (mostrando "null" na lista).

**Correção aplicada:** o `UPDATE` agora usa `cpf ?? old.CPF` e `rg ?? old.RG` (e o mesmo padrão para os demais campos), preservando o valor antigo quando o campo não é enviado.

---

### 2.2 Bug A — Admin não conseguia trocar a foto de pacientes cadastrados por usuários de saúde
**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `atualizarFotoPaciente`)

**Causa:** a verificação de permissão checava apenas `check[0].id_usuario_saude !== id_usuario`, sem considerar que o administrador pode gerenciar pacientes de qualquer usuário de saúde. Isso fazia a troca de foto retornar **403 (sem permissão)** sempre que um admin tentasse trocar a foto de um paciente que não foi cadastrado por ele.

**Correção aplicada:**
```js
// Antes:
if (check[0].id_usuario_saude !== id_usuario)
    return res.status(403).json({erro:'Sem permissão'});

// Depois:
if (req.usuario.perfil !== 'admin' && check[0].id_usuario_saude !== id_usuario)
    return res.status(403).json({erro:'Sem permissão'});
```

**Por que importava para a apresentação:** se durante a demo alguém logasse como administrador e tentasse usar o botão "Trocar foto" na página de detalhes de um paciente, o sistema retornaria erro.

---

### 2.3 Bug B — Exclusão de paciente podia falhar por violação de chave estrangeira
**Arquivo:** `back-end/server/controllers/pacients_controller.js` (função `excluirPaciente`)

**Causa:** ao excluir um paciente, o código tentava apagar diretamente os `formularios` vinculados, mas **não removia antes** os registros das tabelas `formulario_comportamento` e `resultado`, que referenciam `formularios` por chave estrangeira. Isso causaria um erro de banco (`ERROR 1451 - foreign key constraint fails`) ao tentar excluir qualquer paciente que já tivesse formulários preenchidos.

**Correção aplicada:** agora a exclusão segue a ordem correta:
1. `DELETE FROM formulario_comportamento WHERE id_formulario IN (... WHERE id_paciente = ?)`
2. `DELETE FROM resultado WHERE id_formulario IN (... WHERE id_paciente = ?)`
3. `DELETE FROM formularios WHERE id_paciente = ?`
4. `DELETE FROM pacientes WHERE id_paciente = ?`

**Por que importava para a apresentação:** este é provavelmente o cenário mais provável de ser testado ("vamos excluir um paciente de teste") e, sem essa correção, resultaria em erro 500 visível na tela.

---

### 2.4 Bug C — Link "Voltar" da página de detalhes de responsável (admin) levava a uma página inexistente
**Arquivo:** `front-end/js/guardian_dt_admin.js`

**Causa:** o redirecionamento usava `window.location.href = 'guardians_admin.html'` (no plural), mas o arquivo real se chama `guardian_admin.html` (singular). Isso resultaria em uma página "404 Not Found" do servidor de arquivos estáticos.

**Correção aplicada:** `'guardians_admin.html'` → `'guardian_admin.html'`.

---

### 2.5 Bug D — Erro de digitação no `id` do preview de foto (pacientes)
**Arquivos:** `front-end/js/pacient.js` e `front-end/js/pacient_admin.js`

**Causa:** o código chamava `document.getElementById('fotoPreviw')` (faltando o "e"), mas o `id` real no HTML é `fotoPreview`. Isso gerava `TypeError: Cannot set properties of null` no console sempre que o usuário selecionava uma foto ao cadastrar um paciente, e o preview da imagem não aparecia.

**Correção aplicada:** `'fotoPreviw'` → `'fotoPreview'` nos dois arquivos.

---

### 2.6 Bug E — Links do menu lateral da conta do administrador quebrados
**Arquivo:** `front-end/pages/pages_admin/account_admin.html`

**Causa:** dois links de navegação apontavam para nomes de arquivo incorretos:
- `href="form_admin.html"` (deveria ser `forms_admin.html`)
- `href="guardians_admin.html"` (deveria ser `guardian_admin.html`)

Ambos resultariam em "404 Not Found" ao clicar.

**Correção aplicada:** os dois `href` foram corrigidos para os nomes de arquivo reais (`forms_admin.html` e `guardian_admin.html`).

---

### 2.7 Bug F — Painel administrativo (`dashboard_admin.html`) e página de logs com caminhos absolutos inconsistentes
**Arquivos:** `front-end/pages/pages_admin/dashboard_admin.html` e `front-end/pages/pages_admin/logs_admin.html`

**Causa:** essas duas páginas referenciavam CSS/JS com caminhos **absolutos** a partir da raiz do servidor (`/front-end/css/...`, `/front-end/js/...`), enquanto **todas as outras 22 páginas** do projeto usam caminhos **relativos** (`../../css/...`, `../../js/...`). Como o `server.js` do back-end não serve a pasta `/front-end` (ele só serve `/uploads`), esses caminhos absolutos só funcionariam se o servidor de arquivos do front-end (ex.: Live Server) estivesse configurado com uma raiz específica — o que normalmente **não** é o caso.

**Por que importava para a apresentação:** `dashboard_admin.html` é a **página principal do administrador** após o login. Se os caminhos absolutos não resolverem corretamente no ambiente usado na apresentação, o painel ficaria sem estilo (CSS não carrega) e sem funcionalidade (JS não carrega, incluindo o "Log de Edição"). A página de logs teria o mesmo problema com o JS.

**Correção aplicada:** todos os 4 caminhos (2 `<link>` de CSS e 1 `<script>` em `dashboard_admin.html`, e 1 `<script>` em `logs_admin.html`) foram convertidos para o padrão relativo `../../...` usado no resto do projeto.

---

## 3. Verificação de sintaxe

Os arquivos alterados foram verificados (`node --check`) para garantir que não há nenhum erro de sintaxe JavaScript introduzido pelas correções. Todos passaram.

Não foi possível rodar um teste de ponta a ponta completo (subir o servidor conectado ao banco MySQL real) dentro deste ambiente de auditoria, pois ele não tem acesso ao banco de dados local do projeto. **Recomenda-se fortemente** rodar o projeto localmente antes da apresentação seguindo a seção 5.

---

## 4. Observações que NÃO foram corrigidas (de propósito)

Estes pontos foram identificados durante a auditoria, mas **não representam risco de quebra durante a apresentação** e/ou exigiriam mudanças maiores e mais arriscadas a um dia da entrega. Ficam aqui apenas como registro:

### 4.1 Senhas armazenadas em texto puro (sem hash)
**Arquivos:** `back-end/server/controllers/usuarios_controller.js` e `back-end/server/controllers/admin_controller.js` (função `verificaSenha`), usados por `front-end/js/account.js` e `front-end/js/account_admin.js`.

A coluna `senha_hash` no banco, apesar do nome, guarda a senha em **texto puro**, e a comparação de login/verificação é feita com `senha === rows[0].senha_hash` (sem `bcrypt`, mesmo sendo uma dependência do projeto). Ao confirmar a senha atual para editar a conta, o backend devolve essa senha em texto puro, que é exibida no campo de senha da tela.

**Por que não foi corrigido agora:** esse é um padrão usado de forma consistente em **todo** o sistema de autenticação (usuários de saúde e administradores). Trocar para hash com `bcrypt` exigiria re-cadastrar/re-hashear as senhas de todos os usuários já existentes no banco e ajustar login e verificação em vários arquivos ao mesmo tempo — um risco real de impedir o login de todo mundo durante a apresentação. Funcionalmente, isso **não causa erro nem tela em branco** (o fluxo de edição de conta continua funcionando normalmente).

**Recomendação:** mencionar como "trabalho futuro" se perguntarem sobre segurança, e tratar como prioridade após a entrega.

### 4.2 IDs duplicados no HTML das páginas de formulário
**Arquivos:** `front-end/pages/pages_users/forms_user.html` e `front-end/pages/pages_admin/forms_admin.html`

Os atributos `id="title_ppl"` (2x) e `id="text_question"` (12x) se repetem na página. Isso é HTML tecnicamente inválido, mas **inofensivo** aqui, porque nenhum script faz `getElementById` nesses elementos — apenas seletores de classe (`.btn_ys`) são usados.

### 4.3 Painel "Detalhes" inacessível nas páginas de responsáveis
**Arquivo:** `front-end/js/guardian.js` / páginas de responsáveis

Existe um painel `#detalhes` com função `fecharDetalhes()` que nunca é aberto por nenhum botão visível — código morto, sem impacto visual ou funcional.

### 4.4 Campo "Data de Cálculo" sempre vazio nos detalhes de resultado
**Páginas:** `report_detail_user.html` / `report_detail_admin.html`

O campo `data_calculo` aparece desabilitado e nunca é preenchido (provavelmente a API não retorna esse dado). É puramente visual/cosmético — não gera erro.

---

## 5. Recomendações de teste manual antes da apresentação

Sugestão de roteiro rápido (15-20 min) para validar o sistema com o banco real, de preferência hoje ainda:

1. Subir o backend (`npm start` dentro de `back-end/server`) e o front-end (Live Server ou similar).
2. **Login** como usuário de saúde e como administrador (testa `login.html`/`auth.js`).
3. **Cadastrar um paciente** novo, com foto, e confirmar que aparece na lista.
4. **Editar o paciente** (nome, sexo, data) e confirmar que CPF/RG continuam aparecendo corretamente na lista (Correção 2.1).
5. **Trocar a foto** do paciente logado como administrador, em um paciente cadastrado por outro usuário (Correção 2.2).
6. **Preencher um formulário** de comportamento para esse paciente e ver o resultado calculado.
7. **Excluir o paciente de teste** criado no passo 3, como último passo, para validar a correção 2.3 sem perder dados reais.
8. Navegar pelo **painel administrativo** (`dashboard_admin.html`) logo após o login do admin e confirmar que o layout e o "Log de Edição" carregam corretamente (Correção 2.7).
9. Na conta do administrador, clicar em cada item do menu lateral (Dashboard, Formulários, Responsáveis, Pacientes, Relatórios, Usuários) para confirmar que nenhum dá 404 (Correção 2.6).
10. Na página de detalhes de um responsável (admin), clicar em "Voltar" e confirmar que volta para a lista de responsáveis, não uma página 404 (Correção 2.4).

---

## 6. Lista de arquivos alterados nesta auditoria

| Arquivo | Alteração |
|---|---|
| `back-end/server/controllers/pacients_controller.js` | Correções 2.1, 2.2 e 2.3 (CPF/RG, foto por admin, exclusão de paciente) |
| `front-end/js/guardian_dt_admin.js` | Correção 2.4 (link "Voltar") |
| `front-end/js/pacient.js` | Correção 2.5 (`fotoPreviw` → `fotoPreview`) |
| `front-end/js/pacient_admin.js` | Correção 2.5 (`fotoPreviw` → `fotoPreview`) |
| `front-end/pages/pages_admin/account_admin.html` | Correção 2.6 (links do menu lateral) |
| `front-end/pages/pages_admin/dashboard_admin.html` | Correção 2.7 (caminhos CSS/JS relativos) |
| `front-end/pages/pages_admin/logs_admin.html` | Correção 2.7 (caminho do script relativo) |

Todas as alterações podem ser revisadas com `git diff` na raiz do projeto.

---

## 7. Conclusão

O sistema estava, em sua maioria, bem estruturado e consistente. Os problemas encontrados eram pequenos e localizados (links/IDs incorretos, uma verificação de permissão faltante e uma ordem de exclusão no banco), e todos foram corrigidos sem alterar a arquitetura, o banco de dados ou o comportamento esperado das funcionalidades já existentes. Com o roteiro de testes da seção 5 executado uma vez antes da apresentação, o projeto deve estar em condições apresentáveis.
