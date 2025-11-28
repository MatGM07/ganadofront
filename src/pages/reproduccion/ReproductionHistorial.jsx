import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Baby, Activity, Calendar, Stethoscope, FileText } from "lucide-react";
import Header from "../../components/Header";
import { apiGet } from "../../api/api";

export default function ReproduccionHistorial() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("TODOS");

  useEffect(() => {
  const fetchData = async () => {
    console.group("🐮 Cargando historial de reproducción");
    console.info("Animal ID:", animalId);
    console.info("Finca:", fincaid);
    console.info("Hora:", new Date().toISOString());

    try {
      setLoading(true);
      setError(null);

      console.info("➡ Solicitando datos del animal…");
      const animalData = await apiGet(`/api/inventory/animales/${animalId}`);
      console.info("✔ Animal cargado:", animalData);

      setAnimal(animalData);

      const sexo = animalData?.sexo?.toUpperCase();
      const todasIncidencias = [];

      if (sexo === "M") {
        console.info("Sexo: MACHO → cargando montas y nacimientos…");

        const [montasMacho, nacimientosHijo] = await Promise.all([
          apiGet(`/api/reproduccion/montas`).catch((err) => {
            console.error("❌ Error cargando montas:", err);
            return [];
          }),
          apiGet(`/api/reproduccion/nacimientos`).catch((err) => {
            console.error("❌ Error cargando nacimientos:", err);
            return [];
          }),
        ]);

        console.info("Montas recibidas:", montasMacho);
        console.info("Nacimientos recibidos:", nacimientosHijo);

        const montasFiltradas = (Array.isArray(montasMacho) ? montasMacho : [])
          .filter(m => m.idMacho === animalId);

        todasIncidencias.push(
          ...montasFiltradas.map(monta => ({
            ...monta,
            tipo: "MONTA_MACHO",
            fecha: monta.fecha,
            nombre: `Monta con hembra`,
            tipoId: monta.id
          }))
        );

        const nacimientosFiltrados = (Array.isArray(nacimientosHijo) ? nacimientosHijo : [])
          .filter(n => n.idAnimal === animalId);

        todasIncidencias.push(
          ...nacimientosFiltrados.map(nac => ({
            ...nac,
            tipo: "NACIMIENTO_HIJO",
            fecha: nac.fecha,
            nombre: `Nacimiento registrado`,
            tipoId: nac.id
          }))
        );

      } else if (sexo === "H") {
        console.info("Sexo: HEMBRA → cargando montas, diagnósticos, gestaciones y nacimientos…");

        const [montasHembra, diagnosticos, gestaciones, nacimientos] = await Promise.all([
          apiGet(`/api/reproduccion/montas`).catch((err) => {
            console.error("❌ Error montas:", err);
            return [];
          }),
          apiGet(`/api/reproduccion/diagnosticos`).catch((err) => {
            console.error("❌ Error diagnósticos:", err);
            return [];
          }),
          apiGet(`/api/reproduccion/gestaciones`).catch((err) => {
            console.error("❌ Error gestaciones:", err);
            return [];
          }),
          apiGet(`/api/reproduccion/nacimientos`).catch((err) => {
            console.error("❌ Error nacimientos:", err);
            return [];
          }),
        ]);

        console.info("Montas:", montasHembra);
        console.info("Diagnósticos:", diagnosticos);
        console.info("Gestaciones:", gestaciones);
        console.info("Nacimientos:", nacimientos);

        const montasFiltradas = (Array.isArray(montasHembra) ? montasHembra : [])
          .filter(m => m.idHembra === animalId);

        todasIncidencias.push(
          ...montasFiltradas.map(m => ({
            ...m,
            tipo: "MONTA_HEMBRA",
            fecha: m.fecha,
            nombre: "Monta con macho",
            tipoId: m.id
          }))
        );

        const montaIds = montasFiltradas.map(m => m.id);

        const diagnosticosFiltrados = (Array.isArray(diagnosticos) ? diagnosticos : [])
          .filter(d => montaIds.includes(d.idMonta));

        todasIncidencias.push(
          ...diagnosticosFiltrados.map(diag => ({
            ...diag,
            tipo: "DIAGNOSTICO",
            fecha: diag.fecha,
            nombre: "Diagnóstico de gestación",
            tipoId: diag.id
          }))
        );

        const gestacionesFiltradas = (Array.isArray(gestaciones) ? gestaciones : [])
          .filter(g => g.idHembra === animalId);

        todasIncidencias.push(
          ...gestacionesFiltradas.map(gest => ({
            ...gest,
            tipo: "GESTACION",
            fecha: gest.fechaInicio,
            nombre: "Gestación",
            tipoId: gest.id
          }))
        );

        const nacimientosFiltrados = (Array.isArray(nacimientos) ? nacimientos : [])
          .filter(n => n.idMadre === animalId || n.idAnimal === animalId);

        todasIncidencias.push(
          ...nacimientosFiltrados.map(n => ({
            ...n,
            tipo: n.idMadre === animalId ? "NACIMIENTO_MADRE" : "NACIMIENTO_HIJA",
            fecha: n.fecha,
            nombre: n.idMadre === animalId ? "Nacimiento de cría" : "Nacimiento registrado",
            tipoId: n.id
          }))
        );
      }

      const sorted = todasIncidencias.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

      console.info("✔ Incidencias ordenadas:", sorted);

      setIncidencias(sorted);

    } catch (err) {
      console.error("💥 ERROR GENERAL AL CARGAR HISTORIAL");
      console.error("Mensaje:", err.message);
      console.error("Stack:", err);

      if (err.response) {
        console.error("➡ Error del servidor:", err.response.status, err.response.data);
      } else if (err.request) {
        console.error("➡ No hubo respuesta del servidor");
      }

      setError(err.message || "Error al cargar el historial");

      if (err.message.includes("401") || err?.response?.status === 401) {
        console.warn("⚠ Sesión expirada → redirigiendo a login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  fetchData();
}, [animalId, navigate]);


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
      MONTA_MACHO: {
        icon: Heart,
        color: "border-blue-500 bg-blue-50 hover:bg-blue-100",
        badgeColor: "bg-blue-500 text-white",
        iconColor: "text-blue-600",
        label: "Monta (Macho)"
      },
      MONTA_HEMBRA: {
        icon: Heart,
        color: "border-pink-500 bg-pink-50 hover:bg-pink-100",
        badgeColor: "bg-pink-500 text-white",
        iconColor: "text-pink-600",
        label: "Monta (Hembra)"
      },
      DIAGNOSTICO: {
        icon: Stethoscope,
        color: "border-purple-500 bg-purple-50 hover:bg-purple-100",
        badgeColor: "bg-purple-500 text-white",
        iconColor: "text-purple-600",
        label: "Diagnóstico"
      },
      GESTACION: {
        icon: Activity,
        color: "border-orange-500 bg-orange-50 hover:bg-orange-100",
        badgeColor: "bg-orange-500 text-white",
        iconColor: "text-orange-600",
        label: "Gestación"
      },
      NACIMIENTO_MADRE: {
        icon: Baby,
        color: "border-green-500 bg-green-50 hover:bg-green-100",
        badgeColor: "bg-green-500 text-white",
        iconColor: "text-green-600",
        label: "Nacimiento (Madre)"
      },
      NACIMIENTO_HIJO: {
        icon: Baby,
        color: "border-teal-500 bg-teal-50 hover:bg-teal-100",
        badgeColor: "bg-teal-500 text-white",
        iconColor: "text-teal-600",
        label: "Nacimiento (Cría)"
      },
      NACIMIENTO_HIJA: {
        icon: Baby,
        color: "border-teal-500 bg-teal-50 hover:bg-teal-100",
        badgeColor: "bg-teal-500 text-white",
        iconColor: "text-teal-600",
        label: "Nacimiento (Cría)"
      }
    };
    return configs[tipo] || configs.MONTA_MACHO;
  };

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    const colors = {
      ACTIVA: "bg-blue-100 text-blue-800",
      FINALIZADA: "bg-gray-100 text-gray-800",
      CERRADA: "bg-gray-100 text-gray-800",
      POSITIVO: "bg-green-100 text-green-800",
      NEGATIVO: "bg-red-100 text-red-800"
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  // Manejar click en incidencia
  const handleIncidenciaClick = (incidencia) => {
    const routes = {
      MONTA_MACHO: `/${fincaid}/reproduccion/edit/monta/${incidencia.id}`,
      MONTA_HEMBRA: `/${fincaid}/reproduccion/edit/monta/${incidencia.id}`,
      DIAGNOSTICO: `/${fincaid}/reproduccion/edit/diagnostico/${incidencia.id}`,
      GESTACION: `/${fincaid}/reproduccion/edit/gestacion/${incidencia.id}`,
      NACIMIENTO_MADRE: `/${fincaid}/reproduccion/edit/nacimiento/${incidencia.id}`,
      NACIMIENTO_HIJO: `/${fincaid}/reproduccion/edit/nacimiento/${incidencia.id}`,
      NACIMIENTO_HIJA: `/${fincaid}/reproduccion/edit/nacimiento/${incidencia.id}`
    };
    if (routes[incidencia.tipo]) {
      navigate(routes[incidencia.tipo]);
    }
  };

  // Obtener filtros disponibles según el sexo
  const getFiltrosDisponibles = () => {
    const sexo = animal?.sexo?.toUpperCase();
    
    if (sexo === "M") {
      return ["TODOS", "MONTA_MACHO", "NACIMIENTO_HIJO"];
    } else if (sexo === "H") {
      return ["TODOS", "MONTA_HEMBRA", "DIAGNOSTICO", "GESTACION", "NACIMIENTO_MADRE", "NACIMIENTO_HIJA"];
    }
    return ["TODOS"];
  };

  const getFiltroLabel = (tipo) => {
    const labels = {
      TODOS: "Todas",
      MONTA_MACHO: "Montas",
      MONTA_HEMBRA: "Montas",
      DIAGNOSTICO: "Diagnósticos",
      GESTACION: "Gestaciones",
      NACIMIENTO_MADRE: "Nacimientos (Madre)",
      NACIMIENTO_HIJO: "Nacimientos (Cría)",
      NACIMIENTO_HIJA: "Nacimientos (Cría)"
    };
    return labels[tipo] || tipo;
  };

  // Filtrar incidencias
  const incidenciasFiltradas = filtroTipo === "TODOS" 
    ? incidencias 
    : incidencias.filter(inc => inc.tipo === filtroTipo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial de reproducción...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
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
                onClick={() => navigate(`/${fincaid}/inventario/${animalId}`)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Botón volver */}
        <button
          onClick={() => navigate(`/${fincaid}/inventario/${animalId}`)}
          className="flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al animal
        </button>

        {/* Encabezado */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent mb-2">
                Historial de Reproducción
              </h2>
              <p className="text-gray-600">
                {animal?.identificador || `Animal #${animalId}`} • {animal?.especie || "N/A"} • {animal?.raza || "N/A"} • Sexo: {animal?.sexo || "N/A"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-600" />
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
            {getFiltrosDisponibles().map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filtroTipo === tipo
                    ? "bg-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getFiltroLabel(tipo)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de incidencias */}
        <div className="space-y-4">
          {incidenciasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">
                {filtroTipo === "TODOS" 
                  ? "No hay incidencias de reproducción registradas"
                  : `No hay incidencias de tipo ${getFiltroLabel(filtroTipo).toLowerCase()}`
                }
              </p>
              <p className="text-gray-500 text-sm">
                Las incidencias de reproducción del animal aparecerán aquí automáticamente
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
                            {config.label}
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
                        {incidencia.resultado && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(incidencia.resultado)}`}>
                            {incidencia.resultado}
                          </span>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Fecha:</span> {formatDate(incidencia.fecha)}
                        </div>
                        
                        {incidencia.metodoUtilizado && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Método:</span> {incidencia.metodoUtilizado}
                          </div>
                        )}
                        
                        {incidencia.peso && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Peso:</span> {incidencia.peso} kg
                          </div>
                        )}
                        
                        {incidencia.sexo && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Sexo cría:</span> {incidencia.sexo}
                          </div>
                        )}

                        {incidencia.fechaEstimadaParto && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Fecha estimada parto:</span> {formatDate(incidencia.fechaEstimadaParto)}
                          </div>
                        )}
                      </div>

                      {/* Observaciones */}
                      {(incidencia.observaciones || incidencia.notas) && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Observaciones:</span> {incidencia.observaciones || incidencia.notas}
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
          Historial de reproducción completo del animal
        </p>
      </div>
    </div>
  );
}