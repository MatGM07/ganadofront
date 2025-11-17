import { MapPin, Home, Map } from 'lucide-react';
import React, { useState } from 'react';
import Header from '../../components/Header';

// TODO: Instalar el paquete colombia-json
// npm install colombia-json
// import { departments, cities } from "colombia-json";

// Datos temporales para desarrollo (reemplazar con import real)
const departments = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", 
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", 
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", 
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda", 
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", 
  "Vaupés", "Vichada"
];

const cities = [
  { city: "Villavicencio", department: "Meta" },
  { city: "Acacías", department: "Meta" },
  { city: "Granada", department: "Meta" },
  { city: "Bogotá", department: "Cundinamarca" },
  { city: "Soacha", department: "Cundinamarca" },
  { city: "Medellín", department: "Antioquia" },
  { city: "Envigado", department: "Antioquia" },
];

function FincaRegister() {
  const [nombreFinca, setNombreFinca] = useState('');
  const [dept, setDept] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]);

  const handleDepartamento = (e) => {
    const selectedDept = e.target.value;
    setDept(selectedDept);
    setMunicipio(''); // Reset municipio cuando cambia el departamento
    setMunicipiosFiltrados(
      cities.filter((c) => c.department === selectedDept)
    );
  };

  const handleSubmit = () => {
    console.log('Crear finca:', { nombreFinca, dept, municipio });
    // TODO: Aquí iría la lógica para enviar al backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Logo y título */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Nueva Finca
              </h2>
              <p className="mt-2 text-gray-600">
                Registra una nueva finca en Ganado360
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              {/* Campo Nombre de Finca */}
              <div>
                <label htmlFor="nombreFinca" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Finca
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nombreFinca"
                    name="nombreFinca"
                    type="text"
                    value={nombreFinca}
                    onChange={(e) => setNombreFinca(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    placeholder="Ej: Finca El Roble"
                  />
                </div>
              </div>

              {/* Campo Departamento */}
              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Map className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="departamento"
                    name="departamento"
                    value={dept}
                    onChange={handleDepartamento}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione un departamento...</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Campo Municipio */}
              <div>
                <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-2">
                  Municipio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="municipio"
                    name="municipio"
                    disabled={!dept}
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccione un municipio...</option>
                    {municipiosFiltrados.map((m) => (
                      <option key={m.city} value={m.city}>
                        {m.city}
                      </option>
                    ))}
                  </select>
                </div>
                {!dept && (
                  <p className="mt-2 text-sm text-gray-500">
                    Primero selecciona un departamento
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!nombreFinca || !dept || !municipio}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Crear Finca</span>
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                >
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Los datos de la finca se pueden editar más adelante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FincaRegister;