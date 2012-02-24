---
title: A Working Example of Node with Connect, Express, Jade and Stylus
---

Recently I was interested in learning how Node.js works for Web development. I installed it and npm. No problem. I worked on a few simple implementations of servers doing some very basic routing. That was OK, but I wanted to do something more serious, something more like Sinatra for Ruby. I wanted to get Express.js installed and throw something together. There were a number of what looked like good tutorials online, so I decided to go for it. Boy was I wrong. Not that the tutorials are bad, they're quite good. The problem is they're old. A lot of things have changed with Node, Connect and Express. The result was that besides something very basic, nothing else would work. Oh, and it is kind of hard to type along with a video tutorial when the presenter makes changes so fast you can't see what he just did, or parts of the code are obscured in the presentation. Just saying. 

My goal was to create a basic app like the Nodetuts.com product management example. I would therefore need session management, error handling, logging, authentication, and the ability to edit existing products, add new products, add images for a product and upload new images for products. 

There are a bunch of "examples" on the [Express site](http://www.expressjs.com), but these are not complete examples but collections of snippets that you can use. I'm the kind of guy that like to see complete working examples for new stuff so I can totally get my head around something. So I rolled up my sleeves, sat down and plugged away until I got it all working. This is the result. One thing, I've also included a package.json file. It contains all the references to dependencies for this app. 

To make this app totally work, you first need to install Node and npm. Use npm to install Express. After that, open your terminal and cd to this directory. Then just execute this command: 

    npm install -d

Npm will first examine the package.json file to see what dependencies the app has and proceed to install everything you need: Connect, Express with support for sessions, cookies, file system, encryption, Jade templates and the Stylus CSS preprocessor. I chose Jade because I liked it minimalistic markup, and I chose Stylus instead of SASS or LESS for the same reason.

After npm gives you the OK message, you're ready to go. To run the app, cd to the directory, type **node app.js** and hit return. By default it launches a server instance on port 3333. To see the app, open your browser and type in the url: **http://localhost:3333**. You'll see the app running. You'll be able to navigate around. You'll be fine until you try to edit a product or add a new image. At that point you'll be asked to log in. To change the user name and password, open app.js and look at line 63 for the object that defines the user name and password. In real life you'd want to store this information in a database, which you would query during login. However, since that code would vary depending on the data storage, I've left it out and taken this simpler approach. There's a logout link that will end your logged in session. You'll still be able to access the other pages. If you want to change the port number that the app runs on, scroll all the way to the bottom of app.js. There you'll find:

    app.listen(3333);

Change that number to whatever works for you.

When you upload and image from your computer, it will be placed in this project's **/public/uploads/images** directory. This is so if you upload from a different computer than the one the server is running on. If you upload and image that is different put has the same name as an existing file, that will be replaced by the one you're uploading. When the app launches, it reads the directory of uploaded images to build out the select box of available images as well as to populate the page of available images for viewing: **localhost:3333/images**.