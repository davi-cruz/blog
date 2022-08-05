---

---

Occasionally, during some deliveries that involves Microsoft Cloud App Security, customers that are still not using Azure Sentinel and have a 3rd party SIEM would like to integrate MCAS alerts (and eventually activities) to this resource.

For all of those that ever needed there's no secret on making this configuration, that requires only a token generation and to configure a java applet to run, which will start sending the Syslog messages using the defined format in console to the target also defined there.

The point is once this is a simple
