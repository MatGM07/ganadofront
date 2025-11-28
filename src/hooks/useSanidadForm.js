import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";

/**
 * Hook reutilizable para formularios de sanidad
 * Maneja el estado del formulario, validación y envío
 * 
 * @param {Object} config - Configuración del hook
 * @param {string} config.endpoint - Endpoint del API (ej: "/api/sanidad/tratamientos")
 * @param {string} config.successMessage - Mensaje de éxito
 * @param {string} config.redirectPath - Ruta a la que redirigir después del éxito
 * @param {Object} config.initialValues - Valores iniciales del formulario
 * @param {Function} config.validate - Función de validación personalizada
 */
export function useSanidadForm({ 
  endpoint, 
  successMessage = "Registro creado exitosamente",
  redirectPath,
  initialValues = {},
  validate 
}) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Actualizar un campo del formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validar el formulario
  const validateForm = () => {
      if (validate) {
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
      }
      return true;
    };

    // Enviar el formulario
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Descomentar esta línea:
      const response = await apiPost(endpoint, formData);
      
      console.log("=== RESPUESTA DEL SERVIDOR ===");
      console.log(response);

      alert(successMessage);
      
      if (redirectPath) {
        navigate(redirectPath);
      }
      
    } catch (err) {
      console.error("Error enviando formulario:", err);
      setError(err.message || "Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});
    setError(null);
  };

  return {
    formData,
    loading,
    error,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setError
  };
}