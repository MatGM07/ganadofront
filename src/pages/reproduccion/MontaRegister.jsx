import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Calendar, FileText, ArrowLeft, PawPrint } from "lucide-react";
import { apiGet, apiPost } from "../../api/api";

export default function MontaRegister() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [hembra, setHembra] = useState(null);
  const [machos, setMachos] = useState([]);

  // Formulario de monta
  const [form, setForm] = useState({
    animalId: animalId || "",
    idMacho: "",
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
    metodoUtilizado: "",
    notas: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const metodos = [
    "Monta natural",
    "Inseminación artificial",
    "Transferencia de embriones",
    "Otro"
  ];

  // Cargar datos de la hembra y machos disponibles
  useEffect(() => {
    console.log("🔄 useEffect ejecutado — fincaid:", fincaid, "animalId:", animalId);

    const cargarDatos = async () => {
      try {
        console.log("⏳ Inicio de cargarDatos()");
        setLoading(true);

        // ----- OBTENER HEMBRA -----
        console.log("📡 GET hembra:", `/api/inventory/animales/${animalId}`);
        const hembraData = await apiGet(`/api/inventory/animales/${animalId}`);
        console.log("✔ Hembra recibida:", hembraData);
        setHembra(hembraData);

        // ----- OBTENER TODOS LOS ANIMALES -----
        console.log("📡 GET animales: /api/inventory/animales");
        const animalesData = await apiGet("/api/inventory/animales");
        console.log("✔ Animales recibidos:", animalesData.length);

        // ----- FILTRAR MACHOS -----
        const machosDisponibles = animalesData.filter((a) => {
          const keep =
            a.especie === hembraData.especie &&
            a.sexo === "M" &&
            a.estado === "Activo" &&
            a.fincaId === fincaid;

          if (!keep) {
            console.log("⛔ No coincide:", {
              id: a.id,
              especie: a.especie,
              sexo: a.sexo,
              estado: a.estado,
              fincaId: a.fincaId,
              esperado: fincaid,
            });
          }

          return keep;
        });

        console.log("🐂 Machos filtrados:", machosDisponibles.length);
        setMachos(machosDisponibles);

      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        setError("Error al cargar los datos del animal");
      } finally {
        console.log("🏁 Finalizó cargarDatos() — cambiando loading a false");
        setLoading(false);
      }
    };

    if (animalId) {
      console.log("▶ Ejecutando cargarDatos()");
      cargarDatos();
    } else {
      console.warn("⚠ No hay animalId. No se carga nada.");
    }

  }, [fincaid, animalId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!form.fecha) {
      setError("Por favor ingrese la fecha de la monta.");
      return;
    }

    setIsSubmitting(true);

    try {
      const montaData = {
        idHembra: animalId,
        idMacho: form.idMacho || null, // Opcional
        fecha: form.fecha,
        metodoUtilizado: form.metodoUtilizado || null,
        notas: form.notas || null
      };

      await apiPost("/api/reproduccion/montas", montaData);

      setSuccess("¡Monta registrada correctamente!");

      // Limpiar formulario
      setForm({
        animalId: animalId || "",
        idMacho: "",
        fecha: new Date().toISOString().split('T')[0],
        metodoUtilizado: "",
        notas: ""
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/reproduccion`);
      }, 2000);

    } catch (err) {
      console.error("Error al registrar monta:", err);
      setError(err.message || "Error al registrar la monta. Por favor intente nuevamente.");
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

  if (!hembra) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">No se encontró el animal</p>
          <button
            onClick={handleVolver}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl">
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
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    Registrar Monta
                  </h2>
                  <p className="text-sm text-gray-600">
                    Hembra: {hembra.identificador || hembra.id.substring(0, 8)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la hembra */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <PawPrint className="w-5 h-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">
                    Información de la Hembra
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-purple-700">
                    <div>
                      <span className="font-medium">Especie:</span> {hembra.especie}
                    </div>
                    <div>
                      <span className="font-medium">Raza:</span> {hembra.raza}
                    </div>
                    {hembra.identificador && (
                      <div>
                        <span className="font-medium">Identificador:</span> {hembra.identificador}
                      </div>
                    )}
                    {hembra.ubicacion && (
                      <div>
                        <span className="font-medium">Ubicación:</span> {hembra.ubicacion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Errores y éxito */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de la Monta *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Macho (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Macho (Opcional)
                  </label>
                  <select
                    name="idMacho"
                    value={form.idMacho}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                              focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                  >
                    <option value="">Sin macho registrado</option>
                    {machos.map((macho) => (
                      <option key={macho.id} value={macho.id}>
                        {macho.identificador || macho.id.substring(0, 8)} - {macho.raza}
                      </option>
                    ))}
                  </select>
                  {machos.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No hay machos de especie "{hembra.especie}" disponibles
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Solo se muestran machos de la misma especie ({hembra.especie})
                  </p>
                </div>

                {/* Método Utilizado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método Utilizado
                  </label>
                  <select
                    name="metodoUtilizado"
                    value={form.metodoUtilizado}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                              focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione un método</option>
                    {metodos.map((metodo) => (
                      <option key={metodo} value={metodo}>
                        {metodo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas / Observaciones
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="notas"
                    value={form.notas}
                    onChange={handleChange}
                    rows="4"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                              focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Ej: Condiciones de la monta, comportamiento observado, etc."
                  />
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> La monta se registrará con estado "ACTIVA". 
                  Podrá actualizarse a "FINALIZADA" cuando se registre un nacimiento asociado.
                </p>
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
                  disabled={isSubmitting}
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
                    <span>Registrar Monta</span>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Nota inferior */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              La monta será registrada y podrá consultarse en el historial reproductivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}