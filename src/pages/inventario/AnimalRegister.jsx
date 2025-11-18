import React, { useState } from "react";
import { PawPrint, Hash, Calendar, Scale, BadgeCheck } from "lucide-react";
import Header from "../../components/Header";

export default function AnimalRegister() {
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

    try {
      const response = await fetch("http://localhost:8080/api/animales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.status === 409) {
        setError("La identificación ingresada ya existe.");
        return;
      }

      if (!response.ok) {
        setError("Error al registrar el animal.");
        return;
      }

      setSuccess("Animal registrado correctamente.");
      setForm({
        especie: "",
        raza: "",
        sexo: "",
        fechaNacimiento: "",
        identificacion: "",
        peso: "",
      });
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            
            {/* Título con icono */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <PawPrint className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Registrar Animal
              </h2>

              <p className="mt-2 text-gray-600">
                Ingresa los datos básicos del animal
              </p>
            </div>

            {/* Errores y éxito */}
            {error && (
              <p className="bg-red-100 text-red-700 p-2 rounded-lg text-sm text-center">
                {error}
              </p>
            )}
            {success && (
              <p className="bg-green-100 text-green-700 p-2 rounded-lg text-sm text-center">
                {success}
              </p>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Especie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especie *
                </label>
                <div className="relative">
                  <PawPrint className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="especie"
                    value={form.especie}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ej: Bovino"
                    required
                  />
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
                               focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ej: Brahman"
                    required
                  />
                </div>
              </div>

              {/* Sexo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                  <select
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación (opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="identificacion"
                    value={form.identificacion}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ej: 001-A23"
                  />
                </div>
              </div>

              {/* Peso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg) (opcional)
                </label>
                <div className="relative">
                  <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="peso"
                    value={form.peso}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ej: 350"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg shadow-md text-white 
                             bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                             transition-all duration-200 font-medium text-lg"
                >
                  Registrar Animal
                </button>

                <button
                  onClick={() => window.history.back()}
                  type="button"
                  className="w-full py-3 px-4 rounded-lg shadow-sm text-gray-700 bg-white 
                             border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>

          {/* Nota inferior */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Los datos del animal se pueden editar más adelante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
