const express = require('express');
// require('dotenv').config();
const { mongoose, ObjectId } = require('mongoose')
const validator = require('validator')
// import { User,validation } from './users';
const port = process.env.port || 4000;
const app = express();
app.use(express.json());

// mongoose connection
mongoose.connect('mongodb://localhost:27017/mydb').then(() => console.log('successfully connected')).catch(error => console.error(error));
// creating games schema
const gameSchema = mongoose.Schema({
    name: {// ab
        type: String,
        required: true,
        trim: true,
        // minlength:3,
        // maxlength:20
        validate(value) {
            // value.length < 3 || value.length <=20
            if (!(value.length >= 3 && value.length <= 20)) {
                throw new Error('invalid lenght of name');
            }
        }
    },
    author: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!(value.length >= 3 && value.length <= 20)) {
                throw new Error('invalid lenght of author');
            }
        }
    },
    sale:Boolean,
    
    price: {
        type: Number, 
        trim: true,
        required:function(){
             return this.sale;
         } 
    },
    tags: {
        type: [String],
        enum: ['war', 'action', 'advanture', 'puzzel', 'racing ', 'sports', 'sooter'],
        required: true,
        validate(value) {
            if (value.length <= 1) {
                throw new Error('at least 2 tags')
            }
        }
    },
    authorEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    releaseDate: {
        type: Date,
        default: Date.now
    }
});
// creating model games
const Games = mongoose.model('ProjectGames', gameSchema);

// rest end point

//traversing game
app.get('/api/game', (req, res) => {
    Games.find()
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json(err))
        
})

// localhost:4000/api/game/find/askjgdkjasgd
app.get('/api/game/find', (req, res) => {
    // obId = new mongoose.Types.ObjectId(req.query.id)
    Games.findById({ _id: req.query.id })
        .then(result => res.status(200).json(result))
        .catch(err => res.status(400).json(err))
})
// create end point 
app.post('/api/game', (req, res) => {
    const game = new Games(req.body);
    game.save()
         .then((result)=>res.json(result))
         .catch(err=>res.json(err))


});

app.patch('/api/find/update',(req,res)=>{
           // id - X
           // releaseDate - X
           // recieve all incoming field <= req.body
           // create  array of allowed update fields => ['name','price','sale','tags']
           // check if only allowed update fields are in req.body

           allowedUpdates = ['name','price','sale','tags'];
           //updates=['name','price','sale','author'];
           updates = Object.keys(req.body);
           console.log(updates);
           isAllowed = updates.every(update=>allowedUpdates.includes(update));
           console.log(isAllowed);
           if(isAllowed){
            Games.findByIdAndUpdate(req.query.id,req.body)
                .then(result=>res.status(200).json(result))
                .catch(err=>res.status(400).json(err))
           }else{
            res.json('Update not allowed');
           }
        }
    )

app.delete('/api/game/delete',(req, res) => {
    Games.findByIdAndDelete(req.query.id)
        .then(result => res.status(200).json([result, "It is deleted"]))
        .catch(err => res.status(400).json(err));
})
// app.delete('/api/game/delete', (req, res) => {
//     Games.deleteOne({ _id: req.query.id })
//         .then(result => res.status(200).json([result, "It is deleted"]))
//         .catch(err => res.status(400).json(err));
// })
// filters  games
// app.get('/api/filter',(req,res)=>{
//     Games.find({sale:true,tags :['war','action']}).then(result=>res.json(result))
//     .catch(err=>res.json(err))
// })
// filter with sort
// app.get('/api/filter/sort',(req,res)=>{
//     Games.find({sale:true,tags :['action','war']}).sort({name:1}).then(result=>res.json(result))
//     .catch(err=>res.json(err))
// })
// // filter with sorted on selected value
// app.get('/api/filter/selected',(req,res)=>{
//     Games.find({sale:true,tags :['action','war']}).sort({name:1}).select({name:1,sale:1,price:1}).then(result=>res.json(result))
//     .catch(err=>res.json(err))
// })
// // filter with sorted on selected value basis on price value less than(lt)
// app.get('/api/filter/price',(req,res)=>{
//     Games.find({sale:true,tags :['action','war'],price:{$lt:300}}).sort({name:1}).select({name:1,sale:1,price:1}).then(result=>res.json(result))
//     .catch(err=>res.json(err))
// })
// filter with sorted on selected value basis on price value lt and gt
app.get('/api/filter/price',(req,res)=>{
    Games.find({sale:true,tags :['action','war'],price:{$lt:300}}).sort({name:1}).select({name:1,sale:1,price:1}).then(result=>res.json(result))
    .catch(err=>res.json(err))
});

// logical or in mongoose
app.get('/api/or',(req,res)=>{
    Games.find({$or:[{price:{$lt:400}},{price:{$gt:100}}]})
    .sort({name:1})
    .select({name:1,sale:1,price:1,_id:0})
    .then(result=>res.json(result))
    .catch(err=>res.json(err))
}) 

// filter with sorted on selected value basis on price value
// app.get('/api/filter/price',(req,res)=>{
//     Games.find({sale:true,tags :['action','war'],price:{$lt:300}}).sort({name:1}).select({name:1,sale:1,price:1}).then(result=>res.json(result))
//     .catch(err=>res.json(err))
// });
app.listen(port, () => {
    console.log('server is listining on port ' + port);
});
//express midle ware   
