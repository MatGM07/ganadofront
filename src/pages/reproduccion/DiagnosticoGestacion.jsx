import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Stethoscope, Calendar, FileText, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../api/api";

export default function DiagnosticoGestacion() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [montas, setMontas] = useState([]);
  const [hembra, setHembra] = useState(null);
  const [montaSeleccionada, setMontaSeleccionada] = useState(null);

  // Formulario de diagnóstico
  const [form, setForm] = useState({
    idMonta: "",
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
    resultado: "",
    especie: "",
    observaciones: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Opciones del ENUM Resultado
  const resultados = [
    { value: "GESTANTE", label: "GESTANTE - Gestación Confirmada", color: "text-green-600" },
    { value: "VACIA", label: "VACIA - No Gestante", color: "text-red-600" },
    { value: "NO_CONCLUYENTE", label: "NO_CONCLUYENTE - Requiere Nuevo Examen", color: "text-yellow-600" }
  ];

  const especies = [
    "Bovino",
    "Porcino",
    "Ave de corral",
    "Ovino",
    "Caprino",
    "Equino"
  ];

  // Cargar montas activas y datos de la hembra
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener montas en estado ACTIVA filtradas por la hembra de la URL
        const montasData = await apiGet("/api/reproduccion/montas");
        const montasActivas = montasData.filter(m => 
          m.estado === "ACTIVA" && m.idHembra === animalId
        );
        setMontas(montasActivas);

        // Obtener datos de la hembra
        const hembraData = await apiGet(`/api/inventory/animales/${animalId}`);
        setHembra(hembraData);
        
        // Autocompletar especie si está disponible
        if (hembraData.especie) {
          setForm(prev => ({ ...prev, especie: hembraData.especie }));
        }

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar las montas activas");
      } finally {
        setLoading(false);
      }
    };

    if (animalId) {
      cargarDatos();
    }
  }, [fincaid, animalId]);

  // Cuando se selecciona una monta
  useEffect(() => {
    if (form.idMonta) {
      const monta = montas.find(m => m.id === form.idMonta);
      if (monta) {
        setMontaSeleccionada(monta);
      }
    }
  }, [form.idMonta, montas]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!form.idMonta || !form.fecha || !form.resultado || !form.especie) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear el diagnóstico de gestación
      const diagnosticoData = {
        idMonta: form.idMonta,
        fecha: form.fecha,
        resultado: form.resultado,
        especie: form.especie,
        observaciones: form.observaciones || null
      };
      await apiPost("/api/reproduccion/diagnosticos", diagnosticoData);

      // 2. Actualizar estado de la monta según el resultado
      let nuevoEstadoMonta = montaSeleccionada.estado;
      
      if (form.resultado === "GESTANTE") {
        nuevoEstadoMonta = "CONFIRMADA";
      } else if (form.resultado === "VACIA") {
        nuevoEstadoMonta = "FALLIDA";
      }
      // Si es NO_CONCLUYENTE, mantener como ACTIVA

      if (nuevoEstadoMonta !== montaSeleccionada.estado) {
        await apiPut(`/api/reproduccion/montas/${form.idMonta}`, {
          ...montaSeleccionada,
          estado: nuevoEstadoMonta
        });
      }

      setSuccess(`¡Diagnóstico registrado correctamente! Estado: ${form.resultado}`);

      // Limpiar formulario
      setForm({
        idMonta: "",
        fecha: new Date().toISOString().split('T')[0],
        resultado: "",
        especie: hembra?.especie || "",
        observaciones: ""
      });
      setMontaSeleccionada(null);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/reproduccion`);
      }, 2000);

    } catch (err) {
      console.error("Error al registrar diagnóstico:", err);
      setError(err.message || "Error al registrar el diagnóstico. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(`/${fincaid}/reproduccion`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            
            {/* Header con botón volver */}
            <div className="flex items-center justify-between pb-6 border-b">
              <button
                onClick={handleVolver}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    Diagnóstico de Gestación
                  </h2>
                  <p className="text-sm text-gray-600">
                    {hembra ? `Hembra: ${hembra.identificador || hembra.id.substring(0, 8)}` : "Registrar resultado del diagnóstico"}
                  </p>
                </div>
              </div>
            </div>

            {/* Errores y éxito */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Alerta si no hay montas activas */}
            {!loading && montas.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium">No hay montas activas disponibles</p>
                    <p className="text-yellow-700 text-sm mt-1">
                      Esta hembra no tiene montas en estado ACTIVA. Para registrar un diagnóstico, primero debe existir una monta activa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sección: Datos del Diagnóstico */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Datos del Diagnóstico
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monta a Diagnosticar *
                    </label>
                    <select
                      name="idMonta"
                      value={form.idMonta}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                      disabled={montas.length === 0}
                    >
                      <option value="">Seleccione una monta activa</option>
                      {montas.map((monta) => (
                        <option key={monta.id} value={monta.id}>
                          Monta del {new Date(monta.fecha).toLocaleDateString('es-ES')} - {monta.metodoUtilizado || "Sin método"}
                        </option>
                      ))}
                    </select>
                    {montas.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        No hay montas activas para esta hembra
                      </p>
                    )}
                  </div>

                  {/* Fecha (autocompletada con fecha actual) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Diagnóstico *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="fecha"
                        value={form.fecha}
                        onChange={handleFormChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                  focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Por defecto: fecha actual
                    </p>
                  </div>

                  {/* Especie (autocompletada) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especie *
                    </label>
                    <select
                      name="especie"
                      value={form.especie}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione una especie</option>
                      {especies.map((especie) => (
                        <option key={especie} value={especie}>
                          {especie}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resultado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resultado del Diagnóstico *
                    </label>
                    <select
                      name="resultado"
                      value={form.resultado}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione el resultado</option>
                      {resultados.map((resultado) => (
                        <option key={resultado.value} value={resultado.value}>
                          {resultado.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del Diagnóstico
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="observaciones"
                      value={form.observaciones}
                      onChange={handleFormChange}
                      rows="4"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="Ej: Ecografía realizada, embrión visible, gestación de aproximadamente 30 días..."
                    />
                  </div>
                </div>
              </div>

              {/* Información del resultado seleccionado */}
              {form.resultado && (
                <div className={`border-l-4 p-4 rounded-lg ${
                  form.resultado === "GESTANTE" 
                    ? "bg-green-50 border-green-500"
                    : form.resultado === "VACIA"
                    ? "bg-red-50 border-red-500"
                    : "bg-yellow-50 border-yellow-500"
                }`}>
                  <p className={`text-sm font-medium ${
                    form.resultado === "GESTANTE" 
                      ? "text-green-800"
                      : form.resultado === "VACIA"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}>
                    {form.resultado === "GESTANTE" && "✓ La monta será marcada como CONFIRMADA"}
                    {form.resultado === "VACIA" && "✗ La monta será marcada como FALLIDA"}
                    {form.resultado === "NO_CONCLUYENTE" && "⚠ La monta permanecerá ACTIVA para un nuevo diagnóstico"}
                  </p>
                </div>
              )}

              {/* Nota informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Importante:</strong> Al registrar este diagnóstico:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-600 list-disc list-inside">
                  <li>Se guardará el resultado del diagnóstico en el historial</li>
                  <li>El estado de la monta se actualizará según el resultado</li>
                  <li>Si el resultado es GESTANTE, podrá registrar el nacimiento posteriormente</li>
                  <li>Si el resultado es NO_CONCLUYENTE, podrá realizar un nuevo diagnóstico</li>
                </ul>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleVolver}
                  className="flex-1 py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white 
                            border-2 border-gray-300 hover:bg-gray-50 transition-all font-medium"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || montas.length === 0}
                  className="flex-1 py-3 px-4 rounded-lg shadow-md text-white 
                            bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 
                            transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Diagnóstico</span>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Nota inferior */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              El diagnóstico quedará registrado en el historial reproductivo de la hembra
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}