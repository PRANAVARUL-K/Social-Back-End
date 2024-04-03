// Models/Post.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userName: String,
    description: String,
    image: {
        data: Buffer, // Buffer type to store binary data
        contentType: String // String type to store the content type of the image
    }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
