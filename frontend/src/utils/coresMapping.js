/**
 * Mapeamento de nomes de cores para seus respectivos arquivos de imagem
 * Os arquivos seguem o padrão: nomecor_codigo.jpg
 *
 * Total: 48 cores mapeadas
 */

// Mapeamento direto: nome da cor (normalizado) -> { arquivo, codigo }
const CORES_MAPPING = {
  // Amarelos (4)
  'amarelo dourado': { arquivo: 'amarelodourado_561.jpg', codigo: '561' },
  'amarelo mostarda': { arquivo: 'amarelomostarda_517.jpg', codigo: '517' },
  'amarelo ouro': { arquivo: 'amareloouro_506.jpg', codigo: '506' },
  'amarelo pastel': { arquivo: 'amarelopastel_519.jpg', codigo: '519' },

  // Azuis (6)
  'azul bebe': { arquivo: 'azulbebe_705.jpg', codigo: '705' },
  'azul bebê': { arquivo: 'azulbebe_705.jpg', codigo: '705' },
  'azul celeste': { arquivo: 'azulceleste_771.jpg', codigo: '771' },
  'azul marinho': { arquivo: 'azulmarinho_975.jpg', codigo: '975' },
  'azul marinho noite': { arquivo: 'azulmarinhonoite_988.jpg', codigo: '988' },
  'azul royal': { arquivo: 'azulroyal_775.jpg', codigo: '775' },
  'azul serenity': { arquivo: 'azulserenity_719.jpg', codigo: '719' },

  // Beges (4)
  'bege marfim': { arquivo: 'begemarfim_203.jpg', codigo: '203' },
  'bege medio': { arquivo: 'begemedio_218.jpg', codigo: '218' },
  'bege médio': { arquivo: 'begemedio_218.jpg', codigo: '218' },
  'bege nude': { arquivo: 'begenude_214.jpg', codigo: '214' },
  'nude': { arquivo: 'begenude_214.jpg', codigo: '214' },

  // Branco (1)
  'branco': { arquivo: 'branco_100.jpg', codigo: '100' },

  // Cinzas (4)
  'cinza': { arquivo: 'cinza_903.jpg', codigo: '903' },
  'cinza claro': { arquivo: 'cinzaclaro_901.jpg', codigo: '901' },
  'cinza escuro': { arquivo: 'cinzaescuro_906.jpg', codigo: '906' },
  'cinza grafite': { arquivo: 'cinzagrafite_912.jpg', codigo: '912' },

  // Laranja (1)
  'laranja': { arquivo: 'laranja_423.jpg', codigo: '423' },

  // Lilás (1)
  'lilas': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilás': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilas claro': { arquivo: 'lilas_364.jpg', codigo: '364' },
  'lilás claro': { arquivo: 'lilas_364.jpg', codigo: '364' },

  // Marrons (3)
  'marrom': { arquivo: 'marrom_835.jpg', codigo: '835' },
  'marrom caramelo': { arquivo: 'marrom_caramelo_227.jpg', codigo: '227' },
  'caramelo': { arquivo: 'marrom_caramelo_227.jpg', codigo: '227' },
  'marrom cafe': { arquivo: 'marromcafe_860.jpg', codigo: '860' },
  'marrom café': { arquivo: 'marromcafe_860.jpg', codigo: '860' },

  // Marsala (1)
  'marsala': { arquivo: 'marsala_469.jpg', codigo: '469' },
  'vinho marsala': { arquivo: 'marsala_469.jpg', codigo: '469' },

  // Off-white (2)
  'off': { arquivo: 'off_200.jpg', codigo: '200' },
  'off white': { arquivo: 'off_200.jpg', codigo: '200' },
  'off-white': { arquivo: 'off_200.jpg', codigo: '200' },
  'off amarelado': { arquivo: 'offamarelado_204.jpg', codigo: '204' },

  // Preto (1)
  'preto': { arquivo: 'preto_999.jpg', codigo: '999' },

  // Rosas (4)
  'rosa antigo': { arquivo: 'rosaantigo_324.jpg', codigo: '324' },
  'rosa bebe': { arquivo: 'rosabebe_305.jpg', codigo: '305' },
  'rosa bebê': { arquivo: 'rosabebe_305.jpg', codigo: '305' },
  'rosa claro': { arquivo: 'rosaclaro_315.jpg', codigo: '315' },
  'rosa pink': { arquivo: 'rosapink_325.jpg', codigo: '325' },

  // Roxo (1)
  'roxo': { arquivo: 'roxo_376.jpg', codigo: '376' },

  // Salmão (1)
  'salmao': { arquivo: 'salmao_404.jpg', codigo: '404' },
  'salmão': { arquivo: 'salmao_404.jpg', codigo: '404' },

  // Terracota (1)
  'terracota': { arquivo: 'terracota_446.jpg', codigo: '446' },

  // Vermelhos (2)
  'vermelho': { arquivo: 'vemelho_460.jpg', codigo: '460' },
  'vermelho escuro': { arquivo: 'vermelhoescuro_465.jpg', codigo: '465' },

  // Verdes (7)
  'verde agua': { arquivo: 'verdeagua_604.jpg', codigo: '604' },
  'verde água': { arquivo: 'verdeagua_604.jpg', codigo: '604' },
  'verde azeitona': { arquivo: 'verdeazeitona_665.jpg', codigo: '665' },
  'verde bandeira': { arquivo: 'verdebadeira_640.jpg', codigo: '640' },
  'verde floresta': { arquivo: 'verdefloresta_680.jpg', codigo: '680' },
  'verde menta': { arquivo: 'verdementa_610.jpg', codigo: '610' },
  'verde musgo': { arquivo: 'verdemusgo_667.jpg', codigo: '667' },
  'verde oliva': { arquivo: 'verdeoliva_648.jpg', codigo: '648' },

  // Vinho (1)
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

// Lista de todas as cores únicas (48 cores)
export const LISTA_CORES = [
  { nome: 'Amarelo Dourado', codigo: '561', arquivo: 'amarelodourado_561.jpg' },
  { nome: 'Amarelo Mostarda', codigo: '517', arquivo: 'amarelomostarda_517.jpg' },
  { nome: 'Amarelo Ouro', codigo: '506', arquivo: 'amareloouro_506.jpg' },
  { nome: 'Amarelo Pastel', codigo: '519', arquivo: 'amarelopastel_519.jpg' },
  { nome: 'Azul Bebê', codigo: '705', arquivo: 'azulbebe_705.jpg' },
  { nome: 'Azul Celeste', codigo: '771', arquivo: 'azulceleste_771.jpg' },
  { nome: 'Azul Marinho', codigo: '975', arquivo: 'azulmarinho_975.jpg' },
  { nome: 'Azul Marinho Noite', codigo: '988', arquivo: 'azulmarinhonoite_988.jpg' },
  { nome: 'Azul Royal', codigo: '775', arquivo: 'azulroyal_775.jpg' },
  { nome: 'Azul Serenity', codigo: '719', arquivo: 'azulserenity_719.jpg' },
  { nome: 'Bege Marfim', codigo: '203', arquivo: 'begemarfim_203.jpg' },
  { nome: 'Bege Médio', codigo: '218', arquivo: 'begemedio_218.jpg' },
  { nome: 'Bege Nude', codigo: '214', arquivo: 'begenude_214.jpg' },
  { nome: 'Branco', codigo: '100', arquivo: 'branco_100.jpg' },
  { nome: 'Caramelo', codigo: '227', arquivo: 'marrom_caramelo_227.jpg' },
  { nome: 'Cinza', codigo: '903', arquivo: 'cinza_903.jpg' },
  { nome: 'Cinza Claro', codigo: '901', arquivo: 'cinzaclaro_901.jpg' },
  { nome: 'Cinza Escuro', codigo: '906', arquivo: 'cinzaescuro_906.jpg' },
  { nome: 'Cinza Grafite', codigo: '912', arquivo: 'cinzagrafite_912.jpg' },
  { nome: 'Laranja', codigo: '423', arquivo: 'laranja_423.jpg' },
  { nome: 'Lilás', codigo: '364', arquivo: 'lilas_364.jpg' },
  { nome: 'Marrom', codigo: '835', arquivo: 'marrom_835.jpg' },
  { nome: 'Marrom Café', codigo: '860', arquivo: 'marromcafe_860.jpg' },
  { nome: 'Marsala', codigo: '469', arquivo: 'marsala_469.jpg' },
  { nome: 'Nude', codigo: '214', arquivo: 'begenude_214.jpg' },
  { nome: 'Off-White', codigo: '200', arquivo: 'off_200.jpg' },
  { nome: 'Off Amarelado', codigo: '204', arquivo: 'offamarelado_204.jpg' },
  { nome: 'Preto', codigo: '999', arquivo: 'preto_999.jpg' },
  { nome: 'Rosa Antigo', codigo: '324', arquivo: 'rosaantigo_324.jpg' },
  { nome: 'Rosa Bebê', codigo: '305', arquivo: 'rosabebe_305.jpg' },
  { nome: 'Rosa Claro', codigo: '315', arquivo: 'rosaclaro_315.jpg' },
  { nome: 'Rosa Claro 303', codigo: '303', arquivo: 'rosaclaro_303.jpg' },
  { nome: 'Rosa Pink', codigo: '325', arquivo: 'rosapink_325.jpg' },
  { nome: 'Roxo', codigo: '376', arquivo: 'roxo_376.jpg' },
  { nome: 'Salmão', codigo: '404', arquivo: 'salmao_404.jpg' },
  { nome: 'Terracota', codigo: '446', arquivo: 'terracota_446.jpg' },
  { nome: 'Verde Água', codigo: '604', arquivo: 'verdeagua_604.jpg' },
  { nome: 'Verde Azeitona', codigo: '665', arquivo: 'verdeazeitona_665.jpg' },
  { nome: 'Verde Bandeira', codigo: '640', arquivo: 'verdebadeira_640.jpg' },
  { nome: 'Verde Floresta', codigo: '680', arquivo: 'verdefloresta_680.jpg' },
  { nome: 'Verde Menta', codigo: '610', arquivo: 'verdementa_610.jpg' },
  { nome: 'Verde Musgo', codigo: '667', arquivo: 'verdemusgo_667.jpg' },
  { nome: 'Verde Oliva', codigo: '648', arquivo: 'verdeoliva_648.jpg' },
  { nome: 'Vermelho', codigo: '460', arquivo: 'vemelho_460.jpg' },
  { nome: 'Vermelho Escuro', codigo: '465', arquivo: 'vermelhoescuro_465.jpg' },
  { nome: 'Vinho', codigo: '475', arquivo: 'vinho_475.jpg' },
  { nome: 'Vinho Marsala', codigo: '469', arquivo: 'marsala_469.jpg' },
  { nome: 'Lilás Claro', codigo: '364', arquivo: 'lilas_364.jpg' },
];

export default {
  normalizarNomeCor,
  getInfoCor,
  getCodigoCor,
  getArquivoImagemCor,
  CORES_MAPPING,
  LISTA_CORES,
};
