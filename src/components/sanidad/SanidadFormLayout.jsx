import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import Header from "../../components/Header";

/**
 * Componente de layout reutilizable para formularios de sanidad
 * Proporciona estructura consistente con encabezado, contenido y acciones
 */
export default function SanidadFormLayout({
  title,
  subtitle,
  icon: IconComponent,
  iconColor = "from-blue-500 to-blue-600",
  backPath,
  onSubmit,
  onCancel,
  loading = false,
  children,
  submitButtonText = "Guardar",
  cancelButtonText = "Cancelar"
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      handleBack();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className={`bg-gradient-to-br ${iconColor} p-3 rounded-xl shadow-lg`}>
                {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {children}
        </form>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
            <span>{cancelButtonText}</span>
          </button>

          <button
            type="submit"
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{submitButtonText}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Todos los campos marcados con * son obligatorios
        </p>
      </div>
    </div>
  );
}