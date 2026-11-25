# 🏢 DOMU — Sistema Integrado de Gestão Condominial

![Status](https://img.shields.io/badge/Status-Concluído%20(MVP)-brightgreen)
![Curso](https://img.shields.io/badge/ADS-Projeto%20Integrador%20%2F%20TCC%201º%20Ano-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-96.6%25-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-SPA-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Estilização-38B2AC?logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?logo=vite&logoColor=white)

> **DOMU** é uma aplicação web moderna desenvolvida para centralizar, digitalizar e otimizar a comunicação e os processos operacionais entre **Moradores**, **Portaria** e **Administração (Síndico)** em condomínios residenciais.

---

## 📋 Sumário

1. [Contexto Acadêmico](#-contexto-acadêmico)
2. [Problema e Solução](#-problema-e-solução)
3. [Perfis de Acesso e Funcionalidades](#-perfis-de-acesso-e-funcionalidades)
4. [Arquitetura e Fluxo de Dados](#-arquitetura-e-fluxo-de-dados)
5. [Estrutura de Diretórios](#-estrutura-de-diretórios)
6. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
7. [Como Executar o Projeto Localmente](#-como-executar-o-projeto-localmente)
8. [Deploy Automatizado (CI/CD)](#-deploy-automatizado-cicd)
9. [Roadmap e Evoluções Futuras](#-roadmap-e-evoluções-futuras)
10. [Autoria e Licença](#-autoria-e-licença)

---

## 🎓 Contexto Acadêmico

Este projeto foi desenvolvido como **Trabalho de Conclusão de Curso / Projeto Integrador do 1º Ano** do curso de **Análise e Desenvolvimento de Sistemas (ADS)**.

O objetivo central da aplicação é aplicar na prática os fundamentos da engenharia de software, incluindo:
* Levantamento de requisitos funcionais e regras de negócio baseadas em perfis de usuário (*RBAC — Role-Based Access Control*);
* Modelagem de estruturas de dados e tipagem estática;
* Arquitetura de interfaces reativas e componentizadas (*Single Page Application*);
* Versionamento de código com Git/GitHub e automação de implantação (*CI/CD*).

---

## 💡 Problema e Solução

### O Problema
Em muitos condomínios, a gestão cotidiana ainda depende de processos manuais, livros de registro físicos na portaria, quadros de avisos em papel e comunicação fragmentada via aplicativos de mensagens informais. Isso gera falhas no controle de encomendas, conflitos no agendamento de áreas comuns, demora na autorização de visitantes e falta de transparência financeira.

### A Solução (DOMU)
O **DOMU** unifica todas essas frentes em uma plataforma única, responsiva e intuitiva, oferecendo **visões personalizadas** conforme o papel de cada usuário no ecossistema do condomínio, garantindo agilidade operacional na portaria, autonomia para o morador e controle gerencial para o síndico.

---

## 👥 Perfis de Acesso e Funcionalidades

O sistema opera com controle de acesso baseado em três perfis distintos, liberando menus, indicadores e ações específicas após a autenticação:

### 1. 🏠 Morador
* **Dashboard do Morador (`ResidentDashboard`):** Visão geral com resumo de encomendas pendentes, próximas reservas, comunicados e situação financeira.
* **Encomendas (`Encomendas`):** Acompanhamento em tempo real de pacotes recebidos pela portaria e histórico de retiradas.
* **Visitantes (`Visitantes`):** Pré-autorização de convidados e prestadores de serviço para agilizar a liberação na guarita.
* **Reservas de Áreas Comuns (`Reservas`):** Consulta de disponibilidade em calendário e agendamento de espaços (salão de festas, churrasqueira, etc.).
* **Veículos (`Veiculos`):** Cadastro e gerenciamento dos automóveis e motocicletas vinculados à unidade.
* **Ocorrências (`Ocorrencias`):** Abertura de chamados de manutenção, sugestões ou reclamações, com acompanhamento de status.
* **Programação (`Programacao`):** Visualização do calendário oficial de eventos, assembleias e manutenções preventivas.
* **Financeiro (`Financeiro`):** Consulta de taxas condominiais, boletos em aberto e histórico de pagamentos.
* **Chat Interno (`Chat`):** Canal direto de comunicação dentro da plataforma.

### 2. 🛂 Portaria
* **Painel da Portaria (`PortariaPainel`):** Central operacional com indicadores rápidos das atividades do turno.
* **Gestão de Encomendas (`PortariaEncomendas`):** Registro de entrada de novas correspondências/pacotes e baixa mediante retirada pelo morador.
* **Controle de Visitantes (`PortariaVisitantes`):** Registro de entrada e saída de visitantes e validação de pré-autorizações.
* **Consulta Rápida (`ConsultaRapida`):** Busca ágil por unidade, nome de morador ou placa de veículo para identificação imediata.

### 3. 👔 Síndico / Administração
* **Painel Gerencial (`SindicoPainel`):** Visão macro da operação e indicadores administrativos do condomínio.
* **Gestão de Moradores (`GestaoMoradores`):** Cadastro, edição e vínculo de moradores às respectivas unidades habitacionais.
* **Colaboradores (`Colaboradores`):** Controle e organização da equipe interna e prestadores fixos.
* **Emissão de Boletos (`EmitirBoletos`):** Geração e lançamento de cobranças condominiais para as unidades.
* **Gestão de Ocorrências (`SindicoOcorrencias`):** Triagem, resposta e atualização de status dos chamados abertos pelos moradores.
* **Auditoria de Visitantes (`SindicoVisitantes`):** Consulta ao histórico completo de fluxo de acesso no condomínio.
* **Gerenciar Programação (`GerenciarProgramacao`):** Criação, edição e publicação de eventos e avisos no calendário geral.

---

## 🏗 Arquitetura e Fluxo de Dados

A aplicação foi estruturada como uma **SPA (Single Page Application)**, separando claramente a camada de apresentação (telas e componentes), a camada de regras/estado e a definição dos modelos de dados:

```text
[ index.html ]
      │
      ▼
[ src/main.tsx ] ──► Inicializa o React e carrega estilos globais (index.css)
      │
      ▼
[ src/App.tsx ]  ──► Controla a sessão e o roteamento baseado no Perfil (Role)
      │
      ├──► (Não autenticado) ──► [ src/screens/Login.tsx ]
      │
      └──► (Autenticado)     ──► [ AppShell.tsx + TopBar.tsx ]
                                        │
                                        ▼
                                 [ Telas (src/screens/*) ]
                                        │
                                        ▼
                              [ Estado Global (src/store.tsx) ]
                                  ▲                 ▲
                                  │                 │
                       [ src/types.ts ]     [ src/seed.ts ]
                    (Tipagem e Modelos)   (Carga Inicial de Dados)
```

### Persistência em Memória e Integração Backend
Para facilitar a demonstração acadêmica e o acesso imediato sem dependência de infraestrutura externa ativa, o sistema utiliza um **gerenciador de estado reativo (`store.tsx`)** populado inicialmente por uma base de dados simulada realista (**`seed.ts`**), rigorosamente validada pelas interfaces definidas em **`types.ts`**. 

Adicionalmente, o repositório conta com o pacote **`DOMU-Supabase.zip`**, contendo a estrutura preparada para persistência em banco de dados relacional (**PostgreSQL**) e autenticação em nuvem via **Supabase**.

---

## 📁 Estrutura de Diretórios

```text
DOMU/
├── .bolt/                       # Metadados e contexto de prototipação assistida
├── .github/
│   └── workflows/
│       └── deploy.yml           # Pipeline de CI/CD para deploy no GitHub Pages
├── src/
│   ├── components/
│   │   └── ui.tsx               # Biblioteca de componentes visuais reutilizáveis (botões, cards, badges)
│   ├── lib/
│   │   └── format.ts            # Funções utilitárias (formatação de moeda, datas e documentos)
│   ├── screens/                 # Interfaces divididas por módulo e perfil de acesso (23 telas)
│   │   ├── AppShell.tsx         # Layout estrutural (Sidebar + Área principal)
│   │   ├── TopBar.tsx           # Barra superior com identificação da conta e perfil fixado
│   │   ├── Login.tsx            # Tela de autenticação e seleção de acesso
│   │   ├── Chat.tsx             # Módulo de mensagens
│   │   ├── ResidentDashboard.tsx# Início - Morador
│   │   ├── Encomendas.tsx       # Encomendas - Morador
│   │   ├── Visitantes.tsx       # Visitantes - Morador
│   │   ├── Reservas.tsx         # Reservas de espaços - Morador
│   │   ├── Veiculos.tsx         # Veículos - Morador
│   │   ├── Ocorrencias.tsx      # Ocorrências - Morador
│   │   ├── Programacao.tsx      # Calendário - Morador
│   │   ├── Financeiro.tsx       # Financeiro - Morador
│   │   ├── PortariaPainel.tsx   # Início - Portaria
│   │   ├── PortariaEncomendas.tsx
│   │   ├── PortariaVisitantes.tsx
│   │   ├── ConsultaRapida.tsx   # Busca rápida - Portaria
│   │   ├── SindicoPainel.tsx    # Início - Síndico
│   │   ├── GestaoMoradores.tsx  # Cadastro de moradores - Síndico
│   │   ├── Colaboradores.tsx    # Gestão de equipe - Síndico
│   │   ├── EmitirBoletos.tsx    # Lançamento financeiro - Síndico
│   │   ├── SindicoOcorrencias.tsx
│   │   ├── SindicoVisitantes.tsx
│   │   └── GerenciarProgramacao.tsx
│   ├── App.tsx                  # Componente raiz e controle de fluxo de navegação
│   ├── main.tsx                 # Ponto de entrada da aplicação React
│   ├── store.tsx                # Gerenciamento centralizado de estado da aplicação
│   ├── seed.ts                  # Dados iniciais pré-cadastrados (Mock Data)
│   ├── types.ts                 # Definições de tipos e interfaces TypeScript
│   └── index.css                # Importação e diretivas do Tailwind CSS
├── DOMU-Supabase.zip            # Pacote de integração com backend Supabase
├── index.html                   # Documento HTML base da SPA
├── package.json                 # Dependências e scripts do projeto
├── tailwind.config.js           # Configuração de tema e estilos do Tailwind
├── tsconfig.json                # Configurações do compilador TypeScript
└── vite.config.ts               # Configurações do bundler Vite
```

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Finalidade no Projeto | Justificativa Técnica |
| :--- | :--- | :--- |
| **TypeScript** | Linguagem principal (`96.6%`) | Garante segurança de tipos em tempo de compilação, reduzindo falhas em tempo de execução e facilitando a manutenção. |
| **React** | Construção da Interface | Permite dividir a aplicação em componentes modulares e reativos, otimizando a experiência do usuário. |
| **Tailwind CSS** | Estilização e Responsividade | Framework *utility-first* que assegura consistência visual e adaptação fluida entre desktops, tablets e smartphones. |
| **Vite** | Servidor Dev e Build | Oferece inicialização instantânea em desenvolvimento e gera pacotes otimizados para produção. |
| **ESLint** | Qualidade de Código | Padroniza a escrita do código e previne más práticas durante o desenvolvimento. |
| **GitHub Actions** | Automação (CI/CD) | Automatiza o processo de build e publicação contínua no GitHub Pages a cada atualização no repositório. |

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
* Gerenciador de pacotes **npm** (incluso no Node.js)
* [Git](https://git-scm.com/)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/souzzaParabolica/DOMU.git
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd DOMU
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

### Scripts Disponíveis
* `npm run dev` — Inicia a aplicação em modo de desenvolvimento com *Hot Reload*.
* `npm run build` — Compila o TypeScript e gera os arquivos otimizados de produção na pasta `dist/`.
* `npm run lint` — Executa a verificação de qualidade e padronização do código.

---

## 🔄 Deploy Automatizado (CI/CD)

O repositório conta com um fluxo configurado em `.github/workflows/deploy.yml`. Sempre que um *commit* é enviado para a branch principal (`main`), o GitHub Actions:
1. Instala as dependências do projeto em ambiente limpo;
2. Executa o build de produção via Vite;
3. Publica automaticamente a versão atualizada no **GitHub Pages**.

---

## 🗺 Roadmap e Evoluções Futuras

Como próximos passos para a evolução do sistema nos semestres seguintes da graduação:
- [ ] **Persistência em Nuvem:** Migrar o estado em memória (`store.tsx`) para o banco de dados **PostgreSQL** utilizando a integração estruturada em `DOMU-Supabase.zip`.
- [ ] **Autenticação Real:** Implementar login seguro com JWT e recuperação de senha via Supabase Auth.
- [ ] **Controle de Acesso por QR Code:** Geração de passes temporários em QR Code para visitantes pré-autorizados pelos moradores.
- [ ] **Notificações em Tempo Real:** Alertas instantâneos via *WebSockets* ou *Push Notifications* na chegada de encomendas.
- [ ] **Exportação de Relatórios e Boletos:** Geração de arquivos PDF e integração com API de pagamentos PIX.

---

## 👨‍💻 Autoria e Licença

Desenvolvido por **souzza** ([@souzzaParabolica](https://github.com/souzzaParabolica)) como projeto acadêmico de **Análise e Desenvolvimento de Sistemas**.

Este projeto é distribuído para fins educacionais e de portfólio.