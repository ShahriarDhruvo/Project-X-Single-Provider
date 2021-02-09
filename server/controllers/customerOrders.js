const Sequelize = require('sequelize');
const sequelize = require('../../server/util/database');
const Orders = require('../../server/models/Orders');
const orders = Orders(sequelize, Sequelize);
const Order_Details = require('../../server/models/Order_details');
const orderDetails = Order_Details(sequelize, Sequelize);

const CustomerAddress =  require('../../server/models/Customer_Address');
const customeraddress = CustomerAddress(sequelize,Sequelize);
const Customer= require('../../server/models/Customer_Credential');
const customer=Customer(sequelize,Sequelize);

const Universal_Products = require('../models/Universal_Product_List');
const universal_products = Universal_Products(sequelize, Sequelize);
const Service_Inventory = require('../models//Service_Inventory');
const service_inventory = Service_Inventory(sequelize, Sequelize);


exports.createCustomerOrderDetails = (req, res, next) => {
    const customer_id = req.body.userid;
    const service_id = req.body.service_id;
    const order_time = req.body.order_time;
    const customer_address_id = req.body.customer_address_id;
    const payment = req.body.payment;
    const details = req.body.details;
    const delivered = false;

    orders.create({
        customer_id: customer_id,
        service_id: service_id,
        order_time: order_time,
        customer_address_id: customer_address_id,
        payment: payment,
        delivered : delivered
    }).then(result => {
            details.forEach(element => {
                element.order_id = result.order_id;
            });
           // console.log(result.order_id);
            orderDetails.bulkCreate(details,{
                    returning: true
                }).then(result => {
                    res.status(200).json({
                        
                        message: "Success"
                    });
                }).catch(err => {
                    res.status(504).json({
                        message: "Failed to create order details"
                    });
                });           
    }).catch(err => {
        res.status(504).json({
            message: "Failed to create orders"
        });
    });
    

};

exports.getServiceOrder = (req, res, next) => {
  //  const order_id = req.body.orderid;
    const service_id = req.body.userid;
    sequelize.query("SELECT *  FROM  Orders INNER JOIN Customer_Credential ON Orders.customer_id=Customer_Credential.customer_id INNER JOIN Customer_Address ON Orders.customer_address_id=Customer_Address.customer_add_id INNER JOIN Area_Details ON Customer_Address.area_id= Area_Details.area_id  WHERE service_id=? && delivered=false",{replacements: [service_id],type: sequelize.QueryTypes.SELECT})
    .then(result =>
        {
            var output = [];
            if(result.length===0)
                {  
                    res.status(200).json({
                       // details: details,
                        message: "No Orders."
                    });
                }
            else{
               
                result.forEach(element => {

                    var address = element.house_no+','+element.road_no+','+element.area_name+','+element.district;
                    var productorder =
                    {
                        "order_id" :element.order_id,
                        "customer_name" : element.customer_name,
                        "customer_phone" : element.customer_phone,
                        "address" : address,
                        // "road_no" : element.road_no,
                        // "house_no" :element.house_no,
                        "further_description" : element.further_description,
                        "payment" : element.payment,
                        "delivered" : element.delivered
                    };
                    output.push(productorder);
                });

                res.status(200).json({
                     details: output,
                     message: "Success."
                 });
            }
        });
   

};



exports.getServiceOrderDetails = (req, res, next) => {
             
        const order_id = req.body.order_id;
          
        sequelize.query("SELECT Order_details.qty,Order_details.price,Universal_Product_List.product_name,Universal_Product_List.qty AS size,Universal_Product_List.unit FROM Order_details INNER JOIN Universal_Product_List ON Order_details.product_id= Universal_Product_List.product_id WHERE order_id=?",{replacements: [order_id],type: sequelize.QueryTypes.SELECT})
        .then(result =>
            {
                var output = [];
                if(result.length===0)
                    {  
                        res.status(200).json({
                           // details: details,
                            message: "No Orders."
                        });
                    }
                else{
                   
                    result.forEach(element => {
                        var producdetails = element.size+' '+element.unit;
                        var prod="";
                        for (let i = 0; i < element.qty.length; i++) {
                            if(element.qty[i]===' ')
                                break;
                            prod +=element.qty[i];
                        }
                       // console.log(prod);
                      //  prod = parseInt(prod)
                        var product_quantity = parseInt(prod)/parseInt(element.size);
                        //console.log(product_quantity);

                       // var address = element.house_no+','+element.road_no+','+element.area_name+','+element.district;
                        var productorder =
                        {
                            "product_name" : element.product_name,
                            "quantity" : product_quantity,
                            "product_price_per_unit" : element.price,
                            "product_size" :producdetails
                        };
                        output.push(productorder);
                    });
    
                    res.status(200).json({
                         details: output,
                         message: "Success."
                     });
                }
            });

};



exports.completeServiceOrder = (req,res,nxt ) =>{

    const order_id = req.body.order_id;
    //const service_id = req.body.userid;

    orders.findByPk(order_id).then((serv) => {
            serv.delivered = true;
            return serv.save();
    }).then((sucess) => {
        res.status(200).json({message: "Success"});
    }).catch((err) => {
        res.status(504).json({message: "Failed"});
    });


};