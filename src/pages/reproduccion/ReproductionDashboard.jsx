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
import { apiGet } from "../../api/api";


export default function ReproduccionDashboard() {
  const { fincaid } = useParams();
  const navigate = useNavigate();
  const { selectedFinca } = useAuth();

  const [recordatorios, setRecordatorios] = useState([]);
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
      
      // 1. Obtener todos los animales de la finca

      const animales = await apiGet("/api/inventory/animales");

      
        
        // Filtrar solo los animales de esta finca
      const animalesFinca = animales.filter(animal => animal.fincaId === fincaid);

      console.log(animalesFinca)

      const idsAnimalesFinca = animalesFinca.map(animal => animal.id);

      
      // 2. Obtener todas las gestaciones
      const todasGestaciones = await apiGet("/api/reproduccion/gestaciones");
      
      // 3. Filtrar gestaciones activas de animales de esta finca
      const gestacionesActivas = todasGestaciones.filter(
        g => g.estado === "ACTIVA" && idsAnimalesFinca.includes(g.idHembra)
      );
      
      // 4. Calcular días hasta parto (solo informativo)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const recordatoriosSinFiltroFecha = gestacionesActivas
        .map(gestacion => {
          const fechaParto = new Date(gestacion.fechaEstimadaParto);
          fechaParto.setHours(0, 0, 0, 0);
          const diasRestantes = Math.ceil((fechaParto - hoy) / (1000 * 60 * 60 * 24));

          const animal = animales.find(a => a.id === gestacion.idHembra);

          return {
            id: gestacion.id,
            idHembra: gestacion.idHembra,
            nombreAnimal: animal?.nombre || animal?.numeroIdentificacion || `Animal ${gestacion.idHembra}`,
            fechaEstimadaParto: gestacion.fechaEstimadaParto,
            diasRestantes,
            gestacion
          };
        })
        .sort((a, b) => a.diasRestantes - b.diasRestantes);  // Ordenadas por fecha

      setRecordatorios(recordatoriosSinFiltroFecha);

      // 5. Actualizar estadísticas
      setEstadisticas({
        montasActivas: 5, // TODO
        gestacionesEnCurso: gestacionesActivas.length,
        nacimientosEsteMes: 12, // TODO
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

  const getPrioridadColor = (diasRestantes) => {
    if (diasRestantes <= 7) {
      return "bg-red-50 border-red-200 text-red-800";
    } else if (diasRestantes <= 15) {
      return "bg-yellow-50 border-yellow-200 text-yellow-800";
    } else {
      return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getPrioridadBadge = (diasRestantes) => {
    if (diasRestantes <= 7) {
      return "bg-red-200 text-red-800";
    } else if (diasRestantes <= 15) {
      return "bg-yellow-200 text-yellow-800";
    } else {
      return "bg-blue-200 text-blue-800";
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


        {/* RECORDATORIOS DE NACIMIENTOS PRÓXIMOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Recordatorios de Nacimientos</h3>
            {recordatorios.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                {recordatorios.length}
              </span>
            )}
          </div>

          {recordatorios.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Baby className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No hay nacimientos próximos</p>
              <p className="text-gray-500 text-sm">
                No se encontraron gestaciones activas con parto estimado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recordatorios.map((recordatorio) => (
                <div
                  key={recordatorio.id}
                  className={`flex items-start space-x-4 p-4 border-2 rounded-xl ${getPrioridadColor(recordatorio.diasRestantes)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      Nacimiento próximo: {recordatorio.nombreAnimal}
                    </p>
                    <p className="text-sm mt-1">
                      Fecha estimada de parto: {new Date(recordatorio.fechaEstimadaParto).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="text-xs mt-1 opacity-75">
                      {recordatorio.diasRestantes === 0 
                        ? "¡Hoy es la fecha estimada!"
                        : recordatorio.diasRestantes === 1
                        ? "Mañana"
                        : `En ${recordatorio.diasRestantes} días`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPrioridadBadge(recordatorio.diasRestantes)}`}>
                      {recordatorio.diasRestantes <= 7 
                        ? "URGENTE"
                        : recordatorio.diasRestantes <= 15
                        ? "PRÓXIMO"
                        : "PROGRAMADO"}
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