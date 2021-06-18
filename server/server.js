import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";
import { Session } from '@shopify/shopify-api/dist/auth/session';
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import cors from "@koa/cors";
import bodyParser from "koa-bodyparser";
import mongoose from "mongoose";
import { createClient } from "./handlers/client";
import { gql } from "@apollo/client";
import {
  CREATE_TOKEN,
  GET_TOKENS,
  APP_DATA,
  RECURRING_CHARGE,
} from "../helpers/queries";

dotenv.config();

const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

mongoose.connect(
  "mongodb+srv://mandatum_admin:Mandatum2021*-@sessions.zov4x.mongodb.net/sessions?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(resp => {
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
  onlineAccessInfo: {}
});

const SessionSch = mongoose.model('Session', sessionSchema);

async function storeCallback(session) {
  console.log("Store Session", session);
  return await SessionSch.findOneAndUpdate({ id: session.id }, session, {
    new: true,
    upsert: true
  });
}

async function loadCallback(id) {
  console.log(typeof id);
  const loadedSession = await SessionSch.findOne({ id: id });
  console.log("Load Session", loadedSession);

  

  if(!loadedSession){
    return undefined;
  }

  const sess = new Session(loadedSession.id);

  const { shop, state, scope, accessToken, isOnline, expires, onlineAccessInfo } = loadedSession
  sess.shop = shop
  sess.state = state
  sess.scope = scope
  sess.expires = expires ? new Date(expires) : undefined
  sess.isOnline = isOnline
  sess.accessToken = accessToken
  sess.onlineAccessInfo = onlineAccessInfo

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
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
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

      console.log(shop);
      console.log(offlineSession);

      const client = createClient(shop, offlineSession.accessToken);

      const getProductInfo = await client.query({
        query: gql`
          query Product($id: ID!) {
            product(id: $id) {
              id
              title
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

      const producto = getProductInfo.data.product;

      if (producto.tags.includes("mandatum")) {
        isMandatum = true;

        const getTokens = await client.query({
          query: GET_TOKENS,
        });

        console.log(getTokens.data.shop.storefrontAccessTokens.edges[0]);

        if (getTokens.data.shop.storefrontAccessTokens.edges.length > 0) {
          storeFrontToken =
            getTokens.data.shop.storefrontAccessTokens.edges[0].node;
        } else {
          const createSFToken = await client.mutate({
            mutation: CREATE_TOKEN,
            variables: {
              input: {
                title: `Mandatum App - ${new Date().toLocaleString("es-MX")}`,
              },
            },
          });

          storeFrontToken =
            createSFToken.data.storefrontAccessTokenCreate
              .storefrontAccessToken;
        }
      }

      console.log(storeFrontToken);

      ctx.body = {
        id: producto.id,
        isMandatum,
        title: isMandatum ? producto.title : undefined,
        descuento: isMandatum ? producto.descuento.value : undefined,
        dias: isMandatum ? producto.dias.value : undefined,
        storeFrontToken,
      };
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
      const code = dicountCode.toString("base64");
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
          discount: discount / 100,
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

  router.get("/offlineLogin", async (ctx) => {
    const shop = ctx.query.shop;

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
    const shop = ctx.query.shop;
    try {
      await Shopify.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query);
    } catch (error) {
      console.error(error);
    }
    return ctx.redirect(`/?shop=${shop}`);
  });

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.post("/sale", bodyParser(), async (ctx) => {
    const body = ctx.request.body;
    const mandatumAttribute = body.note_attributes.find(
      (attr) => attr.name === "Mandatum Order"
    );
    const shop = body.order_status_url.split("/")[2];

    try {
      if (mandatumAttribute) {
        const discount = parseFloat(body.total_discounts);
        const mandatumCharge = discount / 2;
        const offlineSession = await Shopify.Utils.loadOfflineSession(shop);
        const client = createClient(shop, offlineSession.accessToken);
        let amount = mandatumCharge;

        const appData = await client.query({
          query: APP_DATA,
        });

        console.log(
          appData.data.app.installation.activeSubscriptions[0].lineItems[0].id
        );

        const subscriptionId =
          appData.data.app.installation.activeSubscriptions[0].lineItems[0].id;

        if (body.currency !== "USD") {
          amount = 10;

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
            description: `50% of given dicount for order ${body.name}`,
          },
        });

        console.log(usage.data.appUsageRecordCreate);

        console.log("Descuento", mandatumCharge);
      }
      ctx.status = 201;
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
