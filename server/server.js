import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import { Session } from "@shopify/shopify-api/dist/auth/session";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import mongoose from "mongoose";
import { createClient } from "./handlers/client";
import send from "koa-send";

import { gql } from "@apollo/client";
import sgMail from "@sendgrid/mail";

import Impact from "../schemas/impact";

import {
  CREATE_TOKEN,
  GET_TOKENS,
  APP_DATA,
  RECURRING_CHARGE,
  MANDATE_PRODUCTS_TAGS,
  DELETE_TAGS,
} from "../helpers/queries";

import mandatumAPI from "../helpers/mandatumAPI";

dotenv.config();
sgMail.setApiKey(process.env.SGKEY);

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

mongoose
  .connect(
    "mongodb+srv://mandatum_admin:Mandatum2021*-@sessions.zov4x.mongodb.net/sessions?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then((resp) => {
    console.log("connected to mongo");
  });

const sessionSchema = new mongoose.Schema({
  id: String,
  shop: String,
  state: String,
  scope: String,
  expires: Date,
  isOnline: Boolean,
  accessToken: String,
  onlineAccessInfo: {},
});

const SessionSch = mongoose.model("Session", sessionSchema);

async function storeCallback(session) {
  console.log("Store Session", session);
  return await SessionSch.findOneAndUpdate({ id: session.id }, session, {
    new: true,
    upsert: true,
  });
}

async function loadCallback(id) {
  const loadedSession = await SessionSch.findOne({ id: id });

  if (!loadedSession) {
    return undefined;
  }

  const sess = new Session(loadedSession.id);

  const {
    shop,
    state,
    scope,
    accessToken,
    isOnline,
    expires,
    onlineAccessInfo,
  } = loadedSession;
  sess.shop = shop;
  sess.state = state;
  sess.scope = scope;
  sess.expires = expires ? new Date(expires) : undefined;
  sess.isOnline = isOnline;
  sess.accessToken = accessToken;
  sess.onlineAccessInfo = onlineAccessInfo;

  return sess;
}

async function deleteCallback(id) {
  const loadedSession = await SessionSch.findOneAndDelete({ id: id });
  console.log("Delete Session", loadedSession);
  return loadedSession;
}

// To Do ---- Add Custom Session storage
const mySessionStorage = new Shopify.Session.CustomSessionStorage(
  storeCallback,
  loadCallback,
  deleteCallback
);

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.January21,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: mySessionStorage,
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        console.log("Callback Shopify State: ", ctx.state.shopify);
        const { shop, accessToken, scope } = ctx.state.shopify;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        const offlineSession = await Shopify.Utils.loadOfflineSession(shop);

        if (offlineSession) {
          ctx.redirect(`/?shop=${shop}`);
        } else {
          console.log("------------------");
          console.log("Offline --> ", shop);

          // Create a new client for the specified shop.
          const client = new Shopify.Clients.Rest(shop, accessToken);
          // Use `client.get` to request the specified Shopify REST API endpoint, in this case `products`.
          const store = await client.get({
            path: "shop",
          });
          const storeInfo = store.body.shop;

          // name, url, panel_url, accessToken, sf_api_token, instanceID
          const createStore = await mandatumAPI.createStoreMANDATUM(
            storeInfo.name,
            `https://${storeInfo.domain}`,
            `https://${storeInfo.domain}`,
            accessToken,
            undefined,
            storeInfo.domain
          );

          const clientProducts = createClient(shop, accessToken);

          const data = await clientProducts.query({
            query: MANDATE_PRODUCTS_TAGS,
          });
          // console.log(data.data);
          // console.log(data.products);
          // console.log(data.products.edges);

          for (let pro of data.data.products.edges) {
            // console.log(pro);
            //console.log(pro.node);
            const id = pro.node.id;
            const shopifyDisc = await clientProducts.mutate({
              mutation: DELETE_TAGS,
              variables: {
                id,
              },
            });
            console.log("TAG eliminated", shopifyDisc);
          }

          console.log(createStore);
          ctx.redirect(`/offlineLogin?shop=${shop}`);
        }
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.get("/", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}&host=${ctx.query.host}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.get("/impact", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}&host=${ctx.query.host}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.get("/api/scripts", async (ctx) => {
    console.log(ctx.query);
    // This shop hasn't been seen yet, go through OAuth to create a session
    await send(ctx, `scripts/build/${ctx.query.filename}`);
  });

  router.get("/getImpact", async (ctx) => {
    const shop = ctx.query.shop;

    try {
      const impactData = await Impact.findOne({ shop });

      ctx.status = 200;
      ctx.body = {
        message: "success",
        impactData: impactData
          ? impactData
          : {
              id: null,
              shop,
              orders: 0,
              donations: 0,
              carbon: 0,
              land: 0,
            },
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { message: err?.message };
      console.log(err);
    }
  });

  router.get("/offlineLogin", async (ctx) => {
    const shop = ctx.query.shop;

    console.log("Offline ", shop);

    let authRoute = await Shopify.Auth.beginAuth(
      ctx.req,
      ctx.res,
      shop,
      "/auth/offlineCallback",
      false
    );
    return ctx.redirect(authRoute);
  });

  router.get("/auth/offlineCallback", async (ctx) => {
    console.log("Callback Query: ", ctx.query);
    const shop = ctx.query.shop;
    try {
      await Shopify.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query);
    } catch (error) {
      console.error(error);
    }
    return ctx.redirect(`/?shop=${shop}&host=${ctx.query.host}`);
  });

  router.get("/isMandatum", bodyParser(), async (ctx) => {
    const shop = ctx.query.shop;
    const productId = ctx.query.product;
    let isMandatum = false;
    let storeFrontToken = "";

    try {
      const offlineSession = await Shopify.Utils.loadOfflineSession(shop);

      if (!offlineSession) {
        throw new Error("Shop is not authenticated");
      }

      if (!shop || !productId) {
        throw new Error("Missing Parameter");
      }

      console.log("-------------------");
      console.log(shop);
      console.log(offlineSession);
      console.log("-------------------");

      const client = createClient(shop, offlineSession.accessToken);

      const getProductInfo = await client.query({
        query: gql`
          query Product($id: ID!) {
            shop {
              privateMetafield(namespace: "mandatum", key: "activeWidget") {
                key
                value
              }
              currencyCode
            }
            product(id: $id) {
              id
              createdAt
              updatedAt
              description
              handle
              productType
              title
              vendor
              publishedAt
              onlineStoreUrl
              options {
                name
                values
              }
              images(first: 2) {
                edges {
                  node {
                    id
                    src
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    availableForSale
                    title
                    price
                  }
                }
              }
              tags
              descuento: privateMetafield(
                key: "descuento"
                namespace: "mandatum"
              ) {
                value
              }
              dias: privateMetafield(
                key: "dias_entrega"
                namespace: "mandatum"
              ) {
                value
              }
            }
          }
        `,
        variables: {
          id: productId,
        },
      });

      console.log("Product Info", getProductInfo);

      const producto = getProductInfo.data;

      if (producto.product.tags.includes("mandatum")) {
        isMandatum = true;
      }

      ctx.body = {
        id: producto.product.id,
        isMandatum,
        title: isMandatum ? producto.product.title : undefined,
        descuento: isMandatum
          ? parseFloat(producto.product.descuento.value) / 2
          : undefined,
        dias: isMandatum ? producto.product.dias.value : undefined,
        newProduct: producto,
      };
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.body = err.message;
    }
  });

  router.get("/checkoutData", bodyParser(), async (ctx) => {
    const shop = ctx.query.shop;

    try {
      const offlineSession = await Shopify.Utils.loadOfflineSession(shop);

      if (!offlineSession) {
        throw new Error("Shop is not authenticated");
      }

      if (!shop) {
        throw new Error("Missing Parameter");
      }

      console.log(shop);
      console.log(offlineSession);

      const client = createClient(shop, offlineSession.accessToken);

      const getShopData = await client.query({
        query: gql`
          query {
            shop {
              name
              privateMetafield(namespace: "mandatum", key: "activeWidget") {
                key
                value
              }
              currencyCode
            }
          }
        `,
        fetchPolicy: "no-cache",
      });

      console.log(getShopData.data.shop);

      ctx.body = getShopData.data.shop;
    } catch (err) {
      console.log(err);
      ctx.response.status = 500;
      ctx.body = err.message;
    }
  });

  router.post("/getDiscountCode", bodyParser(), async (ctx) => {
    const shop = ctx.query.shop;
    const { productId } = ctx.request.body;
    const inicio = new Date().toISOString();
    let fin = new Date();
    fin.setDate(fin.getDate() + 1);
    fin = fin.toISOString();

    try {
      const offlineSession = await Shopify.Utils.loadOfflineSession(shop);

      if (!offlineSession) {
        throw new Error("Shop is not authenticated");
      }

      if (!shop || !productId) {
        throw new Error("Missing Parameter");
      }

      const client = createClient(shop, offlineSession.accessToken);

      const getProductInfo = await client.query({
        query: gql`
          query Product($id: ID!) {
            product(id: $id) {
              title
              descuento: privateMetafield(
                key: "descuento"
                namespace: "mandatum"
              ) {
                value
              }
              dias: privateMetafield(
                key: "dias_entrega"
                namespace: "mandatum"
              ) {
                value
              }
              featuredImage {
                transformedSrc(maxWidth: 300)
              }
              priceRangeV2 {
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        `,
        variables: {
          id: productId,
        },
      });

      const productData = getProductInfo.data.product;
      console.log(productData);
      const dicountCode = new Buffer.from(
        productData.title + new Date().toISOString()
      );

      const productMandatum = {
        store_ID: shop,
        product_ID: productId,
        discount_percentage: productData.descuento.value,
        waiting_days: productData.dias.value,
        platform: "shopify", // lowercase() -> shopify, bigcommerce, wix
        product_name: productData.title,
        product_price: productData.priceRangeV2.maxVariantPrice.amount,
        currency: productData.priceRangeV2.maxVariantPrice.currencyCode,
        image: productData.featuredImage?.transformedSrc,
      };

      console.log(productMandatum);
      const productWithDiscount = await mandatumAPI.createCouponMANDATUM(
        productMandatum
      );

      const code = productWithDiscount.coupon_code;
      const discount = parseFloat(productData.descuento.value);
      const days = parseInt(productData.dias.value);

      const shopifyDisc = await client.mutate({
        mutation: gql`
          mutation discountCodeBasicCreate(
            $inicio: DateTime
            $fin: DateTime
            $discount: Float
            $productId: ID!
            $productTitle: String
            $code: String
          ) {
            discountCodeBasicCreate(
              basicCodeDiscount: {
                code: $code
                endsAt: $fin
                startsAt: $inicio
                title: $productTitle
                usageLimit: 1
                customerSelection: { all: true }
                customerGets: {
                  items: { products: { productsToAdd: [$productId] } }
                  value: { percentage: $discount }
                }
              }
            ) {
              codeDiscountNode {
                id
                codeDiscount {
                  ... on DiscountCodeBasic {
                    codes(first: 1) {
                      edges {
                        node {
                          code
                        }
                      }
                    }
                  }
                }
              }
              userErrors {
                code
                extraInfo
                field
                message
              }
            }
          }
        `,
        variables: {
          inicio,
          fin,
          discount: discount / 2 / 100,
          productId,
          productTitle: `Mandatum - ${
            productData.title
          } - ${new Date().toLocaleDateString("es-MX")}`,
          code,
        },
      });

      ctx.body = shopifyDisc.data.discountCodeBasicCreate;
    } catch (error) {
      console.error(error);
      ctx.response.status = 500;
      ctx.body = error.message;
    }
  });

  router.post("/pay", bodyParser(), async (ctx) => {
    const shop = ctx.query.shop;
    const { lineItems, customAttributes, shippingLine } = ctx.request.body;

    try {
      const offlineSession = await Shopify.Utils.loadOfflineSession(shop);
      if (!offlineSession) {
        throw new Error("Shop is not authenticated");
      }

      if (!shop || !lineItems || !customAttributes || !shippingLine) {
        throw new Error("Missing Parameter");
      }

      const client = createClient(shop, offlineSession.accessToken);

      const dOrder = await client.mutate({
        mutation: gql`
          mutation draftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
                invoiceUrl
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            lineItems,
            customAttributes,
          },
        },
      });

      console.log("Draft Order", dOrder.data.draftOrderCreate.draftOrder);
      console.log("Draft Errors", dOrder.data.draftOrderCreate.userErrors);

      ctx.body = dOrder.data.draftOrderCreate;
    } catch (error) {
      console.error(error);
      ctx.response.status = 500;
      ctx.body = error.message;
    }
  });

  router.post("/webhooks", async (ctx) => {
    const shop = ctx.request.header["x-shopify-shop-domain"];

    const responseDeleteStore = await mandatumAPI.deleteStoreMANDATUM(shop);
    console.log(responseDeleteStore);

    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log("Contexto: ", ctx);
      await SessionSch.deleteMany({ shop });
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post("/deleteCustomer", bodyParser(), async (ctx) => {
    const body = ctx.request.body;

    const message = {
      to: "jeisson@mandatum.co",
      from: "mandatum@em5614.acromatico.dev", // Use the email address or domain you verified above
      subject: "Customer Delition Request",
      text:
        "A customer has requested the delition of his profile from your plataform",
      html: `
        <h1>A customer has requested the delition of his/her profile.</h1>
        <p>Delete before 30 natural days, the client requesting this is the next one:</p>
        <p>Shop: ${body.shop_domain}</p>
        <p>Customer:</p>
        <ul>
          <li>Email: ${body.customer.email}</li>
          <li>Phone: ${body.customer.phone}</li>
        </ul>
      `,
    };

    try {
      const response = await sgMail.send(message);

      ctx.status = 200;
      ctx.body = response;
    } catch (err) {
      console.log(err);
      ctx.status = 200;
      ctx.body = { error: true, message: err?.message };
    }
  });

  router.post("/deleteShop", bodyParser(), async (ctx) => {
    const body = ctx.request.body;

    const message = {
      to: "jeisson@mandatum.co",
      from: "mandatum@em5614.acromatico.dev", // Use the email address or domain you verified above
      subject: "Shop Delition Request",
      text:
        "A shop has requested the delition of his profile from your plataform",
      html: `
        <h1>A shop has requested the delition of its profile.</h1>
        <p>Delete before 48 hours, the shop requesting this is the next one:</p>
        <p>Shop: ${body.shop_domain}</p>
      `,
    };

    try {
      const response = await sgMail.send(message);

      ctx.status = 200;
      ctx.body = response;
    } catch (err) {
      console.log(err);
      ctx.status = 200;
      ctx.body = { error: true, message: err?.message };
    }
  });

  router.post("/customerInfo", bodyParser(), async (ctx) => {
    const body = ctx.request.body;

    const message = {
      to: "jeisson@mandatum.co",
      from: "mandatum@em5614.acromatico.dev", // Use the email address or domain you verified above
      subject: "Customer Info Request",
      text:
        "A customer has requested the information of his profile from your plataform",
      html: `
        <h1>A customer has requested the information of his/her profile.</h1>
        <p>The customer requesting informaion is the next one:</p>
        <p>Shop: ${body.shop_domain}</p>
        <p>Customer:</p>
        <ul>
          <li>Email: ${body.customer.email}</li>
          <li>Phone: ${body.customer.phone}</li>
        </ul>
      `,
    };

    try {
      const response = await sgMail.send(message);

      ctx.status = 200;
      ctx.body = response;
    } catch (err) {
      console.log(err);
      ctx.status = 200;
      ctx.body = { error: true, message: err?.message };
    }
  });

  router.post("/sale", bodyParser(), async (ctx) => {
    const body = ctx.request.body;
    console.log("New Sale: ", body);
    const mandatumAttribute = body.note_attributes.find(
      (attr) => attr.name === "Mandatum Order"
    );
    const shop = body.order_status_url.split("/")[2];
    console.log(body);
    try {
      if (mandatumAttribute) {
        const mandateProduct = body.line_items.find((linea) => {
          const hasPropertie = linea.properties.find(
            (proper) => proper.name === "Mandatum Discount"
          );

          return hasPropertie ? true : false;
        });

        const couponInfo = body.discount_applications.find((attr) =>
          attr.description.includes("mandatum")
        );

        console.log(mandateProduct.properties);
        const mandatumCharge = parseFloat(mandateProduct.price);
        const discountValue =
          parseFloat(
            mandateProduct.properties
              .find((proper) => proper.name === "Mandatum Discount")
              .value.split("%")[0]
          ) / 100;
        const exchangeRate =
          parseFloat(body.total_price) / parseFloat(body.total_price_usd);
        const offlineSession = await Shopify.Utils.loadOfflineSession(shop);
        const client = createClient(shop, offlineSession.accessToken);
        let amount = mandatumCharge * 0.02;
        let donation = mandatumCharge * discountValue;

        const appData = await client.query({
          query: APP_DATA,
        });

        console.log(
          appData.data.app.installation.activeSubscriptions[0].lineItems[0].id
        );

        const subscriptionId =
          appData.data.app.installation.activeSubscriptions[0].lineItems[0].id;

        if (body.currency !== "USD") {
          amount = mandatumCharge * exchangeRate * 0.02;
          donation = mandatumCharge * exchangeRate * discountValue;
          // let toUSD = await fetch(
          //   `https://openexchangerates.org/api/convert/${mandatumCharge}/${body.currency}/USD?app_id=c5448ef8ab1a4083826561960b4f51cd`
          // ).then((jso) => jso.json());

          // console.log("Dolares", toUSD);
        }

        const usage = await client.mutate({
          mutation: RECURRING_CHARGE,
          variables: {
            subscriptionLineItemId: subscriptionId,
            price: {
              amount: `${amount}`,
              currencyCode: "USD",
            },
            description: `2% of mandate product in order ${body.name}`,
          },
          fetchPolicy: "no-cache",
        });

        const donationCharge = await client.mutate({
          mutation: RECURRING_CHARGE,
          variables: {
            subscriptionLineItemId: subscriptionId,
            price: {
              amount: `${donation}`,
              currencyCode: "USD",
            },
            description: `${
              discountValue * 100
            }% donation of mandate product in order ${body.name}`,
          },
        });

        const savedImpact = await Impact.findOneAndUpdate(
          { shop },
          {
            $inc: {
              orders: 1,
              donations: donation,
              carbon: donation / 10,
              land: (donation / 10) * 0.25,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        const responseApplication = await mandatumAPI.applyCouponStoreMANDATUM(
          couponInfo.description,
          body.order_number
        );
        console.log("Coupon Applied Mandatum", responseApplication);

        console.log(
          "Usage Data: ",
          usage.data.appUsageRecordCreate.appUsageRecord
        );
        console.log(
          "Donation Data: ",
          donationCharge.data.appUsageRecordCreate.appUsageRecord
        );
        console.log(
          "Usage Errors: ",
          usage.data.appUsageRecordCreate.userErrors
        );
        console.log(
          "Donations Errors: ",
          donationCharge.data.appUsageRecordCreate.userErrors
        );

        console.log("Descuento: ", discountValue);
        console.log("Impact: ", savedImpact);
      }
      ctx.status = 200;
      ctx.body = { message: "success" };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { message: err?.message };
      console.log(err);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", verifyRequest(), handleRequest); // Everything else must have sessions

  server.use(cors());
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

// app.use( mount( '/public', serve('./public') ) ) ;
