---
layout: single
title: "Walktrough: HTB Secret"
namespace: htb-secret
category: Walkthrough
tags:
  - HackTheBox
  - HTB Easy
  - HTB Linux
date: 2021-07-03 16:00:00
header:
   teaser: https://i.imgur.com/T9F3vYj.png

---

Hello guys!

This week's machine will be **Secret**, an easy-rated Linux box from [Hack The Box](https://www.hackthebox.eu/), created by [z9fr](https://app.hackthebox.com/users/485024). <!--more-->

:information_source: **Info**: Write-ups for Hack The Box machines are posted as soon as they’re retired.
{: .notice--info}

![HTB Secret](https://i.imgur.com/DGe13iH.png){: .align-center}

**Add Comment**

## Enumeration

As usual, started with a quick `nmap` scan, as below

```bash
$ nmap -sC -sV -Pn -oA quick 10.10.11.120
Starting Nmap 7.92 ( https://nmap.org ) at 2022-01-22 19:34 -03
Nmap scan report for 10.10.11.120
Host is up (0.38s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 97:af:61:44:10:89:b9:53:f0:80:3f:d7:19:b1:e2:9c (RSA)
|   256 95:ed:65:8d:cd:08:2b:55:dd:17:51:31:1e:3e:18:12 (ECDSA)
|_  256 33:7b:c1:71:d3:33:0f:92:4e:83:5a:1f:52:02:93:5e (ED25519)
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: DUMB Docs
3000/tcp open  http    Node.js (Express middleware)
|_http-title: DUMB Docs
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 69.72 seconds
```

### 80/TCP - HTTP Service

Accessing the website, we can see a page containing a product documentation called **DUMB Docs**.

![HTB Secret - DUMBDocs](https://i.imgur.com/JsvgIkM.png){: .align-center}

Navigating to the docs, noticed that it mentions a web service running in a endpoint at 3000/TCP, as previously enumerated using nmap.

![HTB Secret - DUMBDocs - Register user](https://i.imgur.com/DItNSBr.png){: .align-center}

As this is a known endpoint, registered a new user and then logged in, obtaining a JTW for this session

```bash
$ curl --location --request POST 'http://10.10.11.120:3000/api/user/register' \
--header 'Content-Type: application/json' \
--data-raw ' {
        "name": "johndoe",
        "email": "john@doe.com",
        "password": "P@ssw0rd"
  }'
{"user":"johndoe"}

$ curl --location --request POST 'http://10.10.11.120:3000/api/user/login' \
--header 'Content-Type: application/json' \
--data-raw ' {
        "email": "john@doe.com",      
        "password": "P@ssw0rd"
  }'
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWVkYmU5MWEzOGJiNjA0NjA1YjUzMzAiLCJuYW1lIjoiam9obmRvZSIsImVtYWlsIjoiam9obkBkb2UuY29tIiwiaWF0IjoxNjQyOTcwODQ5fQ.bLIErbVS3NzXLF-67oUOIlqAGjAgUsaQKfpF1pJb02w
```

Inspecting this token in [JTW.MS](https://jwt.ms), obtained the following content:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}.{
  "_id": "61edbe91a38bb604605b5330",
  "name": "johndoe",
  "email": "john@doe.com",
  "iat": 1642970849
}.[Signature]
```

After validation, got confirmation that this user has been registered as a normal user

```bash
$ curl --location --request GET 'http://10.10.11.120:3000/api/priv' \                                                          
--header 'auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MWVkYmU5MWEzOGJiNjA0NjA1YjUzMzAiLCJuYW1lIjoiam9obmRvZSIsImVtYWlsIjoiam9obkBkb2UuY29tIiwiaWF0IjoxNjQyOTcwODQ5fQ.bLIErbVS3NzXLF-67oUOIlqAGjAgUsaQKfpF1pJb02w'        
{"role":{"role":"you are normal user","desc":"johndoe"}}  
```

Considering that our user was registered as a common user, started to look for other resources and information in the page that could help us get a admin access, but without success.

Inspecting the contents of the page, found a zip file to be downloaded, from execution below. In the page it is referenced as the source code of the API and this could be very useful to us in order to get a admin credential as well as what else can we execute with those privileges.

```bash
$ curl -L http://10.10.11.120 -k | grep -Eo 'href=".*"|src=".*"' | awk -F" " '{print $1}' | awk -F"\"" '{print $2}' | sort -u 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 12872  100 12872    0     0  14070      0 --:--:-- --:--:-- --:--:-- 14067
#
/
/api/
assets/css/theme.css
assets/fontawesome/js/all.min.js
assets/js/docs.js
assets/js/highlight-custom.js
assets/plugins/bootstrap/js/bootstrap.min.js
assets/plugins/gumshoe/gumshoe.polyfills.min.js
assets/plugins/popper.min.js
assets/plugins/simplelightbox/simple-lightbox.min.js
assets/plugins/smoothscroll.min.js
/docs#section-1
/docs#section-2
/docs#section-3
/docs#section-5
/docs#section-7
/download/files.zip
favicon.ico
https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.8/highlight.min.js
https://dasith.works
https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700&display=swap
#section-6

```

Inspecting the file `private.js`, found a interestring excerpt, used during user validation: To be considered a Admin, you need to register yourself using name **theadmin**

```javascript
router.get('/priv', verifytoken, (req, res) = {
    // res.send(req.user)
    
    const userinfo = { name: req.user }
    
    const name = userinfo.name.name;
    
    if (name == 'theadmin'){
        res.json({
            creds:
            {
                role:"admin",
                username:"theadmin",
                desc : "welcome back admin,"
            }
        })
    } else {
        res.json({
            role: {
                role: "you are normal user",
                desc: userinfo.name.name
                }
        })
    }
})
```

Also in this same file, found another route not listed in the docs, which also requires to be a user called **theadmin** to work

```javascript
router.get('/logs', verifytoken, (req, res) => {
    const file = req.query.file;
    const userinfo = { name: req.user }
    const name = userinfo.name.name;
    
    if (name == 'theadmin'){
        const getLogs = `git log --oneline ${file}`;
        exec(getLogs, (err , output) =>{
            if(err){
                res.status(500).send(err);
                return
            }
            res.json(output);
        })
    }
    else{
        res.json({
            role: {
                role: "you are normal user",
                desc: userinfo.name.name
            }
        })
    }
})
```

Considering the findings, registered a new user with name theadmin and reached out to `/logs` in order to see which information is disclosed there

```bash

```
