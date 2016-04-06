# ilias-workshop

Workshop to learn the Basics of Websecurity.

Install:

1. Build Docker Containers:
 -  switch to levels
 - run command docker build -f cmdi01/Dockerfile -t sclyther/ilias_cmdi01 .
2. Create External Content Modul in ILIAS with same secret as defined in config.js, random key and level value of the level you want to start
3. modify config.js to your needs
4. Start app.js with node or forever