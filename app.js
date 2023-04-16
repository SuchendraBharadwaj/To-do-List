
const express= require("express");
const app =express();
const mongoose = require("mongoose");
const _= require("lodash");

var bodyparser=require("body-parser");

// required to pass html file to js
app.use(bodyparser.urlencoded({extended:true}));

// to apply our static css file

app.use(express.static("public"));

// for using ejs

app.set("view engine","ejs");



mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

const itemschema = {
  name : String
};

// Item collection created with itemschema

const Item= mongoose.model("Item",itemschema);

// default items

const item1= new Item({
    name :"welcome to to do list"
});

const item2= new Item({
  name :"make your daily schedule"
});
const item3= new Item({
  name :"press + to add "
});

const default_items=[item1, item2,item3];


// schema of list with name and items array with itemschema elements
const listschema={
  name : String,
  items:[itemschema]
};

// collection of lists with listschema

const List= mongoose.model("List",listschema);

// get requests from different routes

app.get("/",function(req,res){

  // we are getting current day and date

 /* var today = new Date();

  // format for date (js object)
 
  var options ={
    weekday : "long",
    day : "numeric",
    month : "long"
  };

  // get date

  var day = today.toLocaleDateString("en-US",options); */

  Item.find({}).then(function(found_items){
    // to insert default first time
    if(found_items.length==0){
      Item.insertMany(default_items).then(function(){
        console.log("Data inserted")  // Success
      }).catch(function(error){
        console.log(error)      // Failure
      });
      res.redirect("/");
    }
      else{
        // for using list.ejs and passing value to list.ejs
      res.render("list",{list_title:"Today" , new_items:found_items});
      }
    
    
  });

  });

// creating seperate pages for different lists

app.get("/:custom_list",function(req,res){

  // using lodash to avoid capital and small letter errors
  const custom_list_name= _.capitalize(req.params.custom_list);

  // checking if already exits

  List.findOne({name:custom_list_name}).then(function(found_list){

        if(!found_list){
          
          const list= new List({
  
            name:custom_list_name,
            items:default_items
        });
        
        list.save(); 
        res.redirect("/"+ custom_list_name);
        }
        else{
        
          // for using list.ejs and passing value to list.ejs
      res.render("list",{list_title:found_list.name , new_items:found_list.items});
      }

  });




});


// to handle post request

app.post("/",function(req,res){

  // new item entered in box is stored using bodyparser

var item_name=req.body.new_item;
// list name stored that is entered in the button
var list_name=req.body.button;




// item object created with  Item schema
const item = new Item({
  name:item_name
});

// if list is home one
if(list_name=="Today"){
  
  
  // saved in item collection
  
  item.save();
    
  res.redirect("/");
}
// if list is some other custom list then add in that list
else{
  // find that custom list
   List.findOne({name:list_name}).then(function(found_list){
    found_list.items.push(item);
    found_list.save();
    res.redirect("/"+list_name);

   });
}
});

// delete request is handled

app.post("/delete",function(req,res){

  const id_of_checked=req.body.checked;

  const listName=req.body.list_name;
  if(listName=="Today"){
    Item.findByIdAndRemove(id_of_checked).then(function(){
    
      console.log("successfully deleted");
      res.redirect("/");
    
  });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id_of_checked}}}).then(function(){
             res.redirect("/"+listName);
    });
  }

});



app.listen(3000);



