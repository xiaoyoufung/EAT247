const express = require("express");
const app = express(); // express function

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var _ = require("lodash"); // lodash

// Database connection
require("./config/db").connect();

//Schema models
const listItem = require("./model/listItem");
const Category = listItem.Category;
const Food = listItem.Food;
const Status = listItem.Status;
const setDefault = require("./model/setDefault");
const User = require("./model/user").User;
const Admin = require("./model/user").Admin;
const Address = require("./model/user").Address;
const Order = require("./model/order");

// authentication
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Authen = require("./control/authen");
const restAuthen = require("./control/restAuthen");

// set session
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }, //one hour
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/EAT247'
  }) 
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
})

app.use(express.static("public"));
app.set("view engine", "ejs");

const Cart = require('./model/cart');

// jqury and jsdom
var jsdom = require("jsdom");
const order = require("./model/order");
const { startSession } = require("./model/order");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = require("jquery")(window);

app.get("/", async (req, res) => {
  // res.sendFile(__dirname + "/index.html");

  const pizzas = await Food.find({});
  const categories = await Category.find({});
  const status = await Status.find({});
  const pizzaId = await Category.find({name: "Pizza"}, {_id:1});
  req.session.currentQty = 1;
  // find pizza id and store to session to be a link of menu
  pizzaId.forEach((pizza)=>{
    req.session.menuLink = pizza._id
  })

  if((pizzas.length === 0) && (categories.length === 0) && (status.length === 0)) {

  // add deafult item to db if no item in db
  setDefault.setDefaultAll();

  res.redirect('/');
  } else {

    res.render('index', {
      categories: categories,
      pizzas: pizzas
    });
  }
});

app.get("/detail", function (req, res) {
  res.render("detail", {
    categories: categories,
    pizzas: pizzas,
  });
});

app.get("/user/signup", function (req, res) {
  res.render("user/signup");
});

app.get("/user/signin", function (req, res) {
  res.render("user/signin");
});

// add sign up info to database
app.post("/user/signup", async function (req, res) {

  // Get user input using bodyParser
  const { username, email, password, firstname, lastname, phone, address, postcode, city, lat, lon } = req.body;

  const newAddress = new Address({
    firstname: firstname,
    lastname: lastname,
    address: address,
    city: city,
    phone: phone,
    postcode: postcode,
    lat: lat,
    lon: lon 
  })

  // new user --> add new user to database
  const newUser = new User({ username: username, email: email, password: password, addresses: newAddress});

  newUser.save();
  res.redirect('/user/signin');
});

app.post("/user/signin", async function (req, res) {
  // Get user input using bodyParser
  const { email, password } = req.body;

  // check if user already exist
  // Validate if user exist in our database
  const oldUser = await User.findOne({ email: email, password: password }).exec();

  if (oldUser) {
      // User already exist >> update session information
      req.session.userName = oldUser.username; 
      req.session.userId = oldUser._id;
      // console.log(req.session);
      res.redirect("/checkout");
  }else{
      res.redirect('/');
  }
});

app.get("/shopping-cart", function (req, res, next) {
  if(!req.session.cart) {
    return res.render('shoppingcart', {products: null, pageName: 'Shopping Cart'});
  }
  let cart = new Cart(req.session.cart);
  res.render("shoppingcart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    pageName: 'Shopping Cart'
  });
});

app.get("/checkout", Authen.authentication, async function (req, res) {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  const userAddress = await User.findById(req.session.userId);

  let cart = new Cart(req.session.cart);

  // console.log(userAddress)

  res.render("checkout", {
    pageName: 'Checkout', 
    total: cart.totalPrice, 
    products: cart.generateArray(),
    addresses: userAddress.addresses
  });
});

app.post("/checkout", Authen.authentication, async function (req, res) {
  let cart = new Cart(req.session.cart);
  let address = req.body.address;
  let user = req.session.userId;

  // find order status
    const findStatus = await Status.find({name: "Queue"}, {_id: 0});

  // find user's selected address
  const findAddress = await User.find(
    {_id: user, "addresses._id": address}, {addresses: 1, _id:0});
  const insertAddress = findAddress[0].addresses[0];
  console.log(insertAddress)

  // create new order
  const order = new Order({
    user: req.session.userId,
    address: insertAddress,
    cart: cart,
    status: findStatus[0]
  });
  await order.save()
  .then(function(result) {
    req.session.cart = null;
    req.session.orderID = order._id;
    res.redirect('/order-complete');
  })
  .catch(function(err) {
    handleError(err);
  });
});

app.get("/order-complete", function (req, res) {
  res.render("order-complete");
});

app.get("/orders", function (req, res) {
  res.render("tracking", {pageName: 'Order'});
});

// check tracking number
app.post("/orders", async function (req, res) {
  const orderId = req.body.orderId;
  let foundedOrder = await Order.find({_id: orderId})
  .catch(function(err) {
    req.session.errorMsg = "Sorry, the order could not be found.";
    res.redirect('/orders');
  });

  // if order were found
  if(foundedOrder) {
    if( foundedOrder.length == 0) {
      req.session.errorMsg = "Sorry, the order could not be found.";
      res.redirect('/orders');
    } else {
      // select found order
      foundedOrder = foundedOrder[0]

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      let date = foundedOrder.date.toLocaleString('en-US', options); 

      // send data to page
      res.render('order-status', {
        pageName: "Order",
        order: foundedOrder,
        carts: foundedOrder.cart,
        date: date,
        status: foundedOrder.status,
        id: orderId,
        address: foundedOrder.address
      });
    }

  }
});

// user account
app.get("/more", Authen.authentication, function (req, res) {
  res.render("more", {pageName: "Account"});
});

app.get("/detail/:food", async (req, res) => {
  let food = (req.params.food);

  const pizzas = await Food.find({});
  const pizza = await Food.findOne({_id: food});



  res.render("detail", {
    id: pizza._id,
    name: pizza.name,
    price: pizza.price,
    category: pizza.category[0].name,
    categoryId: pizza.category[0]._id,
    pizzas: pizzas,
    description: pizza.description,
    qty: req.session.currentQty
  });
});

app.get("/menu/:category", async (req, res) => {
  let category = (req.params.category);

  const foundCategory = await Category.findOne({_id: category});
  const pizzas = await Food.find({});
  const categories = await Category.find({});

  res.render('menu', {
    categories: categories,
    pizzas: pizzas,
    currentCategory: foundCategory
  });
});

// add item to cart
app.get('/add-to-cart/:id', async function(req, res) {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  const product = await Food.findById(productId);
  if(!product) {
    return res.redirect('/');
  } else {
    cart.add(product, product.id);
    req.session.cart = cart;
    // console.log(req.session.cart);
    res.redirect('/');
  }
});

app.get('/add-this-qty/:id', (req, res) => {
  req.session.currentQty += 1;
  // console.log(req.session.currentQty)
  res.redirect('/detail/'+ req.params.id);
})

app.get('/reduce-this-qty/:id', (req, res) => {
  if(req.session.currentQty > 1) {
    req.session.currentQty -= 1;
  }
  res.redirect('/detail/'+ req.params.id);
})

// add individule item to cart
app.get('/add-this-to-cart/:id/:qty', async function(req, res) {
  let productId = req.params.id;
  let productQty = parseInt(req.params.qty);
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  const product = await Food.findById(productId);
  if(!product) {
    return res.redirect('/');
  } else {
    cart.addIndividule(product, product.id, productQty);
    req.session.cart = cart;
    req.session.addedMsg = productQty + " x “" + product.name +"” have been added to your cart.";
    req.session.currentQty = 1;
    res.redirect('/detail/' + productId);
  }
});

// add item to cart when click 'buy-now' button
app.get('/buy-now/:id', async function(req, res) {
  const productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  const product = await Food.findById(productId);
  if(!product) {
    return res.redirect('/');
  } else {
    cart.add(product, productId);
    req.session.cart = cart;
    res.redirect('/checkout');
  }
})

// add individule item to cart when click 'buy-now' button
app.get('/buy-this-now/:id', async function(req, res) {
  const productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  const product = await Food.findById(productId);
  if(!product) {
    return res.redirect('/');
  } else {
    cart.addIndividule(product, productId);
    req.session.cart = cart;
    res.redirect('/checkout');
  }
})

// decrease qty of item when click 'minus' button in shopping-cart
app.get('/reduce/:reItem', function(req, res){
  let productId = req.params.reItem;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// increase qty of item when click 'plus' button in shopping-cart
app.get('/add/:reItem', function(req, res){
  let productId = req.params.reItem;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.increaseByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// remove all items when click 'x' button in shopping-cart
app.get('/remove/:reItem', function(req, res){
  let productId = req.params.reItem;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

// user logout
app.get('/logout',(req,res)=>{
  req.session.destroy(function (err) {
    res.redirect('/');
   });
})




// retaurant side

app.get("/admin/signup", function (req, res) {
  res.render("admin/signup");
});

app.get("/admin/signin", function (req, res) {
  res.render("admin/signin");
});

app.post("/admin/signin", async function (req, res) {
  
      // Get user input using bodyParser
      const { email, password } = req.body;

      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await Admin.findOne({ email: email, password: password }).exec();
  
      if (oldUser) {
          // User already exist >> update session information
          req.session.adminId = oldUser.id; 
          // console.log(req.session);
          res.redirect("/restaurant");
      }else{
          res.redirect('/admin/signup');
      }
});

app.post("/admin/signup", function (req, res) {
  
  // Get user input using bodyParser
  const { username, email, password } = req.body;

  // new user --> add new user to database
  const newUser = new Admin({ username: username, email: email, password: password	});

  newUser.save();
  res.redirect('/admin/signin');
});

app.get("/restaurant", restAuthen.authentication, async function (req, res) {
  const foundStatus = await Status.find({});
  const path = foundStatus[0]._id;
  res.redirect('/restaurant/' + path);
});

app.get('/restaurant/admin', restAuthen.authentication, async function(req, res) {
  const foundStatus = await Status.find({});
  res.render('restaurant/admin', {
    allStatus: foundStatus
  });
})

// show order by the status
app.get('/restaurant/:status', restAuthen.authentication, async function(req, res){
  let statusId = req.params.status;
  const foundStatus = await Status.find({});
  const foundOrder = await Order.find({});
  const thisStatus = await Status.findOne({_id: statusId});

  // find number of order in each status
  const numofQueue = await Order.find({"status.name": "Queue"});
  const numofCook = await Order.find({"status.name": "Cook"});
  const numofDelivery = await Order.find({"status.name": "Delivery"});

  res.render("restaurant/restaurant-order", {
    allStatus: foundStatus,
    orders: foundOrder,
    statusName: thisStatus.name,
    numofQueue: numofQueue,
    numofCook: numofCook,
    numofDelivery: numofDelivery
  });
});

// update queue's order status
app.get('/restaurant/update/Queue/:orderId', restAuthen.authentication, async function(req, res){
  let orderId = req.params.orderId;
  // search status to update to order's status
  const status = await Status.find({name: "Cook"});
  const queue = await Status.find({name: "Queue"});
  const path = queue[0]._id

  const update = {status: status[0]}
  await Order.findByIdAndUpdate({_id: orderId}, update);
  res.redirect('/restaurant/'+ path);
});

// update cook's order status
app.get('/restaurant/update/Cook/:orderId', restAuthen.authentication, async function(req, res){
  let orderId = req.params.orderId;
  // search status to update to order's status
  const status = await Status.find({name: "Delivery"});
  const queue = await Status.find({name: "Queue"});
  const path = queue[0]._id

  const update = {status: status[0]}
  await Order.findByIdAndUpdate({_id: orderId}, update);
  res.redirect('/restaurant/'+ path);
});

// update delivery's order status
app.get('/restaurant/update/Delivery/:orderId', restAuthen.authentication, async function(req, res){
  let orderId = req.params.orderId;
  // search status to update to order's status
  const status = await Status.find({name: "Complete"});
  const queue = await Status.find({name: "Queue"});
  const path = queue[0]._id

  const update = {status: status[0]}
  await Order.findByIdAndUpdate({_id: orderId}, update);
  res.redirect('/restaurant/'+ path);
});

// delete order
app.get('/restaurant/delete-order/:orderId', restAuthen.authentication, async (req, res) => {
  let orderId = req.params.orderId;
  const queue = await Status.find({name: "Queue"});
  const path = queue[0]._id

  await Order.findOneAndDelete(orderId).exec();

  res.redirect('/restaurant/'+ path);
})

// web run on localhost:...

app.listen(3000, function () {
  console.log("Server run on port 3000");
});
