import React, { useState } from 'react';
import { Beef, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { apiPost, apiGet } from "../api/api";

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  const validateName = (name) => name.length >= 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateName(name)){
      setError('El nombre no es válido, debe tener al menos 5 caracteres');
      return;
    }

    // Validar email
    if (!validateEmail(email)) {
      setError('La dirección de correo electrónico no es válida');
      return;
    }

    // Validar contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      let errorMsg = 'La contraseña debe tener: ';
      const requirements = [];
      if (!passwordValidation.minLength) requirements.push('al menos 8 caracteres');
      if (!passwordValidation.hasUpperCase) requirements.push('una letra mayúscula');
      if (!passwordValidation.hasLowerCase) requirements.push('una letra minúscula');
      if (!passwordValidation.hasNumber) requirements.push('un número');
      
      setError(errorMsg + requirements.join(', '));
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      let emailData;

      try {
        emailData = await apiGet(`/api/users/checkemail?email=${email}`);
      } catch (err) {
        setError(err.message || "Error al verificar el correo");
        return;
      }

      if (emailData.exists) {
        setError("Este correo electrónico ya está registrado");
        return;
      }
    } catch (err) {
      setError(err.message ||"Error al verificar el correo" );
      return;
    }

    try {
      await apiPost("/api/users/register", {
        name,
        email,
        password
      });

      setSuccess(true);

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
    

    } catch (err) {
      setError(err.message || "Error registrando usuario");
    }
    
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header Simple */}
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
                Crear Cuenta
              </h2>
              <p className="mt-2 text-gray-600">
                Únete a Ganado360 hoy
              </p>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  ¡Registro exitoso! Tu cuenta ha sido creada correctamente.
                </p>
              </div>
            )}

            {/* Formulario */}
            <div className="space-y-6">
              {/* Campo Email */}
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
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    placeholder="Crea una contraseña segura"
                  />
                </div>
                
                {/* Indicadores de validación de contraseña */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.minLength ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={passwordValidation.minLength ? 'text-green-700' : 'text-gray-500'}>
                        Al menos 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={passwordValidation.hasUpperCase ? 'text-green-700' : 'text-gray-500'}>
                        Una letra mayúscula
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={passwordValidation.hasLowerCase ? 'text-green-700' : 'text-gray-500'}>
                        Una letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${passwordValidation.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={passwordValidation.hasNumber ? 'text-green-700' : 'text-gray-500'}>
                        Un número
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
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
                    placeholder="Confirma tu contraseña"
                  />
                </div>
              </div>

              {/* Botón de envío */}
              <button
                onClick={handleSubmit}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium text-lg"
              >
                <span>Crear Cuenta</span>
              </button>
            </div>

            {/* Login link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <a href="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                  Inicia sesión aquí
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