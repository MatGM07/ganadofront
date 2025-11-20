import Login from 'pages/Login';
import Register from 'pages/Register';
import FincaRegister from 'pages/usuarios/FincaRegister'
import Home from 'pages/Home';
import Password from 'pages/PasswordRecovery'
import ProtectedRoute from "./api/ProtectedRoute";
import AnimalRegister from 'pages/inventario/AnimalRegister'
import AnimalEdit from 'pages/inventario/AnimalEdit'
import AnimalDetail from 'pages/inventario/AnimalDetail'
import AnimalList from 'pages/inventario/AnimalList'
import AnimalHistory from 'pages/inventario/AnimalHistory'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/fincaRegister" element={<FincaRegister />}/>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/passwordrecovery"
          element={
            <ProtectedRoute>
              <Password />
            </ProtectedRoute>
          }
        />
        <Route path="/inventario/registrar" element={<AnimalRegister />} />
        <Route path="/inventario/:id/editar" element={<AnimalEdit />} />
        <Route path="/inventario/:id" element={<AnimalDetail />} />
        <Route path="/inventario/:id/historial" element={<AnimalHistory />} />
        <Route path="/inventario" element={<AnimalList />} />
      </Routes>
    </Router>
  );
}

export default App
