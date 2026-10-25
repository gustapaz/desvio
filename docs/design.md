# Direção visual

Desvio trata a interface como um mapa de metrô e o resultado como um bilhete de papel. O traço de rede ocupa a maior superfície; o visitante pode entrar pelo desenho ou pelo guia textual. Três cores, códigos numéricos, círculo de conexão e marcadores A/B explicam a rede. O rio é uma forma de orientação ilustrativa, sem significado geográfico.

## Comparação com o portfólio

Quadra é um tabuleiro de jogo azul em Flutter; Prorroga explora faixas e placares de basquete em Lit. Margem é uma folha pautada de escrita em Elm, com ferramentas na base. Seus registros de direção e composições foram consultados. Desvio usa Preact, topologia de linhas, estações selecionáveis, uma escala de mapa e um itinerário perfurado ao lado. Não reutiliza shell ou CSS desses projetos. A lista de estações e os bilhetes também têm composições próprias, em vez de repetirem o mapa como uma coleção genérica de cards.

## Tipografia e movimento

Space Grotesk dá ritmo à sinalização; IBM Plex Mono identifica códigos e pequenas notas. Tinta ameixa sobre papel claro mantém a leitura, e amarelo destaca o planejador. As cores das linhas são acompanhadas por códigos e nomes. O caminho recebe um traço claro breve ao calcular; não existe animação contínua, captura de rolagem ou carrossel. Movimento reduzido remove animações e transições.

## Responsividade e acesso

No desktop, mapa e bilhete dividem a superfície. Até 900 px, o mapa ocupa a largura; até 480 px, o planejador e o resultado formam um bilhete vertical. A rede mantém uma largura mínima legível dentro de uma região com rolagem nativa, sem alargar o documento. A ampliação preserva essa proporção. A lista por linha é a alternativa textual.

Estações são botões HTML nomeados, não pontos acessíveis apenas pelo SVG. Detalhes recebem foco ao abrir e devolvem foco à estação ao fechar ou usar Escape. Partida e chegada possuem selects nativos; erros são anunciados. Não há janela modal nem armadilha de foco. O mapa em si não afirma representar uma rota real.
