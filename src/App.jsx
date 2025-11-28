import Login from 'pages/Login';
import Register from 'pages/Register';
import FincaRegister from 'pages/inventario/FincaRegister'
import Home from 'pages/Home';
import Password from 'pages/PasswordRecovery'
import ProtectedRoute from "./api/ProtectedRoute";
import FincaProtectedRoute from './api/FincaProtectedRoute';
import AnimalRegister from 'pages/inventario/AnimalRegister'
import AnimalEdit from 'pages/inventario/AnimalEdit'
import AnimalDetail from 'pages/inventario/AnimalDetail'
import AnimalList from 'pages/inventario/AnimalList'
import AnimalHistory from 'pages/inventario/AnimalHistory'
import FincaDashboard from 'pages/inventario/FincaDashboard';
import SanidadMenu from 'pages/sanidad/SanidadMenu';
import AgregarTratamiento from 'pages/sanidad/AgregarTratamiento';
import AgregarVacuna from 'pages/sanidad/AgregarVacuna';
import AgregarEnfermedad from 'pages/sanidad/AgregarEnfermedad';
import AgregarIncidenciaVacuna from 'pages/sanidad/AgregarIncidenciaVacuna';
import AgregarIncidenciaTratamiento from 'pages/sanidad/AgregarIncidenciaTratamiento';
import AgregarIncidenciaEnfermedad from 'pages/sanidad/AgregarIncidenciaEnfermedad';
import SanidadHistorial from 'pages/sanidad/SanidadHistorial';
import EditIncidenciaSanidad from 'pages/sanidad/EditIncidenciaSanidad';
import ReproductionBirth from 'pages/reproduccion/ReproductionBirth';
import ReproductionDashboard from 'pages/reproduccion/ReproductionDashboard';
import MontaRegister from 'pages/reproduccion/MontaRegister';
import DiagnosticoGestacion from 'pages/reproduccion/DiagnosticoGestacion';
import ReproduccionHistorial from 'pages/reproduccion/ReproductionHistorial';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>

        <Route
          path="/fincaRegister"
          element={
            <ProtectedRoute>
              <FincaRegister />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finca/:id"
          element={
            <FincaProtectedRoute>
              <FincaDashboard />
            </FincaProtectedRoute>
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

        <Route
          path=":fincaid/inventario/"
          element={
            <FincaProtectedRoute>
              <AnimalList />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/inventario/registrar"
          element={
            <FincaProtectedRoute>
              <AnimalRegister />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/inventario/:id/editar"
          element={
            <FincaProtectedRoute>
              <AnimalEdit />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/inventario/:id"
          element={
            <FincaProtectedRoute>
              <AnimalDetail />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/inventario/:id/historial"
          element={
            <FincaProtectedRoute>
              <AnimalHistory />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad"
          element={
            <FincaProtectedRoute>
              <SanidadMenu />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/addtratamiento"
          element={
            <FincaProtectedRoute>
              <AgregarTratamiento />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/addvacuna"
          element={
            <FincaProtectedRoute>
              <AgregarVacuna />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/addenfermedad"
          element={
            <FincaProtectedRoute>
              <AgregarEnfermedad />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/incidenciavacuna/:animalId"
          element={
            <FincaProtectedRoute>
              <AgregarIncidenciaVacuna />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/incidenciatratamiento/:animalId"
          element={
            <FincaProtectedRoute>
              <AgregarIncidenciaTratamiento />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/incidenciaenfermedad/:animalId"
          element={
            <FincaProtectedRoute>
              <AgregarIncidenciaEnfermedad />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/:id/historial"
          element={
            <FincaProtectedRoute>
              <SanidadHistorial />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/sanidad/edit/:tipo/:id"
          element={
            <FincaProtectedRoute>
              <EditIncidenciaSanidad />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/reproduccion/nacimiento"
          element={
            <FincaProtectedRoute>
              <ReproductionBirth />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/reproduccion"
          element={
            <FincaProtectedRoute>
              <ReproductionDashboard />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/reproduccion/monta/:animalId"
          element={
            <FincaProtectedRoute>
              <MontaRegister />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/reproduccion/diagnostico/:animalId"
          element={
            <FincaProtectedRoute>
              <DiagnosticoGestacion />
            </FincaProtectedRoute>
          }
        />

        <Route
          path="/:fincaid/reproduccion/historial/:animalId"
          element={
            <FincaProtectedRoute>
              <ReproduccionHistorial />
            </FincaProtectedRoute>
          }
        />





      </Routes>
    </Router>
  );
}

export default App
