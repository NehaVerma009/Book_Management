const express = require('express');
var bodyParser = require('body-parser');
const multer = require('multer')
const route = require('./routes/route')
const app = express();
const mongoose=require('mongoose')
mongoose.connect("mongodb+srv://book-management:31VMJSSWSjcdoaAO@cluster0.eemzti8.mongodb.net/group48Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )



app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any()) 
app.use('/', route);

app.use(function(req,res){
    return res.status(404).send({status:false,message:"Path not Found."})
  })
  
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});


