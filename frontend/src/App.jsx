import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

function Profile() {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Korisnik: {user.name}</p>
          <button onClick={() => logout()}>Odjava</button>
        </>
      ) : (
        <button onClick={() => loginWithRedirect()}>Prijava</button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Auth0Provider
      domain="tvoj-auth0-domain"
      clientId="tvoj-client-id"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <Profile />
    </Auth0Provider>
  );
}
