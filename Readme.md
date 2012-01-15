mon4mongo
==========
MongoDB database management web server boosted with node.js and express. xhr and partial renders are also used.

![mon4mongo Screenshot](https://s3-eu-west-1.amazonaws.com/mass-io/github/mon4mongo-ss.jpg)

Dependencies
------------

+ node.js = 0.4.12
+ express >= 2.5.1
+ jade >= 0.19.0
+ mongodb = 0.9.7
+ async >= 0.1.15

You can clone github project or use npm to install.

`npm install mon4mongo`

Implementation
--------------

+ Add route to app.js. Check out the getRoute function description
+ Create jade view with appropriate properties (check out the other views in views/modules/...)
+ Create link in views/master/sidebar.jade
+ Add properties to mapping array in /public/js/methods.js to send xhr requests to correct route
+ if you want to extend base capabilities just fork base modules (/mongo/...) or add new one


Author
------

**Erhan Gundogan**

+ http://twitter.com/erhangundogan
+ http://github.com/erhangundogan
+ http://mass.io


License
---------------------

Copyright 2011 Erhan Gundogan

Licensed under the MIT License.
