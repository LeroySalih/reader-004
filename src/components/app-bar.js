import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
  } from "react-router-dom";

  import styled from 'styled-components'

const MenuLink = styled(Link)`
  color: white;
  text-underline: none;
  margin-left: 2rem;
`

export default () => {
    return (
        <AppBar position="static">
  <Toolbar variant="dense">
    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
      <MenuIcon />
    </IconButton>
    
    <MenuLink to="/" style={{color: 'white'}}>Home</MenuLink>
    <MenuLink to="/admin" style={{color: 'white'}}>Admin</MenuLink>
    <MenuLink to="/weeklies" style={{color: 'white'}}>Weeklies</MenuLink>
    
    

    
  </Toolbar>
</AppBar>
    )
}