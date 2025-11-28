import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, Syringe, Pill, AlertCircle, Calendar, User, FileText } from "lucide-react";
import Header from "../../components/Header";
import { apiGet } from "../../api/api";

export default function SanidadHistorial() {
  const { fincaid, id } = useParams(); // id del animal y fincaid desde la URL
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener información del animal
        const animalData = await apiGet(`/api/inventory/animales/${id}`);
        setAnimal(animalData);

        // Obtener todas las incidencias en paralelo
        const [enfermedades, tratamientos, vacunas] = await Promise.all([
          apiGet(`/api/sanidad/enfermedades/incidencias/animal/${id}`).catch(() => []),
          apiGet(`/api/sanidad/tratamientos/incidencias/animal/${id}`).catch(() => []),
          apiGet(`/api/sanidad/vacunas/incidencias/animal/${id}`).catch(() => [])
        ]);

        console.log("Enfermedades:", enfermedades);
        console.log("Tratamientos:", tratamientos);
        console.log("Vacunas:", vacunas);

        // Normalizar y combinar todas las incidencias
        const todasIncidencias = [
          ...(Array.isArray(enfermedades) ? enfermedades : []).map(inc => ({
            ...inc,
            tipo: "ENFERMEDAD",
            fecha: inc.fechaDiagnostico,
            nombre: inc.enfermedadNombre,
            tipoId: inc.enfermedadId
          })),
          ...(Array.isArray(tratamientos) ? tratamientos : []).map(inc => ({
            ...inc,
            tipo: "TRATAMIENTO",
            fecha: inc.fechaTratamiento,
            nombre: inc.tratamientoNombre,
            tipoId: inc.tratamientoId
          })),
          ...(Array.isArray(vacunas) ? vacunas : []).map(inc => ({
            ...inc,
            tipo: "VACUNA",
            fecha: inc.fechaVacunacion,
            nombre: inc.productoNombre,
            tipoId: inc.productoId
          }))
        ];

        // Ordenar por fecha descendente
        const sortedIncidencias = todasIncidencias.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        setIncidencias(sortedIncidencias);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message || "Error al cargar el historial sanitario");
        
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no registrada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  // Configuración visual por tipo de incidencia
  const getIncidenciaConfig = (tipo) => {
    const configs = {
      ENFERMEDAD: {
        icon: AlertCircle,
        color: "border-red-500 bg-red-50 hover:bg-red-100",
        badgeColor: "bg-red-500 text-white",
        iconColor: "text-red-600"
      },
      TRATAMIENTO: {
        icon: Pill,
        color: "border-yellow-500 bg-yellow-50 hover:bg-yellow-100",
        badgeColor: "bg-yellow-500 text-white",
        iconColor: "text-yellow-600"
      },
      VACUNA: {
        icon: Syringe,
        color: "border-blue-500 bg-blue-50 hover:bg-blue-100",
        badgeColor: "bg-blue-500 text-white",
        iconColor: "text-blue-600"
      }
    };
    return configs[tipo] || configs.VACUNA;
  };

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    const colors = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      APLICADO: "bg-green-100 text-green-800",
      COMPLETADO: "bg-green-100 text-green-800",
      ANULADO: "bg-gray-100 text-gray-800",
      DIAGNOSTICADA: "bg-orange-100 text-orange-800",
      EN_TRATAMIENTO: "bg-blue-100 text-blue-800",
      RECUPERADO: "bg-green-100 text-green-800"
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  // Manejar click en incidencia
  const handleIncidenciaClick = (incidencia) => {
    // Redirigir según el tipo de incidencia
    const routes = {
      ENFERMEDAD: `/${fincaid}/sanidad/edit/enfermedad/${incidencia.id}`,
      TRATAMIENTO: `/${fincaid}/sanidad/edit/tratamiento/${incidencia.id}`,
      VACUNA: `/${fincaid}/sanidad/edit/vacuna/${incidencia.id}`
    };
    navigate(routes[incidencia.tipo]);
  };

  // Filtrar incidencias
  const incidenciasFiltradas = filtroTipo === "TODOS" 
    ? incidencias 
    : incidencias.filter(inc => inc.tipo === filtroTipo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial sanitario...</p>
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
                onClick={() => navigate(`/${fincaid}/inventario/${id}`)}
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

      <div className="max-w-6xl mx-auto px-4 py-10">
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
                Historial Sanitario
              </h2>
              <p className="text-gray-600">
                {animal?.identificador || `Animal #${id}`} • {animal?.especie || "N/A"} • {animal?.raza || "N/A"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{incidencias.length} incidencia{incidencias.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {["TODOS", "ENFERMEDAD", "TRATAMIENTO", "VACUNA"].map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filtroTipo === tipo
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tipo === "TODOS" ? "Todas" : tipo.charAt(0) + tipo.slice(1).toLowerCase() }
              </button>
            ))}
          </div>
        </div>

        {/* Lista de incidencias */}
        <div className="space-y-4">
          {incidenciasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">
                {filtroTipo === "TODOS" 
                  ? "No hay incidencias sanitarias registradas"
                  : `No hay incidencias de tipo ${filtroTipo.toLowerCase()}`
                }
              </p>
              <p className="text-gray-500 text-sm">
                Las incidencias del animal aparecerán aquí automáticamente
              </p>
            </div>
          ) : (
            incidenciasFiltradas.map((incidencia) => {
              const config = getIncidenciaConfig(incidencia.tipo);
              const Icon = config.icon;

              return (
                <div
                  key={`${incidencia.tipo}-${incidencia.id}`}
                  onClick={() => handleIncidenciaClick(incidencia)}
                  className={`bg-white border-l-4 rounded-lg p-5 cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl ${config.color}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`p-3 rounded-full bg-white shadow-sm ${config.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${config.badgeColor} mb-2`}>
                            {incidencia.tipo}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">
                            {incidencia.nombre || "Sin nombre"}
                          </h3>
                        </div>
                        {incidencia.estado && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(incidencia.estado)}`}>
                            {incidencia.estado.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Fecha:</span> {formatDate(incidencia.fecha)}
                        </div>
                        {incidencia.responsable && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Responsable:</span> {incidencia.responsable}
                          </div>
                        )}
                      </div>

                      {/* Info adicional para tratamientos vinculados a enfermedades */}
                      {incidencia.tipo === "ENFERMEDAD" && incidencia.tratamientoIds && incidencia.tratamientoIds.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Tratamientos asociados:</span> {incidencia.tratamientoIds.length}
                        </div>
                      )}
                    </div>

                    {/* Indicador de clickeable */}
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Historial sanitario completo del animal
        </p>
      </div>
    </div>
  );
}