import React from "react";

import Todo from "../components/Todo";
import * as TodoActions from "../actions/TodoActions";
import TodoStore from "../stores/TodoStore";


export default class Featured extends React.Component {
  constructor() {
    super();
    this.getTodos = this.getTodos.bind(this);
    this.state = {
      todos: TodoStore.getAll(),
    };
  }

  componentWillMount() {
    TodoStore.on("change", this.getTodos);
  }

  componentWillUnmount() {
    TodoStore.removeListener("change", this.getTodos);
  }

  addTodos() {
    TodoActions.createTodo("Hi");
  }

  getTodos() {
    this.setState({
      todos: TodoStore.getAll(),
    });
  }

  deleteTodos() {
    const val = document.getElementById("deleteID").value;
    TodoActions.deleteTodo(val);
  }

  reloadTodos() {
    TodoActions.reloadTodos();
  }

  render() {
    const { todos } = this.state;

    const TodoComponents = todos.map((todo) => {
        return <Todo key={todo.id} {...todo}/>;
    });

    return (
      <div>
        <button onClick={this.reloadTodos.bind(this)}>Reload!</button>
        <button onClick={this.addTodos.bind(this)}>Add</button>
        <hr />
        <input type="text" name="deleteID" id="deleteID"/>
        <button onClick={this.deleteTodos.bind(this)}>Delete</button>
        <h1>Todos</h1>
        <ul>{TodoComponents}</ul>
      </div>
    );
  }
}
