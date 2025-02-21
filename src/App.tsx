import React from 'react';
import  { ThemeProvider } from 'styled-components';
import { HashRouter as BrowserRouter, Routes, Route  } from "react-router-dom"
import Home from './pages/Home';
import Cadastrar from './pages/Cadastro';
import Localizations from './pages/Localizations';

const App: React.FC = () => {

  const theme = {
    primary: '#322153',
    secondary: '#6C63FF',
    background: '#F0F0F5',
    text : '#6C6C80',
    white: '#FFF',
  }
  return (
    <ThemeProvider theme={theme}>
        <BrowserRouter basename='/'>
          <Routes>
            <Route  path="/" element={<Home />} />
            <Route path="/register" element={<Cadastrar/>} />
            <Route path="/localization" element={<Localizations/>} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
