import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import { FileDown } from "lucide-react";

export default function AnimalHistory() {
  const { id } = useParams(); // id del animal desde la URL

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // === Cargar historial del backend ===
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/animales/${id}/historial`);
        if (!res.ok) throw new Error("Error consultando historial");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  // === Exportar a PDF ===
  const handleExportPDF = () => {
    window.open(`http://localhost:8080/api/animales/${id}/historial/pdf`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Historial completo del animal #{id}
          </h2>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
          >
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {/* Lista del historial */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {history.length === 0 ? (
            <p className="text-gray-600 text-center">No hay registros en el historial.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((event, index) => (
                <li
                  key={index}
                  className="border-l-4 border-blue-600 pl-4 py-3 bg-blue-50 rounded-md"
                >
                  <p className="text-sm text-gray-500">{event.fecha}</p>
                  <p className="font-semibold">{event.tipo}</p>
                  <p className="text-gray-700">{event.descripcion}</p>

                  {event.peso && (
                    <p className="text-gray-600 text-sm">Peso: {event.peso} kg</p>
                  )}
                  {event.ubicacion && (
                    <p className="text-gray-600 text-sm">Ubicación: {event.ubicacion}</p>
                  )}
                  {event.estado && (
                    <p className="text-gray-600 text-sm">Estado: {event.estado}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Historial del ciclo productivo del animal
        </p>
      </div>
    </div>
  );
}
