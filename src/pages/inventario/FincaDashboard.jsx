import { MapPin, Home, Users, LogOut, Package, Heart, Activity, FileText, User, Settings, UserMinus, X, Mail, Send } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { useAuth } from "../../hooks/useAuth";
import { apiGet, apiPost } from "../../api/api";

function FincaDashboard() {
  const navigate = useNavigate();
  const { user, selectedFinca, selectFinca } = useAuth();
  
  const [fincaData, setFincaData] = useState(null);
  const [miembrosConNombres, setMiembrosConNombres] = useState([]);
  const [propietarioNombre, setPropietarioNombre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [miembroAEliminar, setMiembroAEliminar] = useState(null);
  const [emailInvitacion, setEmailInvitacion] = useState('');
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);

  const cargarNombrePropietario = async (propietarioId) => {
    try {
      const userData = await apiGet(`/api/users/${propietarioId}`);
      setPropietarioNombre(userData.nombre);
    } catch (err) {
      console.error("Error al cargar propietario:", err);
      setPropietarioNombre(null);
    }
  };

  const cargarNombresMiembros = async (miembrosIds) => {
    const miembrosPromises = miembrosIds.map(async (miembroId) => {
      try {
        const userData = await apiGet(`/api/users/${miembroId}`);
        return {
          id: miembroId,
          nombre: userData.nombre,
          email: userData.email
        };
      } catch (err) {
        console.error(`Error al cargar usuario ${miembroId}:`, err);
        return {
          id: miembroId,
          nombre: null,
          email: null
        };
      }
    });

    const miembros = await Promise.all(miembrosPromises);
    setMiembrosConNombres(miembros);
  };

  useEffect(() => {
    const cargarFinca = async () => {
      try {
        if (!selectedFinca || !selectedFinca.id) {
          setError("No hay finca seleccionada");
          setLoading(false);
          return;
        }

        const response = await apiGet(`/api/inventory/fincas/${selectedFinca.id}`);
        setFincaData(response);

        // Cargar nombre del propietario
        await cargarNombrePropietario(response.usuarioCreadorId);

        // Cargar nombres de miembros
        await cargarNombresMiembros(response.usuarioMiembroIds || []);

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar la finca:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    cargarFinca();
  }, [selectedFinca]);

  const handleSalirFinca = () => {
    selectFinca(null);
    navigate("/dashboard");
  };

  const confirmarEliminarMiembro = (miembro) => {
    setMiembroAEliminar(miembro);
  };

  const handleEliminarMiembro = async () => {
    if (!miembroAEliminar) return;

    try {
      const nuevosMiembros = fincaData.usuarioMiembroIds.filter(
        id => id !== miembroAEliminar.id
      );

      const updateData = {
        nombre: fincaData.nombre,
        departamento: fincaData.departamento,
        municipio: fincaData.municipio,
        usuarioCreadorId: fincaData.usuarioCreadorId,
        usuarioMiembroIds: nuevosMiembros
      };

      await apiPost(`/api/inventory/fincas/${fincaData.id}`, updateData);

      // Actualizar estado local
      setFincaData({ ...fincaData, usuarioMiembroIds: nuevosMiembros });
      setMiembrosConNombres(
        miembrosConNombres.filter(m => m.id !== miembroAEliminar.id)
      );

      alert(`${miembroAEliminar.nombre || 'Usuario'} ha sido removido de la finca`);
      setMiembroAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar miembro:", err);
      alert("Error al eliminar el miembro: " + err.message);
    }
  };

  const handleEnviarInvitacion = async (e) => {
    e.preventDefault();

    if (!emailInvitacion.trim()) {
        alert("Por favor ingresa un correo electrónico");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInvitacion)) {
        alert("Por favor ingresa un correo electrónico válido");
        return;
    }

    setEnviandoInvitacion(true);


    try {
        const invitacionData = {
        usuarioEmail: emailInvitacion,   // 👈 ahora se envía el email
        fincaId: fincaData.id            // 👈 la finca en la que se invita
        };

        await apiPost(`/api/inventory/fincas/invitaciones`, invitacionData);

        alert(`Invitación enviada exitosamente a ${emailInvitacion}`);
        setEmailInvitacion('');
    } catch (err) {
        console.error("Error al enviar invitación:", err);
        alert("Error al enviar la invitación: " + err.message);
    } finally {
        setEnviandoInvitacion(false);
    }
    };

    
  const esCreador = user && fincaData && user.id === fincaData.usuarioCreadorId;

  const menuItems = [
    {
      icon: Package,
      title: "Inventario",
      description: "Gestión de animales",
      path: "/finca/inventario",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Heart,
      title: "Reproducción",
      description: "Control reproductivo",
      path: "/finca/reproduccion",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Activity,
      title: "Sanidad",
      description: "Salud del ganado",
      path: "/finca/sanidad",
      color: "from-red-500 to-red-600"
    },
    {
      icon: FileText,
      title: "Reportes",
      description: "Análisis y estadísticas",
      path: "/finca/reportes",
      color: "from-purple-500 to-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando información de la finca...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Header />
        <div className="flex items-center justify-center h-screen px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar finca</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/home")}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Información de la Finca */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                <Home className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {fincaData.nombre}
                </h1>
                <p className="text-gray-600 mt-1">Panel de Control</p>
              </div>
            </div>
            
            <button
              onClick={handleSalirFinca}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Salir de Finca</span>
            </button>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="text-lg font-semibold text-gray-800">
                  {fincaData.municipio}, {fincaData.departamento}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Propietario</p>
                <p className="text-lg font-semibold text-gray-800">
                  {user.id === fincaData.usuarioCreadorId 
                    ? "Tú" 
                    : (propietarioNombre || fincaData.usuarioCreadorId)
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Miembros */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Miembros de la Finca
                </h3>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {fincaData.usuarioMiembroIds?.length || 0}
                </span>
              </div>
              
              {esCreador && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  <Settings className="w-4 h-4" />
                  <span>Administrar Miembros</span>
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {miembrosConNombres.length > 0 ? (
                miembrosConNombres.map((miembro) => (
                  <div 
                    key={miembro.id} 
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="bg-green-100 p-2 rounded-full">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {miembro.id === user.id 
                          ? `${miembro.nombre || user.nombre} (Tú)` 
                          : (miembro.nombre || `Usuario ${miembro.id.substring(0, 8)}`)
                        }
                      </p>
                      {miembro.email && (
                        <p className="text-xs text-gray-500 truncate">{miembro.email}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center py-4">
                  No hay miembros registrados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menú de Módulos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulos de Gestión</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 text-left group"
              >
                <div className={`bg-gradient-to-br ${item.color} p-4 rounded-xl shadow-md inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Gestiona todos los aspectos de tu finca desde un solo lugar
          </p>
        </div>
      </div>

      {/* Modal de Administración de Miembros */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Administrar Miembros</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-white hover:bg-blue-800 p-2 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              {/* Formulario de Invitación */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-800">Invitar Nuevo Miembro</h4>
                </div>
                <form onSubmit={handleEnviarInvitacion} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={emailInvitacion}
                      onChange={(e) => setEmailInvitacion(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      disabled={enviandoInvitacion}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={enviandoInvitacion}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoInvitacion ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar</span>
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-600 mt-2">
                  El usuario recibirá una invitación que podrá aceptar o rechazar
                </p>
              </div>

              {/* Lista de Miembros Actuales */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Miembros Actuales</h4>
                  {miembrosConNombres.length > 0 ? (
                <div className="space-y-3">
                  {miembrosConNombres.map((miembro) => (
                    <div 
                      key={miembro.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {miembro.id === user.id 
                              ? `${miembro.nombre || user.nombre} (Tú)` 
                              : (miembro.nombre || `Usuario ${miembro.id.substring(0, 8)}`)
                            }
                          </p>
                          {miembro.email && (
                            <p className="text-sm text-gray-500">{miembro.email}</p>
                          )}
                          {miembro.id === fincaData.usuarioCreadorId && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Propietario
                            </span>
                          )}
                        </div>
                      </div>

                      {miembro.id !== fincaData.usuarioCreadorId && (
                        <button
                          onClick={() => confirmarEliminarMiembro(miembro)}
                          className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <UserMinus className="w-4 h-4" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No hay miembros para administrar
                </p>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {miembroAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <UserMinus className="w-8 h-8 text-red-600 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas remover a{' '}
                <span className="font-semibold">
                  {miembroAEliminar.nombre || 'este usuario'}
                </span>{' '}
                de la finca?
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setMiembroAEliminar(null)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminarMiembro}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FincaDashboard;