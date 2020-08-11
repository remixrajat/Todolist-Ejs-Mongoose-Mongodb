//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rajat:fdfffUmxQlIUZYFD@cluster0.jqeey.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome"
});
const item2 = new Item({
  name: "Add"
});
const item3 = new Item({
  name: "Remove"
});
const defaultItems = [item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Sucessfully submitted");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, result){
    if(!err){
      if(!result){
        const listItem = new List({
          name: customListName,
          items:defaultItems
        });
        listItem.save();
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
      }
  });



});

app.post("/", function(req, res){
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const itemX = new Item({
    name: itemName
  });
  if(listName === "Today"){
    itemX.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, resultFound){
      resultFound.items.push(itemX);
      resultFound.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function(req, res){
  const delItemX = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(delItemX, function(err){
      if(!err){
        console.log("Sucessfully deleted checked item");
        res.redirect("/");
      }else{
        console.log("failed to delete");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delItemX}}}, function(err){
      if(!err){
        console.log("Sucessfully deleted checked item");
        res.redirect("/" + listName);
      }else{
        console.log("failed to delete");
      }
      });
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server started ");
});
