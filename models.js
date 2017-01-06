const mongoose = require('mongoose');

// this is our schema to represent a restaurant
const blogSchema = mongoose.Schema({
  title: {type: String, required: true},
  author: {
  	firstName: String, 
  	lastName: String
  },
  content: {type: String, required: true}
});

// return author name as human readable string
blogSchema.virtual('authorString').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim()
});

// create *instance method to return object that exposes limited resource to API
blogSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    title: this.title,
    author: this.authorString,
  };
}

const BlogPost = mongoose.model('BlogPost', blogSchema);

module.exports = {BlogPost};
