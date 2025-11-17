import { Beef, Plus, ArrowRight, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function Home() {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de llamada al backend
    // TODO: Reemplazar con la llamada real a la API
    const fetchFincas = async () => {
      try {
        setLoading(true);
        // const response = await fetch('/api/fincas');
        // const data = await response.json();
        // setFincas(data);
        
        // Datos de ejemplo (eliminar cuando se conecte al backend)
        setTimeout(() => {
          setFincas([
            { id: 1, nombre: 'Finca El Roble' },
            { id: 2, nombre: 'Finca San José' },
            { id: 3, nombre: 'Finca La Pradera' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar fincas:', error);
        setLoading(false);
      }
    };

    fetchFincas();
  }, []);

  const handleIngresar = (fincaId) => {
    console.log('Ingresar a finca:', fincaId);
    // TODO: Navegar a la finca seleccionada
  };

  const handleAgregarFinca = () => {
    console.log('Agregar nueva finca');
    // TODO: Navegar a formulario de agregar finca
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Mis Fincas
          </h1>
          <p className="text-gray-600 text-lg">
            Selecciona una finca para gestionar tu ganado
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Sin fincas */}
            {fincas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg">
                      <MapPin className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Aún no tienes fincas
                  </h2>
                  <p className="text-gray-600">
                    Comienza agregando tu primera finca para gestionar tu ganado
                  </p>
                  <button
                    onClick={handleAgregarFinca}
                    className="w-full flex justify-center items-center space-x-2 py-3 px-6 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Finca</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Botón agregar finca (cuando hay fincas) */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={handleAgregarFinca}
                    className="flex items-center space-x-2 py-3 px-6 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Finca</span>
                  </button>
                </div>

                {/* Grid de fincas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fincas.map((finca) => (
                    <div
                      key={finca.id}
                      className="bg-white rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow duration-200"
                    >
                      {/* Icono y nombre */}
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                            <Beef className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {finca.nombre}
                        </h3>
                      </div>

                      {/* Botón ingresar */}
                      <button
                        onClick={() => handleIngresar(finca.id)}
                        className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                      >
                        <span>Ingresar</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;