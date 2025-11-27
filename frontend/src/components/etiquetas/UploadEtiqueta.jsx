import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, XCircle, Camera, FileText } from 'lucide-react';
import { uploadEProcessarOCR } from '../../services/assets';

/**
 * Componente para upload e processamento OCR de etiquetas
 * @param {Function} onOCRComplete - Callback quando OCR for concluído com sucesso
 * @param {Function} onErro - Callback quando ocorrer erro
 */
const UploadEtiqueta = ({ onOCRComplete, onErro }) => {
  const [arquivo, setArquivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const processarArquivo = (file) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5MB');
      return;
    }

    setArquivo(file);
    setErro(null);
    setResultado(null);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessarOCR = async () => {
    if (!arquivo) return;

    try {
      setProcessando(true);
      setErro(null);

      const response = await uploadEProcessarOCR(arquivo);

      setResultado(response.data);

      // Chamar callback com dados extraídos
      if (onOCRComplete) {
        onOCRComplete(response.data);
      }
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      const mensagemErro = error.response?.data?.message || 'Erro ao processar imagem';
      setErro(mensagemErro);

      if (onErro) {
        onErro(mensagemErro);
      }
    } finally {
      setProcessando(false);
    }
  };

  const handleReset = () => {
    setArquivo(null);
    setPreview(null);
    setResultado(null);
    setErro(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      processarArquivo(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {!preview ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />

          <p className="text-gray-600 mb-2">
            Clique para selecionar ou arraste uma imagem
          </p>
          <p className="text-sm text-gray-500">
            Formatos: JPG, PNG (máx. 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview da Imagem */}
          <div className="relative rounded-lg overflow-hidden border border-gray-300">
            <img
              src={preview}
              alt="Preview da etiqueta"
              className="w-full h-auto max-h-96 object-contain bg-gray-100"
            />

            {/* Badge de Status */}
            {processando && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                  <p className="text-gray-700 font-medium">Processando OCR...</p>
                  <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
                </div>
              </div>
            )}

            {resultado && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">OCR Concluído</span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            {!resultado && !processando && (
              <button
                onClick={handleProcessarOCR}
                disabled={processando}
                className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Processar OCR
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {resultado ? 'Nova Imagem' : 'Cancelar'}
            </button>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Erro ao processar</p>
                <p className="text-sm text-red-600 mt-1">{erro}</p>
              </div>
            </div>
          )}

          {/* Resultado do OCR */}
          {resultado && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Dados Extraídos</h3>
              </div>

              {/* Informações Estruturadas */}
              <div className="grid grid-cols-2 gap-4">
                {resultado.ocr.informacoesExtraidas.metragem && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Metragem</p>
                    <p className="font-semibold text-gray-900">
                      {resultado.ocr.informacoesExtraidas.metragem} m
                    </p>
                  </div>
                )}

                {resultado.ocr.informacoesExtraidas.quantidade && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Quantidade</p>
                    <p className="font-semibold text-gray-900">
                      {resultado.ocr.informacoesExtraidas.quantidade}
                    </p>
                  </div>
                )}

                {resultado.ocr.informacoesExtraidas.preco && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Preço</p>
                    <p className="font-semibold text-gray-900">
                      R$ {resultado.ocr.informacoesExtraidas.preco}
                    </p>
                  </div>
                )}

                {resultado.ocr.informacoesExtraidas.codigo && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Código</p>
                    <p className="font-semibold text-gray-900 font-mono">
                      {resultado.ocr.informacoesExtraidas.codigo}
                    </p>
                  </div>
                )}
              </div>

              {/* Confiança Média */}
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Confiança do OCR</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${resultado.ocr.confiancaMedia}%` }}
                    />
                  </div>
                  <span className="font-semibold text-gray-900">
                    {resultado.ocr.confiancaMedia.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Texto Completo (colapsável) */}
              <details className="bg-white rounded-lg p-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Ver texto completo extraído
                </summary>
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                    {resultado.ocr.textoCompleto}
                  </pre>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadEtiqueta;
