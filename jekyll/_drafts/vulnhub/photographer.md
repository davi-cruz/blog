Vulnhub - Photographer

# Vulnhub - Photographer

## Enumeration

- Executado enumeração de portas utilizando NMAP

  ```bash
  PORT     STATE SERVICE     REASON  VERSION   
  22/tcp   open  ssh         syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
  | ssh-hostkey:                           
  |   2048 41:4d:aa:18:86:94:8e:88:a7:4c:6b:42:60:76:f1:4f (RSA)
  | ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCq9GoYsvJTOUcsgHSES9+20Ix4Q8wjm5slMheJ2ME+COokAqxBzXSr458KBmHv3bsTLWAH9FxoXJ6zrzDPmPApcqVifB4aI9l/VYxoeJCj54kKIQlCKkWTZjsAeLBI2Lk2+yJLLFWPTAZ2htwRAwCl9z8YV3xgtqhTa+5BqIm/GInW4PYV0zi9zOMn2g4jNSWvy
  91FBUboGLwVgNYslGBydNW8Fhz8X/LXHZ1x6ulA76W026VEGOiQfoiIi84IFi9CbP8GIKfQ7BHuDlMqgiN9+w7K0z0oFdtiFhAS/48w89MYn6UOzw7Aaa9eLQi0+zxpW5SpCpw0mC2euzPxow2Z
  |   256 4d:a3:d0:7a:8f:64:ef:82:45:2d:01:13:18:b7:e0:13 (ECDSA)
  | ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBMz4UG2gfu7L/Lxcqek1pZf46d8SocbES1A2a/XUYQgTmIqJuCEpLf3ERgVXS+7Lwdi6+F3xkI/lYFCA5MkRUQA=
  |   256 1a:01:7a:4f:cf:95:85:bf:31:a1:4f:15:87:ab:94:e2 (ED25519)
  |_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDL5ZwzA5dpqtWx4ZzjVQ6NMzVUia8/We8txfiAn+mv4
  80/tcp   open  http        syn-ack Apache httpd 2.4.18 ((Ubuntu))
  | http-methods:                            
  |_  Supported Methods: POST OPTIONS GET HEAD
  |_http-server-header: Apache/2.4.18 (Ubuntu)
  |_http-title: Photographer by v1n1v131r4  
  139/tcp  open  netbios-ssn syn-ack Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
  445/tcp  open  netbios-ssn syn-ack Samba smbd 4.3.11-Ubuntu (workgroup: WORKGROUP)
  8000/tcp open  http        syn-ack Apache httpd 2.4.18 ((Ubuntu))
  |_http-generator: Koken 0.22.24  
  | http-methods:                                       
  |_  Supported Methods: GET HEAD POST OPTIONS
  |_http-server-header: Apache/2.4.18 (Ubuntu)
  |_http-title: daisa ahomi                     
  |_http-trane-info: Problem with XML parsing of /evox/about 
  Service Info: Host: PHOTOGRAPHER; OS: Linux; CPE: cpe:/o:linux:linux_kernel
  
  ```

### Porta 445

- Como a porta 445 é uma porta SMB, não comumente disponivel em maquinas linux, iniciado a enumeração da maquina por esta, a qual, a partir de um scan com o smbmap, lista permissão de leitura no share **sambashare**

  ```bash
  $ smbmap -H 192.168.164.76                                
  [+] Guest session       IP: 192.168.164.76:445  Name: unknown                                             
          Disk                            Permissions     Comment
          ----                            -----------     -------
          print$                          NO ACCESS       Printer Drivers           
          sambashare                      READ ONLY       Samba on Ubuntu           
          IPC$                            NO ACCESS       IPC Service (photographer server (Samba, Ubuntu))
  ```
  
- Ao acessar o share, encontrado dois arquivos, os quais foram transferidos para a maquina local.

  ```bash
  $ smbclient //192.168.164.76/sambashare                                                                   Enter WORKGROUP\zurc's password: 
  Try "help" to get a list of possible commands.                                                                       
  smb: \> dir                                                                                                          
    .                                   D        0  Thu Aug 20 12:51:08 2020                      
    ..                                  D        0  Thu Aug 20 13:08:59 2020                               
    mailsent.txt                        N      503  Mon Jul 20 22:29:40 2020                           
    wordpress.bkp.zip                   N 13930308  Mon Jul 20 22:22:23 2020                                               
                  3300080 blocks of size 1024. 2958792 blocks aailable
  ```
  
- O primeiro arquivo, **mailsent.txt** contem uma mensagem de e-mail enviada, conforme abaixo, enquanto o segundo arquivo aparentemente se trata de uma instalaçao default do wordpress pt-br 5.4.2.

  ```bash
  cat ../loot/mailsent.txt 
  Message-ID: <4129F3CA.2020509@dc.edu>
  Date: Mon, 20 Jul 2020 11:40:36 -0400
  From: Agi Clarence <agi@photographer.com>
  User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.0.1) Gecko/20020823 Netscape/7.0
  X-Accept-Language: en-us, en
  MIME-Version: 1.0
  To: Daisa Ahomi <daisa@photographer.com>
  Subject: To Do - Daisa Website's
  Content-Type: text/plain; charset=us-ascii; format=flowed
  Content-Transfer-Encoding: 7bit
  
  Hi Daisa!
  Your site is ready now.
  Don't forget your secret, my babygirl ;)
                                                           
  ```

### Porta 8000

- Após ler a mensagem de e-mail compartilhada acima, algo chamou a atenção no scan da porta 8000, que executa um website chamado Koken. Ao buscar **koken** no searchsploit, retornado informaçao de um upload de arquivo arbitrario, porem autenticado, o que bate com a versão instalada de acordo com o scan do Nmap

  ```bash
  $ searchsploit koken      
  ---------------------------------------------------------------------- ------------------------
   Exploit Title                                                        |  Path
  ---------------------------------------------------------------------- ------------------------
  Koken CMS 0.22.24 - Arbitrary File Upload (Authenticated)             | php/webapps/48706.txt
  ----------------------------------------------------------------------------------- -----------
  ```

- Ao tentar acessar a pagina <website>:8000/admin, validado que os atributos solicitados eram o e-mail e senha. Uma vez que o e-mail já temos com base na mensagem de e-mail a senha pode ser alguma combinação do trecho onde é mencionado "secret" no corpo da mensagem, onde **babygirl** funcionou com sucesso

- Após seguir procedimento compartilhado no N-day 48706 do searchsploit, obtido execuçao remota de código a partir da url **http://192.168.164.76:8000/storage/originals/01/5f/image.php** e, consequentemente, um shell reverso

  

## Escalação de privilégios

- Com a conta com a conta www-data, obtido flag user

  ```bash
  www-data@photographer:/home/daisa$ dir
  dir
  Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos  examples.desktop  local.txt  user.txt
  www-data@photographer:/home/daisa$ cat user.txt
  cat user.txt
  This is not the flag you're looking for...
  www-data@photographer:/home/daisa$ cat local.txt
  cat local.txt
  d45321b5893db0c11454b00ddef9e546
  www-data@photographer:/home/daisa$ 
  
  ```

  

- 