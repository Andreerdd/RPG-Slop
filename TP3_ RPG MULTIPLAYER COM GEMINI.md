

# **TP3: RPG MULTIPLAYER COM GEMINI**

## 

## **1\. Visão Geral do Produto**

Vocês construirão uma plataforma web de **RPG de Texto Multiplayer Cooperativo em Tempo Real**, onde o **Google Gemini** atua como o **Mestre do Jogo (Game Master)** e interpreta todos os **NPCs (personagens não jogáveis)**.  
Além da narrativa textual adaptativa, o sistema explora capacidades multimodais e generativas de imagem (*Nano Banana / Imagen via Google GenAI*):

> 1. **Personagens Únicos:** O jogador descreve a aparência visual do seu personagem e o sistema gera o retrato/avatar via IA.  
> 2. **Criação de Salas e Universo Procedural:** O primeiro jogador a criar/entrar na sala define o **nome da aventura e o tema/cenário livre** (ex.: *"Cyberpunk Barroco em Ouro Preto"*, *"Estação espacial abandonada nos anéis de Saturno"*, *"Fantasia sombria em catacumbas esquecidas"*).  
> 3. **Mapas e Cenários Vivos:** O Gemini estrutura a história, projeta os locais/mapas da campanha e gera a **descrição rica e a imagem ilustrada de cada mapa/cenário** conforme o grupo explora o mundo.  
> 4. **Interação 100% Textual em Tempo Real:** As ações dos jogadores são enviadas via chat/WebSocket, o servidor processa o estado do jogo e o Gemini narra os desfechos, diálogos e reações do mundo.

## **2\. Dinâmica e Regras do Jogo**

```
                     ┌──────────────────────────────────────────────┐
                     │ 1º Jogador cria a Sala                       │
                     │ Nome: "Ruínas de Sabará 2099"                │
                     │ Tema: Sci-Fi distópico com folclore mineiro  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │ Gemini (Mestre do Jogo)                      │
                     │ 1. Cria a lore inicial e objetivo            │
                     │ 2. Projeta os mapas/locais da campanha       │
                     │ 3. Descreve o 1º mapa e gera sua imagem      │
                     └──────────────────────┬───────────────────────┘
                                            │
           ┌────────────────────────────────┴────────────────────────────────┐
           ▼                                                                 ▼
┌─────────────────────────────────┐                       ┌─────────────────────────────────┐
│ Jogador 1 (Ana)                 │                       │ Jogador 2 (Bruno)               │
│ Personagem: Mecânica Cibernética│                       │ Personagem: Andarilho Mutante   │
│ Retrato gerado por IA           │                       │ Retrato gerado por IA           │
└────────────────┬────────────────┘                       └────────────────┬────────────────┘
                 │                                                         │
                 └──────────────────────────┬──────────────────────────────┘
                                            │ Ações de turno enviadas via WebSocket
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Servidor Node.js + Express            │
                        │ - Valida regras, atributos e dados    │
                        │ - Monta contexto (Cena + Fichas)      │
                        │ - Invoca Gemini (Narração + Imagens)  │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Broadcast para todos na sala:         │
                        │ Nova narração + mapa atualizado       │
                        └───────────────────────────────────────┘
```

### **2.1 Criação do Personagem (com Retrato por IA)**

* O jogador cadastra nome, classe, atributos e escreve a **descrição física/estética detalhada** do personagem.  
* O back-end orquestra a geração de imagem (via Gemini / Imagen / Nano Banana) usando a descrição do jogador combinada a um prompt de estilo padronizado pelo grupo (ex.: *"concept art, digital painting, dark fantasy character portrait"*).  
* A imagem gerada é vinculada à ficha do personagem e persistida no banco/armazenamento.

### **2.2 Criação da Campanha e Geração de Mapas**

* **O Host (1º Jogador):** Define o nome da sala e descreve o tema e tom da narrativa.  
* **Geração do Mundo pelo Gemini:**  
  1. A IA formula o prelúdio da campanha, o objetivo principal e uma sequência/árvore de **locais/mapas**.  
  2. Para o local inicial (e para cada novo mapa visitado), a IA devolve:  
     * **Nome do local** (ex.: *Nave Central da Basílica Abandonada*);  
     * **Descrição sensorial/narrativa** para o chat;  
     * **Prompt descritivo** para a geração da imagem daquele cenário.  
  3. O servidor gera a imagem do mapa via IA e envia para os navegadores de todos os jogadores da sala.

### **2.3 Turnos e Condução dos NPCs**

* Todos os diálogos e ações acontecem via texto.  
* Se os jogadores encontram um NPC, é o Gemini quem interpreta a fala e as reações dele, mantendo consistência com o tema da sala.  
* **O servidor manda nas regras:** Vida, dados (D20/testes de perícia), inventário e transição de mapas são controlados no Node.js; a IA narra o resultado dos números, nunca o contrário.

## **3\. Requisitos Técnicos Obrigatórios**

> 1. **Front-End Responsivo:** Interface limpa sem frameworks pesados (HTML5 semântico, CSS3 flex/grid ou Bootstrap, JS Vanilla/AJAX). Deve conter:  
   * Painel do Cenário/Mapa Atual (com a imagem gerada em destaque);  
   * Mural de Narrativa e Ações em tempo real;  
   * Ficha do Personagem com avatar gerado pela IA e status;  
   * Campo de entrada de ações e diálogos.  
> 2. **Back-End Estruturado:** Node.js com Express em arquitetura MVC ou camadas de serviço bem delimitadas.  
> 3. **Comunicação em Tempo Real:** WebSockets (Socket.io) para sincronizar mensagens, imagens de salas e fichas instantaneamente entre todos os participantes.  
> 4. **Banco de Dados Relacional:** SQLite, PostgreSQL ou MySQL com chaves estrangeiras (usuarios, personagens, salas, mapas\_cenarios, mensagens).  
> 5. **Autenticação Segura:** Login com hash de senha (bcrypt) e rotas privadas protegidas por sessão ou JWT.  
> 6. **Integração com Gemini API (@google/genai):**  
   * Chave mantida **estritamente no back-end** (*.env*).  
   * Geração de texto (Mestre/NPCs) e orquestração de imagens (Nano Banana / Imagen) isoladas em serviços no servidor.  
   * Tratamento de erro 429 (*Rate Limit*) com avisos elegantes na UI.

## **4\. O que Entregar ao Final do Trabalho**

A entrega é composta por três artefatos obrigatórios enviados no Google Classroom até **09/11 às 23:59**:

```
📦 ENTREGA FINAL
├── 1. Arquivo ZIP do Projeto (codigo-fonte-grupo-X.zip)
├── 2. Vídeo de Demonstração (Link do YouTube / Drive)
└── 3. Apresentação em PDF (slides-grupo-X.pdf)
```

### **4.1 Arquivo .zip com o Código-Fonte**

* Deve conter todo o código do projeto, *package.json*, migrações/scripts SQL e a pasta *docs/*.  
* **ATENÇÃO:** **NÃO inclua a pasta node\_modules nem o arquivo .env dentro do zip\!**  
* Deve conter o arquivo *.env.example* preenchido com os nomes das variáveis necessárias.  
* O projeto deve rodar localmente com os comandos de terminal abaixo:

```sh
npm install
npm start
```

### 

### **4.2 Vídeo de Demonstração (Duração: 4 a 6 minutos)**

O vídeo deve ser gravado pela equipe (com link público ou não listado no YouTube/Drive) demonstrando:

> 1. **Cadastro e Criação de Personagem:** Mostrando o input da descrição e a imagem do avatar sendo gerada pela IA.  
> 2. **Criação da Sala pelo 1º Jogador:** Digitando o tema/universo e mostrando o Gemini criando a história, a descrição do mapa e a imagem do cenário.  
> 3. **Dois Navegadores em Tempo Real:** O segundo jogador entrando pelo código da sala e ambos interagindo via chat em tempo real com narração do Mestre.  
> 4. **Visão Técnica Rápida:** Demonstração do arquivo *.env.example*, da rota no Express que chama a IA e da proteção de chaves.

### **4.3 Apresentação em Slides (Formato PDF)**

Um arquivo PDF objetivo (máximo de 10 a 12 slides) estruturado para apoiar a apresentação ao vivo do dia 10/11:

* **Slide 1:** Título do jogo, tema e integrantes (com indicação de papéis no Scrum).  
* **Slide 2:** Arquitetura do sistema (Diagrama: Front ↔ WebSockets/Express ↔ Banco ↔ Gemini/Nano Banana).  
* **Slide 3:** Modelo do Banco de Dados Relacional.  
* **Slide 4:** Pipeline de IA: Engenharia de prompt para o Mestre do Jogo e prompts para geração de imagens (personagem e cenários).  
* **Slide 5-6:** Telas principais do jogo com exemplos de imagens geradas.  
* **Slide 7:** Desafios técnicos enfrentados (latência de imagem, rate limit 429, sincronização).  
* **Slide 8:** Processo Scrum: Resumo das 4 sprints, velocidade e aprendizados da equipe.

# **🚀 GUIA PRÁTICO: O QUE É SCRUM E COMO APLICAR NO PROJETO**

## **1\. O que é Scrum?**

O **Scrum** é um framework ágil de gestão e desenvolvimento de projetos focado em entregas frequentes, colaboração e melhoria contínua. Em vez de passar o mês inteiro planejando para tentar programar tudo na última noite, o trabalho é fatiado em **ciclos de 1 semana chamados Sprints**.  
Ao final de cada sprint, a equipe **não entrega "código pela metade"**, mas sim um **Incremento Funcional**: um pedaço do jogo que realmente roda, pode ser testado e agrega valor.

## **2\. Os Papéis no Nosso Trabalho (com Rotação Obrigatória)**

No Scrum tradicional, os papéis costumam ser fixos. No nosso projeto pedagógico, **todos são desenvolvedores** e os papéis de liderança **trocam a cada sprint**:

```
                       ┌──────────────────────────────────────────────┐
                       │           EQUIPE DE DESENVOLVIMENTO          │
                       │           (TODOS programam e abrem PRs)      │
                       └──────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌─────────────────────────┐                     ┌─────────────────────────┐
         │  Product Owner (PO)     │                     │  Scrum Master (SM)      │
         │  (1 pessoa / sprint)    │                     │  (1 pessoa / sprint)    │
         ├────────────────────────-┤                     ├─────────────────────────┤
         │ • Voz do produto/jogo   │                     │ • Guardião do processo  │
         │ • Prioriza o Backlog    │                     │ • Conduz as reuniões    │
         │ • Define a Meta         │                     │ • Mantém quadro em dia  │
         │ • Aprova as histórias   │                     │ • Destrava impedimentos │
         └─────────────────────────┘                     └─────────────────────────┘
```

* **Product Owner (PO):** Decide *o que* deve ser feito. Garante que o jogo faça sentido para o usuário, escreve os critérios de aceite e prioriza as tarefas no quadro.  
* **Scrum Master (SM):** Garante *como* o time trabalha. Modera as reuniões, cobra que as pessoas atualizem o quadro no GitHub Projects, ajuda a destravar impedimentos técnicos e garante a ata da sprint.  
* **Desenvolvedores (Todos):** Criam as rotas, telas, prompts, banco de dados e testes. **O PO e o SM da semana continuam programando normalmente.**

## **3\. As 4 Cerimônias do Scrum na Prática**

Toda sprint de 1 semana segue o mesmo ritual cíclico:

```
  ┌──────────────────────────────────────────────────────────────┐
  │ 1. Sprint Planning (Início da Sprint - 30 min)               │
  │    Define a Meta da semana e seleciona as Issues             │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ 2. Daily Scrum (Ao longo da semana - 5 a 15 min)             │
  │    "O que fiz ontem? O que farei hoje? Algum impedimento?"   │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ 3. Sprint Review (Fim da Sprint - 20 min)                    │
  │    Demonstração ao vivo do incremento funcionando na main    │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ 4. Sprint Retrospective (Logo após a Review - 15 min)        │
  │    "O que funcionou bem? O que deu errado? O que mudar?"     │
  └──────────────────────────────────────────────────────────────┘
```

### **3.1 Sprint Planning (Início da Sprint)**

* O PO apresenta as prioridades do jogo.  
* A equipe define uma **Meta Clara** em uma frase (Ex.: *"Sprint 2: Usuário cadastra personagem com imagem gerada e autenticação funcional no banco"*).  
* Quebram a meta em **Histórias de Usuário** e estimam o esforço (P, M, G ou Fibonacci 1, 2, 3, 5, 8).  
* Cada membro assume responsabilidade por issues específicas.

### **3.2 Daily Scrum (Acompanhamento Contínuo)**

* **Presencial (em sala):** 10 a 15 minutos em pé no início da aula, olhando para o GitHub Projects. Cada um responde:  
  1. O que entreguei desde a última reunião?  
  2. No que vou trabalhar hoje?  
  3. Existe algum impedimento me travando?  
* **Assíncrona (no Discord/WhatsApp/GitHub):** Pelo menos 3 vezes por semana, no formato:*Fiz:* Rota de geração de imagem do personagem (\#14)  
  *Vou fazer:* Integrar exibição da imagem na tela do jogo (\#15)  
  *Impedimento:* Dúvida em como salvar o buffer/URL da imagem no SQLite.

### **3.3 Sprint Review (Inspeção do Produto)**

* A equipe testa o incremento **rodando na branch *main***.  
* O PO confere se todos os critérios de aceite foram atendidos antes de fechar a issue.  
* Itens incompletos não são dados como "quase prontos": voltam para o backlog para serem replanejados.

### **3.4 Sprint Retrospective (Melhoria Contínua da Equipe)**

* Reunião com foco nas **pessoas e nos processos** (sem apontar culpados):  
  * 👍 O que correu muito bem nesta semana?  
  * 👎 O que atrapalhou nossa produtividade?  
  * 🎯 **1 a 3 ações práticas** de melhoria para a próxima sprint (ex.: *"Abrir Pull Requests até quinta-feira à noite para não travar os merges na sexta"*).

## **4\. O Fluxo de Trabalho com GitHub Projects e Git**

Para que o trabalho não vire uma bagunça de arquivos sobrescritos, o fluxo de código é amarrado às ferramentas do GitHub:

```
  [Backlog no Projects] ──► [Issue #12 atribuída] ──► [Criar branch: feature/12-mapa]
                                                                  │
                                                                  ▼
  [Merge na main] ◄── [Revisão e Aprovação de colega] ◄── [Abrir Pull Request]
```

> 

> 1. **Quadro no GitHub Projects:** Deve conter 4 colunas obrigatórias:  
   * **A Fazer (To Do):** Histórias selecionadas para a sprint atual.  
   * **Em Andamento (In Progress):** Tarefas com dono trabalhando ativamente (máximo 1 ou 2 por pessoa simultaneamente).  
   * **Em Revisão (In Review):** Pull Request aberto esperando testes e aprovação de outro colega.  
   * **Concluído (Done):** PR aprovado, mergeado na main e testado.  
> 2. **Branch Protection na main:**  
   * Ninguém faz *git push* direto na *main*.  
   * Toda funcionalidade nasce em uma branch própria:

```sh
git checkout -b feature/issue-numero-nome
```

   * Todo código entra na *main* exclusivamente por **Pull Request (PR)** aprovado por pelo menos 1 colega de equipe.  
   * A descrição do PR deve conter o comando *Closes \#N* para fechar a issue correspondente de forma automatizada.

## **5\. Roteiro Sugerido das 4 Sprints do RPG**

| Sprint | Foco Principal | Incremento Funcional Esperado |
| ----- | ----- | ----- |
| **Sprint 1** | Planejamento, Banco & Arquitetura | Repositório protegido, banco configurado (*schema.sql*), tela estática do jogo prototipada, chamada básica de teste na API do Gemini validada. |
| **Sprint 2** | Autenticação & Personagens com Imagem | Cadastro/login funcionando com senha hash, formulário de personagem com descrição visual e chamada ao Nano Banana gerando o avatar e salvando no banco. |
| **Sprint 3** | Salas, Mapas Procedurais & Tempo Real | 1º jogador cria a sala com o tema, Gemini gera a história inicial e a imagem do primeiro mapa; WebSockets conectando 2+ jogadores na mesma sala. |
| **Sprint 4** | Ciclo de Jogo, Mestre/NPCs & Finalização | Ações de texto enviadas pelos jogadores, narração de Mestre/NPCs pelo Gemini, dados/regras validados pelo back-end, polimento, gravação do vídeo, PDF e ZIP. |

