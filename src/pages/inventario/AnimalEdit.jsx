import React, { useEffect, useState } from "react";
import { Hash, Calendar, Weight, PawPrint } from "lucide-react";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";

export default function AnimalEdit() {
  const { id } = useParams(); // ID desde la ruta

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    especie: "",
    raza: "",
    sexo: "",
    fechaNacimiento: "",
    identificacion: "",
    peso: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -------- Cargar datos del animal -------- //
  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/animales/${id}`);
        if (!response.ok) throw new Error("No se pudo cargar el animal");
        const data = await response.json();

        setForm({
          especie: data.especie || "",
          raza: data.raza || "",
          sexo: data.sexo || "",
          fechaNacimiento: data.fechaNacimiento || "",
          identificacion: data.identificacion || "",
          peso: data.peso || "",
        });
      } catch (err) {
        setError("Error cargando los datos del animal.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

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

    return null;
  };

  // -------- Guardar Cambios -------- //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const valid = validar();
    if (valid) {
      setError(valid);
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`http://localhost:8080/api/animales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setError("Error al actualizar el animal.");
        return;
      }

      setSuccess("Información actualizada correctamente.");

    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

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
            {error && <p className="bg-red-100 text-red-700 p-2 rounded">{error}</p>}
            {success && (
              <p className="bg-green-100 text-green-700 p-2 rounded">{success}</p>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Especie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especie *
                </label>
                <input
                  type="text"
                  name="especie"
                  value={form.especie}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccione</option>
                  <option value="M">Macho</option>
                  <option value="H">Hembra</option>
                </select>
              </div>

              {/* Fecha */}
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
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="identificacion"
                    value={form.identificacion}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                    className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <button
                  disabled={saving}
                  className="w-full py-3 rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md font-medium disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Texto extra */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            Solo puedes editar animales asociados a tus fincas.
          </div>
        </div>
      </div>
    </div>
  );
}
