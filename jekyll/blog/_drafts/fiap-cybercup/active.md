CyberCup - Active

# CyberCup - Active

## Enumeration

- Nmap

- Validado que a versão do ActiveMQ é 5.8 ou 5.9 de acordo com a release date no rodape da pagina e site do github. COnsiderando este fato optamos pelo ultimo exploit **48181**

```
----------------------------------------------------------------------------------- ---------------------
  Exploit Title                                                                     |  Path
----------------------------------------------------------------------------------- ---------------------
ActiveMQ < 5.14.0 - Web Shell Upload (Metasploit)                                  | java/remote/42283.rb
Apache ActiveMQ 5.11.1/5.13.2 - Directory Traversal / Command Execution            | windows/remote/40857.txt
Apache ActiveMQ 5.2/5.3 - Source Code Information Disclosure                       | multiple/remote/33868.txt
Apache ActiveMQ 5.3 - 'admin/queueBrowse' Cross-Site Scripting                     | multiple/remote/33905.txt
Apache ActiveMQ 5.x-5.11.1 - Directory Traversal Shell Upload (Metasploit)         | windows/remote/48181.rb
----------------------------------------------------------------------------------- --------------------
```