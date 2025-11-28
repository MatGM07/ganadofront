import React, { useState, useEffect } from "react";
import { PawPrint, Hash, Calendar, BadgeCheck } from "lucide-react";
import Header from "../../components/Header";
import { registrarGenealogia, obtenerAnimales } from "./reproduction.api";

export default function ReproductionGenealogy() {
  const [form, setForm] = useState({
    animalId: "",
    padreId: "",
    madreId: "",
    fechaRegistro: "",
  });

  const [animales, setAnimales] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await obtenerAnimales();
        setAnimales(res.data);
      } catch {
        setError("No se pudieron cargar los animales.");
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.animalId || !form.fechaRegistro) {
      setError("Por favor complete los campos obligatorios.");
      return;
    }

    try {
      const res = await registrarGenealogia(form);

      if (!res.ok) {
        setError("Error al registrar la genealogía.");
        return;
      }

      setSuccess("Genealogía registrada correctamente.");
      setForm({
        animalId: "",
        padreId: "",
        madreId: "",
        fechaRegistro: "",
      });
    } catch {
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
            {/* Título */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <PawPrint className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Registrar Genealogía
              </h2>

              <p className="mt-2 text-gray-600">
                Asigna padre y madre a un animal
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
              {/* Animal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal *
                </label>
                <div className="relative">
                  <PawPrint className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="animalId"
                    value={form.animalId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
                    required
                  >
                    <option value="">Seleccione un animal</option>
                    {animales.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.identificacion || `Animal ${a.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Padre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Padre (opcional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="padreId"
                    value={form.padreId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione</option>
                    {animales
                      .filter((a) => a.sexo === "M")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.identificacion || `Animal ${a.id}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Madre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Madre (opcional)
                </label>
                <div className="relative">
                  <BadgeCheck className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="madreId"
                    value={form.madreId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="">Seleccione</option>
                    {animales
                      .filter((a) => a.sexo === "H")
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.identificacion || `Animal ${a.id}`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Fecha registro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de registro *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="fechaRegistro"
                    value={form.fechaRegistro}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg shadow-md text-white 
                  bg-gradient-to-r from-green-600 to-green-700 
                  hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium text-lg"
                >
                  Registrar Genealogía
                </button>

                <button
                  onClick={() => window.history.back()}
                  type="button"
                  className="w-full py-3 px-4 rounded-lg shadow-sm text-gray-700 
                  bg-white border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          {/* Nota inferior */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Puedes actualizar la genealogía más adelante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
