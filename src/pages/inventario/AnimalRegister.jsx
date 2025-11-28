import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PawPrint, Hash, Calendar, Scale, BadgeCheck, MapPin, ArrowLeft } from "lucide-react";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/useAuth";
import { apiPost } from "../../api/api";

export default function AnimalRegister() {
  const { fincaid } = useParams();
  const navigate = useNavigate();
  const { selectedFinca } = useAuth();

  const [form, setForm] = useState({
    especie: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    peso: "",
    ubicacion: "",
    identificador: "",
    fincaId: fincaid
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const especies = [
    "Bovino",
    "Porcino",
    "Ave de corral",
    "Ovino",
    "Caprino",
    "Equino"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.especie || !form.raza || !form.sexo || !form.fechaNacimiento) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);

    try {
      const animalData = {
        especie: form.especie,
        raza: form.raza,
        sexo: form.sexo,
        fechaNacimiento: form.fechaNacimiento,
        peso: form.peso ? parseFloat(form.peso) : null,
        ubicacion: form.ubicacion || null,
        identificador: form.identificador || null,
        fincaId: fincaid
      };

      // Crear el animal
      const createdAnimal = await apiPost("/api/inventory/animales", animalData);

      // Intentar obtener el id del animal desde la respuesta (varios posibles nombres)
      const createdAnimalId = createdAnimal?.id || createdAnimal?.animalId || createdAnimal?.uuid || null;

      // Preparar payload para historial (siempre enviamos fecha en ISO; el backend puede mapear a LocalDateTime)
      if (createdAnimalId) {
        const historyPayload = {
          animalId: createdAnimalId,
          descripcion: `Creación de animal. Identificador: ${animalData.identificador ?? "N/A"}. Especie: ${animalData.especie}. Raza: ${animalData.raza}.`,
          fechaCreacion: new Date().toISOString()
        };

        try {
          await apiPost("/api/inventory/animales/historias", historyPayload);
          // historial creado correctamente
          setSuccess("¡Animal registrado correctamente! Se generó la entrada en historial.");
        } catch (histErr) {
          console.error("Error al crear historial del animal:", histErr);
          // Animal creado pero fallo la creación del historial
          setSuccess("¡Animal registrado correctamente!");
          setError("No se pudo generar el registro de historial. Por favor inténtelo después.");
        }
      } else {
        // No se obtuvo animalId en la respuesta -> omitimos crear historial
        console.warn("No se obtuvo animalId del servidor; se omite creación de historial.");
        setSuccess("¡Animal registrado correctamente! (No se pudo crear historial por falta de ID devuelto por el servidor)");
      }

      // Limpiar formulario
      setForm({
        especie: "",
        raza: "",
        sexo: "",
        fechaNacimiento: "",
        peso: "",
        ubicacion: "",
        identificador: "",
        fincaId: fincaid
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/inventario`);
      }, 2000);

    } catch (err) {
      console.error("Error al registrar animal:", err);
      setError(err.message || "Error al registrar el animal. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(`/${fincaid}/inventario`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
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
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <PawPrint className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Registrar Animal
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedFinca?.nombre || "Finca"}
                  </p>
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
                {/* Especie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especie *
                  </label>
                  <div className="relative">
                    <PawPrint className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      name="especie"
                      value={form.especie}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione una especie</option>
                      {especies.map((especie) => (
                        <option key={especie} value={especie}>
                          {especie}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Raza */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza *
                  </label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="raza"
                      value={form.raza}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Ej: Brahman, Holstein, etc."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identificador (Arete / Código / Nombre)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="identificador"
                      value={form.identificador}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Ej: A-153, 2045, Manchitas..."
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    identificador visible en campo (arete, código interno o nombre propio).
                  </p>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      name="sexo"
                      value={form.sexo}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="M">Macho</option>
                      <option value="H">Hembra</option>
                    </select>
                  </div>
                </div>

                {/* Fecha Nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="peso"
                      value={form.peso}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Ej: 350.5"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Opcional - Puede agregarlo más tarde
                  </p>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación dentro de la finca
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Ej: Potrero A, Corral 3, etc."
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Opcional - Indique el área o sección
                  </p>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> Los campos marcados con (*) son obligatorios. 
                  Podrás editar toda esta información más adelante desde el detalle del animal.
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
                             bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                             transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Animal</span>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Nota inferior */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              El animal será agregado al inventario de <strong>{selectedFinca?.nombre || "la finca"}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
