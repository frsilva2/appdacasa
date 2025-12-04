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
  const [modoCamera, setModoCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processarArquivo(file);
    }
  };

  const processarArquivo = async (file) => {
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

    // PROCESSAR OCR AUTOMATICAMENTE
    await processarOCRAutomatico(file);
  };

  const processarOCRAutomatico = async (file) => {
    try {
      setProcessando(true);
      setErro(null);

      const response = await uploadEProcessarOCR(file);

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
    pararCamera();
    setArquivo(null);
    setPreview(null);
    setResultado(null);
    setErro(null);
    setModoCamera(false);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const iniciarCamera = async () => {
    try {
      setErro(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Câmera traseira em mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      setModoCamera(true);

      // Aguardar o videoRef estar disponível
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setErro('Erro ao acessar a câmera. Verifique as permissões do navegador.');
    }
  };

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setModoCamera(false);
  };

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Configurar dimensões do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob e criar arquivo
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'captura-camera.jpg', { type: 'image/jpeg' });

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setArquivo(file);
      pararCamera();

      // PROCESSAR OCR AUTOMATICAMENTE após captura
      await processarOCRAutomatico(file);
    }, 'image/jpeg', 0.95);
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
      {/* Modo Câmera */}
      {modoCamera && !preview ? (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border-2 border-primary bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />

            {/* Guias de captura */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50" />
            </div>

            {/* Instruções */}
            <div className="absolute top-4 left-0 right-0 text-center">
              <div className="inline-block bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Posicione a etiqueta dentro do quadrado</p>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            <button
              onClick={capturarFoto}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-6 h-6" />
              Capturar Foto
            </button>

            <button
              onClick={pararCamera}
              className="px-6 py-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : !preview ? (
        <>
          {/* Botões de Modo */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={iniciarCamera}
              className="flex flex-col items-center gap-3 p-6 border-2 border-primary bg-primary bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all group"
            >
              <Camera className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-gray-900">Tirar Foto</p>
                <p className="text-sm text-gray-600">Use a câmera</p>
              </div>
            </button>

            <button
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <Upload className="w-10 h-10 text-gray-500 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-bold text-gray-900">Upload</p>
                <p className="text-sm text-gray-600">Escolher arquivo</p>
              </div>
            </button>
          </div>

          {/* Área de Drag and Drop */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Ou arraste uma imagem aqui (máx. 5MB)
            </p>
          </div>
        </>
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
