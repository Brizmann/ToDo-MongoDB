const taskForm = document.getElementById('taskForm');
const taskName = document.getElementById('taskName');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');

const tasksList = document.getElementById('tasksList');
const emptyMessage = document.getElementById('emptyMessage');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const countPending = document.getElementById('countPending');
const countDone = document.getElementById('countDone');
const toggleTheme = document.getElementById('toggleTheme');

const API = '/api/tasks';

let tasks = [];

async function loadState(){
	try{
		const res = await fetch(API);
		if(!res.ok) throw new Error('Falha ao buscar tarefas');
		tasks = await res.json();
	}catch(e){
		tasks = [];
		alert('Não foi possível carregar as tarefas. O servidor (node server.js) está rodando?');
	}
	// o tema continua no localStorage
	const theme = localStorage.getItem('todo_theme');
	if(theme === 'dark') document.body.classList.add('dark');
}

function formatDate(iso){
	if(!iso) return '';
	try{
		const d = new Date(iso);
		return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
	}catch(e){return iso}
}

function renderTasks(){
	const category = filterCategory.value;
	const sort = sortBy.value;

	let visible = tasks.slice();
	if(category && category !== 'all') visible = visible.filter(t=>t.category===category);

	if(sort === 'priority'){
		const order = {alta:0,media:1,baixa:2};
		visible.sort((a,b)=>order[a.priority]-order[b.priority]);
	}else{ // date
		visible.sort((a,b)=> new Date(a.dueDate) - new Date(b.dueDate));
	}

	tasksList.innerHTML = '';
	if(visible.length === 0){ emptyMessage.style.display = 'block'; } else { emptyMessage.style.display = 'none'; }

	visible.forEach(t=>{
		const card = document.createElement('div');
		card.className = 'task-card' + (t.completed ? ' completed' : '');
		card.dataset.id = t.id;

		const main = document.createElement('div'); main.className = 'task-main';
		const info = document.createElement('div'); info.className = 'task-info';

		const h3 = document.createElement('h3'); h3.textContent = t.name;
		const meta = document.createElement('div'); meta.className = 'meta';
		meta.textContent = `${t.category} • ${formatDate(t.dueDate)}`;

		info.appendChild(h3); info.appendChild(meta);

		const priority = document.createElement('div'); priority.className = `priority ${t.priority}`;
		priority.textContent = t.priority === 'alta' ? 'Alta' : (t.priority === 'media' ? 'Média' : 'Baixa');

		main.appendChild(info);

		const right = document.createElement('div'); right.style.display = 'flex'; right.style.alignItems = 'center'; right.style.gap='12px';
		right.appendChild(priority);

		const actions = document.createElement('div'); actions.className = 'task-actions';

		const doneBtn = document.createElement('button'); doneBtn.className = 'done'; doneBtn.title = 'Marcar como concluída';
		doneBtn.innerHTML = t.completed ? '↺' : '✓';
		doneBtn.addEventListener('click', ()=> toggleDone(t.id));

		const delBtn = document.createElement('button'); delBtn.className = 'delete'; delBtn.title = 'Excluir tarefa'; delBtn.textContent = '🗑';
		delBtn.addEventListener('click', ()=> deleteTask(t.id));

		actions.appendChild(doneBtn); actions.appendChild(delBtn);
		right.appendChild(actions);

		card.appendChild(main);
		card.appendChild(right);

		tasksList.appendChild(card);
	});

	updateCounts();
}

function updateCounts(){
	const pending = tasks.filter(t=>!t.completed).length;
	const done = tasks.filter(t=>t.completed).length;
	countPending.textContent = `Pendentes: ${pending}`;
	countDone.textContent = `Concluídas: ${done}`;
}

// CREATE
async function addTask(e){
	e.preventDefault();
	const name = taskName.value.trim();
	const category = taskCategory.value;
	const priority = taskPriority.value;
	const dueDate = taskDueDate.value;

	if(!name || !category || !priority || !dueDate){
		alert('Preencha todos os campos do formulário.');
		return;
	}

	try{
		const res = await fetch(API, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({name, category, priority, dueDate})
		});
		if(!res.ok) throw new Error('Falha ao criar tarefa');
		const newTask = await res.json(); // já vem com o id gerado pelo MongoDB
		tasks.push(newTask);
		renderTasks();
		taskForm.reset();
	}catch(err){
		alert('Erro ao adicionar a tarefa.');
	}
}

// UPDATE
async function toggleDone(id){
	const t = tasks.find(x=>x.id===id);
	if(!t) return;

	try{
		const res = await fetch(`${API}/${id}`, {
			method: 'PATCH',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({completed: !t.completed})
		});
		if(!res.ok) throw new Error('Falha ao atualizar tarefa');
		const updated = await res.json();
		t.completed = updated.completed;
		renderTasks();
	}catch(err){
		alert('Erro ao atualizar a tarefa.');
	}
}

// DELETE
async function deleteTask(id){
	if(!confirm('Excluir essa tarefa?')) return;

	try{
		const res = await fetch(`${API}/${id}`, {method: 'DELETE'});
		if(!res.ok) throw new Error('Falha ao excluir tarefa');
		tasks = tasks.filter(x=>x.id!==id);
		renderTasks();
	}catch(err){
		alert('Erro ao excluir a tarefa.');
	}
}

filterCategory.addEventListener('change', renderTasks);
sortBy.addEventListener('change', renderTasks);
taskForm.addEventListener('submit', addTask);

toggleTheme.addEventListener('click', ()=>{
	document.body.classList.toggle('dark');
	const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
	localStorage.setItem('todo_theme', theme);
	toggleTheme.textContent = document.body.classList.contains('dark') ? 'Modo Claro' : 'Modo Escuro';
});

// inicialização (loadState agora é assíncrona, então esperamos antes de renderizar)
(async ()=>{
	await loadState();
	renderTasks();
})();