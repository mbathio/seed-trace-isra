// frontend/src/layouts/AuthLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Leaf } from "lucide-react";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex items-center space-x-3 mb-8">
            <Leaf className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">ISRA Seeds</h1>
              <p className="text-green-100">
                Système de traçabilité des semences
              </p>
            </div>
          </div>
          <div className="max-w-lg text-center">
            <h2 className="text-2xl font-semibold mb-4">
              De la recherche au champ
            </h2>
            <p className="text-lg text-green-100">
              Suivez le parcours de vos semences depuis la production jusqu'à la
              distribution avec notre système de traçabilité avancé.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Leaf className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">ISRA Seeds</h1>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
