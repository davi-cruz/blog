---
title: Azure Sentinel Forwarder - High Availability Case Study
namespace: "sentinel-forwarder-high-availability-case-study"
category: Azure Sentinel
tags:
  - Azure Sentinel
  - Syslog Forwarder
  - Rsyslog
  - High Availability
header:
    teaser: http://xxx.xx/image.png
    og_image: *teaser
date: xxxx
---

Enquanto configuramos qualquer solução de segurança em uma organização, resiliência é um ponto extremamente importante e que deve ser considerado. Indisponibilidade dos componentes ou incompletude das informações podem afetar até mesmo soluções cloud-native como o Azure Sentinel, considerando cenários em que o utilizamos inclusive para monitoramento de recursos on-premises (e porque não? :smile: ).

Para o Azure Sentinel, uma vez que a Microsoft garante a disponibilidade do serviço, o principal ponto de falha são as fontes de dados que, se não tiverem conectividade com a workspace de log analytics, pode impactar o funcionamento da solução. De fato, isso não é nada novo nas implementações de SIEM no mercado, porém falando de SIEMs on-premises, dificilmente se indisponibiliza completamente a comunicação dos recursos dentro da própria rede, mas indisponibilidade na comunicação com a Internet pode ocorrer devido a fatores externos (questões climáticas/rompimento de fibras, etc) ou internos (manutenções planejadas ou não), mas os Logs normalmente continuam sendo enviados para o repositório on-premises.

Não é novidade nenhuma 

While configuring  a log collection infrastructure, reliability is a point that should be considered, otherwise you're facing the risk of loosing your logs if it become unavailable.

If you're planning to deploy this infrastructure on Azure, many points can be solved by deploying this infrastructure as a Virtual Machine Scale Set and availability granted by services SLAs (uptime, link connectivity, storage redundancy, etc), which will be discussed in a later post, but on premises we have to take into consideration some key point on infrastructure and service configuration, in order to be resilient to some scenarios, including connectivity outage, considering that logs to be used in Azure Sentinel must be sent to the cloud





When we configure any infrastructure, reliability is a very important point to take into account
When we talk about Rsyslog forwarding infrastructure for azure sentinel this is no different.

Many customers often inquires on how reliable is this infrastructure and if we need to make any additional configuration in order to ensure that received messages are going to be sent to our SIEM. It gets even more important if we're running this infrastructure on-premises where not all services, like internet connectivity have several redundancies like we have in Azure for example.

As in some cases we cant afford to loose these events, proper planning needs to happen prior to your implementation, which will determine the requirements for the resources being provisioned.

Bellow I'll be discussing some points and configurations that needs to be followed that will ensure the desired reliability for your syslog infrastructure

## scalability

First and foremost, we need to guarantee that the amount of servers that are going to be receiving the logs is capable of your current needs.
If you're migrating of SIEMs or is running azure sentinel for a period you might be aware of the average and peak message rate received (eps - events per second) and will also be able to estimate any future growth depending on the stage of your adoption
These metrics can be reviewed using workspace usage and data collection health workbooks. As per Microsoft documentation, a syslog serve can handle up to 8500 events per second with a 4cpu/8gb ram configuration. You can scale up a bit the amount of resources but you might be best served if you scale out additional nodes whenever your demand increases (using private cloud or 3rd party cloud elasticity - or of course manually provisioning more resources to a pool) and assign them to a balanced virtual ip.

## fault tolerance

Let's say that you run  single log Forwarder and for any reason this machine stays unavailable for a period. 
This is why configuring multiple nodes balanced is also beneficial to your infrastructure. 

If you're running this infrastructure in a virtualized environment, also ensuring that affinity and nkn-affinity settings are in place. 
This can prevent failures at host level to impact all machines in this group







- Os itens mais importantes nesta     alteração são, conforme discutido em passagem de conhecimento

 

|        | **30s**        |                | **20s**        |                |
| ------ | -------------- | -------------- | -------------- | -------------- |
| **#**  | **Next Retry** | **Total Wait** | **Next Retry** | **Total Wait** |
| **1**  | 0:00:30        | 0:00:30        | 0:00:20        | 0:00:20        |
| **2**  | 0:01:00        | 0:01:30        | 0:00:40        | 0:01:00        |
| **3**  | 0:02:00        | 0:03:30        | 0:01:20        | 0:02:20        |
| **4**  | 0:04:00        | 0:07:30        | 0:02:40        | 0:05:00        |
| **5**  | 0:08:00        | 0:15:30        | 0:05:20        | 0:10:20        |
| **6**  | 0:16:00        | 0:31:30        | 0:10:40        | 0:21:00        |
| **7**  | 0:32:00        | 1:03:30        | 0:21:20        | 0:42:20        |
| **8**  | 1:04:00        | 2:07:30        | 0:42:40        | 1:25:00        |
| **9**  | 2:08:00        | 4:15:30        | 1:25:20        | 2:50:20        |
| **10** | 4:16:00        | 8:31:30        | 2:50:40        | 5:41:00        |
| **11** | 8:32:00        | 17:03:30       | 5:41:20        | 11:22:20       |
| **12** | 17:04:00       | 34:07:30       | 11:22:40       | 22:45:00       |
| **13** | 10:08:00       | 68:15:30       | 22:45:20       | 45:30:20       |



 [Buffer Plugins - Fluentd](https://docs.fluentd.org/buffer)

 

- - **retry_wait**: Define o valor inicial para      retry. Padrão 30 segundos e, a partir deste, é aumentado exponencialmente      (vide documentação previamente compartilhada). A tabela acima representa      um exemplo de tempo em que um pacote consecutivamente teria as tentativas      refeitas, conforme tempo de retry inicial de 30 e 20 segundos

  - **retry_limit**: Define o número máximo de      tentativas. Este número deve ser definido de forma que a retenção máxima esperada      seja alcançada. Ainda sobre a tabela anterior, caso seja definido o valor      de 12 tentativas, teria o tempo total de espera máxima de 34h para um início      de 30 segundos e 22h para 20 segundos. 

  - **buffer_chunk_limit**: Define o valor total de cada      chunk ou bloco de logs que aguardam o envio. Não se recomenda alterar este      valor para que se evite a criação de arquivos grandes e, consequentemente      corrupção dos dados.

  - **buffer_queue_limit**: Define o valor máximo do comprimento da fila do buffer. Deve garantir que dados retidos por um período sejam mantidos      

  - Define o valor máximo do comprimento      da fila. Este dado depende exclusivamente da quantidade de informação      recebida na máquina. Se uma infraestrutura de Rsyslog opera com 3 nós e      recebe, em 24h em média 500GB de logs, os quais deveriam ser mantidos em      buffer até que a conectividade seja reestabelecida (onde se deve      considerar os itens anteriormente definidos), o seguinte cálculo deve ser      feito:

  - - buffer_queue_limit       = avg_ingestionGB * 1000/ buffer_chunk_limit / vmss_nodes
    - buffer_queue_limit       = 500 * 1000/ 15 / 3 =~ 11112
    - buffer_queue_limit       =~ 11112
