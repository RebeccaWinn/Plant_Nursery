const express = require('express');
const bodyParser= require('body-parser');
const model = require ('./model');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const passport=require('passport');
const passportLocal=require('passport-local');
const session=require('express-session');

//Middleware
app.use(cors ({ credentials: true, origin: 'null,https://plant-nursery.herokuapp.com' }));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(session({ secret:'asdfljkg',resave:false,saveUninitialized:true}));//working with cookies. encrypt the cookie.
app.use(passport.initialize());
app.use(passport.session());

// PASSPORT CONFIG
passport.use(new passportLocal.Strategy({
    usernameField:'email',
    passwordField:'plainPassword'
},function(email,plainPassword,done){
    //authentication success or fail

    //[async]find the user in the database
    model.User.findOne({email:email}).then(function(user){
        if(!user){
            return done(null,false);
        }
        else{
            user.verifyPassword(plainPassword,function(result){
                if (result){
                    return done(null,user);
                }else{
                    return done(null,false);
                }
            });
        }
    }).catch(function(err){
       done(err); 
    });
}));

//PASSPORT serialization and deserialization
passport.serializeUser(function(user, done){
    //called when the user is successfully authenticated
    //save user's id into the session
    done(null,user._id);

});
passport.deserializeUser(function(userId,done){
    //called before any future request,following successful authentication
    // read the user's ID from the session, and  load the user from the DB
    model.User.findOne({_id:userId}).then(function(user){
        done(null,user);
    }).catch(function(err){
        done(err);
    });
});

//RESTful authenticate action/route
app.post('/session', passport.authenticate('local'),function(req,res){
    //authentication succeeded user is logged in
    res.sendStatus(201);

});
app.get('/session',function(req,res){
    if(req.user){
        res.json(req.user);//200 status
    }else{
        res.sendStatus(401)
    }

});
app.delete("/session", function (req, res) {
    req.logout();
    res.sendStatus(200);
});
//REST retrieve(collection) action
app.get('/plants', function (req, res) {
    console.log("user",req.user);
    console.log("all query params:",req.query);
    let q={};
    if(req.user){
        let dbQuery={user:req.user._id};
        if(req.query.typeEquals){
            q.type=req.query.typeEquals;
        }
        if(req.user.userhere){
            dbQuery.user=req.query.userhere;
        }
        model.Plant.find(q).find(dbQuery).then(function(plants){
            res.json(plants);
        });
    }
    if(!req.user){
        if(req.query.typeEquals){
            q.type=req.query.typeEquals;
        }
       
        model.Plant.find(q).then(function(plants){
            res.json(plants);
            res.sendStatus(401);
            
        });
    }
    
});


//REST retrieve(member action)
app.get('/plants/:plantId', function (req, res) {
    let plantId=req.params.plantId;
    model.Plant.findOne({_id:plantId}).then(function(plant){
        if(plant){
            res.json(plant);
        }else{
            res.sendStatus(404);
        }
    }) .catch(function(){
        res.sendStatus(400);
    });
});
app.delete('/plants/:plantId', function (req, res) {
    if(!req.user){
        res.sendStatus(401);
        return;
    }
    let plantId=req.params.plantId;
    model.Plant.findOneAndDelete({_id:plantId}).then(function(plant){
        if(plant){
            res.json(plant);
        }else{
            res.sendStatus(404);
        }
    }) .catch(function(){
        res.sendStatus(400);
    });
});
app.put('/plants/:plantId',function(req,res){
    if(!req.user){
        res.sendStatus(401);
        return;
    }
    model.Plant.findByIdAndUpdate(  
        req.params.plantId,
        req.body,        
        {new: true},
        (err, plant) => {
            if (err) return res.status(500).send(err);
            return res.send(plant);
        }
    )
});
app.post('/plants',function(req,res) {
    if(!req.user){
        res.sendStatus(401);
        return;
    }
    console.log("the body",req.body);
    let plant=new model.Plant({
        name:req.body.name,
        climate:req.body.climate,
        type:req.body.type,
        description:req.body.description,
        user:req.user._id
    }); 
    plant.save().then(function(){
        res.sendStatus(201);
    }).catch(function(err){
        if (err.errors){
            var messages={};
            for (let e in err.errors){
            messages[e]= err.errors[e].message;
            }
            res.status(422).json(messages);
        } else{
            res.sendStatus(500);
            }
    });

});

app.post('/users',function(req,res) {
    console.log("the body",req.body);
        let user=new model.User({
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            email:req.body.email
    }); 
    user.setEncryptedPassword(req.body.plainPassword,function(){
        user.save().then(function(){
            res.sendStatus(201);
        }).catch(function(err){
            if (err.errors){
                var messages={};
                for (let e in err.errors){
                messages[e]= err.errors[e].message;
                }
                res.status(422).json(messages);
            } else{
                res.sendStatus(500);
                }
        });
    
    });
 
});



app.listen(port,function () {
    console.log(`Listening on port ${port}!`)
});
