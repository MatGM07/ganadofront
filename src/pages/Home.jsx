import { Beef, Plus, ArrowRight, MapPin, Mail, Check, X, Clock } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/api";

function Home() {
  const [fincas, setFincas] = useState([]);
  const [invitaciones, setInvitaciones] = useState([]);
  const [fincasInfo, setFincasInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingInvitaciones, setLoadingInvitaciones] = useState(true);
  const [error, setError] = useState(null);
  const [procesandoInvitacion, setProcesandoInvitacion] = useState(null);

  const { selectFinca, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFincas = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiGet("/api/inventory/fincas");
        
        // Filtrar solo las fincas donde el usuario es creador o miembro
        const fincasDelUsuario = data.filter(finca => 
          finca.usuarioCreadorId === user?.id || 
          finca.usuarioMiembroIds?.includes(user?.id)
        );

        setFincas(fincasDelUsuario);
      } catch (error) {
        console.error('Error al cargar fincas:', error);
        setError(error.message || 'Error al cargar las fincas');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFincas();
    }
  }, [user]);

  useEffect(() => {
    const fetchInvitaciones = async () => {
      try {
        setLoadingInvitaciones(true);

        // Obtener invitaciones pendientes del usuario
        const invitacionesData = await apiGet(`/api/inventory/fincas/usuario/${user.id}/pendientes`);
        setInvitaciones(invitacionesData);

        // Cargar información de cada finca invitada
        const fincasPromises = invitacionesData.map(async (inv) => {
          try {
            const fincaData = await apiGet(`/api/inventory/fincas/${inv.fincaId}`);
            return { id: inv.fincaId, data: fincaData };
          } catch (err) {
            console.error(`Error al cargar finca ${inv.fincaId}:`, err);
            return { id: inv.fincaId, data: null };
          }
        });

        const fincasResults = await Promise.all(fincasPromises);
        const fincasMap = {};
        fincasResults.forEach(result => {
          fincasMap[result.id] = result.data;
        });
        setFincasInfo(fincasMap);

      } catch (error) {
        console.error('Error al cargar invitaciones:', error);
      } finally {
        setLoadingInvitaciones(false);
      }
    };

    if (user?.id) {
      fetchInvitaciones();
    }
  }, [user]);

  const handleIngresar = (finca) => {
    selectFinca(finca);
    navigate(`/finca/${finca.id}`);
  };

  const handleAgregarFinca = () => {
    navigate("/fincaregister");
  };

  const handleResponderInvitacion = async (invitacionId, aceptar) => {
    setProcesandoInvitacion(invitacionId);

    try {
      const decisionData = {
        id: invitacionId,
        accepted: aceptar
      };

      await apiPost(`/api/inventory/fincas/invitaciones/${invitacionId}/decidir`, decisionData);

      // Remover la invitación de la lista
      setInvitaciones(invitaciones.filter(inv => inv.id !== invitacionId));

      // Si aceptó, recargar las fincas
      if (aceptar) {
        const data = await apiGet("/api/inventory/fincas");
        const fincasDelUsuario = data.filter(finca => 
          finca.usuarioCreadorId === user?.id || 
          finca.usuarioMiembroIds?.includes(user?.id)
        );
        setFincas(fincasDelUsuario);
        
        alert("¡Has aceptado la invitación exitosamente!");
      } else {
        alert("Has rechazado la invitación");
      }

    } catch (error) {
      console.error('Error al responder invitación:', error);
      alert("Error al procesar la invitación: " + error.message);
    } finally {
      setProcesandoInvitacion(null);
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return "Fecha desconocida";
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {error && (
          <div className="text-red-600 text-center mb-4">
            {error}
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-4">
            Mis Fincas
          </h1>
          <p className="text-gray-600 text-lg">
            Selecciona una finca para gestionar tu ganado
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {fincas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg">
                      <MapPin className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Aún no tienes fincas
                  </h2>
                  <p className="text-gray-600">
                    Comienza agregando tu primera finca para gestionar tu ganado
                  </p>
                  <button
                    onClick={handleAgregarFinca}
                    className="w-full flex justify-center items-center space-x-2 py-3 px-6 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Finca</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-8">
                  <button
                    onClick={handleAgregarFinca}
                    className="flex items-center space-x-2 py-3 px-6 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Agregar Finca</span>
                  </button>
                </div>

                {/* Grid de fincas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fincas.map((finca) => (
                    <div
                      key={finca.id}
                      className="bg-white rounded-2xl shadow-xl p-8 space-y-6 hover:shadow-2xl transition-shadow duration-200"
                    >
                      <div className="text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                            <Beef className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          {finca.nombre}
                        </h3>
                      </div>

                      <button
                        onClick={() => handleIngresar(finca)}
                        className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium"
                      >
                        <span>Ingresar</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Sección de Invitaciones Pendientes */}
        {!loading && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Invitaciones Pendientes
                </h2>
                {invitaciones.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {invitaciones.length}
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                Revisa y responde a las invitaciones para unirte a nuevas fincas
              </p>
            </div>

            {loadingInvitaciones ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : invitaciones.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <Mail className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No tienes invitaciones pendientes
                </h3>
                <p className="text-gray-600">
                  Cuando alguien te invite a su finca, aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitaciones.map((invitacion) => {
                  const fincaInfo = fincasInfo[invitacion.fincaId];
                  const estaProcesando = procesandoInvitacion === invitacion.id;

                  return (
                    <div
                      key={invitacion.id}
                      className="bg-white rounded-2xl shadow-xl p-6 space-y-4 hover:shadow-2xl transition-shadow duration-200 border-2 border-blue-100"
                    >
                      {/* Header de la invitación */}
                      <div className="flex items-center space-x-3 pb-4 border-b">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Invitación a</p>
                          <h3 className="text-xl font-bold text-gray-800">
                            {fincaInfo ? fincaInfo.nombre : "Cargando..."}
                          </h3>
                        </div>
                      </div>

                      {/* Información de la finca */}
                      {fincaInfo && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{fincaInfo.municipio}, {fincaInfo.departamento}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Invitado el {formatFecha(invitacion.createdAt)}</span>
                          </div>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleResponderInvitacion(invitacion.id, true)}
                          disabled={estaProcesando}
                          className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {estaProcesando ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Procesando...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Aceptar</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleResponderInvitacion(invitacion.id, false)}
                          disabled={estaProcesando}
                          className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;