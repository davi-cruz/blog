---
title: Microsoft Sentinel - RSyslog TLS log forwarder configuration
---
## Configuração global

### Criação do Certificado

- Certificado TLS padrão público, PKI interna ou Self-signed

#### Configuração via Keyvault com Let's Encrypt

- Gerar a requisição (CSR)

  ![image-20230315201352549](C:\Repositories\DaviCruz\Blog\jekyll\_drafts\images\tls-config-01)

- Baixar a requisição e assiná-la

  - Let's encrypt:

```powershell
New-PACertificate -CSRPath C:\Users\dacruz\Downloads\RSyslogTLSCertificate_e62f264a56fa417c972d39b1f635845e.csr
```

```plaintext
Please create the following TXT records:
------------------------------------------
_acme-challenge.rsyslog.davicruz.net -> MzIr-NLqeNd2vhDEQcBHlREcE_YIn9KwHDARwoUgs2g
------------------------------------------

Press any key to continue.:
Waiting for DNS to propagate [Sleeping...                                                       99s]









Please remove the following TXT records:
------------------------------------------
_acme-challenge.rsyslog.davicruz.net -> MzIr-NLqeNd2vhDEQcBHlREcE_YIn9KwHDARwoUgs2g
------------------------------------------


Subject                 NotAfter             KeyLength Thumbprint                               AllSANs
-------                 --------             --------- ----------                               -------
CN=rsyslog.davicruz.net 6/13/2023 7:13:08 PM 2048      19C4166344B81752191398A6764062CB171E22C0 {rsyslog.davicruz.net}
```

- certbot

- certutil (Internal PKI)

- Self-signed

- Realizar upload do certificado para o KeyVault

### Deploy VMSS

[Deploy Azure CEF VMSS](https://github.com/azure/azure-quickstart-templates/tree/master/quickstarts/microsoft.compute/vmss-ubuntu-web-ssl)

## configuration Details (For troubleshooting Purposes)

- Configure limits in `/etc/security/limits.conf`

```plaintext
root@SRVLX02:/var/lib/waagent# diff /tmp/bkp/limits.conf /etc/security/limits.conf
56a57,60
> "root soft nofile 65536"
> "root hard nofile 65536"
> "* soft nofile 65536"
> "* hard nofile 65536"
```

- Agent install, according to CEF Legacy Connector

- Input config, named as 60-cef.conf

- Adjustments on /etc/rsyslog.d/50-default.conf

```plaintext
root@SRVLX02:/tmp# diff /tmp/bkp/50-default.conf /etc/rsyslog.d/50-default.conf
9c9
< *.*;auth,authpriv.none                -/var/log/syslog
---
> syslog.*;auth,authpriv.none           -/var/log/syslog
```

- ADjustments on /etc/rsyslog.conf, enforcing the ruleset created

```plaintext
root@SRVLX02:/tmp# diff /tmp/bkp/rsyslog.conf /etc/rsyslog.conf
18c18
< input(type="imudp" port="514")
---
> input(type="imudp" port="514" ruleset="forwarddata")
22c22
< input(type="imtcp" port="514")
---
> input(type="imtcp" port="514" ruleset="forwarddata")
```

- asd
