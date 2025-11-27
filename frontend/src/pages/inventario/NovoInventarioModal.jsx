import { useState } from 'react';
import { X, Package } from 'lucide-react';
import api from '../../services/api';

const NovoInventarioModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'INVENTARIO',
    observacoes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tipo) {
      alert('Selecione o tipo de inventário');
      return;
    }

    try {
      setLoading(true);
      await api.post('/inventario', formData);
      alert('Inventário criado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar inventário:', error);
      alert(error.response?.data?.message || 'Erro ao criar inventário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Novo Inventário</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="space-y-6">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Inventário *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="INVENTARIO">Inventário Completo</option>
                <option value="CONFERENCIA">Conferência Parcial</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                " <strong>Inventário Completo:</strong> Contagem geral de todo o estoque
                <br />
                " <strong>Conferência Parcial:</strong> Verificação de itens específicos
              </p>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Digite observações sobre este inventário (opcional)"
              />
            </div>

            {/* Informações */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">9 Próximos Passos:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Após criar, o inventário ficará com status "Em Andamento"</li>
                <li>Adicione itens usando OCR de etiquetas ou entrada manual</li>
                <li>Revise as divergências encontradas</li>
                <li>Finalize para atualizar o estoque automaticamente</li>
              </ol>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar Inventário'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoInventarioModal;
