import { useState, useEffect } from 'react';
import { X, Camera, ScanLine, CheckCircle, ArrowRight } from 'lucide-react';
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
  const [modoOCR, setModoOCR] = useState(true); // Começa em modo OCR
  const [modoContinuo, setModoContinuo] = useState(true); // Modo contínuo ativado por padrão
  const [itensAdicionados, setItensAdicionados] = useState(0);
  const [ultimoItemAdicionado, setUltimoItemAdicionado] = useState(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/produtos');
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

  const limparFormulario = () => {
    setProdutoId('');
    setCorId('');
    setProduto(null);
    setCor(null);
    setQuantidadeContada('');
    setLote('');
    setObservacoes('');
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

      // Incrementar contador
      setItensAdicionados(prev => prev + 1);
      setUltimoItemAdicionado({
        produto: produto.nome,
        cor: cor.nome,
        quantidade: quantidadeContada,
      });

      // Modo contínuo: limpar e voltar para OCR
      if (modoContinuo) {
        setMostrarConfirmacao(true);

        // Limpar formulário
        limparFormulario();

        // Voltar para modo OCR após 2 segundos
        setTimeout(() => {
          setMostrarConfirmacao(false);
          setModoOCR(true);
        }, 2000);
      } else {
        alert('Item adicionado com sucesso!');
        onSuccess();
      }
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

  const handleFinalizarContagem = () => {
    if (itensAdicionados > 0) {
      if (confirm(`Você adicionou ${itensAdicionados} item(ns). Deseja finalizar a contagem?`)) {
        onSuccess();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header com Contador */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary to-blue-600">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Contagem Contínua - {inventario.numero}</h2>
            <p className="text-sm mt-1 opacity-90">
              {modoContinuo ? '📸 Modo Contínuo Ativo' : 'Modo Manual'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Contador de Itens */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <div className="text-3xl font-bold text-white">{itensAdicionados}</div>
              <div className="text-xs text-white opacity-90">itens contados</div>
            </div>
            <button onClick={handleFinalizarContagem} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        {mostrarConfirmacao && ultimoItemAdicionado && (
          <div className="bg-green-500 text-white px-6 py-4 flex items-center gap-3 animate-pulse">
            <CheckCircle size={24} />
            <div className="flex-1">
              <p className="font-bold">✓ Item adicionado com sucesso!</p>
              <p className="text-sm opacity-90">
                {ultimoItemAdicionado.produto} - {ultimoItemAdicionado.cor} ({ultimoItemAdicionado.quantidade}m)
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">

            {/* Modo OCR */}
            {modoOCR ? (
              <div className="mb-6">
                {/* Instruções do Fluxo Contínuo */}
                <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-primary p-4 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Camera size={20} className="text-primary" />
                    Fluxo de Contagem Contínua
                  </h3>
                  <ol className="text-sm text-gray-700 space-y-1 ml-6 list-decimal">
                    <li>📸 Tire foto da etiqueta</li>
                    <li>⚙️ Aguarde o OCR processar</li>
                    <li>✏️ Confirme/ajuste os dados</li>
                    <li>✅ Clique "Confirmar e Próximo"</li>
                    <li>🔄 Repita para próxima etiqueta</li>
                  </ol>
                </div>

                <UploadEtiqueta
                  onOCRComplete={handleOCRComplete}
                  onErro={(erro) => alert(erro)}
                />
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

          <div className="flex gap-3 p-6 border-t bg-gray-50">
            {modoContinuo ? (
              <>
                <button
                  type="button"
                  onClick={handleFinalizarContagem}
                  className="btn-secondary"
                  disabled={loading}
                >
                  <X size={18} />
                  Finalizar Contagem ({itensAdicionados})
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-lg py-4"
                  disabled={loading || !produtoId || !corId || !quantidadeContada}
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirmar e Próximo
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarItemModal;
