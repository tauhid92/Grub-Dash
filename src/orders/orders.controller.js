const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//GET /orders
function list(req, res){
    res.status(200).json({data: orders});
}

//validateOrdersContact
function validateOrdersContact(req, res, next){
    const {data:{deliverTo,mobileNumber}={}}=req.body;
    if(!deliverTo){
        next({
            status: 400,
            message: `Order must include a deliverTo`
        });
    }
    else if (!mobileNumber) {
        next({
            status: 400,
            message: `Order must include a mobileNumber`
        });
    }
    return next();
}

function validateDishesArray(req, res, next){
    const {data:{dishes}}=req.body;
    if(dishes===null||dishes===undefined){
        next({
            status: 400,
            message: `Order must include a dish`
        });
    }
    else if(!Array.isArray(dishes)||dishes.length===0){
        next({
            status: 400,
            message: `Order must include at least one dish`
        });
    }
    return next();
}

//validateDishQuantity
function validateDishesQuantity(req, res, next){
    const {data:{dishes}}=req.body;
    dishes.forEach(({quantity}, index)=>{
        if(quantity===null||quantity===undefined||!Number.isInteger(quantity)||quantity===0){
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            });
        }
    });
    return next();
}

//POST /orders
function create(req, res){
    const {data:{deliverTo,mobileNumber,dishes}}=req.body;
    const newObj={
        id:nextId(),
        deliverTo:deliverTo,
        mobileNumber:mobileNumber,
       
        dishes:dishes,
    };
    orders.push(newObj);
    res.status(201).json({data:newObj});
}

//orderExists
function orderExists(req, res, next){
    const {orderId} = req.params;
    const orderFound=orders.find(order=>order.id===orderId);
    if (orderFound){
        res.locals.order=orderFound;
        return next();
    }
    next({
        status: 404,
        message:`order with ${orderId} does not exist`
    });
    return next();
}

//GET /orders/:orderId
function read(req, res){
    res.status(200).json({data:res.locals.order})
}

//validateOrderID
function validateOrderID(req, res, next){
    
    const {orderId} = req.params;
    const id = req.body.data.id;
    if(orderId !== id && id !== undefined && (id !== '') && (id !== null)){
        next({status: 400, message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`});
    }
    
    return next();
}

function validateStatus(req, res, next){
    const {data:{status}={}} = req.body;
    const statArray=['pending', 'preparing', 'out-for-delivery', 'delivered'];
    if(!status||!statArray.includes(status)){
        next({
            status: 400,
            message:'Order must have a status of pending, preparing, out-for-delivery, delivered'
        });
    }

    else if(status ==='delivered'){
        next({
            status: 400,
            message:'A delivered order cannot be changed'
        });
    }
    return next();
}

//PUT /orders/:orderId
function update(req, res){
    const {data:{deliverTo,mobileNumber,status,dishes}}=req.body;
    const {orderId}=req.params;

    const orderFound=orders.find(order=>order.id === orderId);

    orderFound.id=orderId;
    orderFound.deliverTo=deliverTo;
    orderFound.mobileNumber=mobileNumber;
    orderFound.status=status;
    orderFound.dishes=dishes;

    res.status(200).json({data: orderFound});
}

function validateStatusPending(req, res, next){
    if(res.locals.order.status!=='pending'){
        next({
            status: 400, 
            message:'status is still pending'
        });
    }
    return next();
}
function destroy(req, res){
    const {orderId}=req.params;

    const index= orders.findIndex(order=>order.id === orderId);
    orders.splice(index,1);
    res.status(204).json({data:{}});
}

//array of validation
const validateBody=[validateOrdersContact,validateDishesArray,validateDishesQuantity]
const validateIdAndStatus=[validateOrderID, validateStatus]

module.exports = {
    list,
    create:[...validateBody, create],
    read:[orderExists, read],
    update:[orderExists, ...validateBody, ...validateIdAndStatus, update],
    destroy:[orderExists, validateStatusPending, destroy],

}