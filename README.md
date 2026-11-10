# ToDo-MongoDB — Agenda de Tarefas

Pequena aplicação web de **Agenda de Tarefas (To-Do)** que armazena os dados em um banco **não relacional (MongoDB)**. Projeto desenvolvido para a disciplina de **Banco de Dados Não Relacional**, com o objetivo de demonstrar o MongoDB funcionando em uma aplicação real.

A aplicação permite organizar tarefas por **categoria**, **prioridade** e **data limite**, e originalmente guardava tudo no `localStorage` do navegador. Nesta versão, os dados passaram a ser persistidos no MongoDB por meio de operações CRUD.

---

## Funcionalidades

- Adicionar tarefas com nome, categoria, prioridade e data limite
- Listar as tarefas salvas no banco
- Marcar tarefas como concluídas
- Excluir tarefas
- Filtrar por categoria e ordenar (por exemplo, por data)
- Contador de tarefas pendentes e concluídas
- Modo escuro

---

## Tecnologias utilizadas

| Camada    | Tecnologia                          |
|-----------|-------------------------------------|
| Frontend  | HTML5, CSS3 e JavaScript            |
| Backend   | Node.js (`server.js`)               |
| Banco     | MongoDB                             |
| Ferramenta de apoio | MongoDB Compass (visualização dos dados) |

---

## Estrutura do projeto

```
ToDo_Mongo/
├── node_modules/
├── .gitignore
├── index.html          # Interface da aplicação
├── main.js             # Lógica do frontend (comunicação com a API)
├── package.json
├── package-lock.json
├── server.js           # Servidor e conexão com o MongoDB
└── style.css           # Estilos da interface
```

---

## Modelagem dos dados

- **Banco de dados:** `agenda`
- **Coleção:** `tarefas`

Cada tarefa é salva como um documento. Exemplo real da coleção:

```json
{
  "_id": "ObjectId('6aefef085f66ed92661f3e15')",
  "name": "Estudar modelo OSI - Redes",
  "category": "Trabalho",
  "priority": "media",
  "dueDate": "2026-11-25",
  "completed": false,
  "createdAt": "2026-11-08T03:39:52.312Z"
}
```

| Campo       | Tipo     | Descrição                                   |
|-------------|----------|---------------------------------------------|
| `_id`       | ObjectId | Identificador único gerado pelo MongoDB     |
| `name`      | String   | Nome da tarefa                              |
| `category`  | String   | Categoria (ex.: Trabalho)                   |
| `priority`  | String   | Prioridade (ex.: baixa, media, alta)        |
| `dueDate`   | String   | Data limite no formato `AAAA-MM-DD`         |
| `completed` | Boolean  | Indica se a tarefa foi concluída            |
| `createdAt` | Date     | Data e hora de criação do documento         |

> **Por que um banco não relacional?** Cada tarefa é um documento independente e autocontido, sem necessidade de joins. O esquema flexível do MongoDB facilita adicionar novos campos (como tags ou subtarefas) sem migrações.

---

## Operações CRUD

| Operação | Ação na aplicação              | Operação no MongoDB |
|----------|--------------------------------|---------------------|
| Create   | Adicionar tarefa               | `insertOne`         |
| Read     | Listar tarefas                 | `find`              |
| Update   | Marcar como concluída          | `updateOne`         |
| Delete   | Excluir tarefa                 | `deleteOne`         |

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [MongoDB](https://www.mongodb.com/try/download/community) rodando localmente (ou uma string de conexão do MongoDB Atlas)
- (Opcional) [MongoDB Compass](https://www.mongodb.com/products/tools/compass) para visualizar os dados

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/Brizmann/ToDo-MongoDB.git
   cd ToDo-MongoDB
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Garanta que o MongoDB está em execução. A conexão padrão usada é:

   ```
   mongodb://localhost:27017
   ```

4. Inicie o servidor:

   ```bash
   node server.js
   ```

5. Abra o navegador no endereço exibido no terminal (por exemplo, `http://localhost:3000`).

---

## Verificando os dados no MongoDB Compass

1. Abra o Compass e conecte em `mongodb://localhost:27017`
2. Acesse o banco **`agenda`** → coleção **`tarefas`**
3. Ao adicionar, concluir ou excluir tarefas na aplicação, os documentos são atualizados em tempo real na coleção

---

## Autor

**Luiz** — Projeto acadêmico da disciplina de Banco de Dados Não Relacional.

Repositório: https://github.com/Brizmann/ToDo-MongoDB
