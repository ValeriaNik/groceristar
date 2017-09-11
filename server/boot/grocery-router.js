'use strict';

var request        = require('request');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// var loopback = require('loopback');


module.exports = function(app) {

  var router  = app.loopback.Router();

  router.get('/change-the-name/grocery/:groceryId', function(req, res, next){ 
    var groceryId = req.params.groceryId;
  	var Grocery = app.models.Grocery;
  	Grocery.findById(groceryId, {}, function(err, model){
  		model.updateAttribute('title', 'Ultimate Grocery List #' + new Date().toString());
      res.redirect('/auth/account');
  	});

  });

  router.post('/addtopurchased', function(req, res, next){
  	var Grocery        = app.models.Grocery;
    var ingredients    = req.body.ingredients;
   	var groceryId      = req.body.groceryId;

    // Grocery.makePurchased(groceryId, ingredientsArr, function(){});

    var options = {

      groceryId: groceryId,
      secondArray: ingredients 
    };
    Grocery.addPurchased(options);  
    res.redirect('/auth/account');

  });

  router.post('/clearpurchased', function(req, res, next){
    // console.log(req.body);
    var Grocery        = app.models.Grocery;

    Grocery.cleanPurchased({});

    res.redirect('/auth/account');

  });

	router.get('/remove-from-purchased/:groceryId/:ingId', function(req, res, next){

		var Grocery = app.models.Grocery;

		// console.log( req.user.id );		

	 	var ingredients = req.params.ingId;
 		var groceryId   = req.params.groceryId;

    var options = {

      groceryId: groceryId,
      secondArray: ingredients 
    };
    Grocery.removePurchased(options);
    
    




  });


 //:todo add relations and display whole information about 
 //:todo make it more protected from view
 router.get('/view/grocery/:groceryId', 
  ensureLoggedIn('/auth/account'), 
  function(req, res, next){
    var Grocery   = app.models.Grocery;
    var groceryId = req.params.groceryId;
    // var userId    = req.user.id;

    // console.log(groceryId);
    // console.log(userId);


    

    Grocery.fetchById(groceryId, function(err, response){

    	// console.log(response.data);

    	
      // :todo make all data came from method
    	res.render('pages/grocery', {
    		  title: response.title,
	        elements: response.data, // [data>> department >> ingredient]
          groceryId: groceryId,
	        // url: req.url,
	        messages: {},
	        // departments: grocery.departmentsList
	      });  

    });

    // Grocery.findById(req.params.groceryId, {}, function(err, grocery){
      
    //   console.log(grocery.departments);

  

    // });





 });

 router.get('/view/grocery/hidden/:groceryId',
  ensureLoggedIn('/auth/account'),
  function(req, res, next){
    var Grocery   = app.models.Grocery;
    var groceryId = req.params.groceryId;

    // only hidden departments will be diplsayed
    Grocery.fetchById2(groceryId, function(err, response){

      console.log(response);

      
      // :todo make all data came from method
      res.render('pages/grocery', {
          title: 'Hidden departments of ' + response.title,
          elements: response.data, // [data>> department >> ingredient]
          groceryId: groceryId,
          messages: {},

      });  

    });

  });



  router.get('/auth/attach-grocery-to-user/:groceryId', 
    ensureLoggedIn('/auth/account'), 
    function(req, res, next) {
    var groceryId = req.params.groceryId;
    var userId    = req.user.id;
    var User      = app.models.user;
    var Grocery   = app.models.Grocery;

    // this is a duplicated function from Grocery :todo think about it, real talk   
    var options = {
      userId: userId,
      secondArray: [ groceryId ]
    };
    User.addGrocery(options);
    // User.proceed(options);

    res.redirect('/auth/account');
  });


 
 router.get('/remove/grocery/:groceryId', 
  ensureLoggedIn('/auth/account'), 
  function(req, res, next){
    var groceryId = req.params.groceryId;
    var userId    = req.user.id;    
    var User      = app.models.user;
    var Grocery   = app.models.Grocery;

    // this is a duplicated function from Grocery :todo think about it, real talk   
    var options = {
      type  : 'detach',
      field : 'groceryIds',
      userId: userId,
      secondArray: [ groceryId ]
    };
    User.proceed(options);

    Grocery.destroyById(groceryId, function(err){});
    res.redirect('/auth/account');

});




// :todo finish
  router.get('/clone/:groceryId', function(req, res, next) {
    var userId    = req.user.id;    
    var groceryId = req.params.groceryId;  
    // var User      = app.models.user;
    var Grocery   = app.models.Grocery;
    Grocery.clone( groceryId, userId, function(){});

    res.redirect('/auth/account');
  });





// :todo finish
 router.get('create-new-grocery', 
  ensureLoggedIn('/auth/account'), 
  function(req, res, next){

    console.log( req.user.id );
    var Grocery = app.models.Grocery;
    var data = {
      title: data.title,
      desc:  data.desc,
      slug:  '',
      img :  '',
      // departmentIds: [], // not sure if we need this
      // hideThisIds:   [],
    }
    Grocery.createnew(req.user.id, data, function(){});
    // res.redirect('/');

 });

// :todo finish
 router.get('/view/groceries', 
  ensureLoggedIn('/auth/account'), 
  function(req, res, next){
    var userId    = req.user.id;    
    var User      = app.models.user;
    // var Grocery   = app.models.Grocery;

    User.methodofAllMethods(userId, function(err, groceries){
      res.render('pages/grocery-list', {
        title: 'GrocerIES ATTACHED TO THIS USER ' + userId,

        // url: req.url,
        messages: {},
        // departments: grocery.departmentsList
        groceries: groceries
      }); 
    });

    

 });

  app.use(router);

};