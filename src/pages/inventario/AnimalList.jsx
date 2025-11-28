import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Beef, Plus, ArrowLeft, Search, Filter } from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import { apiGet } from "../../api/api";

export default function AnimalList() {
  const { fincaid } = useParams();
  const navigate = useNavigate();
  const { selectedFinca } = useAuth();

  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    sexo: "",
    raza: "",
    ubicacion: "",
    especie: "",
    estado: "",
  });

  useEffect(() => {
    const fetchAnimales = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todos los animales
        const data = await apiGet("/api/inventory/animales");
        
        // Filtrar solo los animales de esta finca
        const animalesDeFinca = data.filter(animal => animal.fincaId === fincaid);
        
        setAnimales(animalesDeFinca);
      } catch (err) {
        console.error("Error cargando animales:", err);
        setError(err.message || "Error al cargar los animales");
      } finally {
        setLoading(false);
      }
    };

    if (fincaid) {
      fetchAnimales();
    }
  }, [fincaid]);

  // Calcular edad del animal
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No registrada";
    
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    if (edad === 0) {
      const meses = mes < 0 ? 12 + mes : mes;
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    
    return `${edad} ${edad === 1 ? 'año' : 'años'}`;
  };

  // Filtrado de animales
  const filtered = animales
    .filter((a) => {
      if (search.trim() !== "") {
        return (
          a.id?.toLowerCase().includes(search.toLowerCase()) ||
          a.identificador?.toLowerCase().includes(search.toLowerCase()) ||
          a.raza?.toLowerCase().includes(search.toLowerCase()) ||
          a.especie?.toLowerCase().includes(search.toLowerCase())
        );
      }
      return true;
    })
    .filter((a) => {
      if (filters.sexo && a.sexo !== filters.sexo) return false;
      if (filters.raza && !a.raza?.toLowerCase().includes(filters.raza.toLowerCase())) return false;
      if (filters.ubicacion && !a.ubicacion?.toLowerCase().includes(filters.ubicacion.toLowerCase())) return false;
      if (filters.especie && a.especie?.toLowerCase() !== filters.especie.toLowerCase()) return false;
      if (filters.estado && a.estado !== filters.estado) return false;
      return true;
    });

  const handleVolverFinca = () => {
    navigate(`/finca/${fincaid}`);
  };

  const handleAgregarAnimal = () => {
    navigate(`/${fincaid}/inventario/registrar`);
  };

  const handleVerDetalle = (animalId) => {
    navigate(`/${fincaid}/inventario/${animalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando inventario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <Beef className="w-8 h-8 text-red-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar inventario</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleVolverFinca}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Volver a la Finca
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleVolverFinca}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <Beef className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    Inventario de Animales
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedFinca?.nombre || "Finca"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleAgregarAnimal}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Animal</span>
            </button>
          </div>

          {/* BUSCADOR */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por identificación, ID, raza o especie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.sexo}
                onChange={(e) => setFilters({ ...filters, sexo: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
            </div>

            {/* Raza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Filtrar por raza..."
                value={filters.raza}
                onChange={(e) => setFilters({ ...filters, raza: e.target.value })}
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Filtrar por ubicación..."
                value={filters.ubicacion}
                onChange={(e) => setFilters({ ...filters, ubicacion: e.target.value })}
              />
            </div>

            {/* Especie — SELECT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.especie}
                onChange={(e) => setFilters({ ...filters, especie: e.target.value })}
              >
                <option value="">Todas</option>
                <option value="bovino">Bovino</option>
                <option value="porcino">Porcino</option>
                <option value="ave">Ave de corral</option>
                <option value="equino">Equino</option>
                <option value="caprino">Caprino</option>
                <option value="ovino">Ovino</option>
              </select>
            </div>

            {/* ESTADO — SELECT NUEVO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

          </div>

          {/* Botón limpiar */}
          {(filters.sexo || filters.raza || filters.ubicacion || filters.especie || filters.estado) && (
            <button
              onClick={() =>
                setFilters({ sexo: "", raza: "", ubicacion: "", especie: "", estado: "" })
              }
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Total de Animales</p>
            <p className="text-3xl font-bold text-blue-600">{animales.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Resultados Filtrados</p>
            <p className="text-3xl font-bold text-green-600">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-sm text-gray-500">Machos / Hembras</p>
            <p className="text-3xl font-bold text-purple-600">
              {animales.filter(a => a.sexo === 'M').length} / {animales.filter(a => a.sexo === 'H').length}
            </p>
          </div>
        </div>

        {/* LISTADO */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-800">
            Animales de la Finca
            {filtered.length !== animales.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (mostrando {filtered.length} de {animales.length})
              </span>
            )}
          </h3>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-6 rounded-full">
                  <Beef className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {animales.length === 0 ? "No hay animales registrados" : "No se encontraron animales"}
              </h3>
              <p className="text-gray-600 mb-6">
                {animales.length === 0 
                  ? "Comienza agregando tu primer animal al inventario"
                  : "Intenta ajustar los filtros de búsqueda"
                }
              </p>
              {animales.length === 0 && (
                <button
                  onClick={handleAgregarAnimal}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Agregar Primer Animal</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => handleVerDetalle(animal.id)}
                  className={`p-6 border-2 rounded-2xl shadow-md transition-all cursor-pointer 
                    ${animal.estado?.toLowerCase() === "inactivo"
                      ? "bg-red-50 border-red-300 hover:shadow-lg hover:border-red-400"
                      : "bg-white border-gray-200 hover:shadow-xl hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                      <Beef className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      animal.sexo === 'M' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {animal.sexo === 'M' ? 'Macho' : 'Hembra'}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-blue-700 mb-1">
                    {animal.identificador || "Sin identificación"}
                  </h4>

                  <p className="text-sm text-gray-500 mb-3">
                    {animal.especie || "Sin especie"} • {animal.raza || "Raza no especificada"}
                  </p>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium">Edad:</span>
                      <span>{calcularEdad(animal.fechaNacimiento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Peso:</span>
                      <span>{animal.peso ? `${animal.peso} kg` : "No registrado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ubicación:</span>
                      <span className="text-right">{animal.ubicacion || "No definida"}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      ID: {animal.id.substring(0, 8)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Inventario completo de {selectedFinca?.nombre || "la finca"}
        </p>
      </div>
    </div>
  );
}