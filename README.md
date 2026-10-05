# 🏰 Curse of Strahd: Reloaded | Fuga da Casa da Morte (PT-BR)

[![Foundry v13](https://img.shields.io/badge/Foundry%20VTT-v13-blue.svg)](https://foundryvtt.com/)
[![D&D 5e](https://img.shields.io/badge/D%26D%205e-v4%20%7C%20v5-red.svg)](https://foundryvtt.com/packages/dnd5e)
[![Release](https://img.shields.io/github/v/release/Crespo767/escape-from-death-house-pt-br?color=green)](https://github.com/Crespo767/escape-from-death-house-pt-br/releases/latest)
[![Módulo Original](https://img.shields.io/badge/Módulo%20Original-GitHub-181717?logo=github)](https://github.com/Eidolon-Publishing/cosrl-escape-from-death-house)
[![YouTube](https://img.shields.io/badge/YouTube-Eidolon%20Publishing-FF0000?logo=youtube&logoColor=white)](https://www.youtube.com/@EidolonPublishing)
[![Patreon](https://img.shields.io/badge/Patreon-Eidolon%20Publishing-F96854?logo=patreon&logoColor=white)](https://www.patreon.com/EidolonPublishing)

Adaptação e tradução completa para o Português Brasileiro (PT-BR) do primeiro arco de **Curse of Strahd: Reloaded** por **DragnaCarta** (*Arco A: Fuga da Casa da Morte*), originalmente adaptado para o Foundry VTT pela equipe da [Eidolon Publishing](https://eidolonpublishing.com/).

> [!NOTE]
> **Módulo Original em Inglês:** [cosrl-escape-from-death-house (GitHub)](https://github.com/Eidolon-Publishing/cosrl-escape-from-death-house) desenvolvido por [Eidolon Publishing / Hades](https://eidolonpublishing.com/).  
> Apoie o criador original no [Patreon](https://www.patreon.com/EidolonPublishing) e assista aos vídeos e tutoriais no [YouTube (@EidolonPublishing)](https://www.youtube.com/@EidolonPublishing)!

---

## ⚡ Instalação Direta no Foundry VTT

1. No Foundry VTT, acesse a aba **Módulos Adicionais** (*Add-on Modules*).
2. Clique em **Instalar Módulo** (*Install Module*).
3. No campo **URL do Manifesto** (*Manifest URL*), cole o link abaixo:
   ```text
   https://github.com/Crespo767/escape-from-death-house-pt-br/releases/latest/download/module.json
   ```
4. Clique em **Instalar**. O Foundry baixará automaticamente o módulo e notificará sobre as dependências recomendadas.

---

## 🧩 Módulos Dependentes

Para que os mapas multiníveis e as automações funcionem corretamente, este módulo utiliza as seguintes dependências. Caso o instalador do Foundry solicite a instalação manual ou você deseje instalar uma a uma, basta copiar os links de **Manifest URL** abaixo e colar em **Módulos Adicionais** (*Add-on Modules*) > **Instalar Módulo** (*Install Module*):

| Módulo | Versão | URL do Manifesto (Manifest URL) | Download Direto (.zip) |
| :--- | :---: | :--- | :--- |
| **Levels** | `6.1.0` | `https://github.com/theripper93/Levels/releases/download/6.1.0/module.json` | [module.zip](https://github.com/theripper93/Levels/releases/download/6.1.0/module.zip) |
| **libWrapper** | `1.13.5.1` | `https://github.com/ruipin/fvtt-lib-wrapper/releases/latest/download/module.json` | [lib-wrapper.zip](https://github.com/ruipin/fvtt-lib-wrapper/releases/download/v1.13.5.1/lib-wrapper-v1.13.5.1.zip) |
| **Monk's Active Tile Triggers** | `13.06` | `https://github.com/ironmonk88/monks-active-tiles/releases/download/13.06/module.json` | [13.06.zip](https://github.com/ironmonk108/monks-active-tiles/archive/13.06.zip) |
| **Tagger** | `1.6.0` | `https://github.com/fantasycalendar/FoundryVTT-Tagger/releases/latest/download/module.json` | [module.zip](https://github.com/fantasycalendar/FoundryVTT-Tagger/releases/download/1.6.0/module.zip) |
| **FXMaster** | `8.4.1` | `https://github.com/gambit07/fxmaster/releases/latest/download/module.json` | [module.zip](https://github.com/gambit07/fxmaster/releases/download/v8.4.1/module.zip) |
| **Eidolon Utilities** | `1.11.14` | `https://github.com/Eidolon-Publishing/eidolon-utilities/releases/latest/download/module.json` | [eidolon-utilities.zip](https://github.com/Eidolon-Publishing/eidolon-utilities/releases/download/v1.11.14/eidolon-utilities.zip) |

### 🛠️ Para que serve cada dependência?
* **[Levels](https://github.com/theripper93/Levels)**: Permite a exploração vertical e transição fluida entre os 4 andares da Mansão Durst no mesmo mapa.
* **[libWrapper](https://github.com/ruipin/fvtt-lib-wrapper)**: Biblioteca essencial de encapsulamento de funções utilizada para permitir que múltiplos módulos (como o *Levels*) interceptem chamadas de métodos do Foundry sem gerar conflitos entre si.
* **[Monk's Active Tile Triggers](https://github.com/ironmonk108/monks-active-tiles)**: Executa a automação de armadilhas, portas secretas, sons de terror e a fuga da mansão em colapso.
* **[Tagger](https://github.com/fantasycalendar/FoundryVTT-Tagger)**: Identifica e conecta os alvos dos gatilhos no mapa.
* **[FXMaster](https://github.com/gambit07/fxmaster)**: Aplica a densa névoa de Barovia e partículas climáticas imersivas.
* **[Eidolon Utilities](https://github.com/Eidolon-Publishing/eidolon-utilities)**: Scripts de suporte técnico do módulo original.

---

## 📦 Conteúdo Incluso

- **Aventura Pronta em 1 Clique (`Adventure`)**: Importe toda a Casa da Morte diretamente para o seu mundo pelo compêndio de Aventuras.
- **Mapas Multiníveis Completos (`Scenes`)**:
  - *Mansão Durst* (Térreo, 1º Andar, 2º Andar e Sótão integrados com Levels).
  - *Masmorras dos Durst* (Criptas, aposentos do culto e câmara ritualística do altar).
- **Atores e Monstros Rebalanceados (`Actors`)**:
  - *Walter, o Nascido da Cova* e o *Montículo de Carne* (mecânica de combate em duas fases).
  - *Rosavalda "Rose"* e *Thornboldt "Thorn" Durst*.
  - *Gustav* e *Elisabeth Durst*.
  - *Armadura Animada*, *Vassoura Animada*, *Carniçais*, *Sombras de Cinzas*, *Esfolados*, etc.
- **Guia do Mestre Completo (`Journals`)**:
  - Textos de narração prontos para ler aos jogadores.
  - Pistas, quebra-cabeças e segredos explicados passo a passo.
  - Regras de Sessão Zero, Motivações, Vínculos e Defeitos temáticos de Barovia.
- **Itens e Relíquias (`Items`)**: Cartas secretas, pergaminhos e relíquias do culto Durst.
- **Tabelas de Rolagem (`RollTables`)**: Livros da biblioteca, encontros e eventos aleatórios.

---

## 🛠️ Correções e Melhorias Desta Versão

- **Tradução PT-BR Integrada**: Nomes de atores, cenas, diários, itens e textos principais localizados.
- **Caminhos de Mídia Higienizados**: Todas as 270+ referências de caminhos de arquivos ajustadas para o novo pacote sem quebra de links.
- **Tags e Enrichers Corrigidos**: Eliminação de todas as tags brutas `&amp;Reference` para renderização perfeita de tooltips no Foundry v13.
- **Compatibilidade D&D 5e / PHB 2024**: Ajuste nos cálculos de ficha, itens e atividades para os sistemas modernos.

---

## 📜 Créditos e Reconhecimentos

Este projeto é uma localização comunitária para Português Brasileiro (PT-BR) baseada no trabalho original de **DragnaCarta** e na adaptação técnica para Foundry VTT feita pela equipe da **Eidolon Publishing**. Considere apoiar os criadores originais:

### 🌟 Módulo Original & Criação para Foundry VTT
* **Criador Original**: **Hades** / **Eidolon Publishing**
* **Módulo Original no GitHub**: [Eidolon-Publishing/cosrl-escape-from-death-house](https://github.com/Eidolon-Publishing/cosrl-escape-from-death-house)
* **Canal no YouTube**: [Eidolon Publishing no YouTube](https://www.youtube.com/@EidolonPublishing)
* **Patreon**: [Patreon da Eidolon Publishing](https://www.patreon.com/EidolonPublishing)
* **Site Oficial**: [eidolonpublishing.com](https://eidolonpublishing.com/)

### 📖 Campanha Original (Curse of Strahd: Reloaded)
* **Autor Original**: [DragnaCarta](https://www.patreon.com/DragnaCarta) (*Curse of Strahd: Reloaded*)
* **Patreon**: [Patreon do DragnaCarta](https://www.patreon.com/DragnaCarta)
* **Guia Oficial da Campanha**: [Curse of Strahd: Reloaded](https://www.strahdreloaded.com/)

### 🇧🇷 Tradução e Adaptação PT-BR
* **Tradução e Ajustes Técnicos**: Crespo767 ([GitHub](https://github.com/Crespo767))

---

### ⚖️ Licença e Direitos
* *Dungeons & Dragons* e *Curse of Strahd* são marcas registradas da *Wizards of the Coast LLC*.
* Este módulo é uma iniciativa de fãs e segue a política de conteúdo de fãs da Wizards of the Coast.
