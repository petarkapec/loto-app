import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import Home from './pages/Home'
import Buy from './pages/Buy'
import TicketView from './pages/TicketView'

// Protected route wrapper
function RequireAuth({ children }) {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect()
    }
  }, [isAuthenticated, loginWithRedirect])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  return children
}

// Nav with login/logout
function Nav() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0()
  
  return (
    <nav style={{padding: '10px', display: 'flex', justifyContent: 'space-between'}}>
      <div>
        <Link to="/">Home</Link> {isAuthenticated && <> | <Link to="/buy">Buy Ticket</Link></>}
      </div>
      <div>
        {isAuthenticated ? (
          <span>
            {user?.email} |{' '}
            <button onClick={() => logout()}>
              Logout
            </button>
          </span>
        ) : (
          <button onClick={() => loginWithRedirect()}>Login</button>
        )}
      </div>
    </nav>
  )
}

function App(){
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE
      }}
    >
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/buy" element={
            <RequireAuth>
              <Buy/>
            </RequireAuth>
          } />
          <Route path="/ticket/:id" element={<TicketView/>} />
        </Routes>
      </BrowserRouter>
    </Auth0Provider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
