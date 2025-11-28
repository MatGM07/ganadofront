import React, { useEffect, useState } from "react";
import { Hash, Calendar, Weight, PawPrint, MapPin } from "lucide-react";
import Header from "../../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPut, apiPost } from "../../api/api";

export default function AnimalEdit() {
  const { id } = useParams(); // ID del animal desde la ruta
  const {fincaid} = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [animalOriginal, setAnimalOriginal] = useState(null);

  const [form, setForm] = useState({
    fincaId: "",
    especie: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    identificador: "",
    peso: "",
    ubicacion: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -------- Cargar datos del animal -------- //
  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(`/api/inventory/animales/${id}`);

        console.log(data);
        // Guardar los datos originales para comparar cambios
        setAnimalOriginal(data);

        // Formatear la fecha para el input type="date"
        const fechaFormateada = data.fechaNacimiento 
          ? new Date(data.fechaNacimiento).toISOString().split('T')[0]
          : "";

        setForm({
          fincaId: data.fincaId || "",
          especie: data.especie || "",
          raza: data.raza || "",
          sexo: data.sexo || "",
          fechaNacimiento: fechaFormateada,
          identificador: data.identificador || "",
          peso: data.peso || "",
          ubicacion: data.ubicacion || ""
        });
      } catch (err) {
        console.error("Error cargando animal:", err);
        setError(err.message || "Error cargando los datos del animal.");
        
        // Redirigir si no autorizado
        if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnimal();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------- Validaciones básicas -------- //
  const validar = () => {
    if (!form.especie || !form.raza || !form.sexo || !form.fechaNacimiento) {
      return "Los campos obligatorios no pueden estar vacíos.";
    }

    if (form.peso && Number(form.peso) < 0) {
      return "El peso no puede ser negativo.";
    }

    // Validar que la fecha no sea futura
    const fechaNac = new Date(form.fechaNacimiento);
    const hoy = new Date();
    if (fechaNac > hoy) {
      return "La fecha de nacimiento no puede ser futura.";
    }

    return null;
  };

  // -------- Función para detectar cambios y crear descripción -------- //
  const detectarCambios = () => {
    const cambios = [];

    if (animalOriginal.especie !== form.especie) {
      cambios.push(`Especie cambiada de "${animalOriginal.especie}" a "${form.especie}"`);
    }
    if (animalOriginal.raza !== form.raza) {
      cambios.push(`Raza cambiada de "${animalOriginal.raza}" a "${form.raza}"`);
    }
    if (animalOriginal.sexo !== form.sexo) {
      cambios.push(`Sexo cambiado de "${animalOriginal.sexo}" a "${form.sexo}"`);
    }
    
    const fechaOriginal = animalOriginal.fechaNacimiento 
      ? new Date(animalOriginal.fechaNacimiento).toISOString().split('T')[0]
      : "";
    if (fechaOriginal !== form.fechaNacimiento) {
      cambios.push(`Fecha de nacimiento actualizada`);
    }
    
    if (animalOriginal.identificador !== form.identificador) {
      cambios.push(`Identificador cambiado de "${animalOriginal.identificador || 'Sin identificador'}" a "${form.identificador}"`);
    }
    if (String(animalOriginal.peso || "") !== String(form.peso)) {
      cambios.push(`Peso actualizado a ${form.peso} kg`);
    }
    if (animalOriginal.ubicacion !== form.ubicacion) {
      cambios.push(`Ubicación cambiada a "${form.ubicacion}"`);
    }

    return cambios;
  };

  // -------- Registrar cambios en el historial -------- //
  const registrarEnHistorial = async (cambios) => {
    if (cambios.length === 0) return;

    try {
      const descripcion = `Información actualizada: ${cambios.join(", ")}`;
      
      await apiPost("/api/inventory/animales/historias", {
        animalId: id,
        descripcion: descripcion,
        fechaCreacion: new Date().toISOString(),
      });

      console.log("Cambios registrados en historial:", descripcion);
    } catch (err) {
      console.error("Error registrando en historial:", err);
      // No bloqueamos la operación si falla el historial
    }
  };

  // -------- Guardar Cambios -------- //
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

      // Detectar cambios antes de guardar
      const cambios = detectarCambios();

      // Preparar el DTO para enviar
      const animalDTO = {
        fincaId: form.fincaId,
        especie: form.especie,
        raza: form.raza,
        sexo: form.sexo,
        fechaNacimiento: form.fechaNacimiento,
        identificador: form.identificador,
        peso: form.peso ? parseFloat(form.peso) : null,
        ubicacion: form.ubicacion
      };

      // Actualizar el animal
      const animalActualizado = await apiPut(`/api/inventory/animales/${id}`, animalDTO);

      // Registrar los cambios en el historial
      await registrarEnHistorial(cambios);

      setSuccess("Información actualizada correctamente.");
      setAnimalOriginal(animalActualizado); // Actualizar datos originales

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate(`/${fincaid}/inventario/${id}`); // o la ruta que prefieras
      }, 1500);

    } catch (err) {
      console.error("Error actualizando animal:", err);
      setError(err.message || "No se pudo actualizar el animal.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos del animal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">

            {/* Título */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <PawPrint className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Editar Animal
              </h2>
              <p className="mt-2 text-gray-600">
                Actualiza la información del registro
              </p>
            </div>

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
                {/* Especie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especie *
                  </label>
                  <select
                    name="especie"
                    value={form.especie}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Bovino">Bovino</option>
                    <option value="Porcino">Porcino</option>
                    <option value="Ave de corral">Ave de corral</option>
                    <option value="Equino">Equino</option>
                    <option value="Caprino">Caprino</option>
                    <option value="Ovino">Ovino</option>
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
                    value={form.raza}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Holstein, Angus..."
                    required
                  />
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo *
                  </label>
                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="M">Macho</option>
                    <option value="H">Hembra</option>
                  </select>
                </div>

                {/* Fecha de nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Identificador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Identificador
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="identificador"
                      value={form.identificador}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: A-001, BOV-123..."
                    />
                  </div>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="peso"
                      value={form.peso}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: 450.5"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Potrero 1, Corral A..."
                    />
                  </div>
                </div>

              </div>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <p>Los cambios se registrarán automáticamente en el historial del animal</p>
          </div>
        </div>
      </div>
    </div>
  );
}