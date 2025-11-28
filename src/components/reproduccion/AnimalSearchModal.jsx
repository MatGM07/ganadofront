import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { apiGet } from "../../api/api";

export default function AnimalSearchModal({ isOpen, onClose, onConfirm, fincaid, title, filtroSexo = null }) {
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  useEffect(() => {
    if (isOpen && fincaid) {
      fetchAnimales();
    }
  }, [isOpen, fincaid]);

  const fetchAnimales = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/inventory/animales");
      
      // Filtrar animales por finca
      let animalesFinca = data.filter(animal => animal.fincaId === fincaid);
      
      // Aplicar filtro de sexo si está presente
      if (filtroSexo) {
        animalesFinca = animalesFinca.filter(animal => animal.sexo === filtroSexo);
      }
      
      setAnimales(animalesFinca);
    } catch (err) {
      console.error("Error cargando animales:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimales = animales.filter(animal => 
    animal.identificador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.especie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.raza?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedAnimal) {
      onConfirm(selectedAnimal);
      onClose();
      setSelectedAnimal(null);
      setSearchTerm("");
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedAnimal(null);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{title}</h3>
              {filtroSexo && (
                <p className="text-sm text-pink-100 mt-1">
                  Mostrando solo {filtroSexo === "H" ? "hembras" : filtroSexo === "M" ? "machos" : "animales"}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por identificador, especie o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Animal List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando animales...</p>
            </div>
          ) : filteredAnimales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm 
                  ? "No se encontraron animales con ese criterio" 
                  : filtroSexo 
                    ? `No hay ${filtroSexo === "H" ? "hembras" : "machos"} registradas en esta finca`
                    : "No hay animales registrados en esta finca"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnimales.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => setSelectedAnimal(animal)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedAnimal?.id === animal.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-gray-800">
                        {animal.identificador || "Sin identificador"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {animal.especie} • {animal.raza} • {animal.sexo}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Estado: {animal.estado} {animal.peso && `• Peso: ${animal.peso} kg`}
                      </p>
                    </div>
                    {selectedAnimal?.id === animal.id && (
                      <div className="bg-pink-500 text-white p-2 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAnimal}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedAnimal
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}