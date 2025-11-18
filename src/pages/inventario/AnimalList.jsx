import React, { useEffect, useState } from "react";
import Header from "../../components/Header";

export default function AnimalList() {
  const [animales, setAnimales] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    sexo: "",
    raza: "",
    ubicacion: "",
    edad: "",
    estadoSanitario: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/animales/activos");
        const data = await res.json();
        setAnimales(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error cargando animales", err);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    let result = [...animales];

    // búsqueda por ID o nombre
    if (search.trim() !== "") {
      result = result.filter(
        (a) =>
          a.identificacion?.toLowerCase().includes(search.toLowerCase()) ||
          a.nombre?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // filtros individuales
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        result = result.filter((a) => String(a[key]) === value);
      }
    });

    setFiltered(result);
  }, [search, filters, animales]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ENCABEZADO */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Inventario de Animales
          </h2>

          <p className="text-gray-600 mt-2">
            Consulta general, filtros y acceso al detalle completo.
          </p>

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar por ID o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* FILTROS */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Filtros</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <select
              className="p-2 border rounded-xl"
              value={filters.sexo}
              onChange={(e) =>
                setFilters({ ...filters, sexo: e.target.value })
              }
            >
              <option value="">Sexo</option>
              <option value="M">Macho</option>
              <option value="H">Hembra</option>
            </select>

            <input
              type="text"
              className="p-2 border rounded-xl"
              placeholder="Raza"
              value={filters.raza}
              onChange={(e) =>
                setFilters({ ...filters, raza: e.target.value })
              }
            />

            <input
              type="text"
              className="p-2 border rounded-xl"
              placeholder="Ubicación"
              value={filters.ubicacion}
              onChange={(e) =>
                setFilters({ ...filters, ubicacion: e.target.value })
              }
            />

            <input
              type="number"
              className="p-2 border rounded-xl"
              placeholder="Edad"
              value={filters.edad}
              onChange={(e) =>
                setFilters({ ...filters, edad: e.target.value })
              }
            />

            <input
              type="text"
              className="p-2 border rounded-xl"
              placeholder="Estado sanitario"
              value={filters.estadoSanitario}
              onChange={(e) =>
                setFilters({ ...filters, estadoSanitario: e.target.value })
              }
            />
          </div>
        </div>

        {/* LISTADO */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Animales activos</h3>

          {filtered.length === 0 && (
            <p className="text-gray-500 text-center py-10">
              No hay animales con los filtros seleccionados.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((a) => (
              <a
                key={a.id}
                href={`/inventario/${a.id}`}
                className="p-5 border rounded-2xl shadow hover:shadow-xl bg-white transition-all cursor-pointer"
              >
                <h4 className="text-xl font-semibold text-blue-700">
                  {a.identificacion || "Sin ID"}
                </h4>

                <p className="text-gray-600 mt-1">
                  {a.raza} • {a.sexo === "M" ? "Macho" : "Hembra"}
                </p>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p><strong>Edad:</strong> {a.edad || "No registrada"}</p>
                  <p><strong>Peso:</strong> {a.peso || "No registrado"}</p>
                  <p><strong>Ubicación:</strong> {a.ubicacion || "No definida"}</p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {a.activo ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Listado general del inventario
        </p>
      </div>
    </div>
  );
}
