import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Activity, Calendar, User, Beef, Stethoscope, AlertCircle } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput, FormSelect } from "../../components/sanidad/FormInput.jsx";
import { apiGet, apiPost } from "../../api/api";

export default function AgregarIncidenciaEnfermedad() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    enfermedadId: "",
    idAnimal: animalId,
    responsable: "",
    fechaDiagnostico: new Date().toISOString().split('T')[0], // Fecha actual
    estado: "DIAGNOSTICADA",
    tratamientoIds: [] // Vacío por ahora, se agregará en otra página
  });

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // Datos cargados del backend
  const [animal, setAnimal] = useState(null);
  const [enfermedadesDisponibles, setEnfermedadesDisponibles] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, [animalId]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      setError("");

      console.group("📥 Cargando datos iniciales");
      console.log("Animal ID:", animalId);

      // 1. Cargar información del animal
      console.log("🔄 Obteniendo datos del animal...");
      const animalData = await apiGet(`/api/inventory/animales/${animalId}`);
      console.log("✅ Animal obtenido:", animalData);
      setAnimal(animalData);

      // 2. Cargar todas las enfermedades disponibles
      console.log("🔄 Obteniendo enfermedades disponibles...");
      const enfermedadesData = await apiGet(`/api/sanidad/enfermedades`);
      console.log("✅ Enfermedades obtenidas:", enfermedadesData);
      setEnfermedadesDisponibles(enfermedadesData);

      console.groupEnd();
    } catch (err) {
      console.group("❌ Error cargando datos iniciales");
      console.error("Error completo:", err);
      console.error("Mensaje:", err.message);
      console.groupEnd();

      setError(
        err.message || "Error al cargar los datos. Por favor intente nuevamente."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.enfermedadId) {
      newErrors.enfermedadId = "Debe seleccionar una enfermedad";
    }

    if (!formData.responsable || formData.responsable.trim() === "") {
      newErrors.responsable = "El responsable es obligatorio";
    } else if (formData.responsable.length < 3) {
      newErrors.responsable = "El responsable debe tener al menos 3 caracteres";
    } else if (formData.responsable.length > 100) {
      newErrors.responsable = "El responsable no puede exceder los 100 caracteres";
    }

    if (!formData.fechaDiagnostico) {
      newErrors.fechaDiagnostico = "La fecha de diagnóstico es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.group("📤 Validando formulario");
    console.log("Datos del formulario:", formData);
    console.groupEnd();

    if (!validateForm()) {
      console.warn("⚠️ Validación fallida:", errors);
      setError("Por favor corrija los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      console.group("🔄 Enviando incidencia de enfermedad");
      console.log("Endpoint:", "/api/sanidad/enfermedades/incidencias");
      console.log("Datos a enviar:", formData);

      const response = await apiPost("/api/sanidad/enfermedades/incidencias", formData);

      console.log("✅ Respuesta del servidor:", response);
      console.groupEnd();

      // Mostrar mensaje de éxito
      setError("");
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/sanidad`);
      }, 1500);

    } catch (err) {
      console.group("❌ Error al registrar incidencia");
      console.error("Error completo:", err);
      
      let errorMessage = "Error al registrar el diagnóstico. Por favor intente nuevamente.";

      if (err.response) {
        console.error("Status HTTP:", err.response.status);
        console.error("Data del servidor:", err.response.data);

        const status = err.response.status;
        const serverMessage = err.response.data?.message || err.response.data?.error;

        switch (status) {
          case 400:
            errorMessage = serverMessage || "Datos inválidos. Verifica la información ingresada.";
            break;
          case 401:
            errorMessage = "Sesión expirada. Por favor inicia sesión nuevamente.";
            break;
          case 404:
            errorMessage = "El animal o la enfermedad no existe.";
            break;
          case 409:
            errorMessage = serverMessage || "Ya existe un registro similar.";
            break;
          case 500:
            errorMessage = "Error interno del servidor. Contacta al administrador.";
            break;
          default:
            errorMessage = serverMessage || `Error del servidor (${status})`;
        }
      } else if (err.request) {
        console.error("❗ No se recibió respuesta del servidor");
        errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }

      console.groupEnd();
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones para el select de enfermedades
  const enfermedadesOptions = enfermedadesDisponibles.map(enfermedad => ({
    value: enfermedad.id,
    label: enfermedad.nombre
  }));

  // Obtener detalles de la enfermedad seleccionada
  const enfermedadSeleccionada = enfermedadesDisponibles.find(
    e => e.id === formData.enfermedadId
  );

  return (
    <SanidadFormLayout
      title="Registrar Diagnóstico"
      subtitle="Diagnosticar enfermedad en un animal"
      icon={Activity}
      iconColor="from-red-500 to-red-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Diagnóstico"
    >
      {/* Cargando datos iniciales */}
      {loadingData && (
        <div className="mb-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Cargando información del animal y enfermedades disponibles...</p>
          </div>
        </div>
      )}

      {/* Mensaje de error general */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-1">
                Revisa la consola del navegador para más detalles técnicos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Información del animal */}
      {animal && !loadingData && (
        <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
              <Beef className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Animal Seleccionado
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Identificador:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {animal.identificador || "Sin identificador"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Especie:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {animal.especie}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Raza:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {animal.raza}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Sexo:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {animal.sexo === "M" ? "Macho" : "Hembra"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información sobre enfermedades disponibles */}
      {!loadingData && enfermedadesDisponibles.length === 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Advertencia:</strong> No hay enfermedades registradas en el sistema.
                Por favor, registre primero las enfermedades en el módulo correspondiente.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingData && (
        <>
          {/* Campos del formulario */}
          <div className="space-y-6">
            {/* Selección de Enfermedad */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-red-600" />
                Información del Diagnóstico
              </h3>
              <FormSelect
                label="Enfermedad Diagnosticada"
                name="enfermedadId"
                value={formData.enfermedadId}
                onChange={handleChange}
                error={errors.enfermedadId}
                required
                options={enfermedadesOptions}
                placeholder={
                  enfermedadesDisponibles.length === 0
                    ? "No hay enfermedades registradas"
                    : "Selecciona la enfermedad diagnosticada"
                }
                disabled={enfermedadesDisponibles.length === 0}
                helpText="Enfermedad detectada en el animal"
              />

              {/* Detalles de la enfermedad seleccionada */}
              {enfermedadSeleccionada && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Detalles de la enfermedad:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Nombre:</span>{" "}
                      {enfermedadSeleccionada.nombre}
                    </p>
                    {enfermedadSeleccionada.descripcion && (
                      <p className="text-gray-700">
                        <span className="font-medium">Descripción:</span>{" "}
                        {enfermedadSeleccionada.descripcion}
                      </p>
                    )}
                    {enfermedadSeleccionada.sintomas && (
                      <p className="text-gray-700">
                        <span className="font-medium">Síntomas:</span>{" "}
                        {enfermedadSeleccionada.sintomas}
                      </p>
                    )}
                    {enfermedadSeleccionada.gravedad && (
                      <p className="text-gray-700">
                        <span className="font-medium">Gravedad:</span>{" "}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          enfermedadSeleccionada.gravedad === 'ALTA' ? 'bg-red-100 text-red-800' :
                          enfermedadSeleccionada.gravedad === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {enfermedadSeleccionada.gravedad}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Información del Diagnóstico */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Detalles del Diagnóstico
              </h3>
              
              <div className="space-y-6">
                <FormInput
                  label="Responsable del Diagnóstico"
                  name="responsable"
                  type="text"
                  value={formData.responsable}
                  onChange={handleChange}
                  error={errors.responsable}
                  required
                  placeholder="Nombre del veterinario o responsable"
                  maxLength={100}
                  helpText="Persona que realiza el diagnóstico"
                />

                {/* Fecha de Diagnóstico (solo lectura, fecha actual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Diagnóstico
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      name="fechaDiagnostico"
                      value={formData.fechaDiagnostico}
                      readOnly
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    La fecha se registra automáticamente como la fecha actual
                  </p>
                </div>
              </div>
            </div>

            {/* Nota informativa sobre tratamientos */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Los tratamientos para esta enfermedad podrán ser asignados posteriormente desde el historial médico del animal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa del registro */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Vista previa del registro:
            </h4>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    Diagnóstico - {animal?.identificador || "Animal"}
                  </h5>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Enfermedad:</span>{" "}
                      {formData.enfermedadId
                        ? enfermedadesOptions.find(e => e.value === formData.enfermedadId)?.label
                        : "No seleccionada"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Responsable:</span>{" "}
                      {formData.responsable || "No especificado"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(formData.fechaDiagnostico).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Estado:</span>{" "}
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        DIAGNOSTICADA
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </SanidadFormLayout>
  );
}