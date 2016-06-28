# ilias-workshop

Workshop to learn the Basics of Websecurity.

Install:

1. Build Docker Containers:
 -  switch to levels
 - run skript "build_all_containers.sh"
2. Edit External Content XML with the content of the "plugin.xml" in this directory.
3. Create External Content Modul in ILIAS with same secret as defined in config.js and level value of the level you want to start.
4. modify config.js to your needs
5. Go to directory of app.js and do "npm install" to make sure all dependencies within package.json are installed on the system.
6. Start app.js with node or forever.