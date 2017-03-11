"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs");

var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');


mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
 app.get('/test/:p1', function (request, response) {
     // Express parses the ":p1" from the URL and returns it in the request.params objects.
     console.log('/test called with param1 = ', request.params.p1);

     var param = request.params.p1 || 'info';

     if (param === 'info') {
         // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
         SchemaInfo.find({}, function (err, info) {
             if (err) {
                 // Query returned an error.  We pass it back to the browser with an Internal Service
                 // Error (500) error code.
                 console.error('Doing /user/info error:', err);
                 response.status(500).send(JSON.stringify(err));
                 return;
             }
             if (info.length === 0) {
                 // Query didn't return an error but didn't find the SchemaInfo object - This
                 // is also an internal error return.
                 response.status(500).send('Missing SchemaInfo');
                 return;
             }

             // We got the object - return it in JSON format.
             console.log('SchemaInfo', info[0]);
             response.end(JSON.stringify(info[0]));
         });
     } else if (param === 'counts') {
         // In order to return the counts of all the collections we need to do an async
         // call to each collections. That is tricky to do so we use the async package
         // do the work.  We put the collections into array and use async.each to
         // do each .count() query.
         var collections = [
             {name: 'user', collection: User},
             {name: 'photo', collection: Photo},
             {name: 'schemaInfo', collection: SchemaInfo}
         ];
         async.each(collections, function (col, done_callback) {
             col.collection.count({}, function (err, count) {
                 col.count = count;
                 done_callback(err);
             });
         }, function (err) {
             if (err) {
                 response.status(500).send(JSON.stringify(err));
             } else {
                 var obj = {};
                 for (var i = 0; i < collections.length; i++) {
                     obj[collections[i].name] = collections[i].count;
                 }
                 response.end(JSON.stringify(obj));

             }
         });
     } else {
         // If we know understand the parameter we return a (Bad Parameter) (400) status.
         response.status(400).send('Bad param ' + param);
     }
 });

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {

        User.find({}, '_id first_name last_name login_name __v password', function (err, user) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/list error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (user.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(400).send('Missing User');
                return;
            }
            var userList = JSON.stringify(user);
            response.status(200).send(userList);
            // We got the object - return it in JSON format.
        }); 


});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    var id = request.params.id;

    User.findOne({ '_id': id }, function(err, user) {
        if (err || user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        var userDetails = JSON.stringify(user);
        // response.end(JSON.stringify(userDetails));
        response.status(200).send(userDetails);
    } );
    
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
 app.get('/photosOfUser/:id', function (request, response) {
     const id = request.params.id;
     Photo.find ({'user_id': id}, function(err, photos){
         if (photos.length === 0) {
             response.status(400).send('Not found');
         } else {
           let photoArray = JSON.parse(JSON.stringify(photos));
           async.map(photoArray, function(photo, photosCallback) {
               async.map(photo.comments, function(comment, commentsCallback) {
                   User.findOne({ '_id': comment.user_id}, '_id first_name last_name', function(err, user) {
                       comment.user = user;
                       delete comment.user_id;
                       commentsCallback(err, comment);
                   });
               }, function(err, mergedCommentsArray) {
                   photosCallback(err, mergedCommentsArray);
               });
           }, function(err, mergedPhotosArray) {
               response.status(200).send(photoArray);
           });
         }
     });
 });

 //register
  app.post('/user', function (request, response){
     // if there is a match
     const userObj = request.body.newUser
     const loginName = request.body.newUser.login_name;

     User.findOne ({'login_name': loginName}, function(err, user){
         if (user) {
             response.status(400).send('user name already exists');
         } else {
            User.create(userObj, function (err, photoObject) {
              if (err) return handleError(err);
              // saved!
              response.status(200).send('user uploaded');
            })
         }

     })
     
  });

//login
 app.post('/admin/login', function (request, response){
    // if there is a match
    const loginName = request.body.login_info.name;
    const password = request.body.login_info.password;
    console.log(loginName);
    console.log(password);

    User.findOne ({'login_name': loginName}, function(err, user){
        if (user.password === password) {
            request.session.user_id = user._id;
            request.session.__v = user.__v;
            response.status(200).send(user);
        } else {
            response.status(400).send('Not found');
        }

    })
    
 });

//logout
app.post('/admin/logout', function (request, response){
    // if there is a match
    request.session.destroy();
    response.status(200).send();    
    
 });

//post comment
 app.post('/commentsOfPhoto/:photo_id', function (request, response){
    // if there is a match
    const comment = request.body;
    const user_id = request.session.user_id;
    comment.user_id = user_id;
    var photo_id = request.params.photo_id;
    console.log("here2");
    console.log(comment);
    console.log(photo_id);

    Photo.update ({_id: photo_id}, {$push: {comments: comment}}, function(err, photo) {
        if (err) {
            response.status(400).send('Not found');
        }
        else {
            response.status(200).send();
        }
    })
    
 });

 //upload and post photo
  app.post('/photos/new', function (request, response){

    processFormBody(request, response, function (err) {
                if (err || !request.file) {
                    // XXX -  Insert error handling code here.
                    response.status(400).send('No file');
                    return;
                }
                // request.file has the following properties of interest
                //      fieldname      - Should be 'uploadedphoto' since that is what we sent
                //      originalname:  - The name of the file the user uploaded
                //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
                //      buffer:        - A node Buffer containing the contents of the file
                //      size:          - The size of the file in bytes

                // XXX - Do some validation here.
                // We need to create the file in the directory "images" under an unique name. We make
                // the original file name unique by adding a unique prefix with a timestamp.
                var timestamp = new Date().valueOf();
                var filename = 'U' +  String(timestamp) + request.file.originalname;
                var user_id = request.session.user_id;
                var __v = request.session.__v;
                console.log(filename);

                fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
                    if (err) {
                        response.status(400).send('file upload error');
                    }
                    else {
                        var photoObject = {};
                        photoObject.file_name = filename;
                        photoObject.user_id = user_id;
                        photoObject.__v = __v;
                        photoObject.comments = [];
                        photoObject.date_time = timestamp;
                        console.log (photoObject);

                        Photo.create(photoObject, function (err, photoObject) {
                          if (err) return handleError(err);
                          // saved!
                          response.status(200).send('file uploaded');
                        })

                    }
                  // XXX - Once you have the file written into your images directory under the name
                  // filename you can create the Photo object in the database
                  //I have.. user_id
                  //I can find photo object of user_id
                  //insert new photo object with: _id (empty?) , file_name , user_id (session), __v (session), comments [], date_time = timestamp 
                });
            });
     
  });

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


