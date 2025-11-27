import { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import ProductAutocomplete from './ProductAutocomplete';
import ColorSelector from './ColorSelector';
import LoadingSpinner from './LoadingSpinner';

const BulkAddItemsModal = ({ produtos, onClose, onAddItems, showPrecoUnitario = false }) => {
  const [produto, setProduto] = useState(null);
  const [selectedCorIds, setSelectedCorIds] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [precos, setPrecos] = useState({});

  const handleProdutoSelect = (produtoSelecionado) => {
    setProduto(produtoSelecionado);
    setSelectedCorIds([]);
    setQuantidades({});
    setPrecos({});
  };

  const handleCoresSelect = (corIds) => {
    setSelectedCorIds(corIds);

    // Initialize quantities for newly selected colors
    const newQuantidades = { ...quantidades };
    const newPrecos = { ...precos };
    corIds.forEach(corId => {
      if (!newQuantidades[corId]) {
        newQuantidades[corId] = '';
      }
      if (showPrecoUnitario && !newPrecos[corId]) {
        newPrecos[corId] = '';
      }
    });
    setQuantidades(newQuantidades);
    if (showPrecoUnitario) {
      setPrecos(newPrecos);
    }
  };

  const handleQuantidadeChange = (corId, valor) => {
    setQuantidades(prev => ({
      ...prev,
      [corId]: valor
    }));
  };

  const handlePrecoChange = (corId, valor) => {
    setPrecos(prev => ({
      ...prev,
      [corId]: valor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!produto) {
      alert('Selecione um produto');
      return;
    }

    if (selectedCorIds.length === 0) {
      alert('Selecione pelo menos uma cor');
      return;
    }

    // Validate and build items array
    const items = [];
    for (const corId of selectedCorIds) {
      const quantidade = parseFloat(quantidades[corId]);

      if (!quantidade || quantidade <= 0) {
        const cor = produto.cores.find(c => c.id === corId);
        alert(`Informe a quantidade para a cor "${cor?.nome}"`);
        return;
      }

      // Validate multiple of 60
      if (quantidade % 60 !== 0) {
        const cor = produto.cores.find(c => c.id === corId);
        alert(`A quantidade para "${cor?.nome}" deve ser múltiplo de 60m.\nValor atual: ${quantidade}m`);
        return;
      }

      const item = {
        produtoId: produto.id,
        corId,
        quantidade,
        produto,
        cor: produto.cores.find(c => c.id === corId)
      };

      if (showPrecoUnitario) {
        const preco = parseFloat(precos[corId]);
        if (!preco || preco <= 0) {
          alert(`Informe o preço unitário para a cor "${item.cor?.nome}"`);
          return;
        }
        item.precoUnitario = preco;
      }

      items.push(item);
    }

    onAddItems(items);
    onClose();
  };

  const selectedCores = produto?.cores.filter(c => selectedCorIds.includes(c.id)) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Adicionar Múltiplas Cores</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded flex items-start gap-3">
              <AlertCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Adicionar várias cores de uma vez</p>
                <p>Selecione um produto, depois selecione todas as cores desejadas e defina as quantidades para cada uma.</p>
              </div>
            </div>

            {/* Produto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto *
              </label>
              <ProductAutocomplete
                produtos={produtos}
                selectedProduct={produto}
                onSelect={handleProdutoSelect}
                placeholder="Buscar produto por nome ou código..."
              />
            </div>

            {/* Color Selector - Multi-Select */}
            {produto && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cores * (selecione múltiplas)
                </label>
                <ColorSelector
                  cores={produto.cores}
                  selectedCorIds={selectedCorIds}
                  onSelect={handleCoresSelect}
                  showEstoque={false}
                  multiSelect={true}
                />
              </div>
            )}

            {/* Quantities for Selected Colors */}
            {selectedCores.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Definir Quantidades ({selectedCores.length} cores selecionadas)
                </h3>

                {selectedCores.map((cor) => (
                  <div key={cor.id} className="card bg-gray-50">
                    <div className="flex items-center gap-4">
                      {/* Color Swatch */}
                      <div
                        className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: cor.codigoHex || '#CCCCCC' }}
                      />

                      {/* Color Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cor.nome}</p>
                        <p className="text-sm text-gray-600">{cor.codigoHex}</p>
                      </div>

                      {/* Quantity Input */}
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Qtd (m) *
                        </label>
                        <input
                          type="number"
                          value={quantidades[cor.id] || ''}
                          onChange={(e) => handleQuantidadeChange(cor.id, e.target.value)}
                          className={`input text-sm ${
                            quantidades[cor.id] && parseFloat(quantidades[cor.id]) % 60 !== 0
                              ? 'border-red-500'
                              : ''
                          }`}
                          min="60"
                          step="60"
                          placeholder="60, 120..."
                          required
                        />
                        {quantidades[cor.id] && parseFloat(quantidades[cor.id]) % 60 !== 0 && (
                          <p className="text-xs text-red-600 mt-1">Múltiplo de 60m</p>
                        )}
                      </div>

                      {/* Price Input (if applicable) */}
                      {showPrecoUnitario && (
                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Preço (R$/m) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={precos[cor.id] || ''}
                            onChange={(e) => handlePrecoChange(cor.id, e.target.value)}
                            className="input text-sm"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!produto && (
              <div className="text-center py-8 text-gray-500">
                <Plus size={48} className="mx-auto mb-2 opacity-50" />
                <p>Selecione um produto para começar</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={!produto || selectedCorIds.length === 0}
            >
              Adicionar {selectedCores.length > 0 && `(${selectedCores.length} itens)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkAddItemsModal;
