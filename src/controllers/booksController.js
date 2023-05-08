const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const isValid = require("../validators/bookValidator")
const isValidUser = require("../validators/userValidator")
const mongoose = require('mongoose')

const createBook = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Body should not be empty" });
    }

    const keys = ["title", "excerpt", "userId", "ISBN", "category","subcategory", "reviews","isDeleted","releasedAt","bookCover"];

    if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
      return res.status(400).send({ status: false, message: "wrong Parameters" });
    }

    let title= isValid.isValidTitle(data.title)
    if(title){
        return res.status(400).send({status: false, message: title})
    }
    data.title=data.title.trim()
    data.title=data.title[0].toUpperCase()+data.title.slice(1)//For Concate

  let excerpt= isValid.isValidExcerpt(data.excerpt)
    if(excerpt){
        return res.status(400).send({status: false, message: excerpt})
    }

    let isbn=isValid.isValidISBN(data.ISBN)
    if(isbn){
    return  res.status(400).send({status: false, message: isbn })
    }  

    let isbTitle = await bookModel.findOne({$or:[{ISBN:data.ISBN, isDeleted: false},{title:data.title, isDeleted: false}]})
    if(isbTitle){
        return  res.status(400).send({status:false, message: "Title or ISBN already Exists"})
    }
    //one db call
    let Category= isValid.isValidCategory(data.category)
    if(Category){
        return res.status(400).send({status: false, message: Category })
    }

    let SubCategory= isValid.isValidSubCategory(data.subcategory)
    if(SubCategory){
        return res.status(400).send({status: false, message: SubCategory })
    }

    if(typeof data.reviews == "string")
    {
      let Review= isValid.isValidReview(data.reviews)
    if(Review){
        return res.status(400).send({status: false, message: Review})
    }}

    let releasedAt= isValid.isValidReleased(data.releasedAt)
    if(releasedAt){
        return res.status(400).send({status: false, message: releasedAt})
    }

    let book = await bookModel.create(data)
    return res
    .status(201).send({status: true, message:"Success",data:book})
  } 
  catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
//**********Get Book by Query Param ******************/
let getBooks = async function (req, res) {
  try {
      let data = req.query
      let obj = { isDeleted: false }

      //============ Invalid param validation==================//
      let objArr = ["userId", "category", "subcategory"]
      
      if (!Object.keys(data).every(elem => objArr.includes(elem)))
      return res.status(400).send({ status: false, message: "wrong query parameters present" });
      
      //============ Invalid userId validation==================//
       if (data.userId) {
          if (!mongoose.Types.ObjectId.isValid(data.userId)) {
              return res.status(400).send({ status: false, message: "Invalid userId" })
          }
          obj.userId = data.userId
      }
      if (data.category||data.category==0) {
          if(data.category.trim().length==0){
              return res.status(400).send({ status: false, message: " Please give any value in Category Param" }) 
          }
          obj.category = data.category
      }
      if (data.subcategory||data.subcategory==0) {
          if(data.subcategory.trim().length==0){
              return res.status(400).send({ status: false, message: " Please give any value in Subcategory Param" })     
          }
          obj.subcategory = data.subcategory
      }
        //capital letters coming first
      let listOfBooks = await bookModel.find(obj).select(
          { _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort(
              { title: 1 })
      if (listOfBooks.length == 0) {
          return res.status(404).send({ status: false, message: "No book Found with given filter " })
      }
      return res.status(200).send({ status: true,message:"Books list", data: listOfBooks })
  } 
  catch (error) {
      return res.status(500).send({ status: false, message: error.message })

  }

}

//****************Get Book with Path Param *********************/
const getBook = async function(req,res){

    try{ 
        const bookId = req.params.bookId
     //not done in authentication
     if (!bookId || !isValidUser.isValidId(bookId))
     return res.status(400).send({ status: false, message: "No bookId given or invalid" });
     
     if (Object.keys(req.query).length != 0) {
        return res.status(400).send({ status: false, message: "Query params not allowed" });
      }
     const book = await bookModel.findOne({_id:bookId,isDeleted:false})
     const reviewData = await reviewModel.find({bookId:bookId,isDeleted:false}).select({isDeleted:0,createdAt:0,updatedAt:0,__v:0})
 //console.log(book)
     if(!book)
     return res.status(404).send({status:false,message:"No book found"})
     
     //If you use toObject() mongoose will not include virtuals by default
     const books = book.toObject()
     books.reviewsData = reviewData

     return res.status(200).send({status:true,message:"Books list",data:books})
 }catch(error)
 {
     return res.status(500).send({status:false,message:error.message})
 }
 
 }


 //************updtae book***************** */
const updateBook  = async function(req,res){

   try{ 
    const data = req.body
    const bookId = req.params.bookId

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, message: "Body should not be empty" });
    }

    const keys = ["title", "excerpt", "ISBN", "releasedAt"];

    if (!Object.keys(req.body).every((elem) => keys.includes(elem))) {
      return res.status(400).send({ status: false, message: "wrong Parameters" });
    }

    //check for all fields
    if(data.title!=undefined)
    {let title= isValid.isValidTitle(data.title)
    if(title){
        return res.status(400).send({status: false, message: title})
    }
    data.title=data.title.trim()
    data.title=data.title[0].toUpperCase()+data.title.slice(1)//For Concate
    }
    
   
    //one db call
    if(data.excerpt!=undefined)
    {let excerpt= isValid.isValidExcerpt(data.excerpt)
    if(excerpt){
        return res.status(400).send({status: false, message: excerpt})
    }}

    if(data.ISBN!=undefined)
    {let isbn=isValid.isValidISBN(data.ISBN)
    if(isbn){
    return  res.status(400).send({status: false, message: isbn })
    }}  

    let isbTitle = await bookModel.findOne({$or:[{ISBN:data.ISBN, isDeleted: false},{title:data.title, isDeleted: false}]})
    if(isbTitle){
        return  res.status(400).send({status:false, message: "Title or ISBN already Exists"})
    }

    if(data.releasedAt!=undefined)
    {let releasedAt= isValid.isValidReleased(data.releasedAt)
    if(releasedAt){
        return res.status(400).send({status: false, message: releasedAt})
    }}
    
    const update = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false},{$set:data},{new:true})

    if(!update)
    return res.status(404).send({status:false,message:"No document found"})

    return res.status(200).send({status:true,message:"Document updated",data:update})
}catch(error)
{return res.status(500).send({status:false,message:error.message})}
}

//============================= DeleteBook By Id ==================================================//

const deleteBookById=async function(req,res){
    try{
      const bookId=req.params.bookId
  
    let deleteBook= await bookModel.findByIdAndUpdate(bookId,{$set:{isDeleted:true,deletedAt:new Date()}})
     return res.status(200).send({status:true,message:"Book deleted Succesfully"})
    }catch(error){
      return res.status(500).send({status:false, message:error.message})
      
    }
  
   }
   
   module.exports.getBook = getBook
   module.exports.createBook = createBook;
   module.exports.getBooks = getBooks
   module.exports.updateBook  = updateBook
   module.exports.deleteBookById = deleteBookById
