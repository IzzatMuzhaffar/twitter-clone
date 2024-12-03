import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import { Provider } from 'react-redux'
import store from './store'
import { AuthProvider } from './components/AuthProvider'
import { initAdmin } from './firebaseAdmin'


export default async function App() {
  await initAdmin()
  return (
    <AuthProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="*" element={<AuthPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </AuthProvider>
  )
}
