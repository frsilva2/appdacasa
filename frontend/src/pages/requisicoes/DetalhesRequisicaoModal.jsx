import { X, FileText, User, Calendar, Package, Check, XCircle, AlertCircle } from 'lucide-react';
import { getUrlFotoCor } from '../../services/assets';
import { getArquivoImagemCor, getCodigoCor } from '../../utils/coresMapping';

const DetalhesRequisicaoModal = ({ requisicao, onClose }) => {
  const getColorImageUrl = (cor) => {
    // SEMPRE usa o mapeamento primeiro (banco tem valores incorretos)
    let fileName = getArquivoImagemCor(cor.nome);
    if (!fileName) {
      fileName = cor.arquivoImagem || cor.arquivo_imagem;
    }
    if (!fileName) return null;
    return getUrlFotoCor(fileName);
  };
  const getStatusBadge = (status) => {
    const badges = {
      PENDENTE: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800', icon: Check },
      APROVADA_PARCIAL: { label: 'Aprovada Parcial', class: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      RECUSADA: { label: 'Recusada', class: 'bg-red-100 text-red-800', icon: XCircle },
      ATENDIDA_PARCIAL: { label: 'Atendida Parcial', class: 'bg-purple-100 text-purple-800', icon: Package },
      ATENDIDA: { label: 'Atendida', class: 'bg-indigo-100 text-indigo-800', icon: Package },
      ENVIADA: { label: 'Enviada', class: 'bg-gray-100 text-gray-800', icon: Check },
    };

    const badge = badges[status] || badges.PENDENTE;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText size={28} />
              {requisicao.numero}
            </h2>
            <p className="text-blue-100 mt-1">{requisicao.loja.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Status e Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                Status
              </h3>
              <div className="space-y-2">
                {getStatusBadge(requisicao.status)}
                {requisicao.aprovadoEm && (
                  <p className="text-sm text-gray-600">
                    Aprovada em: {formatarData(requisicao.aprovadoEm)}
                  </p>
                )}
              </div>
            </div>

            <div className="card bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                Data de Criação
              </h3>
              <p className="text-sm text-gray-600">{formatarData(requisicao.createdAt)}</p>
            </div>
          </div>

          {/* Solicitante */}
          <div className="card bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Solicitante
            </h3>
            <div className="space-y-1">
              <p className="text-gray-900">{requisicao.solicitante.name}</p>
              <p className="text-sm text-gray-600">{requisicao.solicitante.email}</p>
              {requisicao.solicitante.telefone && (
                <p className="text-sm text-gray-600">{requisicao.solicitante.telefone}</p>
              )}
            </div>
          </div>

          {/* Observações */}
          {requisicao.observacoes && (
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Observações</h3>
              <p className="text-sm text-blue-800">{requisicao.observacoes}</p>
            </div>
          )}

          {/* Justificativa de Recusa */}
          {requisicao.justificativaRecusa && (
            <div className="card bg-red-50 border-red-200">
              <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                <XCircle size={20} />
                Justificativa da Recusa
              </h3>
              <p className="text-sm text-red-800">{requisicao.justificativaRecusa}</p>
            </div>
          )}

          {/* Itens da Requisição */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Itens da Requisição ({requisicao.items.length})
            </h3>
            <div className="space-y-3">
              {requisicao.items.map((item, index) => (
                <div key={item.id} className="card bg-white border-2 border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="w-12 h-12 rounded-full border-2 border-gray-300 overflow-hidden">
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
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.produto.nome}</h4>
                          <p className="text-sm text-gray-600">
                            Cor: {item.cor.nome} | Código: {item.produto.codigo}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.produto.curva === 'A' ? 'bg-green-100 text-green-800' :
                          item.produto.curva === 'B' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Curva {item.produto.curva}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Solicitado:</span>
                          <p className="font-bold text-gray-900">{item.quantidadeSolicitada}m</p>
                        </div>
                        {item.quantidadeAprovada !== null && (
                          <div>
                            <span className="text-gray-600">Aprovado:</span>
                            <p className="font-bold text-green-700">{item.quantidadeAprovada}m</p>
                          </div>
                        )}
                        {item.quantidadeAtendida !== null && (
                          <div>
                            <span className="text-gray-600">Atendido:</span>
                            <p className="font-bold text-blue-700">{item.quantidadeAtendida}m</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Quantidades */}
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="font-medium text-gray-900 mb-3">Resumo de Quantidades</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Solicitado:</span>
                <p className="text-2xl font-bold text-gray-900">
                  {requisicao.items.reduce((sum, item) => sum + parseFloat(item.quantidadeSolicitada), 0).toFixed(1)}m
                </p>
              </div>
              {requisicao.items.some(item => item.quantidadeAprovada !== null) && (
                <div>
                  <span className="text-sm text-gray-600">Total Aprovado:</span>
                  <p className="text-2xl font-bold text-green-700">
                    {requisicao.items.reduce((sum, item) => sum + parseFloat(item.quantidadeAprovada || 0), 0).toFixed(1)}m
                  </p>
                </div>
              )}
              {requisicao.items.some(item => item.quantidadeAtendida !== null) && (
                <div>
                  <span className="text-sm text-gray-600">Total Atendido:</span>
                  <p className="text-2xl font-bold text-blue-700">
                    {requisicao.items.reduce((sum, item) => sum + parseFloat(item.quantidadeAtendida || 0), 0).toFixed(1)}m
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesRequisicaoModal;
