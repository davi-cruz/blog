EHPT - Homelander

# EHPT - Homelander

## Enumeração

### Scan inicial

- Full NMAP scan TCP

  ```
  # Nmap 7.80 scan initiated Sat Jun 20 15:55:58 2020 as: nmap -A -p22,443,445 -Pn -oA full 10.0.0.12
  Nmap scan report for 10.0.0.12
  Host is up (0.00070s latency).
  Scanned at 2020-06-20 15:55:58 -03 for 47s
  
  PORT    STATE    SERVICE     VERSION
  22/tcp  open     ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
  | ssh-hostkey: 
  |   2048 2b:7d:90:47:e9:70:6b:52:fb:50:e2:f1:90:f8:de:cc (RSA)
  |   256 f1:33:65:46:77:1a:68:2f:6b:0b:37:86:88:ea:05:a1 (ECDSA)
  |_  256 31:b0:6f:c8:60:7a:08:7e:fe:1b:73:46:4d:37:56:b8 (ED25519)
  443/tcp filtered https
  445/tcp open     netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: GOHACKING)
  Service Info: Host: HOMELANDER; OS: Linux; CPE: cpe:/o:linux:linux_kernel
  
  Host script results:
  |_clock-skew: mean: 2h20m02s, deviation: 4h02m31s, median: 0s
  | p2p-conficker: 
  |   Checking for Conficker.C or higher...
  |   Check 1 (port 51834/tcp): CLEAN (Timeout)
  |   Check 2 (port 64584/tcp): CLEAN (Timeout)
  |   Check 3 (port 18978/udp): CLEAN (Timeout)
  |   Check 4 (port 11100/udp): CLEAN (Timeout)
  |_  0/4 checks are positive: Host is CLEAN or ports are blocked
  | smb-os-discovery: 
  |   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
  |   Computer name: ubuntu
  |   NetBIOS computer name: HOMELANDER\x00
  |   Domain name: \x00
  |   FQDN: ubuntu
  |_  System time: 2020-06-20T11:56:10-07:00
  | smb-security-mode: 
  |   account_used: guest
  |   authentication_level: user
  |   challenge_response: supported
  |_  message_signing: disabled (dangerous, but default)
  | smb2-security-mode: 
  |   2.02: 
  |_    Message signing enabled but not required
  | smb2-time: 
  |   date: 2020-06-20T18:56:11
  |_  start_date: N/A
  
  Read data files from: /usr/bin/../share/nmap
  Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
  # Nmap done at Sat Jun 20 15:56:45 2020 -- 1 IP address (1 host up) scanned in 47.63 seconds
  ```
  
- Enumerando os shares SMB com smbmap

  ```
  dcruz@kali:/dcruz/ehpt/homelander/scan$ smbmap -H 10.0.0.12
  [+] Guest session       IP: 10.0.0.12:445       Name: 10.0.0.12                                         
          Disk                                                    Permissions     Comment
          ----                                                    -----------     -------
          print$                                                  NO ACCESS       Printer Drivers
          publica                                                 READ, WRITE     Pasta Publica
          designers                                               NO ACCESS       Pasta designers
          desenvolvedores                                         NO ACCESS       Pasta desenvolvedores
          IPC$                                                    NO ACCESS       IPC Service (ubuntu server (Samba, Ubuntu))
  ```

- uma vez que temos acesso leitura e escrita em publica, realizado o mapeamento conforme comando abaixo, seguido do download do conteúdo para a pasta loot para análise

  ```
  dcruz@kali:/dcruz/ehpt/homelander/scan$ smbclient //10.0.0.12/publica                                                                                                                       
  Enter WORKGROUP\dcruz's password:                                                                                                                                                           
  Try "help" to get a list of possible commands. 
  smb: \> dir
    .                                   D        0  Sat Jun 20 15:06:50 2020
    ..                                  D        0  Sun Apr 19 17:10:22 2020
    Estudos                             D        0  Mon Mar 23 12:12:13 2020
    Notificação.txt                   N      804  Sun Apr 19 17:02:26 2020
  
                  25669860 blocks of size 1024. 16798984 blocks available
  smb: \> recurse on
  smb: \> prompt off
  smb: \> mget *
  getting file \Estudos\PowerShellCheatSheet_v41.pdf of size 153936 as PowerShellCheatSheet_v41.pdf (30065.0 KiloBytes/sec) (average 30065.6 KiloBytes/sec)
  getting file \Estudos\python_para_desenvolvedores_2ed.pdf of size 5344361 as python_para_desenvolvedores_2ed.pdf (173969.5 KiloBytes/sec) (average 153412.3 KiloBytes/sec)
  getting file \Estudos\the-web-application-hackers-handbook.pdf of size 14171674 as the-web-application-hackers-handbook.pdf (175183.6 KiloBytes/sec) (average 168499.6 KiloBytes/sec)
  getting file \Estudos\IDA_Pro_Shortcuts.pdf of size 72352 as IDA_Pro_Shortcuts.pdf (23551.3 KiloBytes/sec) (average 164783.0 KiloBytes/sec)
  getting file \Estudos\Fundamentos-de-redes-e-seguran-a.pdf of size 1197080 as Fundamentos-de-redes-e-seguran-a.pdf (146126.1 KiloBytes/sec) (average 163589.1 KiloBytes/sec)
  getting file \Estudos\using.pdf of size 290030 as using.pdf (56645.4 KiloBytes/sec) (average 159475.9 KiloBytes/sec)
  getting file \Estudos\Fundamentos-de-protocolos-de-rede.pdf of size 1067696 as Fundamentos-de-protocolos-de-rede.pdf (115851.2 KiloBytes/sec) (average 156651.4 KiloBytes/sec)
  getting file \Estudos\SEC573_PythonCheatSheet_06272016.pdf of size 30413 as SEC573_PythonCheatSheet_06272016.pdf (9899.7 KiloBytes/sec) (average 153551.0 KiloBytes/sec)
  getting file \Estudos\GDB Quick Reference.pdf of size 85977 as GDB Quick Reference.pdf (27986.4 KiloBytes/sec) (average 150953.1 KiloBytes/sec)
  getting file \Estudos\Violent Python.pdf of size 11715184 as Violent Python.pdf (184525.7 KiloBytes/sec) (average 161008.8 KiloBytes/sec)
  getting file \Estudos\MetasploitCheatsheet2.0.pdf of size 134533 as MetasploitCheatsheet2.0.pdf (43791.9 KiloBytes/sec) (average 159334.2 KiloBytes/sec)
  getting file \Estudos\Fundamentos-de-Linux.pdf of size 1117038 as Fundamentos-de-Linux.pdf (155834.6 KiloBytes/sec) (average 159221.4 KiloBytes/sec)
  getting file \Estudos\Vi Cheat Sheet.pdf of size 108655 as Vi Cheat Sheet.pdf (53051.6 KiloBytes/sec) (average 158251.9 KiloBytes/sec)
  getting file \Estudos\WinDbg_cmds.pdf of size 220687 as WinDbg_cmds.pdf (107752.1 KiloBytes/sec) (average 157794.9 KiloBytes/sec)
  getting file \Estudos\FootPrinting.pdf of size 1349549 as FootPrinting.pdf (146433.8 KiloBytes/sec) (average 157350.4 KiloBytes/sec)
  getting file \Estudos\tcpip.pdf of size 562816 as tcpip.pdf (78516.8 KiloBytes/sec) (average 155022.0 KiloBytes/sec)
  getting file \Estudos\netcat_cheat_sheet_v1.pdf of size 130097 as netcat_cheat_sheet_v1.pdf (42347.9 KiloBytes/sec) (average 153613.6 KiloBytes/sec)
  getting file \Estudos\rtfm-red-team-field-manual.pdf of size 3062719 as rtfm-red-team-field-manual.pdf (186932.4 KiloBytes/sec) (average 155696.1 KiloBytes/sec)
  getting file \Notificação.txt of size 804 as Notificação.txt (261.7 KiloBytes/sec) (average 153895.7 KiloBytes/sec)
  smb: \> quit
  
  ```

  

### 80/TCP - 



## Exploração

## CVE-

asmdmasd



## Escalação de Privilégios

### AMSDAMS