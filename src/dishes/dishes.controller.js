const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
//GET /dishes
function list(req, res){
    res.json({data:dishes});
}
//POST /dishes
//hasFullDishBody for put and post
function validateDishBody(req, res, next){
    // const dishBody=(res.locals.dish)?res.locals.dish:req.body;
    const{ data:{name='', description='', image_url='',price}}=req.body;
    if(name&&description&&image_url&&price>0){
        res.locals.body=req.body;
        return next();
    }
    else if(price===null||price===undefined||price.length===0){
        next({
            status:400,
            message:"Dish must include a price"
        });
    }
    else if(!Number.isInteger(price)||price<=0){
        next({
            status:400,
            message:"Dish must have a price that is an integer greater than 0"
        });
    }
    else if(!name){
        next({
            status:400,
            message:"Dish must include a name"
        });
    }
    else if(!description){
        next({
            status:400,
            message:"Dish must include a description"
        });
    }
    else if(!image_url){
        next({
            status:400,
            message:"Dish must include a image_url"
        });
    }
}

function create(req, res){
    const { data:{name, description, price, image_url,}}=res.locals.body;
    const dish={
        id:nextId(),
        name:name,
        description:description,
        price:price,
        image_url:image_url,
        
    }
    dishes.push(dish);
    res.status(201).json({data: dish});
}
//dishExists for both put and get 
function dishExists(req, res, next){
    const {dishId}=req.params;
    
    const foundDish=dishes.find(dish=>dish.id===dishId)
    
    if(foundDish){
        res.locals.dish=foundDish;
        return next();
    }
    next({
        status:404,
        message:`Dish does not exist: ${dishId}`
    });
}
//GET /dishes/:dishId
function read(req, res){
    res.json({data:res.locals.dish});
}
//PUT /dishes/:dishId
function checkDishId(req, res, next) {
    const dishId = req.params.dishId;
    const id = req.body.data.id;
    if (dishId !== id && id !== undefined && (id !== '') && (id !== null)) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
    return next();
}

function update(req, res, next){
    const body=req.body.data;
    const dishId=req.params.dishId;

    if(typeof(body.price)!=="number"){
        next({
            status:400,
            message:`price is not a number`
        });
        
    }
    else{
        const dishFound=dishes.find(dish=>dish.id===dishId);

        dishFound.id=dishId;
        dishFound.name=body.name;
        dishFound.description=body.description;
        dishFound.price=body.price;
        dishFound.image_url=body.image_url;
    
        res.status(200).json({data: dishFound});
    }
}

module.exports = {
    list,
    create:[validateDishBody, create],
    read:[dishExists, read],
    update:[dishExists, checkDishId, validateDishBody, update],
}