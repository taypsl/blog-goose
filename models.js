const mongoose = require('mongoose');

// schema
const blogSchema = mongoose.Schema({
	title: {type: String, required: true},
	address: {
    	firstName: String,
    	lastName: String
    }	
    content: {type: String, required: true},
})