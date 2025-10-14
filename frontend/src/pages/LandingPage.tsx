// ===== 6. frontend/src/pages/LandingPage.tsx (CORRIGÉ) =====

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf,
  Shield,
  BarChart3,
  QrCode,
  Users,
  MapPin,
  FileText,
  ArrowRight,
  CheckCircle,
  LogIn,
  Sprout,
  FlaskConical,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ISRA Saint-Louis</h1>
                <p className="text-green-100 text-sm">
                  Institut Sénégalais de Recherches Agricoles
                </p>
              </div>
            </div>
            <Button
              onClick={handleLoginRedirect}
              className="bg-white text-green-600 hover:bg-green-50 flex items-center"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Système de Traçabilité des Semences
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              La solution numérique de l'ISRA Saint-Louis pour assurer la
              traçabilité et la qualité des semences au Sénégal. De la recherche
              au champ, suivez chaque étape de vos semences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleLoginRedirect}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Accéder au système
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 text-lg"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                En savoir plus
              </Button>
            </div>

            {/* Demo access notice */}
            <div className="mt-8 p-4 bg-green-500/20 rounded-lg border border-green-400/30">
              <p className="text-green-100 text-sm">
                <strong>Accès de démonstration :</strong> Utilisez les comptes
                de test disponibles sur la page de connexion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Une solution éprouvée
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              L'ISRA Saint-Louis utilise ce système pour gérer efficacement sa
              production de semences
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600">Lots de semences</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-600">Stations</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FlaskConical className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <p className="text-gray-600">Taux de qualité</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                200+
              </div>
              <p className="text-gray-600">Hectares gérés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi un système de traçabilité ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              L'ISRA Saint-Louis met à disposition des établissements du secteur
              producteur des semences de recherche et R1, R2, essentielles pour
              la filière semencière nationale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-700">Suivi Précis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Traçabilité complète des lots de semences de la production à
                  la distribution, assurant une meilleure qualité
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-amber-700">
                  Qualité Garantie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Contrôles qualité à chaque étape pour assurer la conformité et
                  la performance des semences distribuées
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-700">Données Fiables</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Statistiques et rapports détaillés pour optimiser les
                  processus de production et de distribution
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités du Système
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pour le suivi des semences à tous les stades
              de la chaîne de production
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Leaf className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Enregistrement des Lots
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Création et suivi des lots de semences avec génération
                  automatique d'identifiants uniques et QR codes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <QrCode className="h-6 w-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Codes QR</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Génération de QR codes pour chaque lot permettant un accès
                  rapide aux informations et à l'historique
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Généalogie des Semences
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualisation claire des relations parent-enfant entre les
                  différentes générations de semences
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Contrôle Qualité</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Enregistrement des tests de qualité avec suivi des taux de
                  germination et de pureté variétale
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Gestion des Parcelles
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Suivi des parcelles de production avec leurs caractéristiques
                  et historique d'utilisation
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">
                    Rapports et Statistiques
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Génération de rapports détaillés sur la production et la
                  distribution des semences
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Avantages pour l'écosystème agricole
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <ul className="space-y-6">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Transparence totale
                      </h3>
                      <p className="text-gray-600">
                        Traçabilité complète de la semence depuis sa création
                        jusqu'à sa distribution
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Amélioration de la qualité
                      </h3>
                      <p className="text-gray-600">
                        Contrôles systématiques et documentation des
                        performances
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Optimisation des ressources
                      </h3>
                      <p className="text-gray-600">
                        Meilleure planification et gestion des stocks de
                        semences
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Sécurité alimentaire
                      </h3>
                      <p className="text-gray-600">
                        Contribution à la sécurité alimentaire nationale par des
                        semences de qualité
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-2xl p-8">
                  <Leaf className="h-24 w-24 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    ISRA Saint-Louis
                  </h3>
                  <p className="text-green-700">
                    Au service de l'agriculture sénégalaise depuis plus de 50
                    ans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Rejoignez le système de traçabilité des semences de l'ISRA
            Saint-Louis et contribuez à l'amélioration de la filière semencière
            sénégalaise
          </p>
          <Button
            onClick={handleLoginRedirect}
            size="lg"
            className="bg-white text-green-600 hover:bg-green-50 px-8 py-3 text-lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Accéder au système
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Leaf className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-xl font-bold">ISRA Saint-Louis</h3>
                <p className="text-gray-400">
                  Système de Traçabilité des Semences
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © 2025 Institut Sénégalais de Recherches Agricoles
              </p>
              <p className="text-gray-400">Saint-Louis, Sénégal</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
