import { X, Calendar, User, Package, DollarSign, MapPin, CreditCard, Truck, Clock } from 'lucide-react';
import { getUrlFotoCor } from '../../services/assets';

const DetalhesPedidoModal = ({ pedido, onClose }) => {
  const getColorImageUrl = (cor) => {
    const fileName = cor.arquivoImagem || cor.arquivo_imagem;
    if (!fileName) return null;
    return getUrlFotoCor(fileName);
  };
  const getStatusBadge = (status) => {
    const badges = {
      PENDENTE: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      APROVADA: { label: 'Aprovada', class: 'bg-green-100 text-green-800' },
      RECUSADA: { label: 'Recusada', class: 'bg-red-100 text-red-800' },
      EM_SEPARACAO: { label: 'Em Separação', class: 'bg-blue-100 text-blue-800' },
      ENVIADA: { label: 'Enviada', class: 'bg-purple-100 text-purple-800' },
      ENTREGUE: { label: 'Entregue', class: 'bg-teal-100 text-teal-800' },
      CANCELADA: { label: 'Cancelada', class: 'bg-gray-100 text-gray-800' },
    };
    const badge = badges[status] || badges.PENDENTE;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header com gradiente Polaroid */}
        <div className="bg-gradient-to-r from-pink-500 to-blue-600 p-6 rounded-t-lg">
          <div className="flex items-start justify-between text-white">
            <div>
              <h2 className="text-3xl font-bold mb-2">{pedido.numero}</h2>
              <p className="text-pink-100">
                Cliente: {pedido.cliente.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(pedido.status)}
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
                <p className="text-sm text-gray-600">Data do Pedido</p>
                <p className="font-semibold">
                  {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="font-semibold text-green-600">
                  R$ {parseFloat(pedido.valorTotal).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Package className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total de Itens</p>
                <p className="font-semibold">{pedido.items.length} produto(s)</p>
              </div>
            </div>
          </div>

          {/* Datas Importantes */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-blue-500" />
              Datas Importantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Data do Pedido:</p>
                <p className="font-semibold">
                  {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {pedido.dataAprovacao && (
                <div>
                  <p className="text-gray-600">Data de Aprovação:</p>
                  <p className="font-semibold">
                    {new Date(pedido.dataAprovacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {pedido.dataPrevisaoEntrega && (
                <div>
                  <p className="text-gray-600">Previsão de Entrega:</p>
                  <p className="font-semibold text-blue-600">
                    {new Date(pedido.dataPrevisaoEntrega).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {pedido.dataEnvio && (
                <div>
                  <p className="text-gray-600">Data de Envio:</p>
                  <p className="font-semibold">
                    {new Date(pedido.dataEnvio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {pedido.dataEntrega && (
                <div>
                  <p className="text-gray-600">Data de Entrega:</p>
                  <p className="font-semibold text-green-600">
                    {new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User size={20} className="text-gray-700" />
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Nome:</p>
                <p className="font-semibold">{pedido.cliente.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-semibold">{pedido.cliente.email}</p>
              </div>
              {pedido.cliente.cnpj && (
                <div>
                  <p className="text-gray-600">CNPJ:</p>
                  <p className="font-semibold">{pedido.cliente.cnpj}</p>
                </div>
              )}
              {pedido.cliente.ie && (
                <div>
                  <p className="text-gray-600">IE:</p>
                  <p className="font-semibold">{pedido.cliente.ie}</p>
                </div>
              )}
              {pedido.cliente.telefone && (
                <div>
                  <p className="text-gray-600">Telefone:</p>
                  <p className="font-semibold">{pedido.cliente.telefone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin size={20} className="text-purple-500" />
              Endereço de Entrega
            </h3>
            <p className="text-gray-700">{pedido.enderecoEntrega}</p>
          </div>

          {/* Forma de Pagamento */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard size={20} className="text-green-500" />
              Forma de Pagamento
            </h3>
            <p className="text-gray-700 font-semibold">{pedido.formaPagamento}</p>
          </div>

          {/* Rastreio */}
          {pedido.numeroRastreio && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Truck size={20} className="text-blue-500" />
                Informações de Rastreio
              </h3>
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Código de Rastreio:</p>
                <p className="text-lg font-mono font-semibold text-blue-600 mb-2">
                  {pedido.numeroRastreio}
                </p>
                {pedido.transportadora && (
                  <>
                    <p className="text-gray-600 mb-1">Transportadora:</p>
                    <p className="font-semibold">{pedido.transportadora}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Observações */}
          {pedido.observacoes && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Observações:</h3>
              <p className="text-gray-700">{pedido.observacoes}</p>
            </div>
          )}

          {/* Motivos */}
          {pedido.motivoRecusa && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Motivo da Recusa:</h3>
              <p className="text-gray-700">{pedido.motivoRecusa}</p>
            </div>
          )}

          {pedido.motivoCancelamento && (
            <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-500 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Motivo do Cancelamento:</h3>
              <p className="text-gray-700">{pedido.motivoCancelamento}</p>
            </div>
          )}

          {/* Produtos */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Produtos do Pedido</h3>

            <div className="space-y-3">
              {pedido.items.map((item) => {
                const subtotal = parseFloat(item.precoUnitario) * item.quantidade;

                return (
                  <div key={item.id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
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
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            {item.produto.nome}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Cor: {item.cor.nome}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-600">Subtotal</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t text-sm">
                      <div>
                        <p className="text-gray-600">Quantidade</p>
                        <p className="font-semibold">{item.quantidade}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Preço Unitário</p>
                        <p className="font-semibold">R$ {parseFloat(item.precoUnitario).toFixed(2)}/m</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-semibold text-green-600">R$ {subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Final */}
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Valor Total do Pedido</p>
                <p className="text-sm text-gray-500">
                  {pedido.items.length} produto(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">
                  R$ {parseFloat(pedido.valorTotal).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <button onClick={onClose} className="btn-primary w-full">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalhesPedidoModal;
