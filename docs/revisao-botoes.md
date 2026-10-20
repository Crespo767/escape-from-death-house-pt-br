# Revisão dos três controles — 20/10/2026

Foram extraídos e analisados os seis compêndios (atores, aventura, itens, diários, cenas e tabelas), com rastreamento das ações dos três botões e dos documentos alcançados por eles nas duas formas de importação. A revisão de comportamento ficou restrita a esses controles e ao teletransporte que a tranca habilita.

| Controle | Evidência encontrada | Correção |
| --- | --- | --- |
| Valsa | OGG Vorbis estéreo de 128 segundos e 3.101.152 bytes; reprodução sem espera pelo final, mas carregamento só no primeiro clique e cooldown de 3 segundos. Nenhum erro de decodificação encontrado. | Pré-carregar áudio nos clientes ao abrir a mansão e reduzir cooldown para 0,75 segundo. Manter `prevent: true`, `delay: false` e restrição à cena. Clicar enquanto a música toca continua sem reiniciá-la. |
| Tranca | Alvo existia, mas o aviso apenas dizia “alternado”; faltava proteção contra execuções simultâneas. Região da passagem limitada a 0–9, apesar do sótão estar na altura 30. Teletransporte copiava a altura de origem do token. | Resolver o alvo na própria cena, aguardar a gravação e informar “liberada” ou “trancada”. Região em 30–39 e alturas de destino 0 e 30. |
| Blecaute | Sequência intercalava lotes de luzes/sons com mudanças individuais de imagem; a primeira imagem tinha fade de 3 segundos que era aguardado pelo MATT. `toggle` independente podia inverter incorretamente luzes que o mestre já havia alterado. | Uma operação por coleção, sem fade obrigatório. Estado de blecaute explícito e recuperação persistente do estado anterior. |

O blecaute original acende nove luzes atmosféricas e apaga 24 luzes internas: apagar indiscriminadamente todas as luzes mudaria o efeito. Essa composição foi preservada. Apenas os cinco sons de lareira originalmente associados ao botão são afetados.

Os testes executam o código embutido nos tiles e simulações das APIs de documentos; verificam aventura e cenas avulsas, restauração após recarga, cliques concorrentes, estado inicial personalizado, alvos ausentes, falhas de gravação, bloqueio para jogadores e existência das mídias pré-carregadas. Os testes leem cópias dos bancos para evitar que a própria leitura altere os manifests LevelDB do repositório.

Não foi realizado teste audiovisual em uma sessão de mestre e jogador: o Foundry local estava com o mestre conectado a um mundo em uso. Portanto, os testes automatizados não constituem garantia de latência de rede, volume do navegador ou interação com todos os módulos desse mundo.

## Conferência em uma cena de teste

1. Atualize o módulo, aplique a macro às cenas existentes ou importe cenas novas e recarregue mestre e jogador.
2. Valsa: clique uma vez, confirme áudio nos dois clientes e ausência de sobreposição no segundo clique. Após os 128 segundos, confirme nova reprodução.
3. Tranca: alterne duas vezes e confira os avisos. Um token no térreo não deve descer à masmorra; no sótão, deve descer apenas com a passagem liberada. Confirme altura 0 no porão e 30 ao retornar.
4. Blecaute: clique uma vez e confira os quatro andares, luzes e lareiras; clique novamente e confira restauração. Repita com uma luz alterada manualmente, cliques rápidos e uma recarga entre ativar e desativar.

## Fontes primárias consultadas

- [Módulo original — Eidolon Publishing](https://github.com/Eidolon-Publishing/cosrl-escape-from-death-house).
- [Monk's Active Tile Triggers 13.06 — implementação das ações](https://github.com/ironmonk108/monks-active-tiles/blob/13.06/actions.js), também conferida com a instalação local.
- [MATT — Activate/Deactivate](https://github.com/ironmonk108/monks-module-wiki/wiki/MATT-Activate-Deactivate).
- [Foundry v13 — atualização de documentos da cena](https://foundryvtt.com/api/v13/classes/foundry.documents.Scene.html).
- [Foundry v13 — pré-carregamento de texturas](https://foundryvtt.com/api/v13/functions/foundry.canvas.loadTexture.html).
