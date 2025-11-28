import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Baby, Calendar, Scale, FileText, Hash, ArrowLeft, PawPrint } from "lucide-react";
import { apiGet, apiPost, apiPut } from "../../api/api";

export default function NacimientoRegister() {
  const { fincaid, idMadre } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [montas, setMontas] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [montaSeleccionada, setMontaSeleccionada] = useState(null);

  // Formulario de nacimiento
  const [form, setForm] = useState({
    idMonta: "",
    idMadre: idMadre || "",
    fecha: "",
    observaciones: ""
  });

  // Formulario del animal (hijo)
  const [animalForm, setAnimalForm] = useState({
    especie: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    peso: "",
    ubicacion: "",
    identificador: "",
    fincaId: fincaid,
    estado: "ACTIVO"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const especies = [
    "Bovino",
    "Porcino",
    "Ave de corral",
    "Ovino",
    "Caprino",
    "Equino"
  ];

  // Cargar montas y animales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Obtener montas activas (estado != FINALIZADA) filtradas por la madre de la URL
        const montasData = await apiGet("/api/reproduccion/montas");
        const montasActivas = montasData.filter(m => 
          m.estado !== "FINALIZADA" && m.idHembra === idMadre
        );
        setMontas(montasActivas);

        // Obtener animales hembras de la finca
        const animalesData = await apiGet("/api/inventory/animales");
        const hembras = animalesData.filter(a => 
          a.fincaId === fincaid && a.sexo === "H" && a.estado === "ACTIVO"
        );
        setAnimales(hembras);

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar las montas y animales");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [fincaid, idMadre]);

  // Cuando se selecciona una monta, autocompletar la madre
  useEffect(() => {
    if (form.idMonta) {
      const monta = montas.find(m => m.id === form.idMonta);
      if (monta) {
        setMontaSeleccionada(monta);
        setForm(prev => ({ ...prev, idMadre: monta.idHembra }));
      }
    }
  }, [form.idMonta, montas]);

  // Sincronizar fechaNacimiento y fecha
  useEffect(() => {
    if (animalForm.fechaNacimiento) {
      setForm(prev => ({ ...prev, fecha: animalForm.fechaNacimiento }));
    }
  }, [animalForm.fechaNacimiento]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAnimalChange = (e) => {
    setAnimalForm({ ...animalForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
    if (!form.idMonta || !form.idMadre || !animalForm.fechaNacimiento) {
      setError("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (!animalForm.especie || !animalForm.raza || !animalForm.sexo) {
      setError("Complete los datos del animal recién nacido.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear el animal (hijo)
      const animalData = {
        ...animalForm,
        peso: animalForm.peso ? parseFloat(animalForm.peso) : null
      };
      const animalCreado = await apiPost("/api/inventory/animales", animalData);
      const idAnimal = animalCreado.id;

      // 2. Crear el registro de nacimiento
      const nacimientoData = {
        idMonta: form.idMonta,
        idMadre: form.idMadre,
        idAnimal: idAnimal,
        fecha: animalForm.fechaNacimiento,
        sexo: animalForm.sexo,
        peso: animalForm.peso ? parseFloat(animalForm.peso) : null,
        observaciones: form.observaciones || null
      };
      await apiPost("/api/reproduccion/nacimientos", nacimientoData);

      // 3. Actualizar estado de la monta a "FINALIZADA"
      await apiPut(`/api/reproduccion/montas/${form.idMonta}`, {
        ...montaSeleccionada,
        estado: "FINALIZADA"
      });

      // 4. Crear registro de genealogía
      const genealogiaData = {
        madre: form.idMadre,
        padre: montaSeleccionada?.idMacho || null, // Puede ser opcional
        hijo: idAnimal
      };
      await apiPost("/api/reproduccion/genealogias", genealogiaData);

      setSuccess("¡Nacimiento registrado correctamente!");

      // Limpiar formularios
      setForm({
        idMonta: "",
        idMadre: "",
        fecha: "",
        observaciones: ""
      });
      setAnimalForm({
        especie: "",
        raza: "",
        sexo: "",
        fechaNacimiento: "",
        peso: "",
        ubicacion: "",
        identificador: "",
        fincaId: fincaid,
        estado: "ACTIVO"
      });
      setMontaSeleccionada(null);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/reproduccion`);
      }, 2000);

    } catch (err) {
      console.error("Error al registrar nacimiento:", err);
      setError(err.message || "Error al registrar el nacimiento. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    navigate(`/${fincaid}/reproduccion`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
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
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Baby className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
                    Registrar Nacimiento
                  </h2>
                  <p className="text-sm text-gray-600">
                    Complete los datos del nuevo animal
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
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sección: Datos de Reproducción */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Datos de Reproducción
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monta *
                    </label>
                    <select
                      name="idMonta"
                      value={form.idMonta}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione una monta</option>
                      {montas.map((monta) => (
                        <option key={monta.id} value={monta.id}>
                          Monta {monta.fecha} - {monta.metodoUtilizado || "Sin método"}
                        </option>
                      ))}
                    </select>
                    {montas.length === 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        No hay montas activas disponibles
                      </p>
                    )}
                  </div>

                  {/* Madre (autocompletado) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Madre *
                    </label>
                    <select
                      name="idMadre"
                      value={form.idMadre}
                      onChange={handleFormChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-gray-100 cursor-not-allowed"
                      disabled
                      required
                    >
                      <option value="">Seleccione monta primero</option>
                      {animales.map((animal) => (
                        <option key={animal.id} value={animal.id}>
                          {animal.identificador || animal.id.substring(0, 8)} - {animal.raza}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Se completa automáticamente al seleccionar la monta
                    </p>
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones del Nacimiento
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="observaciones"
                      value={form.observaciones}
                      onChange={handleFormChange}
                      rows="3"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Ej: Parto sin complicaciones, animal saludable..."
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Datos del Animal Recién Nacido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-pink-600" />
                  Datos del Animal Recién Nacido
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Especie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especie *
                    </label>
                    <select
                      name="especie"
                      value={animalForm.especie}
                      onChange={handleAnimalChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white cursor-pointer"
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

                  {/* Raza */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raza *
                    </label>
                    <input
                      type="text"
                      name="raza"
                      value={animalForm.raza}
                      onChange={handleAnimalChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Ej: Brahman, Holstein..."
                      required
                    />
                  </div>

                  {/* Identificador */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identificador (Arete / Nombre)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="identificador"
                        value={animalForm.identificador}
                        onChange={handleAnimalChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                  focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        placeholder="Ej: A-201, Manchitas..."
                      />
                    </div>
                  </div>

                  {/* Sexo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sexo *
                    </label>
                    <select
                      name="sexo"
                      value={animalForm.sexo}
                      onChange={handleAnimalChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none bg-white cursor-pointer"
                      required
                    >
                      <option value="">Seleccione</option>
                      <option value="M">Macho</option>
                      <option value="H">Hembra</option>
                    </select>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="fechaNacimiento"
                        value={animalForm.fechaNacimiento}
                        onChange={handleAnimalChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                  focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso al Nacer (kg)
                    </label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="peso"
                        value={animalForm.peso}
                        onChange={handleAnimalChange}
                        step="0.1"
                        min="0"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                                  focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                        placeholder="Ej: 35.5"
                      />
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación dentro de la finca
                    </label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={animalForm.ubicacion}
                      onChange={handleAnimalChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg
                                focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                      placeholder="Ej: Corral de maternidad, Potrero B..."
                    />
                  </div>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Importante:</strong> Al registrar este nacimiento se creará automáticamente:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-600 list-disc list-inside">
                  <li>El registro del animal en el inventario</li>
                  <li>El vínculo genealógico con madre y padre (si aplica)</li>
                  <li>La monta quedará marcada como "FINALIZADA"</li>
                </ul>
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
                            bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 
                            transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Nacimiento</span>
                  )}
                </button>
              </div>
            </form>

          </div>

          {/* Nota inferior */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              El animal será agregado al inventario y se registrará su genealogía automáticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}