import React from "react";
import { useParams } from "react-router-dom";
import { Activity } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput } from "../../components/sanidad/FormInput.jsx";
import { useSanidadForm } from "../../hooks/useSanidadForm";

export default function AgregarEnfermedad() {
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
    endpoint: "/api/sanidad/enfermedades",
    successMessage: "Enfermedad registrada exitosamente",
    redirectPath: `/${fincaid}/sanidad`,
    initialValues: {
      nombre: "",
      descripcion: ""
    },
    validate: (data) => {
      const newErrors = {};

      // Validar nombre (obligatorio según @NotBlank)
      if (!data.nombre || data.nombre.trim() === "") {
        newErrors.nombre = "El nombre de la enfermedad es obligatorio";
      } else if (data.nombre.length < 3) {
        newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
      } else if (data.nombre.length > 100) {
        newErrors.nombre = "El nombre no puede exceder los 100 caracteres";
      }

      // Descripción es opcional según el DTO (no tiene @NotBlank)
      if (data.descripcion && data.descripcion.length > 500) {
        newErrors.descripcion = "La descripción no puede exceder los 500 caracteres";
      }

      return newErrors;
    }
  });

  return (
    <SanidadFormLayout
      title="Agregar Enfermedad"
      subtitle="Registrar nueva enfermedad en la base de datos"
      icon={Activity}
      iconColor="from-red-500 to-red-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Enfermedad"
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
      <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Esta enfermedad quedará registrada en la base de datos y podrá ser diagnosticada en animales posteriormente.
            </p>
          </div>
        </div>
      </div>

      {/* Campos del formulario */}
      <div className="space-y-6">
        <FormInput
          label="Nombre de la Enfermedad"
          name="nombre"
          type="text"
          value={formData.nombre}
          onChange={handleChange}
          error={errors.nombre}
          required
          placeholder="Ej: Fiebre aftosa, Brucelosis, Mastitis, etc."
          maxLength={100}
          helpText="Nombre técnico o común de la enfermedad"
        />

        <FormInput
          label="Descripción de la Enfermedad"
          name="descripcion"
          type="textarea"
          value={formData.descripcion}
          onChange={handleChange}
          error={errors.descripcion}
          placeholder="Describe la enfermedad, síntomas principales, agente causal, forma de transmisión, tratamiento recomendado, etc."
          maxLength={500}
          rows={6}
          helpText="Información detallada sobre la enfermedad (opcional)"
        />
      </div>

      {/* Vista previa del registro */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vista previa del registro:</h4>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {formData.nombre || "Nombre de la enfermedad"}
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                {formData.descripcion || "Descripción de la enfermedad aparecerá aquí"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SanidadFormLayout>
  );
}