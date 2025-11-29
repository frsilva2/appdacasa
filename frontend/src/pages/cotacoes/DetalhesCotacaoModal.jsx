import { useState } from 'react';
import { X, Calendar, User, Clock, Package, DollarSign, TrendingUp, TrendingDown, Link as LinkIcon, MessageCircle, Check, XCircle, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { getUrlFotoCor } from '../../services/assets';
import { getArquivoImagemCor } from '../../utils/coresMapping';

const DetalhesCotacaoModal = ({ cotacao, onClose, onConcluir, onCancelar, onEditar }) => {
  const getColorImageUrl = (cor) => {
    // SEMPRE usa o mapeamento primeiro (banco tem valores incorretos)
    let fileName = getArquivoImagemCor(cor.nome);
    if (!fileName) {
      fileName = cor.arquivoImagem || cor.arquivo_imagem;
    }
    if (!fileName) return null;
    return getUrlFotoCor(fileName);
  };
  const [linksExpanded, setLinksExpanded] = useState(false);
  const prazoExpirado = new Date(cotacao.prazoResposta) < new Date();

  const copiarLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };

  const enviarWhatsApp = (telefone, link) => {
    const mensagem = `Olá! Segue o link para responder a cotação ${cotacao.numero}:\n\n${link}`;
    const telefoneFormatado = telefone.replace(/\D/g, ''); // Remove tudo que não é número
    window.open(`https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleConcluir = () => {
    if (window.confirm(`Deseja realmente concluir a cotação ${cotacao.numero}?`)) {
      onConcluir && onConcluir(cotacao.id);
    }
  };

  const handleCancelar = () => {
    if (window.confirm(`Deseja realmente cancelar a cotação ${cotacao.numero}? Esta ação não pode ser desfeita.`)) {
      onCancelar && onCancelar(cotacao.id);
    }
  };

  const handleEditar = () => {
    onEditar && onEditar(cotacao);
  };

  const getStatusBadge = (status) => {
    const badges = {
      ABERTA: { label: 'Aberta', class: 'bg-blue-100 text-blue-800' },
      FECHADA: { label: 'Fechada', class: 'bg-gray-100 text-gray-800' },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800' },
    };
    const badge = badges[status] || badges.ABERTA;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  const calcularMelhorPreco = (respostas) => {
    if (!respostas || respostas.length === 0) return null;
    return Math.min(...respostas.map(r => parseFloat(r.precoUnitario)));
  };

  const calcularMediaPrecos = (respostas) => {
    if (!respostas || respostas.length === 0) return null;
    const soma = respostas.reduce((acc, r) => acc + parseFloat(r.precoUnitario), 0);
    return soma / respostas.length;
  };

  const compararComHistorico = (precoAtual, precoHistorico) => {
    if (!precoHistorico) return null;
    const diferenca = ((precoAtual - precoHistorico) / precoHistorico) * 100;
    return diferenca;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header com gradiente Polaroid */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-600 p-6 rounded-t-lg">
          <div className="flex items-start justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-2">{cotacao.numero}</h2>
              <p className="text-pink-100">
                Solicitante: {cotacao.criador?.name || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(cotacao.status)}
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 bg-white bg-opacity-20 rounded-full p-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="text-blue-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Data de Criação</p>
                <p className="font-semibold">
                  {new Date(cotacao.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className={`${prazoExpirado ? 'text-red-500' : 'text-orange-500'}`} size={24} />
              <div>
                <p className="text-sm text-gray-600">Prazo de Resposta</p>
                <p className={`font-semibold ${prazoExpirado ? 'text-red-600' : ''}`}>
                  {new Date(cotacao.prazoResposta).toLocaleDateString('pt-BR')}
                  {prazoExpirado && ' (Expirado)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Package className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="font-semibold">{cotacao.items.length} produto(s)</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          {cotacao.observacoes && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Observações:</h3>
              <p className="text-gray-700">{cotacao.observacoes}</p>
            </div>
          )}

          {/* Fornecedor Aprovado */}
          {cotacao.fornecedorEscolhidoId && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Fornecedor Aprovado:</h3>
              <p className="text-gray-700">
                {cotacao.fornecedorEscolhido?.nome || 'N/A'}
              </p>
            </div>
          )}

          {/* Links para Fornecedores - Seção Minimizável */}
          {cotacao.tokens && cotacao.tokens.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setLinksExpanded(!linksExpanded)}
              >
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <LinkIcon size={20} />
                  Links para Fornecedores
                  <span className="text-sm font-normal text-gray-600">
                    ({cotacao.tokens.length} fornecedor{cotacao.tokens.length > 1 ? 'es' : ''})
                  </span>
                </h3>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                  title={linksExpanded ? 'Minimizar' : 'Expandir'}
                >
                  {linksExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {linksExpanded && (
                <div className="space-y-2 mt-3 animate-fadeIn">
                  {cotacao.tokens.map((token) => {
                    const link = `${window.location.origin}/cotacao/${token.token}`;
                    return (
                      <div key={token.id} className="flex items-center justify-between p-3 bg-white rounded border border-blue-200">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{token.fornecedor.nome}</p>
                          <p className="text-sm text-gray-600">{token.fornecedor.email}</p>
                          {token.respondido && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1">
                              <Check size={12} />
                              Respondido em {new Date(token.dataResposta).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copiarLink(link)}
                            className="btn-secondary flex items-center gap-1 text-sm px-3 py-2"
                            title="Copiar link"
                          >
                            <LinkIcon size={16} />
                            Copiar
                          </button>
                          {token.fornecedor.telefone && (
                            <button
                              onClick={() => enviarWhatsApp(token.fornecedor.telefone, link)}
                              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 text-sm px-3 py-2 rounded transition-colors"
                              title="Enviar por WhatsApp"
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Produtos e Respostas */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Produtos e Respostas dos Fornecedores
            </h3>

            <div className="space-y-6">
              {cotacao.items.map((item) => {
                const melhorPreco = calcularMelhorPreco(item.respostasFornecedor);
                const mediaPrecos = calcularMediaPrecos(item.respostasFornecedor);

                return (
                  <div key={item.id} className="border rounded-lg p-5 bg-gray-50">
                    {/* Cabeçalho do Produto */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 overflow-hidden">
                          {getColorImageUrl(item.cor) ? (
                            <img
                              src={getColorImageUrl(item.cor)}
                              alt={item.cor.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.backgroundColor = item.cor.codigoHex || '#CCCCCC';
                              }}
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: item.cor.codigoHex || '#CCCCCC' }}
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            {item.produto.nome}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Cor: {item.cor.nome} | Quantidade: {item.quantidadeSolicitada}m
                          </p>
                        </div>
                      </div>

                      {item.respostasFornecedor?.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Melhor Preço</p>
                          <p className="text-2xl font-bold text-green-600">
                            R$ {melhorPreco?.toFixed(2)}
                          </p>
                          {mediaPrecos && (
                            <p className="text-xs text-gray-500">
                              Média: R$ {mediaPrecos.toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Respostas dos Fornecedores */}
                    {item.respostasFornecedor?.length > 0 ? (
                      <div className="space-y-3">
                        {(item.respostasFornecedor || [])
                          .sort((a, b) => parseFloat(a.precoUnitario) - parseFloat(b.precoUnitario))
                          .map((resposta) => {
                            const isMelhorPreco = parseFloat(resposta.precoUnitario) === melhorPreco;
                            const isAprovado = cotacao.fornecedorEscolhidoId === resposta.fornecedorId;
                            const precoTotal = parseFloat(resposta.precoUnitario) * item.quantidadeSolicitada;
                            const variacaoHistorica = compararComHistorico(
                              parseFloat(resposta.precoUnitario),
                              resposta.precoHistorico ? parseFloat(resposta.precoHistorico) : null
                            );

                            return (
                              <div
                                key={resposta.id}
                                className={`p-4 rounded-lg border-2 ${
                                  isAprovado
                                    ? 'bg-green-50 border-green-500'
                                    : isMelhorPreco
                                    ? 'bg-blue-50 border-blue-500'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <User size={18} className="text-gray-600" />
                                      <h5 className="font-bold text-gray-900">
                                        {resposta.fornecedor.nome}
                                      </h5>
                                      {isMelhorPreco && !isAprovado && (
                                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                          Melhor Preço
                                        </span>
                                      )}
                                      {isAprovado && (
                                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                          Aprovado
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                      <div>
                                        <p className="text-gray-600">Preço Unitário</p>
                                        <p className="font-semibold flex items-center gap-1">
                                          <DollarSign size={14} />
                                          R$ {parseFloat(resposta.precoUnitario).toFixed(2)}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-gray-600">Total</p>
                                        <p className="font-semibold">
                                          R$ {precoTotal.toFixed(2)}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-gray-600">Prazo Entrega</p>
                                        <p className="font-semibold">
                                          {resposta.prazoEntrega} dias
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-gray-600">Respondido em</p>
                                        <p className="font-semibold">
                                          {new Date(resposta.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Comparação com Histórico */}
                                    {variacaoHistorica !== null && (
                                      <div className="mt-3 p-2 bg-gray-100 rounded flex items-center gap-2 text-sm">
                                        {variacaoHistorica > 0 ? (
                                          <>
                                            <TrendingUp size={16} className="text-red-500" />
                                            <span className="text-red-600 font-medium">
                                              +{variacaoHistorica.toFixed(1)}%
                                            </span>
                                          </>
                                        ) : (
                                          <>
                                            <TrendingDown size={16} className="text-green-500" />
                                            <span className="text-green-600 font-medium">
                                              {variacaoHistorica.toFixed(1)}%
                                            </span>
                                          </>
                                        )}
                                        <span className="text-gray-600">
                                          vs. último preço (R$ {parseFloat(resposta.precoHistorico).toFixed(2)})
                                        </span>
                                      </div>
                                    )}

                                    {resposta.observacoes && (
                                      <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                                        <p className="text-gray-600">Observações:</p>
                                        <p className="text-gray-700">{resposta.observacoes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Nenhum fornecedor respondeu ainda</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo de Valores */}
          {cotacao.items.some(item => item.respostasFornecedor?.length > 0) && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Resumo Financeiro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from(
                  new Set(
                    cotacao.items.flatMap(item =>
                      (item.respostasFornecedor || []).map(r => r.fornecedor.nome)
                    )
                  )
                ).map(fornecedorNome => {
                  const totalFornecedor = cotacao.items.reduce((acc, item) => {
                    const resposta = (item.respostasFornecedor || []).find(
                      r => r.fornecedor.nome === fornecedorNome
                    );
                    if (resposta) {
                      return acc + parseFloat(resposta.precoUnitario) * item.quantidadeSolicitada;
                    }
                    return acc;
                  }, 0);

                  const isAprovado = cotacao.items.some(
                    item => (item.respostasFornecedor || []).some(
                      r => r.fornecedor.nome === fornecedorNome && r.fornecedorId === cotacao.fornecedorEscolhidoId
                    )
                  );

                  return (
                    <div
                      key={fornecedorNome}
                      className={`p-4 rounded-lg ${
                        isAprovado ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
                      }`}
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        {fornecedorNome}
                        {isAprovado && (
                          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                            Aprovado
                          </span>
                        )}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {totalFornecedor.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <button onClick={onClose} className="btn-secondary px-6">
              Fechar
            </button>

            <div className="flex items-center gap-3">
              {/* Botões baseados no status */}
              {(cotacao.status === 'ENVIADA' || cotacao.status === 'ABERTA') && (
                <>
                  <button
                    onClick={handleEditar}
                    className="btn-secondary flex items-center gap-2 px-4 py-2"
                    title="Editar cotação"
                  >
                    <Edit size={18} />
                    Editar
                  </button>

                  <button
                    onClick={handleCancelar}
                    className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-4 py-2 rounded transition-colors"
                    title="Cancelar cotação"
                  >
                    <XCircle size={18} />
                    Cancelar
                  </button>

                  <button
                    onClick={handleConcluir}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded transition-colors"
                    title="Concluir cotação"
                  >
                    <Check size={18} />
                    Concluir
                  </button>
                </>
              )}

              {cotacao.status === 'FECHADA' && (
                <button
                  onClick={handleEditar}
                  className="btn-secondary flex items-center gap-2 px-4 py-2"
                  title="Editar cotação"
                >
                  <Edit size={18} />
                  Editar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalhesCotacaoModal;
