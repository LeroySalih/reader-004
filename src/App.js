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

import styled from "styled-components";

import AppBar from './components/app-bar';
import { SignInButton } from './components/SignInButton';
import { SignOutButton } from "./components/SignOutButton";

const Layout = styled.div`
  max-width : 80vw;
  margin-left : auto;
  margin-right: auto;
`


export default () => {
    return  <Router>
      
      <div>
        <nav>
        <AuthenticatedTemplate>
          <AppBar/>
          
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
        <Layout>
          <Routes>
              <Route exact path="/" element={<Home/>} />
              <Route exact path="/admin" element={<Admin/>} />
              <Route exact path="/weeklies" element={<Weeklies/>} />
              <Route exact path="/redirect" element={<Redirect/>} />
          </Routes>
        </Layout>
        
      </div>
    </Router>
}






function Users(){
    return <h1>Users</h1>
}