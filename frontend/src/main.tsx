import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'

import { store } from '@/core/store'
import { App } from '@/app'

import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
