import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Heart, 
  Baby, 
  Stethoscope, 
  FileText, 
  Calendar,
  Bell,
  TrendingUp,
  History
} from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import AnimalSearchModal from "../../components/reproduccion/AnimalSearchModal";

export default function ReproduccionDashboard() {
  const { fincaid } = useParams();
  const navigate = useNavigate();
  const { selectedFinca } = useAuth();

  const [notificaciones, setNotificaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    montasActivas: 0,
    gestacionesEnCurso: 0,
    nacimientosEsteMes: 0,
    ultimaActualizacion: null
  });
  const [loading, setLoading] = useState(true);

  // Estado para el modal de búsqueda de animales
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    targetRoute: "",
    filtroSexo: null
  });

  useEffect(() => {
    const fetchDatosReproduccion = async () => {
      try {
        setLoading(true);
        
        // Datos de ejemplo - aquí puedes cargar desde el backend
        setNotificaciones([
          {
            id: 1,
            tipo: "gestacion",
            mensaje: "3 hembras están próximas a la fecha estimada de parto",
            prioridad: "alta",
            fecha: new Date().toISOString()
          },
          {
            id: 2,
            tipo: "diagnostico",
            mensaje: "Pendiente diagnóstico de gestación para 2 montas",
            prioridad: "media",
            fecha: new Date().toISOString()
          },
          {
            id: 3,
            tipo: "monta",
            mensaje: "Revisar calendario de montas programadas",
            prioridad: "baja",
            fecha: new Date().toISOString()
          }
        ]);

        setEstadisticas({
          montasActivas: 5,
          gestacionesEnCurso: 8,
          nacimientosEsteMes: 12,
          ultimaActualizacion: new Date().toISOString()
        });

      } catch (err) {
        console.error("Error cargando datos de reproducción:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fincaid) {
      fetchDatosReproduccion();
    }
  }, [fincaid]);

  const handleVolverFinca = () => {
    navigate(`/finca/${fincaid}`);
  };

  // Abrir modal de búsqueda de animal
  const openAnimalSearch = (title, targetRoute, filtroSexo = null) => {
    setModalConfig({ title, targetRoute, filtroSexo });
    setModalOpen(true);
  };

  // Manejar confirmación de animal seleccionado
  const handleAnimalConfirm = (animal) => {
    navigate(modalConfig.targetRoute.replace(":animalId", animal.id));
  };

  // Opciones que requieren selección de animal
  const opcionesRegistro = [
    {
      id: "registrar-monta",
      titulo: "Registrar Monta",
      descripcion: "Registrar apareamiento de animales",
      icono: <Heart className="w-8 h-8" />,
      color: "from-pink-500 to-pink-600",
      modalTitle: "Seleccionar Hembra para Registrar Monta",
      targetRoute: `/${fincaid}/reproduccion/monta/:animalId`,
      filtroSexo: "H"
    },
    {
      id: "diagnostico-gestacion",
      titulo: "Diagnóstico de Gestación",
      descripcion: "Registrar resultado de diagnóstico",
      icono: <Stethoscope className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      modalTitle: "Seleccionar Hembra para Diagnóstico",
      targetRoute: `/${fincaid}/reproduccion/diagnostico/:animalId`,
      filtroSexo: "H"
    },
    {
      id: "registrar-nacimiento",
      titulo: "Registrar Nacimiento",
      descripcion: "Registrar nacimiento de crías",
      icono: <Baby className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      modalTitle: "Seleccionar Madre para Registrar Nacimiento",
      targetRoute: `/${fincaid}/reproduccion/nacimiento/:animalId`,
      filtroSexo: "H"
    },
    {
      id: "ver-genealogia",
      titulo: "Ver Genealogía",
      descripcion: "Consultar árbol genealógico del animal",
      icono: <FileText className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      modalTitle: "Seleccionar Animal para Ver Genealogía",
      targetRoute: `/${fincaid}/reproduccion/genealogia/:animalId`
    },
    {
      id: "historial-animal",
      titulo: "Historial de Animal",
      descripcion: "Ver historial reproductivo completo",
      icono: <History className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      modalTitle: "Seleccionar Animal para Ver Historial",
      targetRoute: `/${fincaid}/reproduccion/historial/:animalId`
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
      case "gestacion":
        return <Baby className="w-5 h-5" />;
      case "diagnostico":
        return <Stethoscope className="w-5 h-5" />;
      case "monta":
        return <Heart className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando módulo de reproducción...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
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
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
                    Módulo de Reproducción
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedFinca?.nombre || "Finca"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Montas Activas</p>
                <p className="text-3xl font-bold text-pink-600">{estadisticas.montasActivas}</p>
              </div>
              <Heart className="w-10 h-10 text-pink-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Gestaciones en Curso</p>
                <p className="text-3xl font-bold text-purple-600">{estadisticas.gestacionesEnCurso}</p>
              </div>
              <Stethoscope className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nacimientos Este Mes</p>
                <p className="text-3xl font-bold text-blue-600">{estadisticas.nacimientosEsteMes}</p>
              </div>
              <Baby className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eficiencia</p>
                <p className="text-lg font-bold text-green-600">Excelente</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* REGISTRO EN ANIMALES */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="w-6 h-6 text-pink-600" />
            <h3 className="text-xl font-semibold text-gray-800">Gestión Reproductiva</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opcionesRegistro.map((opcion) => (
              <button
                key={opcion.id}
                onClick={() => openAnimalSearch(opcion.modalTitle, opcion.targetRoute, opcion.filtroSexo)}
                className="group relative p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-pink-300 transition-all duration-300"
              >
                <div className={`bg-gradient-to-br ${opcion.color} p-3 rounded-lg shadow-lg mb-4 inline-block group-hover:scale-110 transition-transform`}>
                  {opcion.icono}
                </div>
                <h4 className="text-base font-bold text-gray-800 mb-2">{opcion.titulo}</h4>
                <p className="text-sm text-gray-600 mb-3">{opcion.descripcion}</p>
                <div className="flex items-center text-pink-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  <span>Acceder</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* HISTORIAL GENERAL */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-800">Reportes y Análisis</h3>
          </div>

          <button
            onClick={() => navigate(`/${fincaid}/reproduccion/historial-general`)}
            className="w-full group relative p-6 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-xl hover:shadow-xl hover:border-indigo-300 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="text-lg font-bold text-gray-800 mb-1">Historial General</h4>
                  <p className="text-sm text-gray-600">Ver historial completo de reproducción de la finca</p>
                </div>
              </div>
              <ArrowLeft className="w-6 h-6 text-indigo-600 rotate-180 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>

        {/* NOTIFICACIONES Y ALERTAS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Notificaciones del Sistema</h3>
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
              <p className="text-gray-600 text-lg mb-2">No hay notificaciones</p>
              <p className="text-gray-500 text-sm">
                El sistema te alertará sobre eventos reproductivos importantes
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
          Sistema de gestión reproductiva de {selectedFinca?.nombre || "la finca"}
        </p>
      </div>

      {/* Modal de búsqueda de animales */}
      <AnimalSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAnimalConfirm}
        fincaid={fincaid}
        title={modalConfig.title}
        filtroSexo={modalConfig.filtroSexo}
      />
    </div>
  );
}