const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
// serve index.html, main.js e style.css (mesma pasta do server.js)
app.use(express.static(__dirname));

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);
let tarefas; // coleção

// Converte o documento do Mongo para o formato que o frontend já usa (t.id)
function paraFront(doc) {
  const { _id, ...resto } = doc;
  return { id: _id.toString(), ...resto };
}

// Evita repetir try/catch em todas as rotas
const rota = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

// CREATE
app.post('/api/tasks', rota(async (req, res) => {
  const { name, category, priority, dueDate } = req.body;
  if (!name || !category || !priority || !dueDate) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }
  const doc = { name, category, priority, dueDate, completed: false, createdAt: new Date() };
  const r = await tarefas.insertOne(doc);
  res.status(201).json(paraFront({ _id: r.insertedId, ...doc }));
}));

// READ (lista todas)
app.get('/api/tasks', rota(async (req, res) => {
  const lista = await tarefas.find({}).toArray();
  res.json(lista.map(paraFront));
}));

// UPDATE (ex.: marcar como concluída, ou editar campos)
app.patch('/api/tasks/:id', rota(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ erro: 'ID inválido' });

  const permitidos = ['name', 'category', 'priority', 'dueDate', 'completed'];
  const campos = {};
  for (const k of permitidos) {
    if (k in req.body) campos[k] = req.body[k];
  }

  const r = await tarefas.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: campos },
    { returnDocument: 'after' }
  );
  if (!r) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.json(paraFront(r));
}));

// DELETE
app.delete('/api/tasks/:id', rota(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ erro: 'ID inválido' });

  const r = await tarefas.deleteOne({ _id: new ObjectId(id) });
  if (r.deletedCount === 0) return res.status(404).json({ erro: 'Tarefa não encontrada' });
  res.status(204).end();
}));

async function iniciar() {
  await client.connect();
  tarefas = client.db('agenda').collection('tarefas');
  console.log('Conectado ao MongoDB');
  app.listen(3000, () => console.log('Rodando em http://localhost:3000'));
}

iniciar().catch((e) => {
  console.error('Falha ao conectar no MongoDB:', e.message);
  process.exit(1);
});