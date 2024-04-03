const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ClientModel = require('./Models/Client')
//const Post = require('./Models/Post');
const jwt = require('jsonwebtoken')
const multer = require('multer');
//const cookieparser = require('cookie-parser');
 

const app = express();
app.use(express.json())
app.use(cors())
//app.use(cookieparser());

mongoose.connect("mongodb://localhost:27017/client");

app.use(express.static('images'));

app.post('/register', (req,res) => {
    ClientModel.create(req.body)
    .then(client => res.json(client))
    .catch(err => res.json(err))
})

app.post('/login', (req,res) => {
    const {userName, password} = req.body
    ClientModel.findOne({_id: userName})
    .then(user => {
        if(user)
        {
            if(user.password === password)
            {
                const token = user.generateAuthToken();
                res.status(200).send({data: token,message: "Success"});
            }
            else
                res.json("Password or Email is Incorrect")
        }
        else
        {
            res.json("Entered Email Id is not a user")
        }
        
    })
})

app.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    ClientModel.findOne({_id: userId})
        .then(user => {
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({message: "User not found"});
            }
        })
        .catch(err => {
            res.status(500).json({message: "Internal server error"});
        });
});

app.get('/search/:username', (req, res) => {
    const username = req.params.username;
    ClientModel.find({ _id: { $regex: username, $options: 'i' } })
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            console.error('Error searching users:', err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.get('/users', (req, res) => {
    ClientModel.find({})
        .then(users => {
            res.json(users);
        })
        .catch(err => {
            console.error('Error fetching users:', err);
            res.status(500).json({ message: 'Internal server error' });
        });
});

app.put('/user/update/:userId', (req, res) => {
    const userId = req.params.userId; 
    const { email, profileDescription } = req.body;
    
    ClientModel.findByIdAndUpdate(
        userId, 
        { email, profileDescription }, 
        { new: true }
    )
    .then(user => {
        if (user) {
            res.json({ message: "User profile updated successfully", user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    })
    .catch(err => {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Internal server error' });
    });
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });


const postSchema = new mongoose.Schema({
    des: String,
    imageUrl: String,
    uname: String
});

const Post = mongoose.model('Post', postSchema);

app.post("/upload-image", upload.single('image'), async (req, res) => {
    try {
        const imageFile = req.file;
        const description = req.body.description;
        const uname = req.body.uname;
        if (!imageFile) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const newPost = new Post({
            des: description,
            imageUrl: imageFile.filename, 
            uname:uname
        });

        await newPost.save();

        return res.status(200).json({ message: 'Image uploaded successfully', imageUrl: imageFile.filename });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get("/dposts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ _id: -1 }); 
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


app.use("/uploads",express.static('uploads'));

app.get('/search-posts/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const searchResults = await Post.find({ uname: { $regex: username, $options: 'i' } });
        res.json(searchResults);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.listen(3001, () => {
    console.log('server is running');
})
