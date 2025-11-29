import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, User, AlertCircle, Pill, Syringe } from "lucide-react";
import Header from "../../components/Header";
import { apiGet, apiPut } from "../../api/api";

export default function EditIncidenciaSanidad() {
  const { tipo, id, fincaid } = useParams(); // tipo: enfermedad|tratamiento|vacuna, id: UUID de la incidencia
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [incidenciaOriginal, setIncidenciaOriginal] = useState(null);

  const [form, setForm] = useState({
    responsable: "",
    fecha: "",
    estado: "",
    // Campos específicos según tipo
    enfermedadId: "",
    tratamientoId: "",
    productoId: "",
    idAnimal: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Configuración según tipo de incidencia
  const getConfigByTipo = () => {
    const configs = {
      enfermedad: {
        icon: AlertCircle,
        color: "red",
        title: "Incidencia de Enfermedad",
        estadosDisponibles: ["DIAGNOSTICADA", "TRATAMIENTO", "FINALIZADA"],
        fechaField: "fechaDiagnostico",
        endpoint: "/api/sanidad/enfermedades/incidencias"
      },
      tratamiento: {
        icon: Pill,
        color: "yellow",
        title: "Incidencia de Tratamiento",
        estadosDisponibles: ["PENDIENTE", "REALIZADO", "ANULADO"],
        fechaField: "fechaTratamiento",
        endpoint: "/api/sanidad/tratamientos/incidencias"
      },
      vacuna: {
        icon: Syringe,
        color: "blue",
        title: "Incidencia de Vacunación",
        estadosDisponibles: ["PENDIENTE", "REALIZADO", "ANULADO"],
        fechaField: "fechaVacunacion",
        endpoint: "/api/sanidad/vacunas/incidencias"
      }
    };
    return configs[tipo] || configs.vacuna;
  };

  const config = getConfigByTipo();
  const Icon = config.icon;

  // Cargar datos de la incidencia
  useEffect(() => {
    const fetchIncidencia = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(`${config.endpoint}/${id}`);
        console.log("Incidencia cargada:", data);

        setIncidenciaOriginal(data);

        // Obtener la fecha según el tipo
        let fechaValue = "";
        if (tipo === "enfermedad" && data.fechaDiagnostico) {
          fechaValue = new Date(data.fechaDiagnostico).toISOString().split('T')[0];
        } else if (tipo === "tratamiento" && data.fechaTratamiento) {
          fechaValue = new Date(data.fechaTratamiento).toISOString().split('T')[0];
        } else if (tipo === "vacuna" && data.fechaVacunacion) {
          fechaValue = new Date(data.fechaVacunacion).toISOString().split('T')[0];
        }

        setForm({
          responsable: data.responsable || "",
          fecha: fechaValue,
          estado: data.estado || "",
          enfermedadId: data.enfermedadId || "",
          tratamientoId: data.tratamientoId || "",
          productoId: data.productoId || "",
          idAnimal: data.idAnimal || ""
        });

      } catch (err) {
        console.error("Error cargando incidencia:", err);
        setError(err.message || "Error cargando los datos de la incidencia.");
        
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && tipo) {
      fetchIncidencia();
    }
  }, [id, tipo, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validaciones
  const validar = () => {
    if (!form.responsable || !form.fecha || !form.estado) {
      return "Los campos obligatorios no pueden estar vacíos.";
    }

    return null;
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validar();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // Preparar el DTO según el tipo
      let requestDTO = {};

      if (tipo === "enfermedad") {
        requestDTO = {
          enfermedadId: form.enfermedadId,
          idAnimal: form.idAnimal,
          responsable: form.responsable,
          fechaDiagnostico: form.fecha,
          estado: form.estado,
          tratamientoIds: incidenciaOriginal.tratamientoIds || []
        };
      } else if (tipo === "tratamiento") {
        requestDTO = {
          tratamientoId: form.tratamientoId,
          idAnimal: form.idAnimal,
          responsable: form.responsable,
          fechaTratamiento: form.fecha,
          estado: form.estado
        };
      } else if (tipo === "vacuna") {
        requestDTO = {
          productoid: form.productoId,
          idAnimal: form.idAnimal,
          responsable: form.responsable,
          fechaVacunacion: form.fecha,
          estado: form.estado
        };
      }

      console.log("Enviando actualización:", requestDTO);

      const incidenciaActualizada = await apiPut(`${config.endpoint}/${id}`, requestDTO);

      setSuccess("Incidencia actualizada correctamente.");
      setIncidenciaOriginal(incidenciaActualizada);

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/sanidad/${form.idAnimal}/historial`);
      }, 1500);

    } catch (err) {
      console.error("Error actualizando incidencia:", err);
      setError(err.message || "No se pudo actualizar la incidencia.");
    } finally {
      setSaving(false);
    }
  };

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    const colors = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
      REALIZADO: "bg-green-100 text-green-800 border-green-300",
      ANULADO: "bg-gray-100 text-gray-800 border-gray-300",
      DIAGNOSTICADA: "bg-orange-100 text-orange-800 border-orange-300",
      TRATAMIENTO: "bg-blue-100 text-blue-800 border-blue-300",
      FINALIZADA: "bg-green-100 text-green-800 border-green-300"
    };
    return colors[estado] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de la incidencia...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

            {/* Título */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 p-4 rounded-2xl shadow-lg`}>
                  <Icon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {config.title}
              </h2>
              <p className="mt-2 text-gray-600">
                Editar información de la incidencia
              </p>
            </div>

            {/* Info de la incidencia */}
            {incidenciaOriginal && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {tipo === "enfermedad" ? "Enfermedad" : tipo === "tratamiento" ? "Tratamiento" : "Producto/Vacuna"}:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {incidenciaOriginal.enfermedadNombre || incidenciaOriginal.tratamientoNombre || incidenciaOriginal.productoNombre}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Animal ID:</span>
                  <span className="text-sm text-gray-900">{incidenciaOriginal.idAnimal}</span>
                </div>
              </div>
            )}

            {/* Mensajes */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-medium">{success}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Responsable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="responsable"
                      value={form.responsable}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del responsable"
                      required
                    />
                  </div>
                </div>

                {/* Fecha - SIN RESTRICCIÓN max */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tipo === "enfermedad" ? "Fecha Diagnóstico" : tipo === "tratamiento" ? "Fecha Tratamiento" : "Fecha Vacunación"} *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Estado */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {config.estadosDisponibles.map(estado => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => setForm({ ...form, estado })}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                          form.estado === estado
                            ? getEstadoColor(estado) + " shadow-md"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {estado.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Botones - SIN BOTÓN DE ELIMINAR */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? "Guardando cambios..." : "Guardar Cambios"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Texto extra */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Los cambios se aplicarán inmediatamente al historial sanitario</p>
          </div>
        </div>
      </div>
    </div>
  );
}