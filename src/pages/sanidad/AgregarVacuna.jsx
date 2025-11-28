import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Syringe } from "lucide-react";
import SanidadFormLayout from "../../components/sanidad/SanidadFormLayout";
import { FormInput } from "../../components/sanidad/FormInput.jsx";
import { apiPost } from "../../api/api";

export default function AgregarVacuna() {
  const { fincaid } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    especies: [],
    tieneRefuerzos: false,
    refuerzos: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const especies = [
    { value: "BOVINO", label: "Bovino" },
    { value: "OVINO", label: "Ovino" },
    { value: "CAPRINO", label: "Caprino" },
    { value: "EQUINO", label: "Equino" },
    { value: "PORCINO", label: "Porcino" },
    { value: "AVE DE CORRAL", label: "Ave de corral" }
  ];

  const unidadesRefuerzo = [
    { value: "DIAS", label: "Días" },
    { value: "SEMANAS", label: "Semanas" },
    { value: "MESES", label: "Meses" },
    { value: "ANOS", label: "Años" }
  ];

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar nombre (obligatorio)
    if (!formData.nombre || formData.nombre.trim() === "") {
      newErrors.nombre = "El nombre de la vacuna es obligatorio";
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder los 100 caracteres";
    }

    // Validar tipo (obligatorio)
    if (!formData.tipo || formData.tipo.trim() === "") {
      newErrors.tipo = "El tipo de vacuna es obligatorio";
    } else if (formData.tipo.length < 3) {
      newErrors.tipo = "El tipo debe tener al menos 3 caracteres";
    } else if (formData.tipo.length > 100) {
      newErrors.tipo = "El tipo no puede exceder los 100 caracteres";
    }

    // Validar especies aplicables (obligatorio)
    if (!formData.especies || formData.especies.length === 0) {
      newErrors.especies = "Debes seleccionar al menos una especie aplicable";
    }

    // Validar refuerzos si está activado
    if (formData.tieneRefuerzos && (!formData.refuerzos || formData.refuerzos.length === 0)) {
      newErrors.refuerzos = "Debes agregar al menos un refuerzo";
    }

    // Validar cada refuerzo
    if (formData.refuerzos && formData.refuerzos.length > 0) {
      formData.refuerzos.forEach((refuerzo, index) => {
        if (!refuerzo.cantidad || refuerzo.cantidad < 1) {
          newErrors[`refuerzo_${index}_cantidad`] = "La cantidad debe ser mayor a 0";
        }
        if (!refuerzo.unidad) {
          newErrors[`refuerzo_${index}_unidad`] = "Debes seleccionar una unidad";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejar selección de especies
  const handleEspecieToggle = (especieValue) => {
    const currentEspecies = formData.especies || [];
    let newEspecies;

    if (currentEspecies.includes(especieValue)) {
      newEspecies = currentEspecies.filter(e => e !== especieValue);
    } else {
      newEspecies = [...currentEspecies, especieValue];
    }

    setFormData(prev => ({
      ...prev,
      especies: newEspecies
    }));

    if (newEspecies.length > 0 && errors.especies) {
      setErrors(prev => ({
        ...prev,
        especies: null
      }));
    }
  };

  // Manejar switch de refuerzos
  const handleRefuerzosToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      tieneRefuerzos: isChecked,
      refuerzos: isChecked ? (prev.refuerzos?.length > 0 ? prev.refuerzos : [{ cantidad: 1, unidad: "DIAS" }]) : []
    }));
  };

  // Agregar un nuevo refuerzo
  const handleAgregarRefuerzo = () => {
    setFormData(prev => ({
      ...prev,
      refuerzos: [...(prev.refuerzos || []), { cantidad: 1, unidad: "DIAS" }]
    }));
  };

  // Eliminar un refuerzo
  const handleEliminarRefuerzo = (index) => {
    setFormData(prev => ({
      ...prev,
      refuerzos: prev.refuerzos.filter((_, i) => i !== index)
    }));
  };

  // Actualizar datos de un refuerzo específico
  const handleRefuerzoChange = (index, field, value) => {
    setFormData(prev => {
      const newRefuerzos = [...prev.refuerzos];
      newRefuerzos[index] = {
        ...newRefuerzos[index],
        [field]: field === 'cantidad' ? parseInt(value) || 0 : value
      };
      return {
        ...prev,
        refuerzos: newRefuerzos
      };
    });
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Crear la vacuna (ProductoSanitario)
      const vacunaData = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        especies: formData.especies
      };

      console.log("=== CREANDO VACUNA ===");
      console.log(vacunaData);

      const vacunaResponse = await apiPost("/api/sanidad/vacunas", vacunaData);
      
      console.log("=== VACUNA CREADA ===");
      console.log(vacunaResponse);

      // 2. Si tiene refuerzos, crearlos uno por uno
      if (formData.tieneRefuerzos && formData.refuerzos.length > 0) {
        console.log("=== CREANDO REFUERZOS ===");
        
        const refuerzosPromises = formData.refuerzos.map(refuerzo => {
          const refuerzoData = {
            productoId: vacunaResponse.id,
            cantidad: refuerzo.cantidad,
            unidad: refuerzo.unidad
          };
          
          console.log("Refuerzo a crear:", refuerzoData);
          return apiPost("/api/sanidad/refuerzos", refuerzoData);
        });

        await Promise.all(refuerzosPromises);
        console.log("=== REFUERZOS CREADOS ===");
      }

      alert("Vacuna registrada exitosamente");
      navigate(`/${fincaid}/sanidad`);

    } catch (err) {
      console.error("Error enviando formulario:", err);
      setError(err.message || "Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SanidadFormLayout
      title="Agregar Vacuna"
      subtitle="Registrar nueva vacuna en la base de datos"
      icon={Syringe}
      iconColor="from-blue-500 to-blue-600"
      backPath={`/${fincaid}/sanidad`}
      onSubmit={handleSubmit}
      loading={loading}
      submitButtonText="Registrar Vacuna"
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
              Esta vacuna quedará registrada en la base de datos y podrá ser aplicada a animales de las especies seleccionadas.
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
              label="Nombre de la Vacuna"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              error={errors.nombre}
              required
              placeholder="Ej: Vacuna antirrábica, Triple bovina, etc."
              maxLength={100}
              helpText="Nombre comercial o técnico de la vacuna"
            />

            <FormInput
              label="Tipo de Vacuna"
              name="tipo"
              type="text"
              value={formData.tipo}
              onChange={handleChange}
              error={errors.tipo}
              required
              placeholder="Ej: Viral, Bacteriana, Polivalente, etc."
              maxLength={100}
              helpText="Clasificación o categoría de la vacuna"
            />
          </div>
        </div>

        {/* Especies Aplicables */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Especies Aplicables</h3>
          <p className="text-sm text-gray-500 mb-4">
            Selecciona todas las especies animales a las que se puede aplicar esta vacuna
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {especies.map((especie) => {
              const isSelected = formData.especies?.includes(especie.value);
              
              return (
                <label
                  key={especie.value}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleEspecieToggle(especie.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`ml-3 font-medium ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}>
                    {especie.label}
                  </span>
                </label>
              );
            })}
          </div>

          {errors.especies && (
            <div className="flex items-center space-x-1 mt-3 text-red-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.especies}</span>
            </div>
          )}
        </div>

        {/* Refuerzos (opcional con switch) */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Refuerzos</h3>
              <p className="text-sm text-gray-500 mt-1">
                Configura los refuerzos necesarios para esta vacuna
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tieneRefuerzos}
                onChange={handleRefuerzosToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {formData.tieneRefuerzos ? 'Activado' : 'Desactivado'}
              </span>
            </label>
          </div>

          {formData.tieneRefuerzos && (
            <div className="space-y-4">
              {formData.refuerzos && formData.refuerzos.map((refuerzo, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Refuerzo #{index + 1}</h4>
                    {formData.refuerzos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarRefuerzo(index)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={refuerzo.cantidad}
                        onChange={(e) => handleRefuerzoChange(index, 'cantidad', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`refuerzo_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 30"
                      />
                      {errors[`refuerzo_${index}_cantidad`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`refuerzo_${index}_cantidad`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unidad de tiempo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={refuerzo.unidad}
                        onChange={(e) => handleRefuerzoChange(index, 'unidad', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`refuerzo_${index}_unidad`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {unidadesRefuerzo.map((unidad) => (
                          <option key={unidad.value} value={unidad.value}>
                            {unidad.label}
                          </option>
                        ))}
                      </select>
                      {errors[`refuerzo_${index}_unidad`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`refuerzo_${index}_unidad`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAgregarRefuerzo}
                className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
              >
                + Agregar otro refuerzo
              </button>

              {errors.refuerzos && (
                <div className="flex items-center space-x-1 mt-3 text-red-600 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.refuerzos}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vista previa del registro */}
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Vista previa del registro:</h4>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Syringe className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900">
                {formData.nombre || "Nombre de la vacuna"}
              </h5>
              <p className="text-sm text-blue-600 mt-1">
                {formData.tipo || "Tipo de vacuna"}
              </p>
              
              {formData.especies && formData.especies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.especies.map(especieValue => {
                    const especie = especies.find(e => e.value === especieValue);
                    return (
                      <span
                        key={especieValue}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {especie?.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {formData.tieneRefuerzos && formData.refuerzos && formData.refuerzos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Refuerzos programados:</p>
                  <div className="space-y-1">
                    {formData.refuerzos.map((refuerzo, index) => {
                      const unidad = unidadesRefuerzo.find(u => u.value === refuerzo.unidad);
                      return (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold mr-2">
                            {index + 1}
                          </span>
                          <span>
                            <strong>{refuerzo.cantidad}</strong> {unidad?.label?.toLowerCase() || refuerzo.unidad}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SanidadFormLayout>
  );
}