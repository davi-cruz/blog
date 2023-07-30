---
---

## Text call-out

```markdown
{% capture updated %}

:arrows_clockwise: **Este post foi atualizado!**

Voce pode encontrar a versão mais recente deste post no link [Microsoft Sentinel: Configuração do Log Forwarder [Atualizado]]({% post_url 2022-09-30-rsyslog-sentinel-log-forwarder-updated %})

{% endcapture %}

<div>
{{ updated | markdownify }}
</div>{: .notice--success}
```

Resutado:

{% capture updated %}

:arrows_clockwise: **Este post foi atualizado!**

Voce pode encontrar a versão mais recente deste post no link [Microsoft Sentinel: Configuração do Log Forwarder [Atualizado]]({% post_url 2021-02-06-htb-doctor.md %})

{% endcapture %}

<div>
{{ updated | markdownify }}
</div>{: .notice--success}

## Tip 2

## Tip 3
