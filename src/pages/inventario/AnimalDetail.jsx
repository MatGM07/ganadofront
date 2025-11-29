import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../../api/api";
import { 
  Syringe, 
  Pill, 
  AlertCircle, 
  Activity, 
  Heart, 
  Search, 
  GitBranch, 
  FileText,
  History
} from "lucide-react";

export default function AnimalDetail() {
  const { id, fincaid } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el popup de baja
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [motivoBaja, setMotivoBaja] = useState("");
  const [procesandoBaja, setProcesandoBaja] = useState(false);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiGet(`/api/inventory/animales/${id}`);
        console.log(data);
        setAnimal(data);
      } catch (err) {
        console.error("Error cargando animal:", err);
        setError(err.message || "Error al cargar el animal");
        
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id, navigate]);

  const handleDarDeBaja = async () => {
    if (!motivoBaja.trim()) {
      alert("Por favor, ingresa el motivo de la baja");
      return;
    }

    try {
      setProcesandoBaja(true);

      // 1. Crear registro en el historial
      await apiPost("/api/inventory/animales/historias", {
        animalId: id,
        tipoEvento: "BAJA",
        descripcion: motivoBaja.trim(),
        fecha: new Date().toISOString()
      });

      // 2. Dar de baja el animal (DELETE)
      await apiDelete(`/api/inventory/animales/${id}`);

      // 3. Cerrar modal y redirigir
      setShowBajaModal(false);
      alert("Animal dado de baja exitosamente");
      navigate(`/${fincaid}/inventario`);
      
    } catch (err) {
      console.error("Error al dar de baja:", err);
      alert(err.message || "Error al dar de baja el animal");
    } finally {
      setProcesandoBaja(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No registrado";
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

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "No calculada";
    
    try {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      
      let años = hoy.getFullYear() - nacimiento.getFullYear();
      let meses = hoy.getMonth() - nacimiento.getMonth();
      
      if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
        años--;
        meses += 12;
      }
      
      if (hoy.getDate() < nacimiento.getDate()) {
        meses--;
      }
      
      if (años === 0 && meses === 0) {
        const dias = Math.floor((hoy - nacimiento) / (1000 * 60 * 60 * 24));
        return `${dias} día${dias !== 1 ? 's' : ''}`;
      } else if (años === 0) {
        return `${meses} mes${meses !== 1 ? 'es' : ''}`;
      } else if (meses === 0) {
        return `${años} año${años !== 1 ? 's' : ''}`;
      } else {
        return `${años} año${años !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
      }
    } catch {
      return "Error al calcular";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información del animal...</p>
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

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
            <p className="text-gray-600 mb-4">No se encontró el animal</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "Información general" },
    { id: "sanidad", label: "Sanidad" },
    { id: "reproduccion", label: "Reproducción" },
    { id: "documentos", label: "Documentos" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Encabezado */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg text-white font-bold text-xl">
                {animal.especie?.charAt(0).toUpperCase() || "A"}
              </div>

              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {animal.identificador || "Animal sin identificación"}
                </h2>

                <span
                  className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                    animal.estado?.toLowerCase() === "activo"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {animal.estado?.toLowerCase() === "activo" ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              
              {animal.estado?.toLowerCase() !== "inactivo" &&(
                <button
                  onClick={() => navigate(`/${fincaid}/inventario/${id}/editar`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar</span>
                </button>
              )}

              {animal.estado?.toLowerCase() !== "inactivo" && (
                <button
                  onClick={() => setShowBajaModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Dar de baja</span>
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-gray-600">
            {animal.especie || "Especie no definida"} • {animal.raza || "Raza no definida"} • Sexo:{" "}
            {animal.sexo === "M" ? "Macho" : animal.sexo === "H" ? "Hembra" : "No especificado"}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-lg rounded-2xl">
          <div className="border-b flex overflow-x-auto">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de pestaña */}
          <div className="p-6">
            {tab === "general" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Información general</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Especie</p>
                    <p className="font-medium">{animal.especie || "No registrado"}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Raza</p>
                    <p className="font-medium">{animal.raza || "No registrado"}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-medium">{animal.peso ? `${animal.peso} kg` : "No registrado"}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                    <p className="font-medium">{formatDate(animal.fechaNacimiento)}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Edad</p>
                    <p className="font-medium">{calcularEdad(animal.fechaNacimiento)}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium">{animal.ubicacion || "No definida"}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Estado</p>
                    <p className="font-medium">{animal.estado === "Activo" ? "Activo" : "Inactivo"}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === "sanidad" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Gestión Sanitaria</h3>
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                
                <p className="text-gray-600 mb-4">
                  Administra vacunas, tratamientos y diagnósticos de enfermedades para este animal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Aplicar Vacuna */}
                  <button
                    onClick={() => navigate(`/${fincaid}/sanidad/incidenciavacuna/${id}`)}
                    className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Syringe className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Aplicar Vacuna</p>
                      <p className="text-sm text-gray-600">Registrar nueva vacunación</p>
                    </div>
                  </button>

                  {/* Aplicar Tratamiento */}
                  <button
                    onClick={() => navigate(`/${fincaid}/sanidad/incidenciatratamiento/${id}`)}
                    className="p-4 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-yellow-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Aplicar Tratamiento</p>
                      <p className="text-sm text-gray-600">Registrar nuevo tratamiento</p>
                    </div>
                  </button>

                  {/* Diagnosticar Enfermedad */}
                  <button
                    onClick={() => navigate(`/${fincaid}/sanidad/incidenciaenfermedad/${id}`)}
                    className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-red-600 rounded-lg group-hover:scale-110 transition-transform">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Diagnosticar Enfermedad</p>
                      <p className="text-sm text-gray-600">Registrar nuevo diagnóstico</p>
                    </div>
                  </button>

                  {/* Historial Sanitario */}
                  <button
                    onClick={() => navigate(`/${fincaid}/sanidad/${id}/historial`)}
                    className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Historial Sanitario</p>
                      <p className="text-sm text-gray-600">Ver todas las incidencias</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {tab === "reproduccion" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Gestión Reproductiva</h3>
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                
                <p className="text-gray-600 mb-4">
                  Registra y gestiona eventos reproductivos del animal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Registrar Monta */}
                  <button
                    onClick={() => navigate(`/${fincaid}/reproduccion/monta/${id}`)}
                    className="p-4 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-pink-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Registrar Monta</p>
                      <p className="text-sm text-gray-600">Registrar servicio reproductivo</p>
                    </div>
                  </button>

                  {/* Registrar Diagnóstico de Gestación */}
                  <button
                    onClick={() => navigate(`/${fincaid}/reproduccion/diagnostico/${id}`)}
                    className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Diagnosticar Gestación</p>
                      <p className="text-sm text-gray-600">Confirmar estado de gestación</p>
                    </div>
                  </button>

                  {/* Ver Árbol Genealógico */}
                  <button
                    onClick={() => navigate(`/${fincaid}/reproduccion/genealogia/${id}`)}
                    className="p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-lg transition-all flex items-center gap-3 group md:col-span-2"
                  >
                    <div className="p-3 bg-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                      <GitBranch className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Ver Árbol Genealógico</p>
                      <p className="text-sm text-gray-600">Visualizar ancestros y descendencia</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {tab === "documentos" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Documentación y Registros</h3>
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                
                <p className="text-gray-600 mb-4">
                  Accede al historial completo y documentos del animal.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {/* Historial de Inventario */}
                  <button
                    onClick={() => navigate(`/${fincaid}/inventario/${id}/historial`)}
                    className="p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg transition-all flex items-center gap-3 group"
                  >
                    <div className="p-3 bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Historial de Inventario</p>
                      <p className="text-sm text-gray-600">Ver todos los eventos y cambios registrados</p>
                    </div>
                  </button>

                  {/* Placeholder para futuros documentos */}
                  <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      Próximamente: Certificados, registros y archivos adicionales
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón de volver */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            Volver atrás
          </button>
        </div>
      </div>

      {/* Modal de confirmación de baja */}
      {showBajaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Confirmar baja del animal</h3>
              <button
                onClick={() => setShowBajaModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={procesandoBaja}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Estás a punto de dar de baja a <strong>{animal.identificador}</strong>. 
                Esta acción creará un registro en el historial del animal.
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la baja <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Ej: Venta, muerte, transferencia a otra finca..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                disabled={procesandoBaja}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBajaModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                disabled={procesandoBaja}
              >
                Cancelar
              </button>
              <button
                onClick={handleDarDeBaja}
                disabled={procesandoBaja || !motivoBaja.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {procesandoBaja ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  "Confirmar baja"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}