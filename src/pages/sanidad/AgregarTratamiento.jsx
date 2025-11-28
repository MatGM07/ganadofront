import React from "react";
import { useParams } from "react-router-dom";
import { Pill } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput } from "../../components/sanidad/FormInput.jsx";
import { useSanidadForm } from "../../hooks/useSanidadForm";

export default function AgregarTratamiento() {
  const { fincaid } = useParams();

  // Configuración del hook reutilizable
  const {
    formData,
    loading,
    error,
    errors,
    handleChange,
    handleSubmit
  } = useSanidadForm({
    endpoint: "/api/sanidad/tratamientos",
    successMessage: "Tratamiento sanitario registrado exitosamente",
    redirectPath: `/${fincaid}/sanidad`,
    initialValues: {
      nombre: "",
      descripcion: "",
      medicamento: "",
      dosis: "",
      duracionTotalCantidad: "",
      duracionTotalUnidad: "DIAS",
      intervaloCantidad: "",
      intervaloUnidad: "DIAS"
    },
    validate: (data) => {
      const newErrors = {};

      // Validar nombre (obligatorio)
      if (!data.nombre || data.nombre.trim() === "") {
        newErrors.nombre = "El nombre del tratamiento es obligatorio";
      } else if (data.nombre.length < 3) {
        newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
      } else if (data.nombre.length > 100) {
        newErrors.nombre = "El nombre no puede exceder los 100 caracteres";
      }

      // Descripción es opcional según el DTO
      if (data.descripcion && data.descripcion.length > 500) {
        newErrors.descripcion = "La descripción no puede exceder los 500 caracteres";
      }

      // Medicamento es opcional
      if (data.medicamento && data.medicamento.length > 200) {
        newErrors.medicamento = "El medicamento no puede exceder los 200 caracteres";
      }

      // Dosis es opcional
      if (data.dosis && data.dosis.length > 200) {
        newErrors.dosis = "La dosis no puede exceder los 200 caracteres";
      }

      // Validar duración total
      if (data.duracionTotalCantidad) {
        const duracion = parseInt(data.duracionTotalCantidad);
        if (isNaN(duracion) || duracion < 1) {
          newErrors.duracionTotalCantidad = "La duración debe ser al menos 1";
        }
      }

      // Validar intervalo
      if (data.intervaloCantidad) {
        const intervalo = parseInt(data.intervaloCantidad);
        if (isNaN(intervalo) || intervalo < 1) {
          newErrors.intervaloCantidad = "El intervalo debe ser al menos 1";
        }
      }

      return newErrors;
    }
  });

  // Handler para los selects personalizados (duracionTotalUnidad e intervaloUnidad)
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  return (
    <SanidadFormLayout
      title="Agregar Tratamiento Sanitario"
      subtitle="Registrar nuevo tratamiento en la base de datos"
      icon={Pill}
      iconColor="from-purple-500 to-purple-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Tratamiento"
    >
      {/* Mensaje de error general */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información del formulario */}
      <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Este tratamiento quedará registrado en la base de datos y podrá ser asignado a animales posteriormente.
            </p>
          </div>
        </div>
      </div>

      {/* Campos del formulario */}
      <div className="space-y-6">
        {/* Información Básica */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="space-y-6">
            <FormInput
              label="Nombre del Tratamiento"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              required
              placeholder="Ej: Desparasitación interna, Antibiótico sistémico, etc."
              maxLength={100}
              helpText="Nombre claro e identificable del tratamiento sanitario"
            />

            <FormInput
              label="Descripción del Tratamiento"
              name="descripcion"
              type="textarea"
              value={formData.descripcion}
              onChange={handleChange}
              error={errors.descripcion}
              placeholder="Describe el tratamiento, su propósito, modo de aplicación, precauciones, etc."
              maxLength={500}
              rows={4}
              helpText="Información relevante sobre el tratamiento (opcional)"
            />
          </div>
        </div>

        {/* Información del Medicamento */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medicamento y Dosificación</h3>
          <div className="space-y-6">
            <FormInput
              label="Medicamento"
              name="medicamento"
              type="text"
              value={formData.medicamento}
              onChange={handleChange}
              error={errors.medicamento}
              placeholder="Ej: Ivermectina, Penicilina, etc."
              maxLength={200}
              helpText="Nombre comercial o principio activo del medicamento (opcional)"
            />

            <FormInput
              label="Dosis"
              name="dosis"
              type="text"
              value={formData.dosis}
              onChange={handleChange}
              error={errors.dosis}
              placeholder="Ej: 1 ml por cada 50 kg de peso corporal"
              maxLength={200}
              helpText="Especifica la cantidad y forma de administración (opcional)"
            />
          </div>
        </div>

        {/* Duración y Frecuencia */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Duración y Frecuencia</h3>
          <div className="space-y-6">
            {/* Duración Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Total del Tratamiento
              </label>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label=""
                  name="duracionTotalCantidad"
                  type="number"
                  value={formData.duracionTotalCantidad}
                  onChange={handleChange}
                  error={errors.duracionTotalCantidad}
                  placeholder="Cantidad"
                  helpText="Número de unidades"
                />
                <div>
                  <select
                    name="duracionTotalUnidad"
                    value={formData.duracionTotalUnidad}
                    onChange={handleSelectChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="DIAS">Días</option>
                    <option value="SEMANAS">Semanas</option>
                    <option value="MESES">Meses</option>
                    <option value="ANOS">Años</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Unidad de tiempo</p>
                </div>
              </div>
            </div>

            {/* Intervalo de Aplicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo de Aplicación
              </label>
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label=""
                  name="intervaloCantidad"
                  type="number"
                  value={formData.intervaloCantidad}
                  onChange={handleChange}
                  error={errors.intervaloCantidad}
                  placeholder="Cantidad"
                  helpText="Frecuencia de aplicación"
                />
                <div>
                  <select
                    name="intervaloUnidad"
                    value={formData.intervaloUnidad}
                    onChange={handleSelectChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="DIAS">Días</option>
                    <option value="SEMANAS">Semanas</option>
                    <option value="MESES">Meses</option>
                    <option value="ANOS">Años</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Unidad de intervalo</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Ejemplo: Si se aplica cada 3 días, ingresa 3 y selecciona "Días"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa del registro */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vista previa del registro:</h4>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {formData.nombre || "Nombre del tratamiento"}
              </h5>
              {formData.descripcion && (
                <p className="text-sm text-gray-600 mt-1">{formData.descripcion}</p>
              )}
              <div className="mt-3 space-y-1 text-sm">
                {formData.medicamento && (
                  <p className="text-gray-700">
                    <span className="font-medium">Medicamento:</span> {formData.medicamento}
                  </p>
                )}
                {formData.dosis && (
                  <p className="text-gray-700">
                    <span className="font-medium">Dosis:</span> {formData.dosis}
                  </p>
                )}
                {formData.duracionTotalCantidad && (
                  <p className="text-gray-700">
                    <span className="font-medium">Duración:</span> {formData.duracionTotalCantidad}{" "}
                    {formData.duracionTotalUnidad?.toLowerCase() || "días"}
                  </p>
                )}
                {formData.intervaloCantidad && (
                  <p className="text-gray-700">
                    <span className="font-medium">Intervalo:</span> Cada {formData.intervaloCantidad}{" "}
                    {formData.intervaloUnidad?.toLowerCase() || "días"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SanidadFormLayout>
  );
}