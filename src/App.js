import React from "react"

import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";

  import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import Home from './pages/Home'
import Admin from './pages/Admin'
import Redirect from './pages/Redirect'
import Weeklies from "./pages/Weeklies";

import { SignInButton } from './components/SignInButton';
import { SignOutButton } from "./components/SignOutButton";

export default () => {
    return  <Router>
      
      <div>
        <nav>
        <AuthenticatedTemplate>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/admin">Admin</Link>
            </li>
            <li>
              <Link to="/weeklies">Weeklies</Link>
            </li>
            <li>
              <Link to="/redirect">Redirect</Link>
            </li>
          </ul>
          <SignOutButton/>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
          <SignInButton/>  
          </UnauthenticatedTemplate>

          
          
          
        </nav>

        <Routes>
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/admin" element={<Admin/>} />
            <Route exact path="/weeklies" element={<Weeklies/>} />
            <Route exact path="/redirect" element={<Redirect/>} />
        </Routes>

        
      </div>
    </Router>
}






function Users(){
    return <h1>Users</h1>
}