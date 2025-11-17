import Login from 'pages/Login';
import Register from 'pages/Register';
import FincaRegister from 'pages/inventario/FincaRegister'
import Home from 'pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/fincaRegister" element={<FincaRegister />}/>
      </Routes>
    </Router>
  );
}

export default App
