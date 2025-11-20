import { Beef, Mail, Lock, KeyRound } from 'lucide-react';
import React, { useState } from 'react';
import { apiPost } from "../api/api";
import Header from '../components/Header';

function PasswordRecovery() {
  const [step, setStep] = useState(1); // 1: email, 2: código, 3: nueva contraseña
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const validatePassword = (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber
    };
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiPost("/api/users/reset-password", { email });
      console.log("codigo enviado:", res);
      setError("");      // limpiar errores previos
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiPost("/api/users/reset-password/confirm", { code });
      console.log("Código verificado:", res);
      setError("");
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        const parts = [];
        if (!passwordValidation.minLength) parts.push("al menos 8 caracteres");
        if (!passwordValidation.hasUpperCase) parts.push("una letra mayúscula");
        if (!passwordValidation.hasLowerCase) parts.push("una letra minúscula");
        if (!passwordValidation.hasNumber) parts.push("un número");

        setError("La contraseña debe tener " + parts.join(", "));
        return;
      }

    setLoading(true);

    try {
      const res = await apiPost("/api/users/reset-password/new", {
        email,
        password
      });

      console.log("Contraseña actualizada:", res);
      alert("Contraseña actualizada exitosamente");
      window.location.href = "/login";

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Header />
      
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Logo y título */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl shadow-lg">
                  <Beef className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {step === 1 && "Recuperar Contraseña"}
                {step === 2 && "Verificar Código"}
                {step === 3 && "Nueva Contraseña"}
              </h2>
              <p className="mt-2 text-gray-600">
                {step === 1 && "Ingresa tu correo electrónico para recibir el código"}
                {step === 2 && "Ingresa el código enviado a tu correo"}
                {step === 3 && "Crea tu nueva contraseña"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Paso 1: Solicitar Email */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Enviando..." : "Enviar Código"}</span>
                </button>
              </div>
            )}

            {/* Paso 2: Verificar Código */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 text-center">
                    Se ha enviado un código de verificación a <strong>{email}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Verificación
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-center text-lg tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCodeSubmit}
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Verificando..." : "Verificar Código"}</span>
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-green-600 hover:text-green-700 transition-colors"
                >
                  ← Volver a ingresar correo
                </button>
              </div>
            )}

            {/* Paso 3: Nueva Contraseña */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? "Actualizando..." : "Actualizar Contraseña"}</span>
                </button>
              </form>
            )}

            {/* Volver al login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                  Volver al inicio de sesión
                </a>
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Sistema de gestión integral para ganaderos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordRecovery;