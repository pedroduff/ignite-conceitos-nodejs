const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksAlreadyExistsUserAccount(request, response, next) {
  const { username } = request.body;

  const usernameAlreadyExists = users.find(user => user.username === username);

  if(usernameAlreadyExists){
    return response.status(400).json({error:"Username already exists!"});
  }

  return next();
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error:"Username not exists!"});
  }

  request.user = user;

  return next();
}

app.post('/users', checksAlreadyExistsUserAccount, (request, response) => {
  const { name, username } = request.body;

  const user = { id: uuidv4(), name, username, todos:[]}

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos/all', (request,response) => {
  return response.json(users);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todos = {
    id:uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todos);

  return response.status(201).json(todos)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { user } = request;
  const { id } = request.params;
  
  const todosIndex = user.todos.findIndex(todos => todos.id === id );

  if(todosIndex < 0) {
    return response.status(404).json({error: "Erro Id not exist"})
  }

  const todo = {
    id,
    title,
    done:user.todos[todosIndex].done,
    deadline,
    created_at:user.todos[todosIndex].created_at
  }

  user.todos[todosIndex] = todo;

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todosIndex = user.todos.findIndex(todos => todos.id === id );

  if(todosIndex < 0) {
    return response.status(404).json({error: "Erro Id not exist"})
  }


  const todo = {
      id,
      title: user.todos[todosIndex].title,
      done:true,
      deadline: user.todos[todosIndex].deadline,
      created_at:user.todos[todosIndex].created_at
    }
  
  user.todos[todosIndex].done = true;

  return response.json(todo)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todosIndex = user.todos.findIndex(todos => todos.id === id );

  if(todosIndex < 0) {
    return response.status(404).json({error: "Erro Id not exist"})
  }

  user.todos.splice(todosIndex, 1);

  return response.status(204).send();
});

module.exports = app;