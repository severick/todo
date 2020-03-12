import axios from 'axios'  
import Vue from 'vue'  
  
const SERVER_URL = 'http://localhost:9000';  
  
const instance = axios.create({  
  baseURL: SERVER_URL,  
  timeout: 1000  
});  
  
export default {  
  
  async execute(method, resource, data, config) {  
    let accessToken = await Vue.prototype.$auth.getAccessToken()  
    return instance({  
      method:method,  
      url: resource,  
      data,  
      headers: {  
            Authorization: `Bearer ${accessToken}`  
      },  
      ...config  
    })  
  },  
  
  // (C)reate  
  createNew(todo, completed) {  
    return this.execute('POST', 'todos', {title: todo.title, completed: completed, date: todo.date})  
  },  
  // (R)ead  
  getAll() {  
    return this.execute('GET','todos', null, {  
      transformResponse: [function (data) {  
        return data? JSON.parse(data)._embedded.todos : data;  
      }]  
    })  
  },  
  // (U)pdate  
  updateForId(id, text, completed, date) {  
    return this.execute('PUT', 'todos/' + id, { title: text, completed: completed, date: date })  
  },  
  
  // (D)elete  
  removeForId(id) {  
    return this.execute('DELETE', 'todos/'+id)  
  }  
}