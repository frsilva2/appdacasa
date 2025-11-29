/**
 * Mapeamento de nomes de cores para seus respectivos arquivos de imagem
 * Os arquivos seguem o padrão: nomecor_codigo.jpg
 *
 * Este mapeamento é necessário porque o campo arquivoImagem não está
 * preenchido no banco de dados para todas as cores.
 */

// Mapeamento direto: nome da cor (normalizado) -> { arquivo, codigo }
const CORES_MAPPING = {
  'amarelo dourado': { arquivo: 'amarelodourado_561.jpg', codigo: '561' },
  'amarelo mostarda': { arquivo: 'amarelomostarda_517.jpg', codigo: '517' },
  'amarelo ouro': { arquivo: 'amareloouro_506.jpg', codigo: '506' },
  'amarelo pastel': { arquivo: 'amarelopastel_519.jpg', codigo: '519' },
  'azul bebe': { arquivo: 'azulbebe_705.jpg', codigo: '705' },
  'azul bebê': { arquivo: 'azulbebe_705.jpg', codigo: '705' },
  'azul celeste': { arquivo: 'azulceleste_771.jpg', codigo: '771' },
  'azul marinho': { arquivo: 'azulmarinho_975.jpg', codigo: '975' },
  'azul marinho noite': { arquivo: 'azulmarinhonoite_988.jpg', codigo: '988' },
  'azul royal': { arquivo: 'azulroyal_775.jpg', codigo: '775' },
  'azul serenity': { arquivo: 'azulserenity_719.jpg', codigo: '719' },
  'bege marfim': { arquivo: 'begemarfim_203.jpg', codigo: '203' },
  'bege medio': { arquivo: 'begemedio_218.jpg', codigo: '218' },
  'bege médio': { arquivo: 'begemedio_218.jpg', codigo: '218' },
  'bege nude': { arquivo: 'begenude_214.jpg', codigo: '214' },
  'nude': { arquivo: 'begenude_214.jpg', codigo: '214' },
  'branco': { arquivo: 'branco_100.jpg', codigo: '100' },
  'cinza': { arquivo: 'cinza_903.jpg', codigo: '903' },
  'cinza claro': { arquivo: 'cinzaclaro_901.jpg', codigo: '901' },
  'cinza escuro': { arquivo: 'cinzaescuro_906.jpg', codigo: '906' },
  'cinza grafite': { arquivo: 'cinzagrafite_912.jpg', codigo: '912' },
  'laranja': { arquivo: 'laranja_423.jpg', codigo: '423' },
  'lilas': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilás': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilas claro': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilás claro': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'marrom': { arquivo: 'marrom_835.jpg', codigo: '835' },
  'marrom caramelo': { arquivo: 'marrom_caramelo_227.jpg', codigo: '227' },
  'caramelo': { arquivo: 'marrom_caramelo_227.jpg', codigo: '227' },
  'marrom cafe': { arquivo: 'marromcafe_860.jpg', codigo: '860' },
  'marrom café': { arquivo: 'marromcafe_860.jpg', codigo: '860' },
  'marsala': { arquivo: 'marsala_469.jpg', codigo: '469' },
  'vinho marsala': { arquivo: 'marsala_469.jpg', codigo: '469' },
  'off': { arquivo: 'off_200.jpg', codigo: '200' },
  'off white': { arquivo: 'off_200.jpg', codigo: '200' },
  'off-white': { arquivo: 'off_200.jpg', codigo: '200' },
  'off amarelado': { arquivo: 'offamarelado_204.jpg', codigo: '204' },
  'preto': { arquivo: 'preto_999.jpg', codigo: '999' },
  'rosa antigo': { arquivo: 'rosaantigo_324.jpg', codigo: '324' },
  'rosa bebe': { arquivo: 'rosabebe_305.jpg', codigo: '305' },
  'rosa bebê': { arquivo: 'rosabebe_305.jpg', codigo: '305' },
  'rosa claro': { arquivo: 'rosaclaro_315.jpg', codigo: '315' },
  'rosa pink': { arquivo: 'rosapink_325.jpg', codigo: '325' },
  'roxo': { arquivo: 'roxo_376.jpg', codigo: '376' },
  'salmao': { arquivo: 'salmao_404.jpg', codigo: '404' },
  'salmão': { arquivo: 'salmao_404.jpg', codigo: '404' },
  'terracota': { arquivo: 'terracota_446.jpg', codigo: '446' },
  'vermelho': { arquivo: 'vemelho_460.jpg', codigo: '460' },
  'verde agua': { arquivo: 'verdeagua_604.jpg', codigo: '604' },
  'verde água': { arquivo: 'verdeagua_604.jpg', codigo: '604' },
  'verde azeitona': { arquivo: 'verdeazeitona_665.jpg', codigo: '665' },
  'verde bandeira': { arquivo: 'verdebadeira_640.jpg', codigo: '640' },
  'verde floresta': { arquivo: 'verdefloresta_680.jpg', codigo: '680' },
  'verde menta': { arquivo: 'verdementa_610.jpg', codigo: '610' },
  'verde musgo': { arquivo: 'verdemusgo_667.jpg', codigo: '667' },
  'verde oliva': { arquivo: 'verdeoliva_648.jpg', codigo: '648' },
  'vermelho escuro': { arquivo: 'vermelhoescuro_465.jpg', codigo: '465' },
  'vinho': { arquivo: 'vinho_475.jpg', codigo: '475' },
};

/**
 * Normaliza o nome da cor (remove acentos, converte para minúsculas)
 * @param {string} nome - Nome da cor
 * @returns {string} Nome normalizado
 */
export const normalizarNomeCor = (nome) => {
  if (!nome) return '';
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
};

/**
 * Obtém informações da cor pelo nome
 * @param {string} nomeCor - Nome da cor
 * @returns {{ arquivo: string, codigo: string } | null} Informações da cor ou null
 */
export const getInfoCor = (nomeCor) => {
  if (!nomeCor) return null;

  const nomeNormalizado = normalizarNomeCor(nomeCor);

  // Busca direta
  if (CORES_MAPPING[nomeNormalizado]) {
    return CORES_MAPPING[nomeNormalizado];
  }

  // Busca parcial (para casos como "Rosa Claro" -> "rosa claro")
  for (const [key, value] of Object.entries(CORES_MAPPING)) {
    if (nomeNormalizado.includes(key) || key.includes(nomeNormalizado)) {
      return value;
    }
  }

  return null;
};

/**
 * Obtém o código da cor (3 dígitos) pelo nome
 * @param {string} nomeCor - Nome da cor
 * @returns {string} Código da cor ou string vazia
 */
export const getCodigoCor = (nomeCor) => {
  const info = getInfoCor(nomeCor);
  return info?.codigo || '';
};

/**
 * Obtém o nome do arquivo da imagem pelo nome da cor
 * @param {string} nomeCor - Nome da cor
 * @returns {string | null} Nome do arquivo ou null
 */
export const getArquivoImagemCor = (nomeCor) => {
  const info = getInfoCor(nomeCor);
  return info?.arquivo || null;
};

export default {
  normalizarNomeCor,
  getInfoCor,
  getCodigoCor,
  getArquivoImagemCor,
  CORES_MAPPING,
};
