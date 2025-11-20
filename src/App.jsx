import Login from 'pages/Login';
import Register from 'pages/Register';
import FincaRegister from 'pages/inventario/FincaRegister'
import Home from 'pages/Home';
import Password from 'pages/PasswordRecovery'
import ProtectedRoute from "./api/ProtectedRoute";
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
      </Routes>
    </Router>
  );
}

export default App
