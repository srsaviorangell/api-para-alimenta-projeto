# 🌽 São João de Irecê 2026 - API & Admin Panel

Bem-vindo ao repositório oficial da **API e Painel Administrativo** do maior São João do Brasil: o São João de Irecê!

Este projeto foi construído para alimentar não só o aplicativo oficial da festa, mas qualquer outro frontend (site, totens informativos, etc) com dados em tempo real sobre a programação, barracas, pontos de apoio e informações úteis.

---

## 💡 A Ideia do Projeto

O objetivo principal deste sistema é ser o "cérebro" digital da festa. Durante o São João, a programação pode sofrer alterações, novas barracas podem surgir, e informações essenciais de saúde e segurança precisam estar facilmente acessíveis aos turistas e moradores.

Para resolver isso, criamos uma solução composta por duas partes:
1. **API RESTful (Backend):** Serve os dados estruturados em JSON para o Aplicativo (Android/iOS) consumir instantaneamente.
2. **Painel Administrativo (Frontend Web):** Uma interface amigável, elegante e com estética "Dark App Premium", onde a organização da festa pode gerenciar tudo sem precisar de conhecimentos técnicos.

### Por que esta arquitetura?
- **Leveza e Portabilidade:** Utilizamos um banco de dados em arquivo JSON (`sj2026.json`) gerenciado por um adaptador customizado em Node.js. Isso elimina a necessidade de instalar bancos complexos (como MySQL ou Postgres) ou bibliotecas que geram conflitos no Windows (como SQLite). Basta ter o Node.js e rodar!
- **SPA (Single Page Application) em Vanilla JS:** O painel administrativo foi feito com HTML puro, CSS elegante e JavaScript (sem frameworks pesados como React ou Angular), garantindo carregamento ultrarrápido e código fácil de manter.
- **IDs Simplificados:** Para facilitar a comunicação da equipe (ex: "Altera o evento 12"), substituímos IDs complexos por numeração sequencial simples.

---

## 🛠️ Funcionalidades

### 1. Programação (Events)
Gestão completa dos shows e eventos do São João.
- **Campos:** Título, Artista, Data, Horário (Início/Fim), Circuito, Palco, Tipo de evento (Forró, Sertanejo, etc) e Upload de Capa.
- **Cálculo de Status Automático:** A API sabe dizer se o evento está "Em Breve" (⏰), "Ao Vivo" (🔴) ou "Encerrado" (✅) baseada na hora atual.

### 2. Barracas & Parceiros (Venues)
Cadastro das barracas de comida e bebida espalhadas pela festa.
- **Campos:** Nome, Tipo (Comida, Bebida, etc), Endereço, Horário de Funcionamento, Telefone, Selo de "Patrocinador", e Posição no Mapa (Latitude/Longitude).

### 3. Pontos de Apoio (Map Points)
Locais vitais para a infraestrutura do turista.
- **Categorias:** Saúde (UPA), Segurança (Polícia), Banheiros, etc.
- **Campos:** Nome, Categoria, Endereço, Telefone, Horário de Funcionamento e Coordenadas.

### 4. Informações Úteis (Useful Info)
Um "FAQ" do turista.
- Cadastro de manuais rápidos, como: "Pronto-Socorro", "Polícia Militar", "Itens Proibidos" e "Acessibilidade". Ícones personalizáveis.

### 5. Dashboard Inteligente
O Painel Administrativo conta com uma tela inicial que resume toda a festa:
- **KPIs interativos:** Cards elegantes que, ao clicar, abrem relatórios detalhados.
- **Drill-down:** Clique em um dia de festa e veja *apenas* a programação daquele dia. Clique nas barracas e veja o resumo comercial.

### 6. 🔌 API Explorer Embutido
Os desenvolvedores do Aplicativo podem testar todos os endpoints direto do Painel Administrativo, sem precisar do Postman.

---

## 🚀 Como Instalar e Rodar Localmente

### Pré-requisitos
- **Node.js** (versão 16+ recomendada)
- Git (opcional, para clonar)

### Passos

1. **Clone ou baixe o projeto** para sua máquina.
2. Abra o terminal na pasta raiz do projeto.
3. Instale as dependências executando:
   ```bash
   npm install
   ```
   *(Dependências utilizadas: `express` (servidor), `cors` (segurança de requisições), `multer` (upload de arquivos), `jimp` (processamento de imagens) e `dotenv`)*

4. **Inicie o Servidor:**
   Você pode iniciar em modo normal:
   ```bash
   node server.js
   ```
   Ou em modo desenvolvedor (reinicia sozinho ao salvar os arquivos):
   ```bash
   npm run dev
   ```

5. O console exibirá algo como:
   ```
   Server running on port 3000
   ```

### Acessando os Sistemas

- **Painel Administrativo:** Abra seu navegador e acesse:
  👉 `http://localhost:3000/admin`
- **Acessando a API (JSON):**
  👉 `http://localhost:3000/api/events`

*(Se você for rodar no seu celular na mesma rede Wi-Fi, substitua `localhost` pelo IP da sua máquina, ex: `http://192.168.0.15:3000/admin`)*

---

## 📂 Estrutura de Diretórios (Resumo)

```text
/
├── server.js              # Ponto de entrada da API e Configuração do Express
├── sj2026.json            # Banco de Dados da aplicação (Criado automaticamente)
├── /src                   # Backend lógico
│   ├── /routes            # Endpoints da API (events, venues, mapPoints...)
│   ├── /database          # Adaptador de escrita/leitura do banco
│   └── /middleware        # Upload e manipulação de imagens (Multer/Jimp)
├── /uploads               # Pasta onde as fotos dos eventos são salvas
└── /admin                 # Frontend do Painel Administrativo
    ├── index.html         # Estrutura base do Painel
    ├── /css
    │   └── styles.css     # Design do Painel Estilo "Dark Premium"
    └── /js
        ├── app.js         # Roteador SPA e utilitários globais
        └── /pages         # Lógica das telas (dashboard, events, venues, etc)
```

---

## 📝 Rotas Principais da API

Todos os endpoints começam com `/api`. A API aceita e retorna `.json`.

| Entidade | GET (Listar) | POST (Criar) | PUT (Atualizar) | DELETE |
| :--- | :--- | :--- | :--- | :--- |
| **Eventos** | `/api/events` | `/api/events` | `/api/events/:id` | `/api/events/:id` |
| **Eventos (Foto)** | *(servido estático na URL do evento)* | `/api/events/:id/image` | - | - |
| **Barracas** | `/api/venues` | `/api/venues` | `/api/venues/:id` | `/api/venues/:id` |
| **Pontos** | `/api/map-points` | `/api/map-points` | `/api/map-points/:id` | `/api/map-points/:id` |
| **Info** | `/api/useful-info` | `/api/useful-info` | `/api/useful-info/:id` | `/api/useful-info/:id` |

*Dica: Você pode testar todas essas rotas diretamente na aba **🔌 API Explorer** dentro do Painel Administrativo.*

---

**Desenvolvido para conectar as pessoas à energia do São João de Irecê! 🎆🔥**
