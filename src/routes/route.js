const express = require('express');
const router =express.Router()

const userController = require("../controllers/userController")
const booksController = require("../controllers/booksController")
const reviewController = require("../controllers/reviewController")

const auth = require("../middlewares/authentication")
const aws = require ("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRZNIRGT6N",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {//new Promise creates Promise
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
//new keyword is used as constructor.it creates an instance as constructor
    var uploadParams= {
        ACL: "public-read",//Access Control Lists
        Bucket: "classroom-training-bucket", //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
       console.log(data)
      console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        //console.log(files,req.body)
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})





router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)

router.post("/books",auth.isAuthenticate,auth.authorization,booksController.createBook)
router.get("/books",auth.isAuthenticate,booksController.getBooks)
router.get("/books/:bookId",auth.isAuthenticate,booksController.getBook)
router.put("/books/:bookId",auth.isAuthenticate,auth.authorization,booksController.updateBook)
router.delete("/books/:bookId",auth.isAuthenticate,auth.authorization,booksController.deleteBookById)


router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReviewById)

module.exports= router 

