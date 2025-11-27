import React, { useState } from 'react';
import Layout from '../../components/Layout';
import CoresGrid from '../../components/cores/CoresGrid';
import { Palette, Download, FileText } from 'lucide-react';

/**
 * Página de Catálogo de Cores
 * Exibe todas as cores aprovadas com fotos e informações
 */
const CoresPage = () => {
  const [corSelecionada, setCorSelecionada] = useState(null);

  const handleExportarCSV = () => {
    // TODO: Implementar exportação para CSV
    alert('Exportação para CSV em desenvolvimento');
  };

  const handleExportarJSON = () => {
    // TODO: Implementar exportação para JSON
    alert('Exportação para JSON em desenvolvimento');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="w-8 h-8 text-primary" />
              Catálogo de Cores
            </h1>
            <p className="text-gray-600 mt-2">
              46 cores aprovadas com fotos e códigos hexadecimais
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              onClick={handleExportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="hidden md:inline">Exportar CSV</span>
            </button>

            <button
              onClick={handleExportarJSON}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden md:inline">Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* Informações da Cor Selecionada */}
        {corSelecionada && (
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-lg shadow-xl border-4 border-white"
                style={{ backgroundColor: corSelecionada.hex }}
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {corSelecionada.nome_cor}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100">Código Hex</p>
                    <p className="font-mono font-semibold">{corSelecionada.hex}</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Código Cor</p>
                    <p className="font-mono font-semibold">{corSelecionada.codigo_cor}</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Pantone</p>
                    <p className="font-mono font-semibold">{corSelecionada.pantone}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCorSelecionada(null)}
                className="px-4 py-2 bg-white text-primary rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Grid de Cores */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CoresGrid
            onSelectCor={setCorSelecionada}
            modoSelecao={true}
            corSelecionada={corSelecionada}
            showFotos={true}
          />
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📸 Fotos Reais</h3>
            <p className="text-sm text-blue-700">
              Todas as cores possuem fotos reais dos tecidos para referência visual
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">🎨 Códigos Completos</h3>
            <p className="text-sm text-green-700">
              Hexadecimal, Pantone e RGB para uso em diferentes contextos
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">🔍 Busca Rápida</h3>
            <p className="text-sm text-purple-700">
              Encontre cores por nome ou código hexadecimal facilmente
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoresPage;
