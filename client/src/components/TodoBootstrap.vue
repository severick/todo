<template>
  <b-container>
    <h1 class="title">Todos</h1>
    <h1 class="email">{{userEmail}}</h1>
    <b-container class="todoapp">
        <div v-if="loading">
            <h1 class="loading">Loading...</h1>
        </div>
        <div v-else>
            <header class="header">
                <b-input-group size="lg">
                    <b-input-group-prepend is-text>
                        <b-form-checkbox class="toggle-all" type="checkbox" v-model="allDone"></b-form-checkbox>
                    </b-input-group-prepend>
                    <b-form-input class="new-todo" autofocus
                    :placeholder="this.inputPlaceholder"
                    v-model="newTodo"
                    @keyup.enter="addTodo">
                    </b-form-input>
                </b-input-group>
            </header>
            <b-container class="main" v-show="todos.length" v-cloak>
                <b-input-group size="lg">
                    <b-row v-for="todo in filteredTodos"
                        class="todo"
                        :key="todo.id"
                        :class="{ completed: todo.completed, editing: todo == editedTodo }">
                        <b-col sm="12">
                            <b-form-input v-model="todo.title" :id="`${todo.id}`"></b-form-input>
                        </b-col>
                    </b-row>
                </b-input-group>
            </b-container>
        </div>
    </b-container>
  </b-container>
</template>

<script>
import api from '../Api'

  // visibility filters
  let filters = {
    all: function (todos) {
      return todos
    },
    active: function (todos) {
      return todos.filter(function (todo) {
        return !todo.completed
      })
    },
    completed: function (todos) {
      return todos.filter(function (todo) {
        return todo.completed
      })
    }
  }

  // app Vue instance
  const Todos = {
    name: 'Todos',
    props: {
      activeUser: Object
    },
    
    // app initial state
    data: function() {
      return {
        todos: [],
        newTodo: '',
        editedTodo: null,
        visibility: 'all',
        loading: true,
        error: null,
      }
    },

    mounted() {
        api.getAll()
            .then(response => {
                this.$log.debug("Data loaded: ", response.data)
                this.todos = response.data
            })
            .catch(error => {
                this.$log.debug(error)
                this.error = "Failed to load todos"
            })
            .finally(() => this.loading = false)
    },

    // computed properties
    // http://vuejs.org/guide/computed.html
    computed: {
      filteredTodos: function () {
        return filters[this.visibility](this.todos)
      },
      remaining: function () {
        return filters.active(this.todos).length
      },
      allDone: {
        get: function () {
          return this.remaining === 0
        },
        set: function (value) {
          this.todos.forEach(function (todo) {
            todo.completed = value
          })
        }
      },
      userEmail: function () {
        return this.activeUser ? this.activeUser.email : ''
      },
      inputPlaceholder: function () {
        return this.activeUser ? this.activeUser.given_name + ', what needs to be done?' : 'What needs to be done?'
      }
    },

    filters: {
      pluralize: function (n) {
        return n === 1 ? 'item' : 'items'
      }
    },

    // methods that implement data logic.
    // note there's no DOM manipulation here at all.
    methods: {

      addTodo: function () {
        var value = this.newTodo && this.newTodo.trim()
        if (!value) {
          return
        }

        api.createNew(value, false).then( (response) => {
          this.$log.debug("New item created:", response);
            this.todos.push({
          id: response.data.id,
              title: value,
              completed: false
            })
        }).catch((error) => {
          this.$log.debug(error);
            this.error = "Failed to add todo"
            });

        this.newTodo = ''
      },

      setVisibility: function(vis) {
        this.visibility = vis
      },

      completeTodo (todo) {
        api.updatedForId(todo.id, todo.title, todo.completed).then((response) => {
          this.$log.info("Item updated:", response.data);
        }).catch((error) => {
          this.$log.debug(error)
          todo.completed = !todo.completed
          this.error = "Failed to updated todo"
        });
      },

      removeTodo: function (todo) { // notice NOT using "=>" syntax
        api.removeForId(todo.id).then(() => {
          this.$log.debug("Item removed:", todo);
          this.todos.splice(this.todos.indexOf(todo), 1)
        }).catch((error) => {
          this.$log.debug(error);
          this.error = "Failed to remove todo"
        });
      },

      editTodo: function (todo) {
        this.beforeEditCache = todo.title
        this.editedTodo = todo
      },

      doneEdit: function (todo) {
        if (!this.editedTodo) {
          return
        }

        this.$log.info("Item udpated:", todo);
        api.updateForId(todo.id, todo.title.trim(), todo.completed).then((response) => {
          this.$log.info("Item updated:", response.data);
          this.editedTodo = null,
          todo.title = todo.title.trim()
        }).catch((error) => {
          this.$log.debug(error)
          this.cancelEdit(todo)
          this.error = "Failed to update todo"
        });

        if (!todo.title) {
          this.removeTodo(todo)
        }
      },

      cancelEdit: function (todo) {
        this.editedTodo = null
        todo.title = this.beforeEditCache
      },

      removeCompleted: function () {
        this.todos = filters.active(this.todos)
      },

      handleErrorClick: function () {
        this.error = null;
      },
    },

    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
      'todo-focus': function (el, binding) {
        if (binding.value) {
          el.focus()
        }
      }
    }
  }

  export default Todos
</script>

<style>
 [v-cloak] { display: none; }
</style>