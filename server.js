const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(bodyParser.json());


// GET requests to /blogposts => return all blog posts  
app.get('/blogposts', (req, res) => {
  BlogPost
    .find()
    .exec()
    .then(blogposts => {
      res.json({
        blogposts: blogposts.map(
          (blogpost) => blogpost.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// GET request by ID => return specific blog post
app.get('/blogposts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(blogpost =>res.json(blogpost.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});


app.post('/blogposts', (req, res) => {

  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if (! (field in req.body && req.body[field])) {
      return res.status(400).json({message: `Must specify value for ${field}`});
    }
  });

  BlogPost
    .create({
      title: req.body.title,
	  content: req.body.content,
	  author: req.body.author
	})
    .then(
      blogpost => res.status(201).json(blogpost.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    })
});

app.put('/blogposts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content', 'author'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(blogpost => res.status(201).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/blogposts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(blogpost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// if client makes request to non-existent endpoint, throw 404 error
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// declare server here: 
let server;

// runServer connects to database and then initiates server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// closeServer closes server and returns Promise
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
