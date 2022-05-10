const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username)
  if (!user) {
    return response.status(404).json({ error: "User does not exists!" })
  }
  request.user = user;
  request.username = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.find((user) => user.username === username)
  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }
  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Esta rota deve receber a propriedade username e retornar uma lista com todas as tarefas do usuario
  const { username } = request;
  if (username)
    return response.status(201).json(username.todos);
  else
    return response.status(201).json([{}]);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists!" })
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists!" })
  }
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "Todo does not exists!" })
  }
  user.todos.splice(todo, 1);
  return response.status(204).json(users.todos);
});

module.exports = app;