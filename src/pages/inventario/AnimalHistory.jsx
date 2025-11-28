import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { FileDown, ArrowLeft, Calendar, FileText } from "lucide-react";
import { apiGet } from "../../api/api";

export default function AnimalHistory() {
  const { id, fincaid } = useParams(); // id del animal y fincaid desde la URL
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);

  // Cargar información del animal y su historial
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener información básica del animal
        const animalData = await apiGet(`/api/inventory/animales/${id}`);
        setAnimal(animalData);

        // Obtener historial del animal
        const historyData = await apiGet(`/api/inventory/animales/historias/animal/${id}`);
        console.log(historyData);
        // Ordenar por fecha descendente (más reciente primero)
        const sortedHistory = Array.isArray(historyData) 
          ? historyData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          : [];
        
        setHistory(sortedHistory);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message || "Error al cargar el historial");
        
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Exportar a PDF
  const handleExportPDF = async () => {
    try {
      setExportando(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch(
        `http://localhost:8080/api/inventory/animales/historias/animal/${id}/export/pdf`,
        {
          headers: {
            "Authorization": token ? `Bearer ${token}` : undefined
          }
        }
      );

      if (!response.ok) throw new Error("Error al exportar el historial");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `historial_animal_${animal?.identificador || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exportando PDF:", err);
      alert(err.message || "Error al exportar el historial");
    } finally {
      setExportando(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no registrada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  // Determinar color según tipo de evento
  const getEventColor = (tipoEvento) => {
    const colors = {
      BAJA: "border-red-600 bg-red-50",
      NACIMIENTO: "border-green-600 bg-green-50",
      VACUNACION: "border-blue-600 bg-blue-50",
      TRATAMIENTO: "border-yellow-600 bg-yellow-50",
      PESAJE: "border-purple-600 bg-purple-50",
      MOVIMIENTO: "border-indigo-600 bg-indigo-50",
      REPRODUCCION: "border-pink-600 bg-pink-50",
      SANITARIO: "border-orange-600 bg-orange-50"
    };
    return colors[tipoEvento?.toUpperCase()] || "border-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Botón volver */}
        <button
          onClick={() => navigate(`/${fincaid}/inventario/${id}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al animal
        </button>

        {/* Encabezado */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                Historial completo
              </h2>
              <p className="text-gray-600">
                {animal?.identificador || `Animal #${id}`} • {animal?.especie || "N/A"} • {animal?.raza || "N/A"}
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={exportando || history.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  Exportar PDF
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{history.length} registro{history.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Lista del historial */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Registros del historial</h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No hay registros en el historial</p>
              <p className="text-gray-500 text-sm">
                Los eventos del animal aparecerán aquí automáticamente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((event) => (
                <div
                  key={event.id}
                  className={`border-l-4 pl-4 py-3 rounded-md transition hover:shadow-md ${getEventColor(event.tipoEvento)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white shadow-sm mb-2">
                        {event.tipoEvento || "EVENTO"}
                      </span>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.fecha)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-900 font-medium mb-1">
                    {event.descripcion || "Sin descripción"}
                  </p>

                  {/* Información adicional */}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                    {event.peso && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Peso:</span> {event.peso} kg
                      </span>
                    )}
                    {event.ubicacion && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Ubicación:</span> {event.ubicacion}
                      </span>
                    )}
                    {event.estado !== undefined && event.estado !== null && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Estado:</span> {event.estado ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Historial del ciclo productivo del animal
        </p>
      </div>
    </div>
  );
}