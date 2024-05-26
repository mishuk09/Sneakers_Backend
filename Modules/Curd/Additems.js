const express = require('express');
const app = express.Router();
const Post = require('../../Schema/Post');

// Create a new post
app.post('/add', (req, res) => {
    console.log('Request body:', req.body);
    const { img, category, title, newPrice, oldPrice, color, size, description } = req.body;

    const newPost = new Post({ img, category, title, newPrice, oldPrice, color, size, description });

    newPost.save()
        .then(() => res.json('Post added!'))
        .catch(err => {
            console.error('Error:', err);
            res.status(400).json('Error: ' + err);
        });
});

// Read all posts
app.get('/', (req, res) => {
    Post.find()
        .then(posts => res.json(posts))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Read a single post
app.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Update a post
app.post('/update/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            post.img = req.body.img;
            post.category = req.body.category;
            post.title = req.body.title;
            post.newPrice = req.body.newPrice;
            post.oldPrice = req.body.oldPrice;
            post.color = req.body.color;
            post.size = req.body.size;
            post.description = req.body.description;

            post.save()
                .then(() => res.json('Post updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a post
app.delete('/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id)
        .then(() => res.json('Post deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = app;
