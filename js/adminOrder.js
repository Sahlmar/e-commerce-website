$(document).ready(function() {
    
//function that loads all orders in a table. Contains a button that opens a modal with more info
$("#allOrdersButton").on("click", function() {
 
    //loops through all the orders that are in the order registry
    $.getJSON("https://medieinstitutet-wie-products.azurewebsites.net/api/orders?companyId=7", function (result) {
         
        var tr = "";
        for(var i = 0; i < result.length; i++){
            tr = "<tr>";
            
            //shows results in a table with a "more info"-button
            tr +=   "<td>" + result[i].id + "</td>" +
                    "<td>" + time(result[i].created) + "</td>" +
                    "<td>" + result[i].createdBy + "</td>" +
                    "<td>" + result[i].totalPrice + " SEK</td>" + 
                    "<td><button id='" + result[i].id + "' class='showOrder' data-toggle='modal' data-target='#moreInfoModal'>More info <i class='fa fa-info' aria-hidden='true'></i></button></td>";

            tr += "</tr>";
            
            $("#showAllOrders tbody").append(tr);
        }
        
//function that shows the right order on the modal that pops up after pressing more info
$(".showOrder").on("click", function() {
    
    var orderId = $(this).attr("id");
            
        $.ajax({
            url: "https://medieinstitutet-wie-products.azurewebsites.net/api/orders?companyId=7",
            method: "GET",
            success: function (data) {
                    
                for (var i = 0; i < data.length; i++){
                        
                    if(data[i].id == orderId) {

                        //modal content
                        var info =  "<div class='orderModalInfo'>" +
                                        "<h4>| Customer/Order-ID |</h4><p>" + data[i].id + "</p><br/>" +
                                        "<h4>| Date created |</h4><p>" + time(data[i].created) + "</p><br/>" +
                                        "<h4>| Customer |</h4><p>Email: " + data[i].createdBy + "</p><br/>" +
                                        "<h4>| Total sum |</h4><p>" + data[i].totalPrice + " SEK</p><br/>" +
                                        "<h4>| Payment method |<p></h4>" + data[i].paymentMethod + "</p><br/><h4>| Movie title(s) |</h4>";
 
                        //loop and function that shows the right movie name 
                        for (var j = 0; j < data[i].orderRows.length; j++) {
                            $.ajax({
                                url: "https://medieinstitutet-wie-products.azurewebsites.net/api/products/" + data[i].orderRows[j].productId,
                                method: "GET",
                                async:false,
                                success: function(product) {
                                        info += "<p>- " + product.name + " | " + data[i].orderRows[j].amount + " pcs.</p>"; 
                                    }
                                });
                            }
                        }
                    }
                            info += "</div>";
                            $("#moreInfoModal .modal-body").html(info);
                }  
            });
        });
    });
});
    
//document.ready
});
        
//function that shows the time the order was made in a tidy fashion 
function time(showTime) {
    return moment(showTime).format("MMMM Do YYYY, HH:mm:ss");  
}    