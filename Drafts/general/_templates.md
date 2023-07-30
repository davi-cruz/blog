---
title: "teste"
---

## Templates

Blocos para simplificar authoring de conteúdo no blog

### Spoiler

{% capture details %}
Place some **markdown** here if you like.

Can be multiple paragraphs, `inline code`, whatever.
{% endcapture %}

<details>
  <summary>Spoiler</summary>
  {{ details | markdownify }}
</details>

## Edited/Reviews

{% capture changes %}
:newspaper: **Edits**:

- **30/04/2021** - Incluído seção [Redução de mensagens repetidas](#redução-de-mensagens-repetidas)
{% endcapture %}

<div>
{{ changes | markdownify }}
</div>{: .notice--success}

## Center images

![img](/path/to/img){: .align-center}
