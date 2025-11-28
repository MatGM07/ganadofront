import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pill, Calendar, User, Beef, Heart, AlertCircle, Activity } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput, FormSelect } from "../../components/sanidad/FormInput.jsx";
import { apiGet, apiPost } from "../../api/api";

export default function AgregarIncidenciaTratamiento() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    tratamientoId: "",
    idAnimal: animalId,
    responsable: "",
    fechaTratamiento: new Date().toISOString().split('T')[0], // Fecha actual
    estado: "REALIZADO",
    incidenciaEnfermedadId: "" // Opcional: vinculación con enfermedad
  });

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // Datos cargados del backend
  const [animal, setAnimal] = useState(null);
  const [tratamientosDisponibles, setTratamientosDisponibles] = useState([]);
  const [enfermedadesDelAnimal, setEnfermedadesDelAnimal] = useState([]);

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

      // 2. Cargar todos los tratamientos disponibles
      console.log("🔄 Obteniendo tratamientos disponibles...");
      const tratamientosData = await apiGet(`/api/sanidad/tratamientos`);
      console.log("✅ Tratamientos obtenidos:", tratamientosData);
      setTratamientosDisponibles(tratamientosData);

      // 3. Cargar incidencias de enfermedades del animal (solo DIAGNOSTICADAS o EN_TRATAMIENTO)
      console.log("🔄 Obteniendo enfermedades diagnosticadas del animal...");
      const enfermedadesData = await apiGet(`/api/sanidad/enfermedades/incidencias/animal/${animalId}`);
      console.log("✅ Enfermedades del animal obtenidas:", enfermedadesData);
      
      // Filtrar solo las que están en estado DIAGNOSTICADA o EN_TRATAMIENTO
      const enfermedadesActivas = enfermedadesData.filter(
        e => e.estado === "DIAGNOSTICADA" || e.estado === "EN_TRATAMIENTO"
      );
      setEnfermedadesDelAnimal(enfermedadesActivas);

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

    if (!formData.tratamientoId) {
      newErrors.tratamientoId = "Debe seleccionar un tratamiento";
    }

    if (!formData.responsable || formData.responsable.trim() === "") {
      newErrors.responsable = "El responsable es obligatorio";
    } else if (formData.responsable.length < 3) {
      newErrors.responsable = "El responsable debe tener al menos 3 caracteres";
    } else if (formData.responsable.length > 100) {
      newErrors.responsable = "El responsable no puede exceder los 100 caracteres";
    }

    if (!formData.fechaTratamiento) {
      newErrors.fechaTratamiento = "La fecha de tratamiento es obligatoria";
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
      console.group("🔄 Enviando incidencia de tratamiento");
      console.log("Endpoint:", "/api/sanidad/tratamientos/incidencias");
      
      // Preparar datos: si incidenciaEnfermedadId está vacío, no enviarlo
      const dataToSend = {
        ...formData,
        incidenciaEnfermedadId: formData.incidenciaEnfermedadId || undefined
      };
      
      console.log("Datos a enviar:", dataToSend);

      const response = await apiPost("/api/sanidad/tratamientos/incidencias", dataToSend);

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
      
      let errorMessage = "Error al registrar el tratamiento. Por favor intente nuevamente.";

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
            errorMessage = "El animal o el tratamiento no existe.";
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

  // Preparar opciones para el select de tratamientos
  const tratamientosOptions = tratamientosDisponibles.map(tratamiento => ({
    value: tratamiento.id,
    label: `${tratamiento.nombre}${tratamiento.medicamento ? ` - ${tratamiento.medicamento}` : ""}`
  }));

  // Preparar opciones para el select de enfermedades
  const enfermedadesOptions = enfermedadesDelAnimal.map(enfermedad => ({
    value: enfermedad.id,
    label: `${enfermedad.enfermedadNombre} (${new Date(enfermedad.fechaDiagnostico).toLocaleDateString("es-ES")})`
  }));

  // Obtener detalles del tratamiento seleccionado
  const tratamientoSeleccionado = tratamientosDisponibles.find(
    t => t.id === formData.tratamientoId
  );

  // Obtener detalles de la enfermedad seleccionada
  const enfermedadSeleccionada = enfermedadesDelAnimal.find(
    e => e.id === formData.incidenciaEnfermedadId
  );

  return (
    <SanidadFormLayout
      title="Registrar Tratamiento"
      subtitle="Registrar aplicación de tratamiento sanitario a un animal"
      icon={Pill}
      iconColor="from-purple-500 to-purple-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Tratamiento"
    >
      {/* Cargando datos iniciales */}
      {loadingData && (
        <div className="mb-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Cargando información del animal, tratamientos y enfermedades...</p>
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
        <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
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

      {/* Información sobre tratamientos disponibles */}
      {!loadingData && tratamientosDisponibles.length === 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Advertencia:</strong> No hay tratamientos registrados en el sistema.
                Por favor, registre primero los tratamientos sanitarios.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingData && (
        <>
          {/* Campos del formulario */}
          <div className="space-y-6">
            {/* Vinculación con Enfermedad (Opcional) */}
            {enfermedadesDelAnimal.length > 0 && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-red-600" />
                  Vinculación con Enfermedad (Opcional)
                </h3>
                
                <FormSelect
                  label="Enfermedad Diagnosticada"
                  name="incidenciaEnfermedadId"
                  value={formData.incidenciaEnfermedadId}
                  onChange={handleChange}
                  error={errors.incidenciaEnfermedadId}
                  options={enfermedadesOptions}
                  placeholder="Ninguna (tratamiento general)"
                  helpText="Si este tratamiento está relacionado con una enfermedad diagnosticada, selecciónala aquí"
                />

                {enfermedadSeleccionada && (
                  <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Enfermedad vinculada:
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Enfermedad:</span>{" "}
                        {enfermedadSeleccionada.enfermedadNombre}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Fecha diagnóstico:</span>{" "}
                        {new Date(enfermedadSeleccionada.fechaDiagnostico).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Estado:</span>{" "}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          enfermedadSeleccionada.estado === "DIAGNOSTICADA" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {enfermedadSeleccionada.estado}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {enfermedadesDelAnimal.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No hay enfermedades diagnosticadas activas para este animal.
                  </p>
                )}
              </div>
            )}

            {/* Selección de Tratamiento */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-purple-600" />
                Información del Tratamiento
              </h3>
              <FormSelect
                label="Tratamiento Sanitario"
                name="tratamientoId"
                value={formData.tratamientoId}
                onChange={handleChange}
                error={errors.tratamientoId}
                required
                options={tratamientosOptions}
                placeholder={
                  tratamientosDisponibles.length === 0
                    ? "No hay tratamientos registrados"
                    : "Selecciona el tratamiento a aplicar"
                }
                disabled={tratamientosDisponibles.length === 0}
                helpText="Tratamiento a administrar al animal"
              />

              {/* Detalles del tratamiento seleccionado */}
              {tratamientoSeleccionado && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Detalles del tratamiento:
                  </h4>
                  <div className="space-y-2 text-sm">
                    {tratamientoSeleccionado.medicamento && (
                      <p className="text-gray-700">
                        <span className="font-medium">Medicamento:</span>{" "}
                        {tratamientoSeleccionado.medicamento}
                      </p>
                    )}
                    {tratamientoSeleccionado.dosis && (
                      <p className="text-gray-700">
                        <span className="font-medium">Dosis:</span>{" "}
                        {tratamientoSeleccionado.dosis}
                      </p>
                    )}
                    {tratamientoSeleccionado.descripcion && (
                      <p className="text-gray-700">
                        <span className="font-medium">Descripción:</span>{" "}
                        {tratamientoSeleccionado.descripcion}
                      </p>
                    )}
                    {tratamientoSeleccionado.duracionTotalCantidad && (
                      <p className="text-gray-700">
                        <span className="font-medium">Duración total:</span>{" "}
                        {tratamientoSeleccionado.duracionTotalCantidad}{" "}
                        {tratamientoSeleccionado.duracionTotalUnidad?.toLowerCase() || ""}
                      </p>
                    )}
                    {tratamientoSeleccionado.intervaloCantidad && (
                      <p className="text-gray-700">
                        <span className="font-medium">Intervalo:</span>{" "}
                        Cada {tratamientoSeleccionado.intervaloCantidad}{" "}
                        {tratamientoSeleccionado.intervaloUnidad?.toLowerCase() || ""}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Información de la Aplicación */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Detalles de la Aplicación
              </h3>
              
              <div className="space-y-6">
                <FormInput
                  label="Responsable del Tratamiento"
                  name="responsable"
                  type="text"
                  value={formData.responsable}
                  onChange={handleChange}
                  error={errors.responsable}
                  required
                  placeholder="Nombre del veterinario o responsable"
                  maxLength={100}
                  helpText="Persona que aplica o supervisa el tratamiento"
                />

                {/* Fecha de Tratamiento (solo lectura, fecha actual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Tratamiento
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      name="fechaTratamiento"
                      value={formData.fechaTratamiento}
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
          </div>

          {/* Vista previa del registro */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Vista previa del registro:
            </h4>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    Tratamiento - {animal?.identificador || "Animal"}
                  </h5>
                  <div className="mt-3 space-y-1 text-sm">
                    {enfermedadSeleccionada && (
                      <p className="text-gray-700 mb-2 pb-2 border-b border-gray-200">
                        <span className="font-medium">Vinculado a enfermedad:</span>{" "}
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          {enfermedadSeleccionada.enfermedadNombre}
                        </span>
                      </p>
                    )}
                    <p className="text-gray-700">
                      <span className="font-medium">Tratamiento:</span>{" "}
                      {formData.tratamientoId
                        ? tratamientosOptions.find(t => t.value === formData.tratamientoId)?.label
                        : "No seleccionado"}
                    </p>
                    {tratamientoSeleccionado?.medicamento && (
                      <p className="text-gray-700">
                        <span className="font-medium">Medicamento:</span>{" "}
                        {tratamientoSeleccionado.medicamento}
                      </p>
                    )}
                    <p className="text-gray-700">
                      <span className="font-medium">Responsable:</span>{" "}
                      {formData.responsable || "No especificado"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(formData.fechaTratamiento).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Estado:</span>{" "}
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        REALIZADO
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