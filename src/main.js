import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(Toast, {
  position: 'top-right',
  timeout: 2800,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: true,
  draggable: true,
  maxToasts: 3,
  containerClassName: 'equity-toast-container',
  toastClassName: 'equity-toast',
  bodyClassName: 'equity-toast__body'
})

app.mount('#app')
