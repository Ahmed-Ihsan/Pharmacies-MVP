import Router from './router'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import ErrorBoundary from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <UserPreferencesProvider>
        <Router />
      </UserPreferencesProvider>
    </ErrorBoundary>
  )
}

export default App
