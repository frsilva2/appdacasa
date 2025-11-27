import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CriarEditarProdutoModal = ({ produto, onClose, onSuccess }) => {
  const isEdit = !!produto;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    categoria: 'Tecidos',
    precoAtacado: '',
    precoVarejo: '',
    curva: 'B',
    larguraMetros: '',
    composicao: '',
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo || '',
        nome: produto.nome || '',
        categoria: produto.categoria || 'Tecidos',
        precoAtacado: produto.precoAtacado || '',
        precoVarejo: produto.precoVarejo || '',
        curva: produto.curva || 'B',
        larguraMetros: produto.larguraMetros || '',
        composicao: produto.composicao || '',
      });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!formData.codigo || !formData.nome || !formData.precoAtacado || !formData.precoVarejo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const data = {
        ...formData,
        precoAtacado: parseFloat(formData.precoAtacado),
        precoVarejo: parseFloat(formData.precoVarejo),
        larguraMetros: formData.larguraMetros ? parseFloat(formData.larguraMetros) : null,
      };

      if (isEdit) {
        await api.put(`/produtos/${produto.id}`, data);
        alert('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', data);
        alert('Produto criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Código e Nome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código * <span className="text-xs text-gray-500">(ex: 4402, 2767)</span>
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    className="input"
                    placeholder="4402"
                    required
                    disabled={isEdit}
                  />
                  {isEdit && (
                    <p className="mt-1 text-xs text-gray-500">Código não pode ser alterado</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curva ABC *
                  </label>
                  <select
                    name="curva"
                    value={formData.curva}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="A">Curva A (Alta rotatividade)</option>
                    <option value="B">Curva B (Média rotatividade)</option>
                    <option value="C">Curva C (Baixa rotatividade)</option>
                  </select>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ex: CETIM TINTO, FILÓ PREMIUM..."
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Tecidos">Tecidos</option>
                  <option value="Aviamentos">Aviamentos</option>
                  <option value="Rendas">Rendas</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Atacado (R$/m) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precoAtacado"
                    value={formData.precoAtacado}
                    onChange={handleChange}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Varejo (R$/m) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precoVarejo"
                    value={formData.precoVarejo}
                    onChange={handleChange}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Largura e Composição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura (metros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="larguraMetros"
                    value={formData.larguraMetros}
                    onChange={handleChange}
                    className="input"
                    placeholder="1.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Composição
                  </label>
                  <input
                    type="text"
                    name="composicao"
                    value={formData.composicao}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ex: 100% Poliéster"
                  />
                </div>
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
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? 'Atualizar' : 'Criar Produto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarEditarProdutoModal;
