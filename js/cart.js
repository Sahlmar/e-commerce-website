$(document).ready(function() {
    
// for the thank you page added validation and payment
$("#paymentButton").on("click", paymentDone);
    
//function that hides the search field if pressed anywhere on the page
 $(window).on("click", function(){
        
     if ($("#searchResult:visible").length > 0) {
         $("#searchResult").addClass("collapse");
     }
});
    

itemBadge();
    
/*NAVIGATION*/ 
//loops through every category in the api 
$.getJSON("http://medieinstitutet-wie-products.azurewebsites.net/api/categories", function (navBarInfo) {
    
    //creates a drop down menu
    var navbar = $(".dropdown-menu"); 
      
        for (i = 0; i < navBarInfo.length; i++) { 
               
            var li = $("<li>"); 
                
            var a =$("<a />").attr("href", "genre.html?category=" + navBarInfo[i].id).attr("id", navBarInfo[i].name).text(navBarInfo[i].name).addClass("list-group-item");
                
            a.appendTo(li);  
            li.appendTo(navbar); 
        }   
});   
    
/*SEARCH*/  
//search function for products 
$('#searchInput').keyup(function(){
    
    //the search input MUST contain at least two characters to be able to execute the function
    $('#searchResult').html('');
    var searchInputField = $('#searchInput').val();
     var regEx = /(.*[a-z]){3}/i;

        if (searchInputField > regEx) {
        $.getJSON('http://medieinstitutet-wie-products.azurewebsites.net/api/search?searchText=' + searchInputField, function(data) {
        
            //if the search equals no products found, show an error span
            $("#searchResult").removeClass("collapse");
            if(data.length == 0) {
                
                $('#searchResult').html(
                '<li class="list-group-item searchFieldNoRes"><span class="text-muted"> Your search gave no results... </span></li>'
                );
            }
            
            //if the search however is a success, a list of products that match the search will appear 
            $.each(data, function(key, data){
               
            $('#searchResult').append(                
                '<li id="' + data.id + '"class="list-group-item searchField" data-toggle="modal" data-target="#myModal" onclick="generateProductModal(this.id);"> '  +
                "<img src=" + data.imageUrl + ' " class="movieImg"/><u>'
                + data.name + '</u><span> | '   
                + data.price +' SEK </span><span class="text-muted">('
                + data.year + ')</span></li>');
            });   
        });
    }
});                    

/* SHOPPING CART */
//empty list that products will be pushed into
var selectemItems = [];
    
var finalOrder = JSON.parse(localStorage.getItem("order"))
                         
getSummary();
     
//product info is generated through the javascript below, that shows every product selected, amount per products and other options
var productHtml = "";
        
    //loops through our localstorage that shows the selected products
    $(finalOrder).each(function (index, product){
            
    selectemItems.push(product);
    
            
    //image, name, price, amount and glyphicons that has different functions are generate here
    productHtml +=  "<div class='row'>" +
                        "<div class='col-md-3 col-lg-3 col-sm-6 col-xs-6'>" +
                            "<img src=" + product.imageUrl + "alt='Movie picture'" + "height='200' width='125' class='moviePicDesign'/>" + 
                        "</div>";    
            
    productHtml +=      "<div class='col-md-3 col-lg-3 col-sm-6 col-xs-6'>" +
                            "<span padding='100'>" + product.name + "</span>" + 
                        "</div>";
            
    productHtml +=      "<div class='col-md-3 col-lg-3 col-sm-6 col-xs-6'>" +
                            "<span class='score'>" + product.price + " SEK </span>" + 
                        "</div>" +
                        
                        "<div id='cartButtons' class='col-md-3 col-lg-3 col-sm-6 col-xs-6'>" +
                            "<span class='glyphicon glyphicon-plus addButton' data-toggle='tooltip' title='Add a unit' id='" + product.id + "'></span>" +
                        
                            "<span class='productAmount'>" + product.amount + "</span>" +
                
                            "<span class='glyphicon glyphicon-minus subtractButton' data-toggle='tooltip' title='Subtract a unit' id='" + product.id + "'></span>" +
                
                            "<span class='glyphicon glyphicon-trash deleteButton' data-toggle='tooltip' title='Remove entire unit' id='" + product.id + "'></span>" +
                         
                        "</div>" +
                            
                    "</div>";
    });
        
//writes out the correct cart information out in a div on the html page 
$(".productSummary").append(productHtml);

//shows tooltips for the glyphicons in the cart    
function showtooltip() {
    $('[data-toggle="tooltip"]').tooltip();
};
  
//removes an entire product from the cart
$(document).on('click', '.deleteButton', function () {
        var id = $(this).attr('id');
        indexes = $.map(finalOrder, function(obj, index) {
            if(obj.id == id) {
                return index;
            }
        });
    
        //this makes that only one product title gets removed from the localstorage
        firstIndex = indexes[0];
        finalOrder.splice(firstIndex, 1);
        $(this).parent().parent().remove();
    
       localStorage.setItem("order", JSON.stringify(finalOrder));
        
    getSummary();
    itemBadge();
 });   
    
//subtracts a unit of the product amount
$(document).on('click', '.subtractButton', function (){
    
       //gets info from current localstorage
       JSON.parse(localStorage.getItem("order"));
       
       //loops the local storage array and gives the same id that the product has, to the glyphicon
       for (var i = 0; i < finalOrder.length; i++) {
           if (finalOrder[i].id == $(this).attr("id")) {
               finalOrder[i].amount --;
               
               //if the number of items is only one, leave the number amount at one. cannot go below zero
               if (finalOrder[i].amount <= 1) {
                   finalOrder[i].amount = 1;
               } 
            
               //creates a new local storage when a change has been made
               localStorage.setItem("order", JSON.stringify(finalOrder));
               
               //shows the correct amount of products for each movie title /after changes has been made
               var amount = finalOrder[i].amount;
               var parent = $(this).parent().parent();
               $(".productAmount", parent).text(amount);
               
               getSummary(); 
               itemBadge();
           } 
        }  
});
    
//adds one unit on the product amount
$(document).on('click', '.addButton', function (){
      
    //gets info from current local storage
    JSON.parse(localStorage.getItem ("order"));
       
        //loops the local storage array
        for (var i = 0; i < finalOrder.length; i++) {
           
           //when clicked on, add one amount of the movie title
           if (finalOrder[i].id == $(this).attr("id")) {
               finalOrder[i].amount ++;
        
               //creates a new local storage when a change has been made
               localStorage.setItem("order", JSON.stringify(finalOrder));
               
               //shows the correct amount of products for each movie title /after changes has been made
               var amount = finalOrder[i].amount;
               var parent = $(this).parent().parent();
               $(".productAmount", parent).text(amount);
               
               getSummary();
               itemBadge();
           }  
       } 
});

//counts the total amount in SEK in the cart
function getSummary() {
    var sum = 0 ;
      
    $.each(finalOrder, function( index, value ) {
        sum += (value.amount * value.price);
    });
        
    $('#showCart').text(sum); 
    
    //creates a local storage just for the specific total amount number
    localStorage.setItem("getAmount", JSON.stringify(sum));
};

/* BADGE ICON */              
//shows a number beside the cart symbol equivalent to the number of products that are in the cart
function itemBadge() {
    var currentCart = JSON.parse(localStorage.getItem("order"));
    
    if(currentCart == null) {
        currentCart = [];
    }
    
    //an empty list that represents the products that are pushed into this list - becomes a number
    var itemCount = []; 
        for (var i = 0; i < currentCart.length; i++) {
            itemCount.push(currentCart[i].amount);
        }
    
    var summary = itemCount.reduce(function (a, b) {
        return a + b; 
    }, 0);
    
    $("#shoppingCartIcon").attr("data-count", summary).addClass("badge");
}; 
    
 /* PAYMENT */   
//function that validates the payment form
function validate(isValid) {
    var firstName = document.getElementById("firstName").value;
    if(firstName == "") {
      return false;
    }
 
  var lastName = document.getElementById("lastName").value;
    if(lastName == "") {
      return false;
    }
    
  var number = document.getElementById("phoneNr").value;
  if(number == "") {
      return false;
  }
    return true;
}
 
//function that gets executed when payment button is pressed
function paymentDone() {       
 
    //checks if every field has been typed in before you move along
    var isValid = true;
    isValid = validate(isValid); 
    
    var isEmailValid=true;
    isEmailValid = checkEmail(isEmailValid);
    
    //if the email is not correct, pop up will appear
    if(!isEmailValid) {
        alert('Please provide a valid email address');
        return;
    }
    
    //if however every field has been type in correctly, this function will run
    if(isValid == true) {
     
    //loops through our localstorage, creates the orderRows for the API
    var order = JSON.parse(localStorage.getItem("order"));
    var orderRows = [];
    for (i = 0; i < order.length; i++){
        orderRows.push({ProductId: order[i].id, Amount: order[i].amount})
    }
    
    //information that must be sent in to the API
    var companyId = 7;
    var created = infoDate();
    var createdBy = document.getElementById("email").value;
    var totalPrice = document.getElementById("showCart").innerHTML;
    var status = 1;
    
    //creates an order with all the correct information for each customer
    var userOrder = {};
    userOrder.companyId = companyId;
    userOrder.created = created;
    userOrder.createdBy = createdBy;
    userOrder.paymentMethod = "CARD"; //currently only has card as a payment option
    userOrder.totalPrice = totalPrice;
    userOrder.status = status;
    userOrder.orderRows = orderRows;
    
//searches our order through our company id - API
$.ajax({
    url: "https://medieinstitutet-wie-products.azurewebsites.net/api/orders?companyId=7",
    method: "POST",
    data: JSON.stringify(userOrder),
    contentType: "application/json;charset=utf-8",
    headers: { "Accept": "application/json" },
    success: function (data) {
    
        //thank you modal will appear, all the data saved from the specific order will show using the API
        //loops through all products to show correct movie titles in the thank you modal
        $.getJSON("http://medieinstitutet-wie-products.azurewebsites.net/api/products", function (allProducts) {
                
            var html =
                        "<div id='thankYouModal'>" +
                            "<h4>| Order number |</h4> <span>" + data.id + "</span><br/><br/>" +
                            "<h4>| Customer information |</h4><span>Firstname: " + $("#firstName").val() + "</span><br/>" +
                            "<span>Lastname: " + $("#lastName").val() + "</span><br/>" +
                            "<span>Email: " + $("#email").val() + "</span><br/>" +
                            "<span>Phone number: " + $("#phoneNr").val() + "</span><br/><br/>" +
                            "<h4>| Total price |</h4><span>" + data.totalPrice + " SEK</span><br/><br/><h4>| Purchased movies |</h4>";
                    
            // the order from the customers are looped from all the product to find the films title
            for (var j = 0; j < data.orderRows.length; j++){
                for (var p = 0; p < allProducts.length; p++){
                    if(data.orderRows[j].productId == allProducts[p].id){
                        
                        html += "<span>" + allProducts[p].name + "</span><br/>";
                            break;
                    }
                }
            }  
                html +=     "<br/><h4>| Total amount of movie titles |</h4><span> " + data.orderRows.length + "</span><br/><br/>" +
                            "<span>Thank you for shopping with us. If you have any questions please don't hesitate to contact us. Have a great movie night.</span>" +
                       
                        "</div>";
                    
            //the content of the thank you modal is shown in the modal body 
            $("#thankYouModal .modal-body").html(html); 
                    
            //after an order has been made, the local storage is cleared and no products will appear in the cart
            localStorage.removeItem("order");
                    
            $("#thankYouModal").modal();
        });
                
    },
        error: function() {
            
        }
});   
    }
    else {
        alert("Please enter all requried fields");  
    }
}

//checks if the email is in the correct form
function checkEmail() {
    var email = document.getElementById("email");
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return filter.test(email.value);
}    
    
// document.ready
});

//redirect when payment is done and the "confirm payment" button is pressed
function paymentDone() {

    //loops through our local storage
    var order = JSON.parse(localStorage.getItem("order"));
    
    var orderRows = [];
        for (i = 0; i < order.length; i++){
            orderRows.push({ProductId: id[i], Amount: amount[i]});
        }
    
    var companyId = 7;
    var created = new Date(); 
    var createdBy = document.getElementById("email").value;
    var paymentMethod = document.getElementById("paymentMethod").value;
    var totalPrice = document.getElementById("showCart").value;
    var status = 1;
    
    var userOrder = {};
    userOrder.companyId = companyId;
    userOrder.created = created;
    userOrder.createdBy = createdBy;
    userOrder.paymentMethod = paymentMethod;
    userOrder.totalPrice = totalPrice;
    userOrder.status = status;
    userOrder.orderRows = orderRows;
    
    $.ajax({
        url: "https://medieinstitutet-wie-products.azurewebsites.net/api/orders?companyId=7",
        method: "POST",
        data: JSON.stringify(userOrder),
        contentType: "application/json;charset=utf-8",
        headers: { "Accept": "application/json" },
        success: function (data) {
            location.href = "thankyou.html";
        },
        error: function() {
            
        }
    });    
};
    
//saves the date the order was made 
function infoDate() {
    var recentDate = new Date();
    
    recentDate.setHours(recentDate.getHours() + 1);
        return recentDate;
}

/* PRODUCT MODAL */
//uses modals bootstrap to generate the popup with information about the chosen product
//first loops through the products-, then the category API
function generateProductModal(id){
    $.ajax({
        url: "https://medieinstitutet-wie-products.azurewebsites.net/api/products/" + id,
        method: "GET",
        headers: { "Accept": "application/json" },
        success: function (data) {
            
            var movieCategories = "";
            
            $.ajax({
                url: "https://medieinstitutet-wie-products.azurewebsites.net/api/categories",
                method: "GET",
                headers: { "Accept": "application/json " },
                success: function (categories) {
                        for (var i = 0; i < data.productCategory.length; i++){
                            for (var j = 0; j < categories.length; j++){
                                if (data.productCategory[i].categoryId == categories[j].id){
                                    movieCategories += categories[j].name + " ";
                                };
                            };
                        };
                    var items = [];
                    items.push(
                        
                        //content in the modal body
                        "<img id='modal-img' src=" + data.imageUrl + " height='225' width='150' />" +
                        "<p id='modal-cat'> Category  |  " + movieCategories + " </p>" +
                        "<p id='modal-y'>  Year | " + data.year + " </p>" +
                        "<h4 id='modal-desc'> | Description | </h4><p id='modal-desc'>" + data.description + "</p><br/>" +
                        "<h4 id='modal-p'> | Price | </h4><p id='modal-p'>" + data.price +  " SEK</p><br/>" 
                    );
                    
                    document.getElementById("modal-t").innerHTML = data.name;
                    $("#modal-b").html(items.join(''));
                    
                    var productInformation = [id, data.name, data.price, data.imageUrl];
                    document.getElementById("buyButton").setAttribute("value", productInformation);
                }
            });
        }
    });    
};
    
//saves the product to the customers order cart
function saveProductToCart(productInformation){
    var str = productInformation;
    var res = str.split(",");
    
    for (i = 0; i < res.length; i++) { 
         var id = res[0];
        var name = res[1];
        var price = res[2];
        var imageUrl = res[3];
    }
    
    var amount = 1;
    if (localStorage.getItem("order") != null) {
        var order = JSON.parse(localStorage.getItem("order"));
        
        var isFound = order.some(function (item) {
            var isFound = item.id == id; //this line is updated
            item.amount += isFound ? 1 : 0;
            return isFound;
        });
        if (!isFound) {
            order.push({id: id, amount: 1, imageUrl: imageUrl, name: name, price: price})
        }
        localStorage.setItem("order", JSON.stringify(order));
    }
    
    else {
        var order = [];
        var newProduct = new product(id, amount, imageUrl, name, price);
        order.push(newProduct);
        localStorage.setItem("order", JSON.stringify(order));
    }
    
    itemBadge();
};

//constructor to save the product to the order
function product(id, amount, imageUrl, name, price){
    this.id = id;
    this.amount = amount;
    this.imageUrl = imageUrl;
    this.name = name;
    this.price = price;
}; 