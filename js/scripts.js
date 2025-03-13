// Seleção de Elementos
const todoForm = document.querySelector("#todo-form"); // Formulário de tarefas
const todoInput = document.querySelector("#todo-input"); // Entrada de texto para nova tarefa
const todoList = document.querySelector("#todo-list"); // Lista de tarefas
const editForm = document.querySelector("#edit-form"); // Formulário de edição de tarefas
const editInput = document.querySelector("#edit-input"); // Entrada de texto para editar tarefa
const cancelEditBtn = document.querySelector("#cancel-edit-btn"); // Botão de cancelar edição
const searchInput = document.querySelector("#search-input"); // Entrada de texto para pesquisa de tarefas
const eraseBtn = document.querySelector("#erase-button"); // Botão de apagar pesquisa
const filterBtn = document.querySelector("#filter-select"); // Seletor de filtro de tarefas

let oldInputValue; // Valor antigo da tarefa a ser editada

// Cria um elemento de tarefa (todo)
const createTodoElement = (text, done = false) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  // Botão de conclusão
  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  // Botão de edição
  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  todo.appendChild(editBtn);

  // Botão de exclusão
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  if (done) {
    todo.classList.add("done"); // Marca a tarefa como concluída
  }

  return todo;
};

// Salva uma nova tarefa
const saveTodo = (text, done = false, save = true) => {
  const todo = createTodoElement(text, done);

  if (save) {
    saveTodoLocalStorage({ text, done });
  }

  todoList.appendChild(todo);

  todoInput.value = ""; // Limpa o campo de entrada
  todoInput.focus(); // Foca no campo de entrada
};

// Alterna entre os formulários de edição e criação
const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

// Atualiza uma tarefa existente
const updateTodo = (text) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");

    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = text;

      updateTodoLocalStorage(oldInputValue, text);
    }
  });
};

// Pesquisa tarefas com base na entrada do usuário
const getSearchTodos = (search) => {
  const todos = document.querySelectorAll(".todo");
  const normalizedSearch = search.toLowerCase();

  todos.forEach((todo) => {
    const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
    todo.style.display = todoTitle.includes(normalizedSearch) ? "flex" : "none";
  });
};

// Filtra tarefas com base no valor selecionado
const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    const shouldDisplay =
      filterValue === "all" ||
      (filterValue === "done" && todo.classList.contains("done")) ||
      (filterValue === "todo" && !todo.classList.contains("done"));

    todo.style.display = shouldDisplay ? "flex" : "none";
  });
};

// Eventos
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const inputValue = todoInput.value;

  if (inputValue) {
    saveTodo(inputValue);
  }
});

document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");

  // Verifica se o elemento clicado é um botão ou um ícone dentro de um botão
  const isButton = targetEl.tagName === "BUTTON";
  const isIcon =
    targetEl.tagName === "I" && targetEl.parentElement.tagName === "BUTTON";

  if (parentEl && parentEl.querySelector("h3")) {
    const todoTitle = parentEl.querySelector("h3").innerText;

    if (isButton || isIcon) {
      const buttonEl = isIcon ? targetEl.parentElement : targetEl;

      if (buttonEl.classList.contains("finish-todo")) {
        parentEl.classList.toggle("done");
        updateTodoStatusLocalStorage(todoTitle);
      }

      if (buttonEl.classList.contains("remove-todo")) {
        parentEl.remove();
        removeTodoLocalStorage(todoTitle);
      }

      if (buttonEl.classList.contains("edit-todo")) {
        toggleForms();
        editInput.value = todoTitle;
        oldInputValue = todoTitle;
      }
    }
  }
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const editInputValue = editInput.value;

  if (editInputValue) {
    updateTodo(editInputValue);
  }

  toggleForms();
});

// Função debounce para limitar a frequência das chamadas de função
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

// Evento de pesquisa de tarefas
searchInput.addEventListener(
  "keyup",
  debounce((e) => {
    const search = e.target.value;
    getSearchTodos(search);
  }, 300)
);

// Evento de apagar pesquisa
eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("keyup"));
});

// Evento de filtro de tarefas
filterBtn.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  filterTodos(filterValue);
});

// Local Storage
const getTodosLocalStorage = () =>
  JSON.parse(localStorage.getItem("todos")) || [];

// Carrega tarefas do Local Storage
const loadTodos = () => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => saveTodo(todo.text, todo.done, false));
};

// Salva uma tarefa no Local Storage
const saveTodoLocalStorage = (todo) => {
  const todos = getTodosLocalStorage();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Remove uma tarefa do Local Storage
const removeTodoLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();
  const filteredTodos = todos.filter((todo) => todo.text !== todoText);
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

// Atualiza o status de conclusão de uma tarefa no Local Storage
const updateTodoStatusLocalStorage = (todoText) => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => {
    if (todo.text === todoText) {
      todo.done = !todo.done;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Atualiza o texto de uma tarefa no Local Storage
const updateTodoLocalStorage = (todoOldText, todoNewText) => {
  const todos = getTodosLocalStorage();
  todos.forEach((todo) => {
    if (todo.text === todoOldText) {
      todo.text = todoNewText;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Carrega tarefas ao iniciar a aplicação
loadTodos();
