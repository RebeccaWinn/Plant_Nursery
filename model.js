const mongoose= require('mongoose');
mongoose.connect('mongodb+srv://beck:dogshelter@4200-dhzrl.mongodb.net/dummyapp?retryWrites=true&w=majority',
{useNewUrlParser:true,useUnifiedTopology:true, useCreateIndex: true,});

const bcrypt=require('bcrypt');

var Plant= mongoose.model('Plant', {
    name:{
        type:String,
        required:[true,"Name of plant must be provided"]
    },
    climate:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

});
var userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    encryptedPassword:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    }
});
userSchema.methods.setEncryptedPassword= function(plainPassword,callBackFunction) {
    //"this"(self) is the user instance 
    //var myUser=this;
    bcrypt.hash(plainPassword,12).then(hash=>{
        this.encryptedPassword=hash;
        callBackFunction();
    });
};
userSchema.methods.verifyPassword=function(plainPassword,callBackFunction){
    bcrypt.compare(plainPassword,this.encryptedPassword).then(result =>{
        callBackFunction(result);
    });
};
var User=mongoose.model('User',userSchema);

 module.exports={
    Plant:Plant,
    User:User
 };