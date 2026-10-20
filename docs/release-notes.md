Correções dos controles da Mansão Durst no Foundry VTT v13:

- **Blecaute sobrenatural:** removida a espera de 3 segundos; atualização em lotes das 33 luzes, 5 sons e 4 imagens dos andares. O efeito mantém sua iluminação atmosférica original e restaura o estado anterior no segundo clique, inclusive após recarregar a sessão. Cliques simultâneos são ignorados durante a operação e falhas de gravação acionam recuperação.
- **Tranca do sótão:** usa o gatilho da própria cena e só confirma o estado após gravá-lo. Corrigidas a altura da região da escada secreta (30–39) e a altura dos tokens ao atravessar entre sótão e porão.
- **Valsa para Klara:** pré-carregamento da música ao abrir a mansão, preservando a proteção contra áudio sobreposto. Intervalo dos três botões reduzido de até 3 segundos para 0,75 segundo.
- **Instalação:** pacote inclui os novos scripts e uma macro para atualizar cenas já importadas. A URL permanente de instalação continua igual.
- **Validação:** testes automatizados de importação, restauração, concorrência, alvos ausentes, permissões e recuperação de erros; arquivo OGG decodificado integralmente sem erros. Teste audiovisual em sessão multiplayer ainda necessário.

**Cenas existentes:** atualizar o módulo não altera automaticamente documentos já importados no mundo. Veja a seção de atualização dos controles no README; a macro fornecida atualiza apenas os controles e a escada, preservando tokens e demais documentos da cena.
