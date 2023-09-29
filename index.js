let SERVER_NAME = 'products-api'
let PORT = 5000;
let HOST = '127.0.0.1';

let postTotalCount = 0;
let getTotalCount = 0;

let errors = require('restify-errors');
let restify = require('restify')

  // Get a persistence engine for the products
  , productsSave = require('save')('products')

  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

  //Middleware to log requests
  server.use((req, res, next) => {
    console.log(`${req.method} ${req.url}: received request`);
    next();
  });

  server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('**** Resources: ****')
  console.log('********************')
  console.log(' /products')
  console.log(' /products/:id')    
})

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all products in the system
server.get('/products', function (req, res, next) {
  console.log('GET /products params=>' + JSON.stringify(req.params));
  getTotalCount++;
  console.log('GET:' + getTotalCount, 'POST: ' + postTotalCount)

  // Find every entity within the given collection
  productsSave.find({}, function (error, products) {

    // Return all of the products in the system
    res.send(products)
    console.log(`${req.method} ${req.url}: sending response`);
    console.log('GET /products: retrieved all products')
  })
})

  // Create a new Products
server.post('/products', function (req, res, next) {
  console.log('POST /products params=>' + JSON.stringify(req.params));
  console.log('POST /products body=>' + JSON.stringify(req.body));
  postTotalCount++;
  console.log('GET:' + getTotalCount, 'POST: ' + postTotalCount)

  // validation of manadatory fields
  if (req.body.productID === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('product ID must be supplied'))
  }
  if (req.body.name === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('name must be supplied'))
  }
  if (req.body.price === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('price must be supplied'))
  }
  if (req.body.quantity === undefined ) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError('quantity must be supplied'))
  }

  let newProduct = {
    productID: req.body.productID,
		name: req.body.name, 
		price: req.body.price,
    quantity: req.body.quantity
	}

  // Create the product using the persistence engine
  productsSave.create( newProduct, function (error, product) {

    console.log(`${req.method} ${req.url}: sending response`);

    // If there are any errors, pass them to next in the correct format
    if (error) {
      return next(new Error(JSON.stringify(error.errors)))
    }
    // Send the product if no issues
    res.send(201, product)
    console.log('POST /products: product created successfully')
  })  
})

// Delete all products
server.del('/products', function (req, res, next) {
  console.log('DELETE /products params=>' + JSON.stringify(req.params));

  // Delete all products from the persistence engine
  productsSave.deleteMany({}, function (error) {

    console.log(`${req.method} ${req.url}: sending response`);
    
    // If there are any errors, pass them to next in the correct format
    if (error) {
      return next(new Error(JSON.stringify(error.errors)));
    }
    // Send a success response indicating the number of products deleted
    res.send(204)
    console.log('DELETE /products: deleted all products')
  });
});