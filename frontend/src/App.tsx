import useStore from './store/useStore'
import Login from './components/Login'
import Layout from './components/Layout'

function App() {
  const { authenticated } = useStore()

  if (!authenticated) {
    return <Login />
  }

  return <Layout />
}

export default App
