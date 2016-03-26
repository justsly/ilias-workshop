# ilias-workshop

Workshop to learn the Basics of Websecurity.

Install:

1. copy ilias/Customizing/docker_controller.php into your ILIAS Base Directory.
2. Build Docker Containers:
 -  switch to levels
 - run command docker build -f cmdi01/Dockerfile -t sclyther/ilias_cmdi01 .
3. Create Test on ILIAS and Link to level like: Customizing/docker_controller.php?action=go&level=ping
4. modify config.js to your needs
5. Start app.js with node or forever