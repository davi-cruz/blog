# Atualizações necessárias para utilizar o Jekyll Multilanguage no tema Minimal Mistakes

Durnate o processo de construção do meu blog, modifiquei diversos arquivos para fazer com que o tema [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/) funcionasse de modo apropriado com o plugin [jekyll-multiple-languages-plugin](https://github.com/kurtsson/jekyll-multiple-languages-plugin).

Abaixo você encontrará uma lista das modificações necessárias para que ambos os componentes funcionem adequadamente.

## Configuração padrão não utilizada

O arquivo `_data\navigation.yml` não é utilizado uma vez que toda navegação é carregada dos arquivos de tradução. Você pode comparar o meu arquivo `<language>.yml` para ter uma ideia de como foi configurado.

## Arquivos a serem mantidos durante a atualização

- YML
  - `_config.yml`: Necessário apenas confirmar se houve alguma grande mudança em sua estrutura para que o tema continue funcionando adequadamente.

- HTML
  - `index.html`: Apenas revisar se tiver alguma configuração diferente do padrão (o que é o meu caso).
  - `_includes\head\custom.html`: Manter customizações de cabeçalho do seu site.

- `LICENCE` e `README.md`: Manter seus próprios arquivos de licença e README.
- `Gemfile`

## Arquivos desnecessários

Uma vez que a geraão de novas releases nem sempre é realizada, a forma mais facil é obter o download do tema a partir do repositorio. Os Seguintes arquivos podem ser removidos uma vez que são especificos das demonstrações:

- `CHANGELOG.md`
- `screenshot-layouts.png` e `screenshot.png`
- Remover as seguintes pastas:
  - `.github`
    - Manter apenas suas próprias Github Actions, se houver
  - `docs`
  - `test`

## Arquivos onde mudanças foram necessárias

- **CSS**: Por padrão, nenhuma mudança seria necessária, mas por algumas mudanças em meu blog os seguintes arquivos foram alterados:
  
  - `_sass\minimal-mistakes\_buttons.scss`: Declara as opções de botão do Telegram e WhatsApp
  - `_sass\minimal-mistakes\_variables.scss`: Define as cores dos botões do Telegram e WhatsApp
  - `_sass\minimal-mistakes\_page.scss`: Oculta alguns meta-objects que adicionei na visão grid da home page
  
- **HTML**

  - **Global**: Substituir os valores para compatibilizar o tema com o Jekyll-multilanguage plugin (removendo os parenteses do `(.)`).

    | Source                             | Replace                                         |
    | ---------------------------------- | ----------------------------------------------- |
    | `site(.)data.ui-text[site.locale]` | `site.data.ui-text[site.lang]`                  |
    | `site(.)category_archive`          | `site.translations[site.lang].category_archive` |
    | `site(.)data.navigation`           | `site.translations[site.lang].navigation`       |
    | `site(.)tag_archive`               | `site.translations[site.lang].tag_archive`      |

  - `_includes`

    - `archive-single.html`: Ajustado os links do post para o idioma utilizado
    - `footer.html`:
      - Alterações relacionadas ao Multilanguage (Atom Feed)
      - Adicionado dois links customizados: um para a página de "Termos e Privacidade" e outro para "Ler em outro idioma"

    - `masthead.html`:
      - Alterações relacionadas ao Multilanguage no link do título, assim como a substituição da navegação do arquivo `_data\navigation.yml` para a tradução

    - `nav-list.html`: Alterações relacionadas à tradução da navegação
    - `page__meta.html`: Adicionado meta-tags customizadas para os posts
      - Um botão para "Ler em outro idioma"
      - Um botão para compartilhamento, direcionando para uma ancora no final da pagina

    - `paginator.html` e `post_pagination.html`: Realizados alguns ajustes de modo que a paginaão possa ocorrer dentro do idioma atualmente ativo.
    - `social-share.html`:
      - Incluido o `id="sharelinks"` nas ações de compartilhamento em redes sociais. Funciona como ancora para a tag adicionada no arquivo `page__meta.html`
      - Adicionado botões do WhatsApp e Telegram para compartilhamento (para ser mobile friendly :smile: )
      - Ajustado URL compartilhada para refletir o idioma ativo

    - `comments-providers\utterances.html`: Definido o issue-term para o namespace das páginas, para que todos os comentários, em qualquer idioma, sejam direcionados ao mesmo Issue no GitHub
    - `_layouts\default.html`: Incluido tag GTM após abertura do `<body>` e alterado para que `head\custom.html` seja carregado primeiro

Espero que ajude quem esteja buscando utilizar este tema em conjunto com o plugin de multiplos idiomas :smiley:
