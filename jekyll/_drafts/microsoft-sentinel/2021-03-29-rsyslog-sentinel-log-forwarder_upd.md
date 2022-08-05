---
layout: single
title: "Azure Sentinel: Log Forwarder Configuration"
namespace: rsyslog-sentinel-log-forwarder
category: "Azure Sentinel"
tags:
  - Sentinel
  - Syslog
  - CEF
  - Rsyslog
  - Linux
  - Syslog Server
  - Syslog Forwarder
  - Log Collector
  - Log Forwarder
header:
   teaser: https://i.imgur.com/xsbyF4T.png
   og_image: *teaser
date: 2021-03-29 12:00:00 -03
last_modified_at: 2021-11-06 16:00:00 -03
toc: true
---

Often I help customers on deploying CEF/Syslog forwarders in their environments to gather data from Network Appliances and/or other servers and services into Log Analytics, which is consequently available for Azure Sentinel.<!--more-->

Besides having plenty of documentation on how to do this deployment, as well as other community resources like Tech Community and Webinars, I have compiled all the resources I normally review with my customers in their environments.

{% capture changelog %}
:newspaper: **Edits**:

- **18/12/2021** - Added [Rsyslog RuleSet](#ruleset-usage) as alternative to editing default rsyslog files and added recommendation to keep [generated timestamp](#keep-generated-timestamp).
- **30/04/2021** - Added section [Repeated message reduction](#repeated-message-reduction)
{% endcapture %}

<div>
{{ changelog | markdownify }}
</div>{: .notice--success}

## Requirements

According to [Microsoft's official documentation](https://docs.microsoft.com/en-us/azure/sentinel/connect-common-event-format), the requirement for this resource is quite simple as listed below:

- 4 CPUs and 8GB RAM, which is capable of handling up to 8500 EPS (events per second) using rsyslog, as stated in the docs.
  - If you're deploying this infrastructure in Azure you can use the SKU **Standard_F4s_v2** which is compute-optimized, recommended in this case.
- A Microsoft Monitoring Agent (aka omsagent) supported Linux distribution.
- Python version 2.7 or 3.
- One of the supported Syslog daemons was installed. The most common scenario I came across uses **rsyslog**, once it normally is the default package for most of the distributions. Below I list the versions supported as stated in the docs:
  - Rsyslog v8
  - Syslog-ng 2.1 - 3.22.1

## Forwarder Architecture

![Forwarder Architecture](https://i.imgur.com/shmVfzP.png)

Forwarder architecture is simple:

- It is composed of one or more machines receiving the logs on Syslog protocol over UDP, TCP, or TLS. This is done by using rsyslog or syslog-ng daemon configurations, like any standard syslog server you might be already running in your environment.
- The received messages are forwarded to local listeners configured on omsagent to parse data as raw Syslog messages (UDP/25224) or CEF (TCP/25226).
- Messages are sent to Log Analytics Workspace according to its configuration, making them available to Sentinel.

Now I'll walk you through the detailed configuration of this service and share some tips of actions I have implemented along with some customers to mitigate some issues and reduce churn in their environment.

### Design considerations

Before deploying/reviewing your forwarder infrastructure there are some questions you need to answer that will help you to properly define your configuration:

- **Is this forwarder handling only CEF or Syslog messages or both log types?**
  - Besides both will be received through Syslog protocol, CEF messages are parsed by omsagent according to its standard, making each field available in their columns in Log Analytics while Syslog messages are stored in a single column, requiring the proper parsing when inspecting the information contained on them.
  - Also, if you're using the forwarder for both purposes, we need to prevent that messages sent as CEF be also stored as Syslog, which will incur in **double charging** for your workspace.
- **What are the facilities and severities, as well as message type and sources being forwarded to Sentinel?**
  - Over-sending data to Sentinel can also be costly if you don't filter them properly.
  - Consider mapping the detection scenarios based on [MITRE ATT&CK Matrix Techniques](https://attack.mitre.org/matrices/enterprise/) you're hunting for before sending the data. This way you can avoid sending data without a purpose to your SIEM, which won't give you any return over the investment made in the log storage and Sentinel analytics.
- **What are the security requirements for this communication?**
  - As stated in [this best practice post](https://techcommunity.microsoft.com/t5/azure-sentinel/best-practices-for-common-event-format-cef-collection-in-azure/ba-p/969990) shared by Cristhofer Romeo Muñoz, **TCP should be used as the default protocol** for every communication due to its reliability, unless your appliance only supports UDP or if you must use encryption in this communication, adopting TLS when this data is being sent over the Internet or you might have sensitive data being sent.
  - Deploying the forwarder machine closer to the source also helps reduce complexity on protocols used, as well as avoid performance issues caused by high latency between this communication.

## Installation

The initial installation can be easily achieved by running the `cef_installer.py` from [Official Github Repository](https://github.com/Azure/Azure-Sentinel/blob/master/DataConnectors/CEF/cef_installer.py) using the command line below, which can be obtained for your environment by accessing the **Common Event Format (CEF)** connector page in Sentinel or simply by replacing the `<workspace id>` and `<workspace secret>` with yours.

:bulb: **Note**: If you don't have python 2.7 in your system you might need to replace `python` with `python3` before executing the line below.
{: .notice--info}

```bash
sudo wget -O cef_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_installer.py && sudo python cef_installer.py <workspace id> <workspace secret>
```

If your forwarder machine requires a proxy for communication, you need also to update proxy settings by modifying the `/etc/opt/microsoft/omsagent/proxy.conf` file:

```bash
proxyconf="http://user:password@proxyserver:3128" #user:password can be ignored if your proxy doesn't require authentication
sudo echo $proxyconf >>/etc/opt/microsoft/omsagent/proxy.conf
sudo chown omsagent:omiusers /etc/opt/microsoft/omsagent/proxy.conf

#restart service
sudo /opt/microsoft/omsagent/bin/service_control restart
```

This install script performs the changes below to your system. Most of them require connectivity to Github once the reference configurations are located at [Azure Sentinel's official repository](https://github.com/Azure/Azure-Sentinel):

- Download and install Microsoft Monitoring Agent for Linux.
- Configures omsagent to listen to TCP/25226 and properly handle CEF messages by copying the file `security_events.conf` under workspace configuration (`/etc/opt/microsoft/omsagent/<workspaceID>/conf/omsagent.d`).
- Forwards Messages matching ASA and CEF events to TCP/25226 by copying the file `security-config-omsagent.conf` to `/etc/rsyslog.d/` or `/etc/syslog-ng/conf.d/`, depending on your syslog daemon.
- Enables syslog daemon to listen to TCP/514 e UDP/514 for inbound communication at `/etc/rsyslog.conf` or `/etc/syslog-ng/syslog-ng.conf`

With this configuration, you might be ready to forward the CEF messages to your machine, which will be sooner available in your Log Analytics workspace at `CommonSecurityLog` table but there are some other changes described here that you might benefit to collect also raw Syslog messages, as well as implement further filtering and adjustment in this infrastructure.

## Configuration

As we saw the log forwarder infrastructure is based on the Syslog daemon + omsagent. As the **rsyslog** is one of the most popular daemons used, once it comes with most of the distributions today, I'll be doing all configurations using it as a reference, but you can easily adjust the syntax also for syslog-ng if necessary.

### Rsyslog version Check and install

As stated in our docs we need to be running rsyslog v8. To confirm the running version on your system you can run the command `rsyslogd -v`, which will give an output like the example below:

```bash
$ rsyslogd -v
rsyslogd 8.32.0, compiled with:
        PLATFORM:                               x86_64-pc-linux-gnu
        PLATFORM (lsb_release -d):
        FEATURE_REGEXP:                         Yes
        GSSAPI Kerberos 5 support:              Yes
        FEATURE_DEBUG (debug build, slow code): No
        32bit Atomic operations supported:      Yes
        64bit Atomic operations supported:      Yes
        memory allocator:                       system default
        Runtime Instrumentation (slow code):    No
        uuid support:                           Yes
        systemd support:                        Yes
        Number of Bits in RainerScript integers: 64
```

According to the [project documentation](https://www.rsyslog.com/doc/v8-stable/installation/index.html), you should be fine running the latest version provided by your distribution repository unless some bug fix is not backported to it. In this case, you might need to download the latest build provided or install it from the source.

### Reloading rsyslog configuration

After any change made to the main rsyslog configuration file (`/etc/rsyslog.conf`) or any other file imported by it (normally located at `/etc/rsyslog.d/*.conf`), you need to restart the daemon so the changes are made effective. This can be achieved by running the command below:

```bash
sudo systemctl restart rsyslog.service
```

### Adjusting rsyslog listeners

Besides the `cef_installer.py` is already defining a listener for TCP/514 and UDP/514, you might require additional configuration to encrypt communication using TLS.

Your configuration for TCP and UDP should look like the sample below, which is an excerpt from file `/etc/rsyslog.conf`:

```ini
module(load="imuxsock") # provides support for local system logging
#module(load="immark")  # provides --MARK-- message capability

# provides UDP syslog reception
module(load="imudp")
input(type="imudp" port="514") 

# provides TCP syslog reception
module(load="imtcp")
input(type="imtcp" port="514")
```

For TLS Configuration there's some additional work required, where need to issue the certificates for servers and clients (if you're not using an internal PKI) as well as make the required changes to the rsyslog daemon to accept these encrypted communications.

More details and sample configurations can be found in official documentation at [this link](https://www.rsyslog.com/doc/v8-stable/tutorials/tls_cert_summary.html), from where the excerpt below was extracted to give you an idea of how this configuration looks like:

```ini
module(load="imuxsock") # local messages
module(load="imtcp" # TCP listener
    StreamDriver.Name="gtls"
    StreamDriver.Mode="1" # run driver in TLS-only mode
    StreamDriver.Authmode="anon"
    )

# make gtls driver the default and set certificate files
global(
    DefaultNetstreamDriver="gtls"
    DefaultNetstreamDriverCAFile="/path/to/contrib/gnutls/ca.pem"
    DefaultNetstreamDriverCertFile="/path/to/contrib/gnutls/cert.pem"
    DefaultNetstreamDriverKeyFile="/path/to/contrib/gnutls/key.pem"
    )

    # start up listener at port 6514
    input(
    type="imtcp"
    port="6514"
    )
```

### Preventing logging of remote events to local files

One point that is always requested by customers is that after configuring machines to work as forwarders for CEF and/or Syslog is that local log files (often `/var/log/messages` or `/var/log/syslog`) are being bloated with messages from remote servers, in most of the cases consuming all the available disk space in the volume where `/var/log` resides.

This happens because the default definitions on the service, listed below, get some facilities and severities stored in some local files without checking the source of the events (line comments and empty removed for simplicity).

:bulb: **Note**: The location you can find in this default configuration varies depending on your Linux distribution. For Ubuntu there's a file named `/etc/rsyslog.d/50-default.conf` while for RHEL based distributions (RHEL, CentOS, Fedora) it is in the main `/etc/rsyslog.conf`.
{: .notice--info}

```ini
#Extracted from Ubuntu /etc/rsyslog.d/50-default.conf

auth,authpriv.*                 /var/log/auth.log
*.*;auth,authpriv.none          -/var/log/syslog
kern.*                          -/var/log/kern.log
mail.*                          -/var/log/mail.log
mail.err                        /var/log/mail.err
*.emerg                         :omusrmsg:*
```

As you can see, anything that matches those severities is sent to the specified local files. A quick way to prevent this issue is to edit your configuration file to accept only messages generated by localhost (`127.0.0.1`):

```ini
if ($fromhost-ip == '127.0.0.1') then {
    auth,authpriv.*                 /var/log/auth.log
    *.*;auth,authpriv.none          -/var/log/syslog
    kern.*                          -/var/log/kern.log
    mail.*                          -/var/log/mail.log
    mail.err                        /var/log/mail.err
    *.emerg                         :omusrmsg:*
}
```

#### RuleSet usage

After some time, knowing better rsyslog and some of its features, came across the **RuleSets**. According to the official documentation it can be used, among other purposes, to split local and remote logging (vide [RSyslog Documentation - rsyslog](https://www.rsyslog.com/doc/master/concepts/multi_ruleset.html#split-local-and-remote-logging)) which is exactly what we aimed to achieve by editing default rsyslog files.

Another advantage mentioned is **performance**. Since, depending on the implementation, we might not have any filters, this can provide better performance than processing in the main queue.

This is basically achieved by 2 changes:

- **Bind listeners to a RuleSet**: This will prevent received logs from being processed from existing files and, depending on the ruleset configuration, dedicate a separated queue for messaging processing. In the example below we're binding TCP and UDP inputs to a ruleset called *NewQueue*

  ```ini
  module(load="imudp")
  input(type="imudp" port="514" ruleset="NewQueue") 
  
  module(load="imtcp")
  input(type="imtcp" port="514" ruleset="NewQueue")
  ```

- **Declare RuleSet in a rsyslog file configuration**: Inside this block, you can specify any action you desire for it and those actions will be applied only to messages received to input associated with this ruleset. Considering that you'll be receiving only CEF messages from these external listeners, you can use the block below to forward all messages to the omsagent CEF listener.

  ```ini
  ruleset(name="NewQueue"){
    *.* @@127.0.0.1:25226
  }
  ```

  :bulb: **Note**: For simplicity legacy syslogd syntax was used. You can benefit from a better performance by using a dedicated queue on this ruleset processing, according to rsyslog reference at [RSyslog Documentation - rsyslog](https://www.rsyslog.com/doc/v8-stable/concepts/queues.html), which is also used by Microsoft CEF-VMSS configuration available on [GitHub](https://github.com/Azure/Azure-Sentinel/blob/master/DataConnectors/CEF-VMSS/security-config-omsagent.conf)
  {: .notice--info}

Considering you have both Syslog and CEF reception in the same infrastructure you can choose between one of the following scenarios:

- **Have simple filter actions inside RuleSet declaration**: This is necessary once you can't split this configuration into several files and if you have complex settings to use to filter out messages and/or to differ raw Syslog from CEF this might be easier. We have to prevent also that complex filters be applied, which might impact performance in some scenarios.

  - The example below filter out some messages, forward CEF messages to their specific listener, and forward specific facilities and severities to their respective tables

  ```ini
  ruleset(name="NewQueue"){
    # Drop messages from process XPTO based on its tag
    :syslogtag, isequal, "XPTO" stop

    # Forwards CEF messages to CEF listener and discard them
    if ($rawmsg contains "CEF:") or ($rawmsg contains "ASA-") then {
      *.*     @@127.0.0.1:25226
      stop
    }

    # Forwards messages from local4.* to Log Analytics
    local4.* @127.0.0.1:25224
  }
  ```

- **Configure a listener for each data source**: This should be the option to go, as previously exemplified, can reduce to no or least possible filters on received messages.

  ```ini
  ## Defines a specific listener for PFSense
  input(type="imtcp" port="515" ruleset="PfSense")
  
  ## Define ruleset actions
  ruleset(name="PfSense"){
    # Optionally discard some unecessary messages
    if ($rawmsg contains "TestEnv") then stop
      *.* @127.0.0.1:25224
  }
  ```

### Repeated message reduction

As remembered by my colleague [Flavio Honda](https://www.linkedin.com/in/flavio-honda/), Rsyslog has an option that can help you reduce repeated messages.

If you have trouble with this kind of situation or even want to prevent this even before happens in the first time, you can enable the configuration below into your `/etc/rsyslog.conf` file :smile:. Just pay attention if this configuration isn't already at the default rsyslog configuration file.

```ini
$RepeatedMsgReduction on
```

Official references about this feature in Rsyslog documentation can be found on [this link](https://www.rsyslog.com/doc/master/configuration/action/rsconf1_repeatedmsgreduction.html).

### Message processing flow

At rsyslog, the first file to be processed is `rsyslog.conf`, which normally contains an import to all `*.conf` inside `/etc/rsyslog.d,` and the files are processed **alphabetically**. When a message arrives or is generated in the system, it is forwarded and evaluated by each set in the same order, unless we explicitly change this behavior.

In the configuration below, let's consider that we're forwarding messages in CEF format from an appliance that comes with facility `local4.info`:

<img src="https://i.imgur.com/8HW60a9.png" alt="processing - initial configuration" style="zoom:80%;" />{: .align-center}

- If no changes were made to `rsyslog.conf` or `50-default.conf` to prevent logging from remote hosts, these messages will be stored in the `/var/log/Syslog file.
- Also, if I there's a match in `95-omsagent.conf` this message will be sent to Log Analytics workspace as raw Syslog.
- And finally, it will match the `security-config-omsagent.conf` by the regex pattern and send it as CEF to the table `CommonSecurityLog`.

This will not only result in a full disk but also in double charging for this event, which will be stored twice in Log Analytics.

To prevent this behavior, as Ofer Shezaf shared in one of the [Security Community Webinars](https://aka.ms/securitywebinars) (*Log Forwarder deep dive \| Filtering CEF and Syslog events*), we'll rename the file `security-config-omsagent.conf` to `60-cef.conf` so it can be processed **before** `95-omsagent.conf` file.

Also, we need to ensure that once the messages are forwarded to the CEF listener at TCP/25226 we'll discard them, which can be done by the instruction `stop`. **Stop** drops the messages and they are no longer processed in the message flow.

:bulb: **Note**: You may find some variations of the stop instruction as a tilde (`~`). This came from the legacy syslogd syntax
{: .notice--info}

The configuration will look like this:

```bash
$ cat /etc/rsyslog.d/60-cef.conf
if ($rawmsg contains "CEF:") or ($rawmsg contains "ASA-") then {
        *.*     @@127.0.0.1:25226
        stop
}
```

<img src="https://i.imgur.com/fTZellZ.png" alt="processing - reordering" style="zoom:80%;" />{: .align-center}

### Adjusting `95-omsagent.conf`

After the initial installation, your MMA agent will create this file located at the configuration folder of your Syslog daemon (`/etc/rsyslog.d/95-omsagent.conf`) in sync with the settings you can define in the Azure Portal navigating to your Log Analytics workspace > Agents Configuration > Syslog:

![Log Analytics Agent Configurations - Syslog](https://i.imgur.com/M80i6Pg.png)

For the configuration above the content of this file will look like this:

```ini
# OMS Syslog collection for workspace <workspace id>
auth.=alert;auth.=crit;auth.=debug;auth.=emerg;auth.=err;auth.=info;auth.=notice;auth.=warning  @127.0.0.1:25224
authpriv.=alert;authpriv.=crit;authpriv.=debug;authpriv.=emerg;authpriv.=err;authpriv.=info;authpriv.=notice;authpriv.=warning  @127.0.0.1:25224
local3.=alert;local3.=crit;local3.=debug;local3.=emerg;local3.=err;local3.=info;local3.=notice;local3.=warning  @127.0.0.1:25224
local4.=alert;local4.=crit;local4.=debug;local4.=emerg;local4.=err;local4.=info;local4.=notice;local4.=warning  @127.0.0.1:25224
```

Besides this configuration is extremely easy to set through the portal, it applies globally to all your Linux systems running omsagent connected to this workspace, ingesting more information you need into your Log Analytics workspace if more data type is selected than needed.

If you need to set a different configuration to some machines like your forwarders, you are recommended to edit directly the `95-omsagent.conf` by adding or removing facilities from it as well as building your criteria to send data to Azure but we need first prevent that this file is synchronized again with the definitions in the portal.

The command below "breaks" the existing link between this file and the workspace configuration:

```bash
sudo su omsagent -c 'python /opt/microsoft/omsconfig/Scripts/OMS_MetaConfigHelper.py --disable'
```

The only thing that cannot be changed at `95-omsagent.conf` file is the forwarding instruction to `@127.0.0.1:25224`.

:bulb: **Note**: In syslogd syntax, a single at-sign (`@`) means UDP while double at sign (`@@`) means TCP.
{: .notice--info}

:warning: **Warning**: In the previously mentioned Deep Dive CEF webinar, Ofer also recommends you change the omsagent configuration to accept messages using TCP. If you follow his recommendation, you also need to adjust any forwarding instruction to double at signs in your `95-omsagent.conf` file, otherwise, the messages won't be sent to Log Analytics.
{: .notice--warning}

### Keep Generated Timestamp

When the agent forwards events, it should keep the original timestamp, not the timestamp they were forwarded. The script `TimeGenerated.py` from Sentinel official Github repository ensures that by making some changes at `/opt/microsoft/omsagent/plugin/filter_syslog_security.rb`

```bash
sudo wget -O TimeGenerated.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/TimeGenerated.py && python TimeGenerated.py $workspaceid
```

### Filtering out events

If you're still noticing ingestion of unnecessary events into your workspace, you can both implement the filter in the source as well in the forwarder, which is normally easier once most of the appliances don't support much granularity on their configurations.

An uncomplicated way to implement this is creating a file to be processed before the files `60-cef.conf` and `95-omsagent.conf`, in this example named `59-filter-out.conf` but you can use whatever name you want but need to ensure they'll be processed in the right order.

<img src="https://i.imgur.com/gxTHSWA.png" alt="filtering out messages" style="zoom:80%;" />{: .align-center}

In this file we'll make use again of the instruction `stop`, dropping the messages we don't want to be forwarded either to Syslog or CEF. The sample below drops any messages containing "test" and matching one of the severities/facilities will be dropped.

```ini
if ($rawmsg contains "test") and prifilt("auth,authpriv.*") then {
        stop
}
```

The rsyslog documentation is very rich in resources on [how you can filter](https://www.rsyslog.com/doc/master/configuration/filters.html) these messages as well as [which properties](https://www.rsyslog.com/doc/master/configuration/properties.html) you have available to build your instructions in a more advanced way, including tips on [how to convert](https://www.rsyslog.com/doc/v8-stable/configuration/converting_to_new_format.html) the instructions from syslogd syntax to the advanced, previously known as **RainerScript**

Hope that this information helps you to properly deploy and maintain your CEF/Syslog forwarder infrastructure in your environment!

Do you have a specific configuration or challenge in your environment not discussed here? Feel free to reach out in the comments so we can update this post to help others facing the same! :smile:
