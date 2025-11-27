import { useState, useEffect } from 'react';
import { X, Camera, ScanLine } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import UploadEtiqueta from '../../components/etiquetas/UploadEtiqueta';
import ProductAutocomplete from '../../components/ProductAutocomplete';
import ColorSelector from '../../components/ColorSelector';

const AdicionarItemModal = ({ inventario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [produtoId, setProdutoId] = useState('');
  const [corId, setCorId] = useState('');
  const [produto, setProduto] = useState(null);
  const [cor, setCor] = useState(null);
  const [quantidadeContada, setQuantidadeContada] = useState('');
  const [lote, setLote] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [modoOCR, setModoOCR] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos/com-estoque');
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    }
  };

  const handleProdutoSelect = (produtoSelecionado) => {
    setProduto(produtoSelecionado);
    setProdutoId(produtoSelecionado?.id || '');
    setCor(null);
    setCorId('');
  };

  const handleCorSelect = (corSelecionada) => {
    setCor(corSelecionada);
    setCorId(corSelecionada.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!produtoId || !corId || !quantidadeContada) {
      alert('Preencha produto, cor e quantidade');
      return;
    }

    try {
      setLoading(true);

      await api.post(`/inventario/${inventario.id}/items`, {
        produtoId,
        corId,
        quantidadeContada: parseFloat(quantidadeContada),
        lote: lote || null,
        observacoes: observacoes || null,
      });

      alert('Item adicionado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar item');
    } finally {
      setLoading(false);
    }
  };

  const handleOCRComplete = (dadosOCR) => {
    // Preencher campos com dados do OCR
    const info = dadosOCR.ocr.informacoesExtraidas;

    if (info.metragem) {
      setQuantidadeContada(info.metragem);
    }

    if (info.codigo) {
      setLote(info.codigo);
    }

    // Adicionar texto completo às observações
    const textoOCR = dadosOCR.ocr.textoCompleto.substring(0, 200); // Limitar tamanho
    setObservacoes(prev => {
      const novoTexto = `[OCR] ${textoOCR}`;
      return prev ? `${prev}\n\n${novoTexto}` : novoTexto;
    });

    // Voltar para modo manual
    setModoOCR(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Adicionar Item - {inventario.numero}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Botão para alternar entre modo Manual e OCR */}
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => setModoOCR(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  !modoOCR
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Modo Manual
              </button>
              <button
                type="button"
                onClick={() => setModoOCR(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  modoOCR
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ScanLine size={20} />
                Modo OCR
              </button>
            </div>

            {/* Modo OCR */}
            {modoOCR ? (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Camera size={20} />
                  Escanear Etiqueta com OCR
                </h3>
                <UploadEtiqueta
                  onOCRComplete={handleOCRComplete}
                  onErro={(erro) => alert(erro)}
                />
                <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <strong>Dica:</strong> Após escanear a etiqueta, os dados extraídos serão preenchidos automaticamente nos campos abaixo. Você pode então ajustar conforme necessário.
                </p>
              </div>
            ) : null}

            <div className="space-y-4">
              {/* Produto com Autocomplete */}
              <div>
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

              {/* Cor com Seletor Visual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor * {cor && `- ${cor.nome}`}
                </label>
                {produto ? (
                  <ColorSelector
                    cores={produto.cores}
                    selectedCorId={corId}
                    onSelect={handleCorSelect}
                    showEstoque={false}
                  />
                ) : (
                  <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded border border-gray-200">
                    Selecione um produto primeiro
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Contada (m) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantidadeContada}
                    onChange={(e) => setQuantidadeContada(e.target.value)}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lote
                  </label>
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    className="input"
                    placeholder="L123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="input min-h-[60px]"
                  placeholder="Observações sobre este item..."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Adicionar Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarItemModal;
