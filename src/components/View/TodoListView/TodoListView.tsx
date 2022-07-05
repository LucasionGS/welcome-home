import { ActionIcon, Button, Checkbox, Group, Modal, NumberInput, Text, Textarea, TextInput } from "@mantine/core";
import { ArrowUp, ArrowDown } from "tabler-icons-react";
import { useForceUpdate } from "@mantine/hooks";
import { useNotifications } from "@mantine/notifications";
import React, { useState } from "react";
import Api from "../../../api/Api";
import "./TodoListView.scss";

export default function TodoListView() {
  const { showNotification } = useNotifications();
  const [todos, _setTodos] = useState<Api.Todo[]>(null);
  const setTodos = (todos: Api.Todo[]) => {
    _setTodos(todos.sort((a, b) => a.orderIndex - b.orderIndex));
  }
  const [newTodoLoading, setNewTodoLoading] = useState(false);
  const [showCompleted, _setShowCompleted] = useState(localStorage.getItem("showCompleted") === "true");
  const setShowCompleted = (showCompleted: boolean) => {
    localStorage.setItem("showCompleted", showCompleted.toString());
    _setShowCompleted(showCompleted);
  }

  const forceUpdate = useForceUpdate();

  if (todos === null) {
    Api.Todo.getAll(true).then(todos => {
      setTodos(todos);
    });
  }

  function createTodo() {
    setNewTodoLoading(true);
    Api.Todo.create({
      title: "New task " + Math.max(...todos.map(todo => todo.id), 0),
      description: ""
    }).then(todo => {
      setTodos([...todos, todo]);
      setNewTodoLoading(false);
    });
    showNotification({
      message: "Task created",
      color: "green",
      autoClose: 2000
    });
  }

  return (
    <div>
      <div className="todo-list">
        <h1>To-do List</h1>
        <Group>
          <Checkbox
            label="Show completed"
            checked={showCompleted}
            onChange={e => setShowCompleted(e.currentTarget.checked)}
          />
        </Group>
        <br />
        <Button disabled={newTodoLoading} loading={newTodoLoading} onClick={() => createTodo()}>New Task</Button>
        {todos?.filter(t => !t.completed || (t.completed && showCompleted)).map(todo => (
          <TodoItem
            forceUpdate={forceUpdate}
            parentTodos={todos}
            canHaveSubTodos
            key={todo.id}
            todo={todo}
            onDelete={todo => {
              Api.Todo.delete(todo.id).then(() => {
                setTodos(todos.filter(t => t.id !== todo.id));
              });
            }}
            reorder={() => {
              Api.Todo.order(todos).then(() => {
                forceUpdate();
              });
            }}
          />
        ))}
      </div>
    </div>
  )
}

function TodoItem(props: {
  todo: Api.Todo,
  parentTodos?: Api.Todo[],
  onDelete: (todo: Api.Todo) => void,
  canHaveSubTodos?: boolean,
  forceUpdate: () => void,
  reorder?: () => void,
}) {
  const { todo, parentTodos, onDelete, forceUpdate: forceUpdateParent, canHaveSubTodos = false, reorder } = props;
  const [checked, setChecked] = useState(todo.completed);
  const [openModel, setOpenModel] = useState(false);
  const [newTodoLoading, setNewTodoLoading] = useState(false);
  const { showNotification } = useNotifications();
  const [todos, _setTodos] = useState<Api.Todo[]>(todo.subTasks ?? []);

  const setTodos = (todos: Api.Todo[]) => {
    _setTodos(todos.sort((a, b) => a.orderIndex - b.orderIndex));
  }

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);

  const forceUpdate = useForceUpdate();

  if (!todo) {
    return null;
  }

  function createTodo() {
    setNewTodoLoading(true);
    Api.Todo.create({
      title: "New task",
      description: "",
      parentId: todo.id
    }).then(todo => {
      const newTodos = [...(todos), todo];
      todo.subTasks = newTodos;
      setTodos(newTodos);
      setNewTodoLoading(false);
    });
    showNotification({
      message: "Task created",
      color: "green",
      autoClose: 2000
    });
  }

  return (
    <>
      <Group
        grow
        className={["todo-item", checked ? "todo-item-checked" : null].filter(Boolean).join(" ")}
        onClick={(e) => {
          setOpenModel(true);
        }}
      >
        <Group>
          <p>{todo.title}</p>
        </Group>
        <Group position="right">
          <Text>
            {canHaveSubTodos && todos.length > 0 && `${todos.reduce((prev, curr) => prev + (curr.completed ? 1 : 0), 0)}/${todos.length}`}
          </Text>
          
          <ActionIcon disabled={parentTodos.findIndex(t => t.id === todo.id) === 0} component="button" onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();

            const index1 = parentTodos.findIndex(t => t.id === todo.id);
            const index2 = index1 - 1;

            [parentTodos[index1], parentTodos[index2]] = [parentTodos[index2], parentTodos[index1]];

            reorder && reorder();
          }}>
            <ArrowUp />
          </ActionIcon>
          <ActionIcon disabled={parentTodos.findIndex(t => t.id === todo.id) == parentTodos.length - 1} component="button" onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();

            const index1 = parentTodos.findIndex(t => t.id === todo.id);
            const index2 = index1 + 1;

            [parentTodos[index1], parentTodos[index2]] = [parentTodos[index2], parentTodos[index1]];

            reorder && reorder();
          }}>
            <ArrowDown />
          </ActionIcon>

          <Checkbox checked={checked} onClick={e => {
            e.stopPropagation();
            setChecked(e.currentTarget.checked);
            todo.completed = e.currentTarget.checked;
            Api.Todo.update({
              id: todo.id,
              completed: e.currentTarget.checked
            });
          }} />
        </Group>
      </Group>
      <Modal opened={openModel} onClose={() => setOpenModel(false)}>
        <div>
          <TextInput label="Title" value={title} onChange={e => {
            setTitle(e.currentTarget.value);
          }} />
          <br />
          <Textarea label="Description" value={description} onChange={e => {
            setDescription(e.currentTarget.value);
          }} />
          <br />
          <Group position="right" direction="column">
            <Group>
              <Button
                onClick={() => {
                  onDelete(todo);
                  forceUpdateParent();
                }}
                color="red"
              >
                Delete
              </Button>
              <Button onClick={() => {
                Api.Todo.update({
                  id: todo.id,
                  title,
                  description,
                }).then((t) => {
                  Object.assign(todo, t);
                  setOpenModel(false);
                  forceUpdateParent();
                }).catch(e => {
                  console.error(e);
                });
              }}>
                Save
              </Button>
            </Group>
            {
              canHaveSubTodos && (<>
                <Group grow>
                  <Button disabled={newTodoLoading} loading={newTodoLoading} onClick={() => createTodo()}>New Todo</Button>
                </Group>
                <div className="todo-list">
                  {todos?.map(todo => (
                  <TodoItem
                    key={todo.id}
                    parentTodos={todos}
                    forceUpdate={forceUpdate}
                    todo={todo}
                    onDelete={todo => {
                      Api.Todo.delete(todo.id).then(() => {
                        setTodos(todos.filter(t => t.id !== todo.id));
                      });
                    }}
                    reorder={() => {
                      Api.Todo.order(todos).then(() => {
                        forceUpdate();
                      });
                    }}
                  />
                  ))}
                </div>
              </>)
            }
          </Group>
        </div>
      </Modal>
    </>
  )
}
