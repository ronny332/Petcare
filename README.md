# Petcare

[Sure Petcare](https://www.surepetcare.com/) Flap NodeJS Reader/Writer with [FHEM](https://fhem.de/) binding.

Features:

- reads the flap state/status from the (not listed to the public) surehub.io API
- writes open/closed flap states to the surehub.io API
- two FHEM devices are updated, the reader dummy device, for instance to get the value into Amazon Alexa (door open/closed) and a writer dummy devices, which handles updates
- the online status of the flap is monitored on a third FHEM dummy device (could be one of the other devices before)
- HTTP REST API for controlling the flap state and monitoring the flap device status, my device goes offline one or two times a month (not the ethernet device itself)
- the third FHEM device (I use the main dummy at for this purpose) gets all available API data as readings
- [Amazon Alexa](https://alexa.amazon.com) integration with extra FHEM notifiers (currently not part of the repo)
- [Google Assistant](https://assistant.google.com) possible, again with extra FHEM notifiers (not in use by myself, but easily doable).

The goal was to get the flap state into my FHEM instance and use it in Amazon Alexa. The first steps were the read the state to ask Alexa for the current state of the flap.
Meanwhile updating the state by voice ("Alexa, the cat is outside of the house") is working fine.
As my flap goes offline one of two times a month (have to reset the batteries to get it back online), an online status check was also implemented.

For now this fulfills my needs. Updates and fixes will follow for sure.

![FHEM readings for flap device](https://github.com/ronny332/Petcare/blob/master/doc/fhem_readings.png?raw=true)
