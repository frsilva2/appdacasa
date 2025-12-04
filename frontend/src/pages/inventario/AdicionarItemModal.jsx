import { useState } from 'react';
import { X, Camera, ScanLine, CheckCircle, ArrowRight, Edit3 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import UploadEtiqueta from '../../components/etiquetas/UploadEtiqueta';

/**
 * Modal para adicionar itens ao inventário
 * Fluxo simplificado:
 * 1. OCR lê etiqueta (PRODUTO, COR, METRAGEM)
 * 2. Busca correspondência no DEPARA
 * 3. Se encontrar: usa nome do sistema (nomeERP)
 * 4. Se não encontrar: usa texto lido da etiqueta
 * 5. Cor é texto simples (não seletor)
 * 6. Operador apenas confirma os dados
 */
const AdicionarItemModal = ({ inventario, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Campos de texto simples
  const [produtoNome, setProdutoNome] = useState('');
  const [corNome, setCorNome] = useState('');
  const [codigoCor, setCodigoCor] = useState('');
  const [quantidadeContada, setQuantidadeContada] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Controle de fluxo
  const [modoOCR, setModoOCR] = useState(true);
  const [modoContinuo, setModoContinuo] = useState(true);
  const [itensAdicionados, setItensAdicionados] = useState(0);
  const [ultimoItemAdicionado, setUltimoItemAdicionado] = useState(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Dados originais lidos pela OCR (para exibição)
  const [dadosOCRExtraidos, setDadosOCRExtraidos] = useState(null);
  // Indica se o produto foi encontrado no DEPARA
  const [produtoNoDEPARA, setProdutoNoDEPARA] = useState(false);

  const limparFormulario = () => {
    setProdutoNome('');
    setCorNome('');
    setCodigoCor('');
    setQuantidadeContada('');
    setObservacoes('');
    setDadosOCRExtraidos(null);
    setProdutoNoDEPARA(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!produtoNome.trim() || !quantidadeContada) {
      alert('Preencha pelo menos o nome do produto e a quantidade');
      return;
    }

    try {
      setLoading(true);

      // Enviar dados como texto para o backend
      await api.post(`/inventario/${inventario.id}/items`, {
        produtoNome: produtoNome.trim(),
        corNome: corNome.trim() || null,
        codigoCor: codigoCor.trim() || null,
        quantidadeContada: parseFloat(quantidadeContada),
        observacoes: observacoes.trim() || null,
        fonteOCR: dadosOCRExtraidos ? true : false,
        produtoEncontradoDEPARA: produtoNoDEPARA,
      });

      // Incrementar contador
      setItensAdicionados(prev => prev + 1);
      setUltimoItemAdicionado({
        produto: produtoNome,
        cor: corNome ? `#${codigoCor} ${corNome}` : 'Sem cor',
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

  const handleOCRComplete = async (dadosOCR) => {
    console.log('=== OCR COMPLETE ===');
    console.log('Dados OCR recebidos:', dadosOCR);

    // Verificar estrutura dos dados
    const ocrData = dadosOCR.data?.ocr || dadosOCR.ocr;

    if (!ocrData) {
      console.error('Estrutura OCR inválida:', dadosOCR);
      alert('Erro: Dados do OCR não encontrados');
      return;
    }

    const info = ocrData.informacoesExtraidas || {};
    console.log('Informações extraídas:', info);

    // Salvar dados originais da etiqueta para exibição
    setDadosOCRExtraidos({
      produto: info.produto,
      cor: info.cor,
      codigoCor: info.codigoCor,
      metragem: info.metragem,
      confianca: ocrData.confiancaMedia
    });

    // 1. PREENCHER METRAGEM (sempre usa o valor lido)
    if (info.metragem) {
      setQuantidadeContada(info.metragem);
    }

    // 2. PREENCHER COR (sempre usa o texto lido)
    if (info.cor) {
      setCorNome(info.cor);
    }
    if (info.codigoCor) {
      setCodigoCor(info.codigoCor);
    }

    // 3. BUSCAR PRODUTO NO DEPARA
    // Lógica simples:
    // - Procurar nome da etiqueta na Coluna A (nomeFornecedor)
    // - Se encontrar: usar Coluna B (nomeERP)
    // - Se não encontrar: usar nome da etiqueta
    let nomeParaUsar = info.produto || '';
    let encontradoNoDEPARA = false;

    if (info.produto) {
      const produtoEtiqueta = info.produto.toUpperCase().trim();
      console.log('Buscando no DEPARA:', produtoEtiqueta);

      try {
        const response = await api.get('/depara');
        const deparaList = response.data.data || [];
        console.log(`DEPARA carregado: ${deparaList.length} registros`);

        // Procurar nome da etiqueta na Coluna A (nomeFornecedor)
        const correspondencia = deparaList.find(item => {
          const nomeFornecedor = (item.nomeFornecedor || '').toUpperCase().trim();
          return nomeFornecedor === produtoEtiqueta;
        });

        if (correspondencia && correspondencia.nomeERP) {
          // Encontrou na Coluna A → usar Coluna B
          console.log('✅ DEPARA encontrado:', correspondencia.nomeFornecedor, '->', correspondencia.nomeERP);
          nomeParaUsar = correspondencia.nomeERP;
          encontradoNoDEPARA = true;
        } else {
          // Não encontrou → usar nome da etiqueta
          console.log('❌ DEPARA não encontrado, usando nome da etiqueta:', info.produto);
          nomeParaUsar = info.produto;
        }
      } catch (error) {
        console.log('Erro ao buscar DEPARA:', error);
        nomeParaUsar = info.produto;
      }
    }

    // Preencher nome do produto
    setProdutoNome(nomeParaUsar);
    setProdutoNoDEPARA(encontradoNoDEPARA);

    // Adicionar dados lidos às observações para referência
    const obs = `[Etiqueta] ${info.produto || 'N/A'} | ${info.cor ? `#${info.codigoCor} ${info.cor}` : 'N/A'} | ${info.metragem ? `${info.metragem} MT` : 'N/A'}`;
    setObservacoes(obs);

    // Sair do modo OCR e mostrar formulário para confirmação
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

  // Verificar se todos os campos obrigatórios estão preenchidos
  const camposPreenchidos = produtoNome.trim() && quantidadeContada;

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
                    <li>✅ Confirme os dados preenchidos</li>
                    <li>🔄 Repita para próxima etiqueta</li>
                  </ol>
                </div>

                <UploadEtiqueta
                  onOCRComplete={handleOCRComplete}
                  onErro={(erro) => alert(erro)}
                />
              </div>
            ) : null}

            {/* Card de Dados Lidos da Etiqueta */}
            {dadosOCRExtraidos && !modoOCR && (
              <div className={`mb-6 rounded-lg p-4 border-2 ${camposPreenchidos ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold flex items-center gap-2 ${camposPreenchidos ? 'text-green-800' : 'text-yellow-800'}`}>
                    {camposPreenchidos ? (
                      <>
                        <CheckCircle size={20} />
                        Pronto para Confirmar
                      </>
                    ) : (
                      <>
                        <ScanLine size={20} />
                        Dados da Etiqueta
                      </>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { limparFormulario(); setModoOCR(true); }}
                    className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                  >
                    Nova Foto
                  </button>
                </div>

                {/* Dados originais da etiqueta */}
                <div className="bg-gray-100 rounded p-3 mb-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">LIDO NA ETIQUETA:</p>
                  <p className="text-sm text-gray-700">
                    <strong>Produto:</strong> {dadosOCRExtraidos.produto || 'N/A'}
                    {produtoNoDEPARA && <span className="text-green-600 ml-2">(DEPARA ✓)</span>}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Cor:</strong> {dadosOCRExtraidos.cor ? `#${dadosOCRExtraidos.codigoCor} ${dadosOCRExtraidos.cor}` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Metragem:</strong> {dadosOCRExtraidos.metragem ? `${dadosOCRExtraidos.metragem} MT` : 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Produto */}
                  <div className={`rounded p-3 border ${produtoNome ? 'bg-green-100 border-green-300' : 'bg-white border-yellow-300'}`}>
                    <p className="text-xs text-gray-600 font-medium mb-1">PRODUTO</p>
                    <p className="font-bold text-gray-900 text-sm leading-tight">
                      {produtoNome || 'NÃO PREENCHIDO'}
                    </p>
                    {produtoNoDEPARA && (
                      <p className="text-xs text-green-600 mt-1">Nome do sistema</p>
                    )}
                  </div>

                  {/* Cor */}
                  <div className={`rounded p-3 border ${corNome ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}`}>
                    <p className="text-xs text-gray-600 font-medium mb-1">COR</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {corNome ? `#${codigoCor} ${corNome}` : 'N/A'}
                    </p>
                  </div>

                  {/* Metragem */}
                  <div className={`rounded p-3 border ${quantidadeContada ? 'bg-green-100 border-green-300' : 'bg-white border-yellow-300'}`}>
                    <p className="text-xs text-gray-600 font-medium mb-1">METRAGEM</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {quantidadeContada || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">metros</p>
                  </div>
                </div>

                {camposPreenchidos ? (
                  <p className="text-xs text-green-700 mt-3 font-bold text-center">
                    ✓ Tudo preenchido! Clique em "Confirmar e Próximo" para lançar.
                  </p>
                ) : (
                  <p className="text-xs text-yellow-700 mt-3 font-medium">
                    Complete os campos obrigatórios abaixo.
                  </p>
                )}
              </div>
            )}

            {/* Formulário de Edição (campos de texto simples) */}
            {!modoOCR && (
              <div className="space-y-4">
                {/* Produto - Campo de Texto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Edit3 size={16} />
                    Produto *
                  </label>
                  <input
                    type="text"
                    value={produtoNome}
                    onChange={(e) => setProdutoNome(e.target.value)}
                    className="input w-full text-lg font-medium"
                    placeholder="Nome do produto..."
                    required
                  />
                  {produtoNoDEPARA && (
                    <p className="text-xs text-green-600 mt-1">✓ Nome encontrado no DEPARA</p>
                  )}
                </div>

                {/* Cor - Campos de Texto */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Cor
                    </label>
                    <input
                      type="text"
                      value={codigoCor}
                      onChange={(e) => setCodigoCor(e.target.value)}
                      className="input w-full font-mono"
                      placeholder="#00901"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Cor
                    </label>
                    <input
                      type="text"
                      value={corNome}
                      onChange={(e) => setCorNome(e.target.value)}
                      className="input w-full"
                      placeholder="PRATA, AZUL, etc..."
                    />
                  </div>
                </div>

                {/* Quantidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade Contada (metros) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quantidadeContada}
                    onChange={(e) => setQuantidadeContada(e.target.value)}
                    className="input w-full text-2xl font-bold text-center"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="input min-h-[60px] w-full"
                    placeholder="Observações sobre este item..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t bg-gray-50">
            {modoContinuo && !modoOCR ? (
              <>
                <button
                  type="button"
                  onClick={handleFinalizarContagem}
                  className="btn-secondary"
                  disabled={loading}
                >
                  <X size={18} />
                  Finalizar ({itensAdicionados})
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-lg py-4"
                  disabled={loading || !camposPreenchidos}
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
            ) : !modoOCR ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading || !camposPreenchidos}
                >
                  {loading ? <LoadingSpinner /> : 'Adicionar Item'}
                </button>
              </>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarItemModal;
