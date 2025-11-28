import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Syringe, Calendar, User, Beef, Shield, AlertCircle } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput, FormSelect } from "../../components/sanidad/FormInput.jsx";
import { apiGet, apiPost } from "../../api/api";

export default function AgregarIncidenciaVacuna() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    productoid: "",
    idAnimal: animalId,
    responsable: "",
    fechaVacunacion: new Date().toISOString().split('T')[0], // Fecha actual
    estado: "REALIZADO"
  });

  // Estados de carga y errores
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  // Datos cargados del backend
  const [animal, setAnimal] = useState(null);
  const [vacunasDisponibles, setVacunasDisponibles] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, [animalId]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingData(true);
      setError("");
      console.log("jijiji")

      console.group("📥 Cargando datos iniciales");
      console.log("Animal ID:", animalId);

      // 1. Cargar información del animal
      console.log("🔄 Obteniendo datos del animal...");
      const animalData = await apiGet(`/api/inventory/animales/${animalId}`);
      console.log("✅ Animal obtenido:", animalData);
      setAnimal(animalData);

      // 2. Cargar vacunas disponibles para la especie del animal
      console.log("🔄 Obteniendo vacunas para especie:", animalData.especie);
      const vacunasData = await apiGet(`/api/sanidad/vacunas/especie/${animalData.especie}`);
      console.log("✅ Vacunas obtenidas:", vacunasData);
      setVacunasDisponibles(vacunasData);

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

    if (!formData.productoid) {
      newErrors.productoid = "Debe seleccionar una vacuna";
    }

    if (!formData.responsable || formData.responsable.trim() === "") {
      newErrors.responsable = "El responsable es obligatorio";
    } else if (formData.responsable.length < 3) {
      newErrors.responsable = "El responsable debe tener al menos 3 caracteres";
    } else if (formData.responsable.length > 100) {
      newErrors.responsable = "El responsable no puede exceder los 100 caracteres";
    }

    if (!formData.fechaVacunacion) {
      newErrors.fechaVacunacion = "La fecha de vacunación es obligatoria";
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
      console.group("🔄 Enviando incidencia de vacunación");
      console.log("Endpoint:", "/api/sanidad/vacunas/incidencias");
      console.log("Datos a enviar:", formData);

      const response = await apiPost("/api/sanidad/vacunas/incidencias", formData);

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
      
      let errorMessage = "Error al registrar la vacunación. Por favor intente nuevamente.";

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
            errorMessage = "El animal o la vacuna no existe.";
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

  // Preparar opciones para el select de vacunas
  const vacunasOptions = vacunasDisponibles.map(vacuna => ({
    value: vacuna.id,
    label: `${vacuna.nombre}${vacuna.tipo ? ` (${vacuna.tipo})` : ""}`
  }));

  return (
    <SanidadFormLayout
      title="Registrar Vacunación"
      subtitle="Registrar aplicación de vacuna a un animal"
      icon={Syringe}
      iconColor="from-green-500 to-green-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Vacunación"
    >
      {/* Cargando datos iniciales */}
      {loadingData && (
        <div className="mb-6 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Cargando información del animal y vacunas disponibles...</p>
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
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
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

      {/* Información sobre vacunas disponibles */}
      {!loadingData && vacunasDisponibles.length === 0 && (
        <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Advertencia:</strong> No hay vacunas registradas para la especie {animal?.especie}.
                Por favor, registre primero las vacunas en el módulo de productos sanitarios.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loadingData && (
        <>
          {/* Campos del formulario */}
          <div className="space-y-6">
            {/* Selección de Vacuna */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Información de la Vacuna
              </h3>
              <FormSelect
                label="Vacuna / Producto Sanitario"
                name="productoid"
                value={formData.productoid}
                onChange={handleChange}
                error={errors.productoid}
                required
                options={vacunasOptions}
                placeholder={
                  vacunasDisponibles.length === 0
                    ? `No hay vacunas para ${animal?.especie}`
                    : "Selecciona la vacuna a aplicar"
                }
                disabled={vacunasDisponibles.length === 0}
                helpText={`Vacunas disponibles para ${animal?.especie || "esta especie"}`}
              />
            </div>

            {/* Información de la Aplicación */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Detalles de la Aplicación
              </h3>
              
              <div className="space-y-6">
                <FormInput
                  label="Responsable de la Vacunación"
                  name="responsable"
                  type="text"
                  value={formData.responsable}
                  onChange={handleChange}
                  error={errors.responsable}
                  required
                  placeholder="Nombre del veterinario o responsable"
                  maxLength={100}
                  helpText="Persona que aplica o supervisa la vacunación"
                />

                {/* Fecha de Vacunación (solo lectura, fecha actual) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vacunación
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      name="fechaVacunacion"
                      value={formData.fechaVacunacion}
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
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                  <Syringe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">
                    Vacunación - {animal?.identificador || "Animal"}
                  </h5>
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Vacuna:</span>{" "}
                      {formData.productoid
                        ? vacunasOptions.find(v => v.value === formData.productoid)?.label
                        : "No seleccionada"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Responsable:</span>{" "}
                      {formData.responsable || "No especificado"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Fecha:</span>{" "}
                      {new Date(formData.fechaVacunacion).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Estado:</span>{" "}
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        REALIZADA
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