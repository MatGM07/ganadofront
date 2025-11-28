import React, { useState, useEffect } from "react";
import { Search, X, AlertCircle, Beef } from "lucide-react";
import { apiGet } from "../../api/api";

/**
 * Modal reutilizable para buscar y seleccionar un animal
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función que recibe el animal seleccionado
 * @param {string} fincaid - ID de la finca actual
 * @param {string} title - Título del modal
 */
export default function AnimalSearchModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  fincaid,
  title = "Seleccionar Animal" 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [animales, setAnimales] = useState([]);
  const [filteredAnimales, setFilteredAnimales] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar animales de la finca
  useEffect(() => {
    if (isOpen && fincaid) {
      fetchAnimales();
    }
  }, [isOpen, fincaid]);

  // Filtrar animales cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAnimales(animales);
    } else {
      const filtered = animales.filter(animal => 
        animal.identificador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAnimales(filtered);
    }
  }, [searchTerm, animales]);

  const fetchAnimales = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los animales
      const data = await apiGet("/api/inventory/animales");

      // Filtrar solo los animales de esta finca y con estado "Activo"
      const animalesDeFinca = data.filter(
        animal => animal.fincaId === fincaid && animal.estado === "Activo"
      );

      setAnimales(animalesDeFinca);
      setFilteredAnimales(animalesDeFinca);
    } catch (err) {
      console.error("Error cargando animales:", err);
      setError("Error al cargar los animales de la finca");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedAnimal) {
      onConfirm(selectedAnimal);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setSelectedAnimal(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por identificador del animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {filteredAnimales.length} animal{filteredAnimales.length !== 1 ? 'es' : ''} encontrado{filteredAnimales.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lista de animales */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando animales...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : filteredAnimales.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Beef className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? "No se encontraron animales" : "No hay animales disponibles"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnimales.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => setSelectedAnimal(animal)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    selectedAnimal?.id === animal.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                        <Beef className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {animal.identificador || "Sin identificación"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {animal.especie || "N/A"} • {animal.raza || "N/A"} • {
                            animal.sexo === "M" ? "Macho" : "Hembra"
                          }
                        </p>
                      </div>
                    </div>
                    {selectedAnimal?.id === animal.id && (
                      <div className="flex-shrink-0">
                        <div className="bg-blue-500 rounded-full p-1">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAnimal}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Confirmar Selección
          </button>
        </div>
      </div>
    </div>
  );
}