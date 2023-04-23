---
layout: single
title: "Walktrough: HTB Ready"
namespace: "Walktrough: HTB Ready"
category: Walkthrough
tags: HackTheBox htb-medium htb-linux
date: 2021-02-27 12:00:00
header:
   teaser: https://i.imgur.com/CVlQBn9.png
   og_image: https://i.imgur.com/CVlQBn9.png
---

Frequentemente, quando precisamos realizar alguma demonstração, ou mesmo se está buscando uma plataforma de onde realizar exercicios de red team em sua organização, as nuvens públicas são excelentes opções para.

## Criando a máquina virtual

### Virtual Network

### Network Security Group

### Maquina virtual

#### Criação

Utilize VMs serie B que possui um custo mais acessível, uma vez que nao dependemos de muita performance o tempo todo para uma máquina **D**
{: .notice--info}

#### Configurações padrão

Uma vez que definimos a criação da máquina, precisamos definir uma senha para o usuário root e usuários criados para caso precisemos acessar a console serial nestas maquinas

```bash
sudo -i
passwd
passwd <username>
```

#### Updates

Como a imagem do Kali no Azure está um pouco desatualizada, é necessário executar, como root, o comando abaixo para atualizar a chave publica utilizada para se conectar nos repositórios, de acordo com a [documentação oficial](https://www.kali.org/blog/kali-linux-2018-1-release/).

> Note that if you haven’t updated your Kali installation in some time (tsk2), you will like receive a GPG error about the repository key being expired (ED444FF07D8D0BF6). Fortunately, this issue is quickly resolved by running the following as root:

```bash
wget -q -O - https://archive.kali.org/archive-key.asc | apt-key add
```

Instalação dos pacotes necessários para sessão remota (xrdp e xfce4). O `mitmproxy` foi incluido apenas para resolver dependencias existentes na maquina.

```bash
sudo apt update && sudo apt install kali-desktop-xfce kali-themes mitmproxy xrdp -y && sudo apt autoremove -y
```

Apos instalação dos pacotes, para a ativaçaõ do xrdp, executar os comandos abaixo

```bash
sudo systemctl enable xrdp
sudo systemctl start xrdp
```

Ao acessar o RDP da primeira vez, um erro relacionado ao Colord será exibido. Para corrigí-lo, basta criar um novo arquivo conforme abaixo:

```bash
# Configure the policy xrdp session
cat > /etc/polkit-1/localauthority/50-local.d/45-allow-colord.pkla <<EOF
[Allow Colord all Users]
Identity=unix-user:*
Action=org.freedesktop.color-manager.create-device;org.freedesktop.color-manager.create-profile;org.freedesktop.color-manager.delete-device;org.freedesktop.color-manager.delete-profile;org.freedesktop.color-manager.modify-device;org.freedesktop.color-manager.modify-profile
ResultAny=no
ResultInactive=no
ResultActive=yes
EOF
```

Após instalação dos pacotes e limpeza do cache do apt e remoção dos pacotes não mais necessários, realizado full upgrade para garantir atualização total do kali. A atualização completa não foi realizada no início pois ja tive alguns problemas no passado devido a espaço em disco, ja que a imagem do kali vem com disco pequeno (3)

```bash
sudo apt update && sudo apt full-upgrade --fix-missing -y && sudo apt autoremove -y
```

#### Instalação de pacotes default

Como a instalação do Kali no azure é limitada, recomendo instalar um dos metapackages de acordo com a finalidade da maquina a ser utilizada, conforme disponível em [Kali Metapackages | Penetration Testing Tools](https://tools.kali.org/kali-metapackages).

Recomendo para CTFs e relacionados o `kali-linux-large` ou o `kali-linux-default`, instalando os demais pacotes necessários ao longo de que serão utilizados

### Instalação waagent

Aparentemente, no pacote distribuido pelo time do kali Linux, o waagent é incompativel com os pacotes de desktop, vide abaixo

```bash
$ sudo apt install waagent                                                                                   
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  dnsmasq-base grub-pc-bin libcharon-extauth-plugins libndp0 libnma-common libnma0 libopenconnect5 libstoken1 libstrongswan libstrongswan-standard-plugins libteamdctl0 libtomcrypt1 libtss2-esys-3.0.2-0 libtss2-mu0 libtss2-sys1
  libtss2-tcti-cmd0 libtss2-tcti-device0 libtss2-tcti-mssim0 libtss2-tcti-swtpm0 mobile-broadband-provider-info openconnect openfortivpn pptp-linux python3-netifaces strongswan strongswan-charon strongswan-libcharon
  strongswan-starter tpm-udev xl2tpd
Use 'sudo apt autoremove' to remove them.
The following packages will be REMOVED:
  kali-desktop-xfce network-manager network-manager-fortisslvpn network-manager-fortisslvpn-gnome network-manager-gnome network-manager-l2tp network-manager-l2tp-gnome network-manager-openconnect network-manager-openconnect-gnome
  network-manager-openvpn network-manager-openvpn-gnome network-manager-pptp network-manager-pptp-gnome network-manager-vpnc network-manager-vpnc-gnome
The following NEW packages will be installed:
  waagentq
0 upgraded, 1 newly installed, 15 to remove and 0 not upgraded.
Need to get 153 kB of archives.
After this operation, 27.6 MB disk space will be freed.
Do you want to continue? [Y/n] 
```

Para termos aproveitarmos algumas funcionalidades, sem a necessidade de criar scripts customizados, instalado waagent manualmente, conforme abaixo

```bash
git clone https://github.com/Azure/WALinuxAgent.git
cd WALinuxAgent
sudo python3 setup.py install --register-service

sudo systemctl unmask walinuxagent.service                                                                   
sudo systemctl enable walinuxagent.service
sudo systemctl start walinuxagent.service
```

Configurando interface (NMCLI)

Editar arquivo `/etc/NetworkManager/NetworkManager.conf` e definir o valor managed para true, conforme abaixo

```ini
[...]

[ifupdown]
managed=true
```
