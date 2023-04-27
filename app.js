const express  = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/",function(req,res){

    Item.find({}, function(err, foundItems){
            res.render("list",{listTitle: "Today", newListItems: foundItems});
    })
});

app.get("/:customListName",function(req,res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName
                })
                list.save();
                res.redirect("/" + customListName)
            }
            else{
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
            }
        }
        
        
    })

    
})

app.post("/", function(req,res){

    let itemName= req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
    res.redirect("/")
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }
    
    
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName == "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){console.log(err);}
            else{
                res.redirect("/")
            }
        })
    }

    else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }
        });
    }

    
})

app.get("/about", function(req, res){
    res.render("about")
})

app.listen(3000, function(){
    console.log("Server on port 3000")
});