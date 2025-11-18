import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";

export default function AnimalDetail() {
  const { id } = useParams(); // ID del animal desde la URL

  const [animal, setAnimal] = useState(null);
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/animales/${id}`);

        if (!res.ok) {
          throw new Error("Error al cargar el animal");
        }

        const data = await res.json();
        setAnimal(data);
      } catch (err) {
        console.error("Error cargando animal", err);
        setAnimal(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando animal...</p>
      </div>
    );

  if (!animal)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">No se encontró el animal</p>
      </div>
    );

  const tabs = [
    { id: "general", label: "Información general" },
    { id: "sanidad", label: "Sanidad" },
    { id: "reproduccion", label: "Reproducción" },
    { id: "documentos", label: "Documentos" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Encabezado */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl shadow-lg text-white font-bold text-xl">
              {animal.especie?.charAt(0) || "A"}
            </div>

            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {animal.identificacion || "Animal sin identificación"}
              </h2>

              <span
                className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${
                  animal.activo
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {animal.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <p className="mt-4 text-gray-600">
            {animal.especie} • {animal.raza} • Sexo:{" "}
            {animal.sexo === "M" ? "Macho" : "Hembra"}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-lg rounded-2xl">
          <div className="border-b flex overflow-x-auto">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                  tab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de pestaña */}
          <div className="p-6">
            {/* Información General */}
            {tab === "general" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información general</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p><strong>Especie:</strong> {animal.especie}</p>
                  <p><strong>Raza:</strong> {animal.raza}</p>
                  <p><strong>Peso:</strong> {animal.peso || "No registrado"}</p>
                  <p><strong>Fecha nacimiento:</strong> {animal.fechaNacimiento}</p>
                  <p><strong>Edad:</strong> {animal.edad || "No calculada"}</p>
                  <p><strong>Ubicación:</strong> {animal.ubicacion || "No definida"}</p>
                  <p><strong>Estado:</strong> {animal.activo ? "Activo" : "Inactivo"}</p>
                </div>
              </div>
            )}

            {/* Sanidad */}
            {tab === "sanidad" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Historial sanitario</h3>
                <p className="text-gray-500">Aquí se mostrarán vacunas, tratamientos y controles.</p>
              </div>
            )}

            {/* Reproducción */}
            {tab === "reproduccion" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Información reproductiva</h3>
                <p className="text-gray-500">Montas, partos, ciclos reproductivos…</p>
              </div>
            )}

            {/* Documentos */}
            {tab === "documentos" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Documentos</h3>
                <p className="text-gray-500">Certificados, registros y archivos del animal.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Información completa del animal
        </p>
      </div>
    </div>
  );
}
