---
title: Developer
category: FIAP CyberCup
---

## Enumeration

### NMAP Scan

- Após ligar a maquina, executado os comandos abaixo para enumeração da VM

```plaintext
# Nmap 7.80 scan initiated Sat Jun 27 19:55:03 2020 as: nmap -sC -sV -Pn -oA quick 10.2.0.12
Nmap scan report for 10.2.0.12
Host is up (0.012s latency).
Scanned at 2020-06-27 19:55:10 -03 for 161s
Not shown: 991 closed ports
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 5.9p1 Debian 5ubuntu1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:                            
|   1024 d0:0a:61:d5:d0:3a:38:c2:67:c3:c3:42:8f:ae:ab:e5 (DSA)
| ssh-dss AAAAB3NzaC1kc3MAAACBAKhWvQi17DDbE+4rIT/g1SC8rxuv0MUowSJKUPEWlMVqfoLa6iWJVA2EzqUGPgtTnq6uuTr110Op760IivE6U3cBbgEz5xIz1AZJbB8MtOGqGK5EMnkfPr/cUn4PPnMPHt7I/JU4KGcTPcq3KA+tOZRH8m3PEaBg6vUXWSVKIybVAAAAFQDYJev6e7e0vLa/gEoTi8qyOhf2Z
QAAAIEAg5bfw3eI3IUo4FEnjy7aY4pRsI+iGqwb29GLJXgonVhec0mtavAvwRwrJ5XFjgeVcHZQHySN7I+S66hKqTOQo4jalb6U9ZptVzIC8qkbeKToXqJLYwsGdDTTLyA+lRJfem9FMjaAl7mhX7ulm8szQ3q5g+D4jqJKXlpsMK42U+gAAACAV3s6IYys0w5l6Q/LzjBHVFy6Vm1J2jrT0MegkfzpxHI0CQz+EyXH
rPG+Mu0iC9MuA8a7GjS5ryz2iqo/uEHPaoVYk2FpnsFXbCTvbeMruv5ifRh9LNKZ/vWR1Hl2FIi5RlNnEgeAIFymST8QuYEm7WWxZLXeyO9DwRSMPp2zNUU=
|   2048 bc:e0:3b:ef:97:99:9a:8b:9e:96:cf:02:cd:f1:5e:dc (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDCzMPj80rWOSTS2cPOg24Yep4GX3GXio0p3MPI0g9AWya12ACkxFPwl3uOljwfE3UGzNS53H9HhXvhUd+yMaNbJVCWs2+2LsejPUCnykAlhSCKcrpviyitU3C3/5fojXtnrGyCBZzeyEQbkIaZ1QnUmykljjgCfDxH6qh50wRRpaEt7r0OTSKh7FDvTy/ly/EMU
BOSq/UmMsO61/NNxDgWEPGvvWrbt7aKT71PJXM4i8xxEfi+K7rC3dJBGGV71X7m6o3S32/HLw71RbtRyy1gbfMY/pOduFmFuI+s7H5fI1/Ulid0AnJNXPCFUnZMEWLrBjhme/q4wjLxwFHKLyDd
|   256 8c:73:46:83:98:8f:0d:f7:f5:c8:e4:58:68:0f:80:75 (ECDSA)
|_ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBI9oPSx9ey3GvWq/2+7fWNxzZj9WF9BYq5Mf+dLbBbGHakQLPzIKRrHPL902cZhUqQ88hbceEdNZGH2MnFvpDt8=
53/tcp  open  domain      ISC BIND 9.8.1-P1                                                                          
| dns-nsid:                                                                                                          
|_  bind.version: 9.8.1-P1                     
80/tcp  open  http        Apache httpd 2.2.22 ((Ubuntu))
| http-methods: 
|_  Supported Methods: POST OPTIONS GET HEAD
|_http-server-header: Apache/2.2.22 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
110/tcp open  pop3        Dovecot pop3d
|_pop3-capabilities: UIDL CAPA SASL STLS RESP-CODES PIPELINING TOP
|_ssl-date: 2020-06-27T22:55:37+00:00; 0s from scanner time.
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
143/tcp open  imap        Dovecot imapd
|_imap-capabilities: Pre-login LITERAL+ more have post-login LOGIN-REFERRALS IDLE capabilities OK listed ENABLE STARTTLS ID LOGINDISABLEDA0001 SASL-IR IMAP4rev1
|_ssl-date: 2020-06-27T22:55:37+00:00; 0s from scanner time.
445/tcp open  netbios-ssn Samba smbd 3.6.3 (workgroup: WORKGROUP)
993/tcp open  ssl/imaps?
|_ssl-date: 2020-06-27T22:55:37+00:00; 0s from scanner time.
995/tcp open  ssl/pop3s?
|_ssl-date: 2020-06-27T22:55:37+00:00; 0s from scanner time.
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_clock-skew: mean: 39m59s, deviation: 1h37m58s, median: 0s
| nbstat: NetBIOS name: DEVELOPER, NetBIOS user: <unknown>, NetBIOS MAC: <unknown> (unknown)
| Names:
|   DEVELOPER<00>        Flags: <unique><active>
|   DEVELOPER<03>        Flags: <unique><active>
|   DEVELOPER<20>        Flags: <unique><active>
|   WORKGROUP<1e>        Flags: <group><active>
|   WORKGROUP<00>        Flags: <group><active>
| Statistics:
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
|_  00 00 00 00 00 00 00 00 00 00 00 00 00 00
| p2p-conficker:                                                                                                     
|   Checking for Conficker.C or higher...                                                                                                                                                                                                  
|   Check 1 (port 6854/tcp): CLEAN (Couldn't connect)                                                                
|   Check 2 (port 53873/tcp): CLEAN (Couldn't connect)                                                               
|   Check 3 (port 8128/udp): CLEAN (Failed to receive data)
|   Check 4 (port 31928/udp): CLEAN (Failed to receive data)                                
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb-os-discovery:                             
|   OS: Unix (Samba 3.6.3)                      
|   Computer name: Developer                        
|   NetBIOS computer name:                     
|   Domain name:                                                                                                     
|   FQDN: Developer                                                                                                  
|_  System time: 2020-06-27T18:55:24-04:00                                                                           
| smb-security-mode:                                  
|   account_used: guest                                                                                                                                                                                                                    
|   authentication_level: user                                                                                       
|   challenge_response: supported                                                                                    
|_  message_signing: disabled (dangerous, but default)
|_smb2-security-mode: Couldn't establish a SMBv2 connection.                                                         
|_smb2-time: Protocol negotiation failed (SMB2)                                                                      
                                                                                                                     
Read data files from: /usr/bin/../share/nmap                                                                         
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jun 27 19:57:51 2020 -- 1 IP address (1 host up) scanned in 167.65 seconds

```

### 80/TCP

- Ao acessar porta o

```plaintext
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          10.2.0.12
+ Target Hostname:    10.2.0.12
+ Target Port:        80
+ Start Time:         2020-06-27 19:59:13 (GMT-3)
---------------------------------------------------------------------------
+ Server: Apache/2.2.22 (Ubuntu)
+ Server may leak inodes via ETags, header found with file /, inode: 152308, size: 12, mtime: Fri Jun  5 12:46:03 2020
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined. This header can hint to the user agent to protect against some forms of XSS
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type
+ Retrieved x-powered-by header: PHP/5.3.10-1ubuntu3
+ Entry '/wordpress/' in robots.txt returned a non-forbidden or redirect HTTP code (200)
+ "robots.txt" contains 1 entry which should be manually viewed.

```

- Acessando, encontrado um wordpress 3.9XXX via WP Scan. Com senhas admin:admin foi possivel fazer o acesso.

- Apos acesso realizado upload de plugin customizado contendo shell reverso

- obtido flag de user ao acessar conteudo na pasta /home/wpadmin

```plaintext
www-data@Developer:/home/wpadmin$ cat user.txt 
2bafe61f03117ac66a73c3c514de796e
www-data@Developer:/home/wpadmin$ 
```

## Escalação

- Atraves dos arquivos de configuração do wordpress obtido credenciais para acesso ao banco mysql

```ini
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');                                                                                      
                                                                                                                      
/** MySQL database username */                                                                                       
define('DB_USER', 'root');                                                                                           
                                                                                                                      
/** MySQL database password */                                                                                       
define('DB_PASSWORD', 'rootpassword!');                                                                              
                                                                                                                      
/** MySQL hostname */                                                                                                
define('DB_HOST', 'localhost');    
```

- Com a senha do root, enumerados bancos de dados dentro da instancia e obtidas as seguintes credenciais, ja com os hashes de senha quebrados

| Database  | tabela    | username         | hash                                     | password |
| --------- | --------- | ---------------- | ---------------------------------------- | -------- |
| Lepton    | lep_users | admin            | (MD5) 5f4dcc3b5aa765d61d8327deb882cf99   | password |
| mysql     | user      | root             | CBE70E8EFEC686415DAA1FDAD3366E4E3CBFB054 |          |
| mysql     | user      | root             | E8F5222DC502C2BB34AFA3312E8C3A6B20725869 |          |
| mysql     | user      | debian-sys-maint | FC9AC51985240558EC5476C1BC88CCD9F82D4D22 |          |
| wordpress | wp_user   | wpuser           | $P$BdcZZVb0ssMccLU1ECFCtUihocqQ0S.       |          |
|           |           |                  |                                          |          |
