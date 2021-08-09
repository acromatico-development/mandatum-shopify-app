import axios from "axios";

// Create store in mandatum
async function createStoreMANDATUM(
  name,
  url,
  panel_url,
  accessToken,
  sf_api_token,
  instanceID
) {
  const body = {
    // *** PUT YOUR PARAMS HERE ***
    name: name,
    url: url,
    panel_url: panel_url,
    platform: "shopify", // lowercase() -> shopify, bigcommerce, wix
    access_token: accessToken,
    sf_api_token: sf_api_token,
    store_ID: instanceID,
  };

  console.log(body);
  /*
    Sample
    {
      "name": "mandatum",
      "url" : "https://mymandatum.com/",
      "platform" : "wix",
      "access_token": "OAUTH2.eyJraWQiOiJkZ0x3cjNRMCIsImFsZyI6IkhTMjU2In0",
      "sf_api_token" : "asdasd",
      "store_ID" : "mymandatum"
    }
    */
  const out = await axios.post(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/stores`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );

  return out.data;
}

// Update CusId to STORE in mandatum => Store working with mandatum
async function updateCusIdMANDATUM(stripe_cus_ID, instanceId) {
  const body = {
    stripe_cus_ID: stripe_cus_ID,
  };
  const out = await axios.patch(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/stores/${instanceId}/stripe`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Get the refresh token to use the wix API
/*
Returns 
{
    "access_Token": "some access token",
    "sf_api_token": "some storefront api token"
}
*/
async function getRefreshTokenMANDATUM(instanceId, where = "") {
  const out = await axios.get(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/tokens/${instanceId}&${where}`,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Delete mandatum to Store
async function deleteStoreMANDATUM(instanceId) {
  const out = await axios.delete(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/stores/${instanceId}`,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Get all products
/*
Returns
{
    "112": {
        "percentage": 20,
        "waiting_days": 45
    },
    "product_ID": {
        "percentage": NUMBER,
        "waiting_days": NUMBER
    },
}
*/
async function getProductsMANDATUM(instanceId) {
  const out = await axios.get(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/products/${instanceId}`,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Add products to mandatum
async function addProductsMANDATUM(instanceId, products) {
  const body = products;
  /*
    Sample
    {
        "products" : [
            {
              "product_ID": "1234", 
              "percentage": 30.6, 
              "waiting_days": 40
            },
            {
              "product_ID": "9876", 
              "percentage": 15.2, 
              "waiting_days": 30
            }
        ]
    }
  */
  const out = await axios.post(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/products/${instanceId}/add_products`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Update product products to mandatum
/* 
  product = {
   id: "productID",
   percentage: "percentage",
   percentage: "percentage",
  }
*/
async function updateProductsMANDATUM(instanceId, product) {
  const productID = product.id;
  const body = {
    percentage: product.percentage,
    waiting_days: product.waiting_days,
  };

  const out = await axios.patch(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/products/${instanceId}/update_product/${productID}`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Delete product to mandatum
async function deleteProductsMANDATUM(instanceId, productID) {
  const out = await axios.delete(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/products/${instanceId}/delete_product/${productID}`,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Create new Buyer(customer) in mandatum.
// PLEASE Call after REDEM click in the order confirmation page
async function createBuyerMANDATUM(full_name, email, password) {
  const body = {
    full_name: full_name,
    email: email,
    password: password,
  };

  const out = await axios.post(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/buyers`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Apply Coupon to STORE in mandatum
// This change the state in DB
async function applyCouponStoreMANDATUM(coupon_code, order_ID) {
  const body = {
    order_ID: order_ID,
  };
  const out = await axios.patch(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons/${coupon_code}/apply_store`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Apply Coupon to BUYER in mandatum
// PLEASE Call after the buyer creation
// buyer_ID: email
async function applyCouponBuyerMANDATUM(coupon_code, buyer_ID) {
  const body = {
    buyer_ID: buyer_ID,
  };

  const out = await axios.patch(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons/${coupon_code}/apply_buyer`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Get ALL COUPONS of given STORE
async function getCouponsStoreMANDATUM(instanceId) {
  const out = await axios.get(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons/${instanceId}/stores`,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

// Create coupon mandatum
/* 
Returns
{
  store_ID: store_ID,
  product_ID: product_ID,
  coupon_code: `mandatum-R1H78-6T8B6-BF9L5`, 
  coupon_name: `mandatum-R1H78-6T8B6-BF9L5`, // Name and code == 
  starts_at: 2021-07-28 14:33:21,
  ends_at: 2021-07-29 14:33:21,
  discount_percentage: discount_percentage, 
}
*/
async function createCouponMANDATUM(product) {
  const body = product;
  /*
    Sample
    {
      store_ID              = store_ID;
      product_ID            = product_ID;
      discount_percentage   = discount_percentage;
      waiting_days          = waiting_days;
      platform              = platform; // lowercase() -> shopify, bigcommerce, wix
      product_name          = product_name;
      product_price         = product_price;
      currency              = currency;   // USD, COP, MXN
      image                 = image; url
    }
  */
  const out = await axios.post(
    `https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons`,
    body,
    {
      headers: { "x-mandatum-key": "7e516728-d04a-11e8-aabb-02d8633d3428" },
    }
  );
  return out.data;
}

module.exports = {
  createStoreMANDATUM,
  updateCusIdMANDATUM,
  getRefreshTokenMANDATUM,
  deleteStoreMANDATUM,
  getProductsMANDATUM,
  addProductsMANDATUM,
  updateProductsMANDATUM,
  deleteProductsMANDATUM,
  createCouponMANDATUM,
  getCouponsStoreMANDATUM,
  createBuyerMANDATUM,
  applyCouponStoreMANDATUM,
  applyCouponBuyerMANDATUM,
};
