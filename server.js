const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(bodyParser.json());

// what am I making my get request to? / "" ? 
app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .exec()
    .then(posts => {
      res.json({
        posts: posts.map(
          (posts) => posts.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(posts =>res.json(posts.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/posts', (req, res) => {

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
	    	author: req.body.author,
		})
	    .then(
	    	posts => res.json(posts.apiRepr())
	    )
	    .catch(err => {
	    	console.error(err);
	    	res.status(500).json({message: 'Internal server error'});
	    });
});

app.put('/posts/:id', (req, res) => {
  	if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    	const message = (
      		`Request path id (${req.params.id}) and request body id ` +
      		`(${req.body.id}) must match`);
    	console.error(message);
    	res.status(400).json({message: message});
  	}

  	const toUpdate = {};
  	const updateableFields = ['id', 'title', 'content', 'author'];

  	updateableFields.forEach(field => {
	    if (field in req.body) {
	      toUpdate[field] = req.body[field];
	    }
	});

	BlogPost
	    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
	    .exec()
	    .then(posts => res.status(201).end())
	    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(posts => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// runServer connects to database and then initiates server
// closeServer closes server and returns Promise
let server;

function runServer() {
  const port = process.env.PORT || 8080; 
  return new Promise((resolve, reject) => {
    //connect to mongoose database (update URL)
    //mongoose.connect(database URL, err => {if (err) { return reject(err);})
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve();
    })
    .on('error', err => {
      reject(err);
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
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