$(document).ready(function() {
    
//function that hides the search field if pressed anywhere on the page
 $(window).on("click", function(){
        
     if ($("#searchResult:visible").length > 0) {
         $("#searchResult").addClass("collapse");
     }
});
       
itemBadge();
    
/* NAVIGATION */  
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
      
/* SEARCH */  
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

//loads the API for products once the page is ready
var chosenCategory = location.search.replace('?category=', '');
    
    $.ajax({
        url: "https://medieinstitutet-wie-products.azurewebsites.net/api/products/",
        type: "GET",
        headers: { "Accept": "application/json" },
        success: function (data) {
            
            var items = [];
            
                for (var i = 0; i < data.length; i++){
                    if(chosenCategory == "") {
                            var id = data[i].id;
                            items.push( 
                                "<div class='col-lg-3 col-md-4 col-sm-4 col-xs-12 homeMovieDiv'>" +
                                "<img class='homeMovieImg' id=" + data[i].id + " data-toggle='modal' data-target='#myModal' onclick='generateProductModal(id);' src='" + data[i].imageUrl + "'/>" +
                                "<h4>" + data[i].name + "</h4>" +
                                "<h4>" + data[i].price + " SEK</h4>" +
                                "</div>"
                            )}
                    else {
                    for (var j = 0; j < data[i].productCategory.length; j++){
                        if (chosenCategory == data[i].productCategory[j].categoryId){
                            var id = data[i].id;
                            items.push(
                                "<div class='col-lg-3 col-md-4 col-sm-4 col-xs-12 homeMovieDiv'>" +
                                "<img class='homeMovieImg' id=" + data[i].id + " data-toggle='modal' data-target='#myModal' onclick='generateProductModal(id);' src='" + data[i].imageUrl + "'/>" +
                                "<h4>" + data[i].name + "</h4>" +
                                "<h4>" + data[i].price + " SEK</h4>" +
                                "</div>"
                            );
                        }
                    }
                    }
                };
        
            $("#loadAPI").html(items.join(''))
        }
    });

//document.ready 
});  
              
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