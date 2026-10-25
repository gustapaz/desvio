# Desvio ↗

Um planejador de metrô para **Vila Brisa**, uma cidade inventada. Explore o mapa, escolha uma partida e uma chegada e descubra como pequenas mudanças nas opções alteram o caminho.

**[Abrir demonstração](https://gustapaz.github.io/desvio/)** · [Código](https://github.com/gustapaz/desvio)

![Mapa e planejador do Desvio](docs/mapa.jpg)

## O que dá para fazer

- Explorar 17 estações em três linhas, com detalhes de bairro, saídas e acessos.
- Calcular menor tempo ou menos baldeações, inverter o sentido e acompanhar o itinerário no mapa.
- Pedir acesso sem escadas na partida, chegada e troca de linha. O trem pode passar por estações com escadas.
- Simular a interrupção Central–Jardim nos dois sentidos e encontrar outro caminho.
- Buscar estações e bairros, inclusive sem digitar acentos, e filtrar por linha.
- Guardar até seis itinerários neste navegador, reabri-los, remover e desfazer a última remoção.
- Baixar um itinerário em texto, com direções, estimativas e contexto de demonstração.
- Ampliar o mapa e percorrê-lo por rolagem nativa. No celular, a lista oferece uma alternativa ao desenho.

## Stack e execução

Preact 10, TypeScript 6 e Vite 8. SVG para o desenho, botões HTML sobre as estações, CSS próprio e fontes locais Space Grotesk e IBM Plex Mono. Vitest verifica o domínio; Prettier mantém a formatação. O lockfile fixa as versões resolvidas.

Requer Node.js 24 e npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run check
npm test
npm run build
npm run preview -- --host 127.0.0.1
```

O endereço local usa `/desvio/`. O build estático fica em `dist/`; o workflow testa e publica essa pasta no GitHub Pages. As três áreas usam estado de interface na mesma URL, portanto o refresh abre o mapa sem depender de fallback de rotas do servidor.

## Dados e cálculo

Todos os lugares, serviços e tempos são fixtures originais em `src/network.ts`. Não existe integração com transporte real. O cálculo percorre o grafo por estação e linha, considerando três minutos de espera inicial e quatro minutos por troca. “Menos baldeações” prioriza a quantidade de trocas e depois o tempo. O grafo é pequeno e os tempos são positivos e limitados. Não inclui caminhada externa, elevadores fora de serviço, atrasos ou disponibilidade real.

O mapa é esquemático: distâncias e posições não são geográficas. A linha branca tracejada destaca o caminho calculado; números e nomes de linhas acompanham as cores. As obras só passam a valer no resultado quando o visitante calcula novamente.

## Privacidade, custo e limites

O aplicativo usa apenas arquivos estáticos e armazenamento local (`desvio:routes:1`). Sem conta, backend, API de aplicação, banco, análise de tráfego ou serviços pagos. GitHub Pages hospeda a demonstração pública. Não foi ativado faturamento nem cadastrado cartão.

Bilhetes não sincronizam entre dispositivos; apagar os dados do navegador remove a coleção. Se o armazenamento estiver indisponível, um aviso informa que os bilhetes ficam apenas na sessão. A última gravação prevalece entre abas. Não há cache offline garantido. Os arquivos TXT são gerados no dispositivo.

## Qualidade

Treze testes verificam conexão de todos os pares de estações com e sem obras, continuidade dos trechos, sentidos, tempos, baldeações, acessibilidade dos acessos, exportação e leitura defensiva do armazenamento. Foram inspecionados desktop, tablet e celular, teclado, foco dos detalhes, erros de formulário, busca, filtros, bilhetes e download. Veja [o registro de validação](docs/validacao.md).

HTML em português, landmarks, rótulos nativos, foco visível, região de status, link de salto, navegação sem depender apenas da cor e movimento reduzido. Metadados sociais e canonical apontam à demonstração. A introdução HTML e o aviso sem JavaScript são estáticos; a experiência completa é renderizada no cliente. Não há promessa de indexação individual dos trajetos nem certificação de acessibilidade. Não foram atribuídas notas de Lighthouse.

## Direção visual

O mapa é a superfície principal. Sinalização de transporte, papel claro, tinta ameixa, linhas coloridas e um bilhete amarelo perfurado formam a identidade. O guia usa uma lista numerada; a coleção guarda bilhetes com pequenas rotações. O movimento explica o trajeto e a escala, respeitando `prefers-reduced-motion`. A [direção visual](docs/design.md) registra as diferenças em relação aos projetos anteriores.

## Licenças

Código e desenhos originais: MIT, Gustavo Paz. As fontes locais têm licença SIL Open Font License 1.1, preservada em [Space Grotesk](docs/LICENSE-SpaceGrotesk.txt) e [IBM Plex Mono](docs/LICENSE-IBMPlexMono.txt). As licenças das dependências permanecem nos pacotes instalados. Não há fotos, tiles de mapas ou ícones de serviços externos.
