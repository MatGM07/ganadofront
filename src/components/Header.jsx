import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Beef, Heart, Package, BarChart3, Settings, User, LogOut } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const navItems = [
    { name: 'Inventario', icon: Package, path: '/inventario' },
    { name: 'Reproducción', icon: Heart, path: '/reproduccion' },
    { name: 'Sanidad', icon: Beef, path: '/sanidad' },
    { name: 'Reportes', icon: BarChart3, path: '/reportes' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-lg">
              <Beef className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Ganado360
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3">

            {!isLoggedIn ? (
              <a
                href="/login"
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
              >
                <User className="w-5 h-5" />
                <span>Iniciar sesión</span>
              </a>
            ) : (
              <>
                <span className="text-gray-600 font-medium">
                  Sesión iniciada
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </>
            )}

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="space-y-1">

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">

                {!isLoggedIn ? (
                  <a
                    href="/login"
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>Iniciar sesión</span>
                  </a>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                  </button>
                )}

              </div>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
