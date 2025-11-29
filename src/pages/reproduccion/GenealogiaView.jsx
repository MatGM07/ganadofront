import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, User, Heart, Baby } from "lucide-react";
import Header from "../../components/Header";
import { apiGet } from "../../api/api";

export default function GenealogiaView() {
  const { fincaid, animalId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [arbolGenealogico, setArbolGenealogico] = useState(null);
  const [animalCentral, setAnimalCentral] = useState(null);

  useEffect(() => {
    const construirArbol = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Obtener información del animal central
        const animal = await apiGet(`/api/inventory/animales/${animalId}`);
        setAnimalCentral(animal);

        // 2. Obtener todas las genealogías para construir el árbol completo
        const todasGenealogias = await apiGet("/api/reproduccion/genealogias");
        
        // 3. Obtener todos los animales para tener sus datos
        const todosAnimales = await apiGet("/api/inventory/animales");
        const animalesMap = {};
        todosAnimales.forEach(a => {
          animalesMap[a.id] = a;
        });

        // 4. Construir el árbol genealógico
        const arbol = {
          central: animal,
          // Padres del animal central
          madre: null,
          padre: null,
          // Abuelos maternos
          abuelaMat: null,
          abueloMat: null,
          // Abuelos paternos
          abuelaPat: null,
          abueloPat: null,
          // Hijos del animal central
          hijos: []
        };

        // Buscar genealogía del animal central (sus padres)
        const genealogiaCentral = todasGenealogias.find(g => g.hijo === animalId);
        
        if (genealogiaCentral) {
          // Asignar madre
          if (genealogiaCentral.madre) {
            arbol.madre = animalesMap[genealogiaCentral.madre];
            
            // Buscar abuelos maternos
            const genealogiaMadre = todasGenealogias.find(g => g.hijo === genealogiaCentral.madre);
            if (genealogiaMadre) {
              arbol.abuelaMat = genealogiaMadre.madre ? animalesMap[genealogiaMadre.madre] : null;
              arbol.abueloMat = genealogiaMadre.padre ? animalesMap[genealogiaMadre.padre] : null;
            }
          }

          // Asignar padre
          if (genealogiaCentral.padre) {
            arbol.padre = animalesMap[genealogiaCentral.padre];
            
            // Buscar abuelos paternos
            const genealogiaPadre = todasGenealogias.find(g => g.hijo === genealogiaCentral.padre);
            if (genealogiaPadre) {
              arbol.abuelaPat = genealogiaPadre.madre ? animalesMap[genealogiaPadre.madre] : null;
              arbol.abueloPat = genealogiaPadre.padre ? animalesMap[genealogiaPadre.padre] : null;
            }
          }
        }

        // Buscar hijos (donde el animal central es madre o padre)
        const hijos = todasGenealogias
          .filter(g => g.madre === animalId || g.padre === animalId)
          .map(g => animalesMap[g.hijo])
          .filter(Boolean);
        
        arbol.hijos = hijos;

        setArbolGenealogico(arbol);

      } catch (err) {
        console.error("Error construyendo árbol genealógico:", err);
        setError(err.message || "Error cargando la genealogía del animal");
      } finally {
        setLoading(false);
      }
    };

    if (animalId && fincaid) {
      construirArbol();
    }
  }, [animalId, fincaid]);

  const AnimalCard = ({ animal, label, color = "gray", size = "md" }) => {
    if (!animal) {
      return (
        <div className={`${
          size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
        } bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-center`}>
          <p className="text-gray-400 text-sm">Sin información</p>
          {label && <p className="text-xs text-gray-400 mt-1">{label}</p>}
        </div>
      );
    }

    const getSexIcon = (sexo) => {
      if (sexo === "M") return "♂";
      if (sexo === "H") return "♀";
      return "?";
    };

    const getSexColor = (sexo) => {
      if (sexo === "M") return "text-blue-600";
      if (sexo === "H") return "text-pink-600";
      return "text-gray-600";
    };

    const cardColors = {
      pink: "from-pink-500 to-pink-600 border-pink-300",
      blue: "from-blue-500 to-blue-600 border-blue-300",
      purple: "from-purple-500 to-purple-600 border-purple-300",
      green: "from-green-500 to-green-600 border-green-300",
      gray: "from-gray-500 to-gray-600 border-gray-300"
    };

    return (
      <div className={`${
        size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
      } bg-white border-2 ${cardColors[color] ? `border-${color}-300` : 'border-gray-300'} rounded-xl shadow-md hover:shadow-lg transition-all`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-2xl font-bold ${getSexColor(animal.sexo)}`}>
            {getSexIcon(animal.sexo)}
          </span>
          {label && (
            <span className="text-xs font-semibold text-gray-500 uppercase">
              {label}
            </span>
          )}
        </div>
        <p className={`${size === "lg" ? "text-lg" : "text-sm"} font-bold text-gray-800 truncate`}>
          {animal.identificador || animal.id}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {animal.especie} - {animal.raza || "Sin raza"}
        </p>
        {animal.fechaNacimiento && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(animal.fechaNacimiento).getFullYear()}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Construyendo árbol genealógico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    Árbol Genealógico
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {animalCentral?.identificador || animalCentral?.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ÁRBOL GENEALÓGICO */}
        <div className="bg-white rounded-2xl shadow-xl p-8 overflow-x-auto">
          
          {/* GENERACIÓN ABUELOS */}
          <div className="mb-8">
            <h3 className="text-center text-sm font-semibold text-gray-500 uppercase mb-4">
              Abuelos
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Abuelos Maternos */}
              <AnimalCard 
                animal={arbolGenealogico?.abuelaMat} 
                label="Abuela Mat." 
                color="purple"
                size="sm"
              />
              <AnimalCard 
                animal={arbolGenealogico?.abueloMat} 
                label="Abuelo Mat." 
                color="purple"
                size="sm"
              />
              
              {/* Abuelos Paternos */}
              <AnimalCard 
                animal={arbolGenealogico?.abuelaPat} 
                label="Abuela Pat." 
                color="blue"
                size="sm"
              />
              <AnimalCard 
                animal={arbolGenealogico?.abueloPat} 
                label="Abuelo Pat." 
                color="blue"
                size="sm"
              />
            </div>
          </div>

          {/* LÍNEAS VISUALES HACIA PADRES */}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-2 gap-8">
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-purple-300"></div>
                </div>
                <div className="flex justify-center">
                  <div className="h-8 w-0.5 bg-blue-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* GENERACIÓN PADRES */}
          <div className="mb-8">
            <h3 className="text-center text-sm font-semibold text-gray-500 uppercase mb-4">
              Padres
            </h3>
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              <AnimalCard 
                animal={arbolGenealogico?.madre} 
                label="Madre" 
                color="pink"
              />
              <AnimalCard 
                animal={arbolGenealogico?.padre} 
                label="Padre" 
                color="blue"
              />
            </div>
          </div>

          {/* LÍNEA VISUAL HACIA ANIMAL CENTRAL */}
          <div className="flex justify-center mb-4">
            <div className="h-8 w-0.5 bg-green-300"></div>
          </div>

          {/* ANIMAL CENTRAL */}
          <div className="mb-8">
            <h3 className="text-center text-sm font-semibold text-green-600 uppercase mb-4 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              Animal Seleccionado
            </h3>
            <div className="max-w-md mx-auto">
              <AnimalCard 
                animal={arbolGenealogico?.central} 
                color="green"
                size="lg"
              />
            </div>
          </div>

          {/* LÍNEA VISUAL HACIA HIJOS */}
          {arbolGenealogico?.hijos && arbolGenealogico.hijos.length > 0 && (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-8 w-0.5 bg-purple-300"></div>
              </div>

              {/* GENERACIÓN HIJOS */}
              <div>
                <h3 className="text-center text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center justify-center gap-2">
                  <Baby className="w-4 h-4" />
                  Descendientes ({arbolGenealogico.hijos.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                  {arbolGenealogico.hijos.map((hijo) => (
                    <AnimalCard 
                      key={hijo.id}
                      animal={hijo} 
                      label="Hijo/a" 
                      color="purple"
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MENSAJE SI NO HAY HIJOS */}
          {(!arbolGenealogico?.hijos || arbolGenealogico.hijos.length === 0) && (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Baby className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                Este animal aún no tiene descendientes registrados
              </p>
            </div>
          )}
        </div>

        {/* LEYENDA */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leyenda</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className="text-gray-700">Línea Materna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700">Línea Paterna</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-700">Animal Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-gray-700">Descendientes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-pink-600">♀</span>
              <span className="text-gray-700">Hembra</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl text-blue-600">♂</span>
              <span className="text-gray-700">Macho</span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Árbol genealógico completo del animal
        </p>
      </div>
    </div>
  );
}