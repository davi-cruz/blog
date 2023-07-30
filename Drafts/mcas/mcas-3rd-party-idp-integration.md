---
title: "title"

---

## Keycloak Setup

ttt

### Docker Execution

[Keycloak - Guide - Keycloak on Docker](https://www.keycloak.org/getting-started/getting-started-docker)

Added parameters name and restart behavior, to make easier to identify container and its restart behavior

```bash
docker run --name keycloak -d -p 8080:8080 --restart unless-stopped -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin quay.io/keycloak/keycloak:13.0.0
```

### SSL Certificate

sss

#### Let's encrypt certificate

Install [Posh-ACME Powershell Module](https://github.com/rmbolger/Posh-ACME)

```powershell
Install-Module -Name Posh-ACME
```

Request the certificate for your domain. To make easier to make the appropriate changes I'm requesting a wildcard and a root domain cert for my own domain.

```powershell
$certNames = '*.davicruz.com','davicruz.com'
$email = 'eu@davicruz.com'
New-PACertificate $certNames -AcceptTOS -Contact $email
```

It will requires you to confirm the domain ownership using TXT entries on your DNS registrar

After validation

```powershell
PS C:\Users\dacruz> Get-PACertificate | fl *

Subject       : CN=*.davicruz.com
NotBefore     : 5/12/2021 11:20:01 AM
NotAfter      : 8/10/2021 11:20:01 AM
KeyLength     : 2048
Thumbprint    : <Redacted>
AllSANs       : {*.davicruz.com, davicruz.com}
CertFile      : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\cert.cer
KeyFile       : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\cert.key
ChainFile     : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\chain.cer
FullChainFile : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\fullchain.cer
PfxFile       : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\cert.pfx
PfxFullChain  : C:\Users\dcruz\AppData\Local\Posh-ACME\acme-v02.api.letsencrypt.org\123275196\!.davicruz.com\fullchain.pfx
PfxPass       : System.Security.SecureString
```

**Note:** If not specified the default password for the private key will be `poshacme`. Your current password can be seen running the command below

```powershell
ConvertFrom-SecureString (Get-PACertificate).PfxPass -AsPlainText
```

#### Configuring m

[Configure Azure AD as a brokered Identity Provider in KeyCloak (alphabold.com)](https://www.alphabold.com/azure-ad-configuration/)

[Server Installation and Configuration Guide (keycloak.org)](https://www.keycloak.org/docs/6.0/server_installation/#enabling-ssl-https-for-the-keycloak-server)
