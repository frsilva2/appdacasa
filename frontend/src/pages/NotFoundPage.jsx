import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <AlertCircle className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Voltar para o início
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
