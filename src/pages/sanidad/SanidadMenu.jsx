import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Syringe,
  Pill,
  Activity,
  FileText,
  Plus,
  Database,
  Calendar,
  Bell,
  TrendingUp
} from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import AnimalSearchModal from "../../components/sanidad/AnimalSearchModal";
import { apiGet } from "../../api/api";

export default function SanidadMenu() {
  const { fincaid } = useParams();
  const navigate = useNavigate();
  const { selectedFinca } = useAuth();

  const [notificaciones, setNotificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    vacunasProximas: 0,
    tratamientosActivos: 0,
    animalesEnObservacion: 0,
    ultimaActualizacion: null
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Estado para el modal de búsqueda de animales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    targetRoute: ""
  });

  // helpers de fecha
  const parseDate = (d) => {
    if (!d) return null;
    // soporta 'yyyy-MM-dd' y formatos ISO
    const parsed = new Date(d);
    if (isNaN(parsed)) {
      // intentar parse manual para 'yyyy-MM-dd'
      const parts = ("" + d).split("-");
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2].slice(0, 2), 10); // por si viene con tiempo
        return new Date(y, m, day);
      }
      return null;
    }
    return parsed;
  };

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const isWithinNextDays = (dateStr, days) => {
    const date = parseDate(dateStr);
    if (!date) return false;
    const today = startOfDay(new Date());
    const last = startOfDay(new Date());
    last.setDate(last.getDate() + days);
    return date >= today && date <= last;
  };

  const daysUntil = (dateStr) => {
    const date = parseDate(dateStr);
    if (!date) return Infinity;
    const today = startOfDay(new Date());
    const diffMs = startOfDay(date) - today;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchRecordatorios = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        console.log("[SanidadMenu] Cargando incidencias de vacunas y tratamientos...");

        // Llamadas a endpoints del gateway (lista completa)
        // - Vacunas: /api/sanidad/vacunas/incidencias
        // - Tratamientos: /api/sanidad/tratamientos/incidencias
        const [vacunasResp, tratamientosResp] = await Promise.all([
          apiGet("/api/sanidad/vacunas/incidencias").catch(err => {
            console.error("[SanidadMenu] Error al traer incidencias de vacunas:", err);
            return [];
          }),
          apiGet("/api/sanidad/tratamientos/incidencias").catch(err => {
            console.error("[SanidadMenu] Error al traer incidencias de tratamientos:", err);
            return [];
          })
        ]);

        console.log("[SanidadMenu] vacunasResp:", vacunasResp);
        console.log("[SanidadMenu] tratamientosResp:", tratamientosResp);

        // Filtrar PENDIENTE y fechas entre hoy y hoy+5
        const vacunasPendientesProximas = (Array.isArray(vacunasResp) ? vacunasResp : [])
          .filter(v => (v?.estado || "").toUpperCase() === "PENDIENTE")
          .filter(v => {
            // el campo puede ser fechaVacunacion o fecha (según backend). Intentamos ambos.
            const dateField = v.fechaVacunacion || v.fecha;
            return isWithinNextDays(dateField, 5);
          })
          .map(v => {
            const fecha = v.fechaVacunacion || v.fecha;
            const dias = daysUntil(fecha);
            const prioridad = dias <= 1 ? "alta" : dias <= 3 ? "media" : "baja";
            return {
              id: v.id || `${v.idAnimal || "unknown"}-vacuna-${fecha}`,
              tipo: "vacuna",
              mensaje: `Vacuna pendiente (${v.productoNombre || v.productoid || "producto"}) para animal ${v.idAnimal || ""} — ${fecha}`,
              prioridad,
              fecha,
              raw: v
            };
          });

        const tratamientosPendientesProximos = (Array.isArray(tratamientosResp) ? tratamientosResp : [])
          .filter(t => (t?.estado || "").toUpperCase() === "PENDIENTE")
          .filter(t => {
            // campo fechaTratamiento o fecha
            const dateField = t.fechaTratamiento || t.fecha;
            return isWithinNextDays(dateField, 5);
          })
          .map(t => {
            const fecha = t.fechaTratamiento || t.fecha;
            const dias = daysUntil(fecha);
            const prioridad = dias <= 1 ? "alta" : dias <= 3 ? "media" : "baja";
            return {
              id: t.id || `${t.idAnimal || "unknown"}-tratamiento-${fecha}`,
              tipo: "tratamiento",
              mensaje: `Tratamiento pendiente (${t.tratamientoNombre || t.tratamientoId || ""}) para animal ${t.idAnimal || ""} — ${fecha}`,
              prioridad,
              fecha,
              raw: t
            };
          });

        // combinación y orden por fecha ascendente (próximos primero)
        const combinadas = [...vacunasPendientesProximas, ...tratamientosPendientesProximos];
        combinadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        console.log("[SanidadMenu] Recordatorios filtrados:", combinadas);

        // Si quieres filtrar por finca (si la respuesta incluye fincaId), lo haces aquí:
        const filtradasPorFinca = combinadas.filter(item => {
          // si el backend ya restringe por finca, esta línea devuelve true para todo.
          // Si la incidencia trae idAnimal y quieres asegurar finca: deberías tener fincaId o pedir animal; aquí hacemos un filtro condicional:
          if (!fincaid) return true;
          const raw = item.raw || {};
          // ejemplo: si backend incluye fincaId en inc: raw.fincaId
          if (raw.fincaId) return String(raw.fincaId) === String(fincaid);
          // si no hay fincaId, devolvemos true (no tenemos forma de verificar sin otra llamada)
          return true;
        });

        // Estadísticas: vacunas próximas = número de vacunas en rango; tratamientos activos = cantidad total de tratamientos en PENDIENTE (o los que prefieras)
        const tratamientosPendientesTotal = (Array.isArray(tratamientosResp) ? tratamientosResp : [])
          .filter(t => (t?.estado || "").toUpperCase() === "PENDIENTE").length;

        setNotificaciones(filtradasPorFinca);
        setEstadisticas(prev => ({
          ...prev,
          vacunasProximas: vacunasPendientesProximas.length,
          tratamientosActivos: tratamientosPendientesTotal,
          ultimaActualizacion: new Date().toISOString()
        }));

      } catch (err) {
        console.error("[SanidadMenu] Error general cargando recordatorios:", err);
        setFetchError(err.message || "Error cargando recordatorios");
      } finally {
        setLoading(false);
      }
    };

    if (fincaid) {
      fetchRecordatorios();
    } else {
      // intentar igualmente si no hay fincaid (opcional)
      fetchRecordatorios();
    }
  }, [fincaid]);

  const handleVolverFinca = () => {
    navigate(`/finca/${fincaid}`);
  };

  // Abrir modal de búsqueda de animal
  const openAnimalSearch = (title, targetRoute) => {
    setModalConfig({ title, targetRoute });
    setModalOpen(true);
  };

  // Manejar confirmación de animal seleccionado
  const handleAnimalConfirm = (animal) => {
    navigate(modalConfig.targetRoute.replace(":animalId", animal.id));
  };

  const opcionesGestion = [
    {
      id: "agregar-vacuna",
      titulo: "Agregar Vacuna",
      descripcion: "Registrar nueva vacuna en la base de datos",
      icono: <Database className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      ruta: `/${fincaid}/sanidad/addvacuna`
    },
    {
      id: "agregar-tratamiento",
      titulo: "Agregar Tratamiento",
      descripcion: "Registrar nuevo tratamiento sanitario",
      icono: <Database className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      ruta: `/${fincaid}/sanidad/addtratamiento`
    },
    {
      id: "agregar-enfermedad",
      titulo: "Agregar Enfermedad",
      descripcion: "Registrar nueva enfermedad en el sistema",
      icono: <Database className="w-8 h-8" />,
      color: "from-red-500 to-red-600",
      ruta: `/${fincaid}/sanidad/addenfermedad`
    }
  ];

  const opcionesRegistro = [
    {
      id: "registrar-vacuna",
      titulo: "Vacunar Animal",
      descripcion: "Registrar vacuna aplicada a un animal",
      icono: <Syringe className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      modalTitle: "Seleccionar Animal para Vacunar",
      targetRoute: `/${fincaid}/sanidad/incidenciavacuna/:animalId`
    },
    {
      id: "registrar-tratamiento",
      titulo: "Aplicar Tratamiento",
      descripcion: "Registrar tratamiento aplicado a un animal",
      icono: <Pill className="w-8 h-8" />,
      color: "from-yellow-500 to-yellow-600",
      modalTitle: "Seleccionar Animal para Tratar",
      targetRoute: `/${fincaid}/sanidad/incidenciatratamiento/:animalId`
    },
    {
      id: "registrar-enfermedad",
      titulo: "Diagnosticar Enfermedad",
      descripcion: "Registrar enfermedad diagnosticada en un animal",
      icono: <Activity className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      modalTitle: "Seleccionar Animal para Diagnosticar",
      targetRoute: `/${fincaid}/sanidad/incidenciaenfermedad/:animalId`
    },
    {
      id: "ver-historial",
      titulo: "Ver Historial Sanitario",
      descripcion: "Consultar historial completo de un animal",
      icono: <FileText className="w-8 h-8" />,
      color: "from-indigo-500 to-indigo-600",
      modalTitle: "Seleccionar Animal para Ver Historial",
      targetRoute: `/${fincaid}/sanidad/:animalId/historial`
    }
  ];

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-50 border-red-200 text-red-800";
      case "media":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "baja":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getPrioridadIcon = (tipo) => {
    switch (tipo) {
      case "vacuna":
        return <Syringe className="w-5 h-5" />;
      case "tratamiento":
        return <Pill className="w-5 h-5" />;
      case "revision":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando módulo de sanidad...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hubo error en fetch
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error cargando recordatorios</h3>
              <p className="text-red-600 mb-4">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Reintentar
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

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleVolverFinca}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Módulo de Sanidad
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedFinca?.nombre || "Finca"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GESTIÓN DE BASE DE DATOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Gestión de Base de Datos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opcionesGestion.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => navigate(opcion.ruta)}
                className="group relative p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div className={`absolute top-4 right-4 bg-gradient-to-br ${opcion.color} p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform`}>
                  {opcion.icono}
                </div>
                <div className="text-left pr-16">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{opcion.titulo}</h4>
                  <p className="text-sm text-gray-600">{opcion.descripcion}</p>
                </div>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  <span>Ir a registro</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* REGISTRO EN ANIMALES */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Plus className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-800">Registro en Animales</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {opcionesRegistro.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => openAnimalSearch(opcion.modalTitle, opcion.targetRoute)}
                className="group relative p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-green-300 transition-all duration-300"
              >
                <div className={`bg-gradient-to-br ${opcion.color} p-3 rounded-lg shadow-lg mb-4 inline-block group-hover:scale-110 transition-transform`}>
                  {opcion.icono}
                </div>
                <h4 className="text-base font-bold text-gray-800 mb-2">{opcion.titulo}</h4>
                <p className="text-sm text-gray-600 mb-3">{opcion.descripcion}</p>
                <div className="flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  <span>Acceder</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RECORDATORIOS PRÓXIMOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Recordatorios Próximos</h3>
            {notificaciones.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                {notificaciones.length}
              </span>
            )}
          </div>

          {notificaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No hay recordatorios próximos</p>
              <p className="text-gray-500 text-sm">
                Aquí aparecerán vacunas o tratamientos pendientes con fecha entre hoy y los próximos 5 días.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start space-x-4 p-4 border-2 rounded-xl ${getPrioridadColor(notif.prioridad)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getPrioridadIcon(notif.tipo)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{notif.mensaje}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(notif.fecha).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      notif.prioridad === "alta"
                        ? "bg-red-200 text-red-800"
                        : notif.prioridad === "media"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-blue-200 text-blue-800"
                    }`}>
                      {notif.prioridad.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Sistema de gestión sanitaria de {selectedFinca?.nombre || "la finca"}
        </p>
      </div>

      {/* Modal de búsqueda de animales */}
      <AnimalSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAnimalConfirm}
        fincaid={fincaid}
        title={modalConfig.title}
      />
    </div>
  );
}
