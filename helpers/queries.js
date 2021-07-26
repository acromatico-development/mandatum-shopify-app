import { gql } from "apollo-boost";

export const APP_DATA = gql`
  query AppData {
    shop {
      id
      url
      privateMetafield(namespace: "mandatum", key: "activeWidget"){
        key
        value
      }
    }
    app {
      installation {
        accessScopes {
          handle
          description
        }
        activeSubscriptions {
          id
          createdAt
          currentPeriodEnd
          lineItems {
            id
            usageRecords(first: 10) {
              edges {
                cursor
                node {
                  description
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const WIDGET_UPDATE = gql`
  mutation WidgetUpdate($input: PrivateMetafieldInput!) {
    privateMetafieldUpsert(input: $input) {
      privateMetafield {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const APP_INSTALL = gql`
  mutation AppInstall($return: URL!) {
    appSubscriptionCreate(
      name: "Mandatum App"
      returnUrl: $return
      lineItems: [
        {
          plan: {
            appUsagePricingDetails: {
              cappedAmount: { amount: 5000.00, currencyCode: USD },
              terms: "App will charge 2% of the total price in mandate products each time a discount is used."
            }
          }
        }
      ]
      test: true
    ) {
      userErrors {
        field
        message
      }
      confirmationUrl
      appSubscription {
        id
      }
    }
  }
`;

export const RECURRING_CHARGE = gql`
  mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $price: MoneyInput!, $description: String!) {
    appUsageRecordCreate(
      subscriptionLineItemId: $subscriptionLineItemId
      price: $price
      description: $description
    ) {
      appUsageRecord {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const JS_INSTALL = gql`
  mutation scriptTagCreate($input: ScriptTagInput!) {
    scriptTagCreate(input: $input) {
      scriptTag {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const WEBHOOK_INSTALL = gql`
  mutation webhookSubscriptionCreate($webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(
      topic: ORDERS_PAID
      webhookSubscription: $webhookSubscription
    ) {
      userErrors {
        field
        message
      }
      webhookSubscription {
        id
      }
    }
  }
`

export const JS_QUERY = gql`
  query scriptTags {
    scriptTags(
      first: 10
    ){
      edges {
        node {
          id
          createdAt
          displayScope
          src
        }
      }
    }
  }
`;

// export const WEBHOOK_QUERY = gql`
//   query webhookSubscriptions {
//     webhookSubscriptions(
//       first: 1
//       callbackUrl: "https://stage-dot-mandatum-app.uc.r.appspot.com/sale"
//     ){
//       edges {
//         node {
//           id
//           createdAt
//           topic
//           endpoint {
//             __typename
//             ... on WebhookHttpEndpoint {
//               callbackUrl
//             }
//           }
//         }
//       }
//     }
//   }
// `;

export const WEBHOOK_QUERY = gql`
  query webhookSubscriptions {
    webhookSubscriptions(
      first: 1
      callbackUrl: "https://mandatum-app.uc.r.appspot.com/sale"
    ){
      edges {
        node {
          id
          createdAt
          topic
          endpoint {
            __typename
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
    }
  }
`;

export const DELETE_APP = gql`
  mutation appSubscriptionCancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      appSubscription {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const DELETE_JS = gql`
  mutation scriptTagDelete($id: ID!) {
    scriptTagDelete(id: $id) {
      deletedScriptTagId
      userErrors {
        field
        message
      }
    }
  }
`

export const DELETE_WEBHOOK = gql`
  mutation webhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      deletedWebhookSubscriptionId
      userErrors {
        field
        message
      }
    }
  }
`

export const INITIAL_PRODUCTS = gql`
  query InitialProducts {
    products(first: 10, query: "-tag:mandatum") {
      edges {
        node {
          id
          featuredImage {
            transformedSrc(maxWidth: 300)
          }
          priceRangeV2 {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          title
          description
        }
      }
    }
  }
`

export const MANDATE_PRODUCTS = gql`
  query MandateProducts {
    products(first: 100, query: "tag:mandatum") {
      edges {
        node {
          id
          featuredImage {
            transformedSrc(maxWidth: 300)
          }
          priceRangeV2 {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          title
          description
          privateMetafields(namespace: "mandatum", first: 4) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

export const QUERY_PRODUCTS = gql`
  query QueryProducts($query: String) {
    products(first: 100, query: $query) {
      edges {
        node {
          id
          featuredImage {
            transformedSrc(maxWidth: 300)
          }
          priceRangeV2 {
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          title
          description
        }
      }
    }
  }
`;

export const ADD_METAFIELDS = gql`
  mutation UpdateProduct($id: ID!) {
    productUpdate(
      input: {
        id: $id
        privateMetafields: [
          {
            namespace: "mandatum"
            key: "porcentaje"
            owner: $id
            valueInput: { value: "15", valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "descuento"
            owner: $id
            valueInput: { value: "15", valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "donacion"
            owner: $id
            valueInput: { value: "15", valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "dias_entrega"
            owner: $id
            valueInput: { value: "45", valueType: INTEGER }
          }
        ]
      }
    ) {
      product {
        id
      }
    }
  }
`;

export const ADD_TAGS = gql`
  mutation TagsAdd($id: ID!) {
    tagsAdd(id: $id, tags: ["mandatum"]) {
      node {
        id
      }
    }
  }
`;

export const DELETE_META = gql`
  mutation privateMetafieldDelete($id: ID!, $key: String!) {
    privateMetafieldDelete(
      input: { owner: $id, namespace: "mandatum", key: $key }
    ) {
      deletedPrivateMetafieldId
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_TAGS = gql`
  mutation tagsRemove($id: ID!) {
    tagsRemove(id: $id, tags: ["mandatum"]) {
      node {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_METAFIELDS = gql`
  mutation UpdateProduct(
    $id: ID!
    $porcentaje: String!
    $descuento: String!
    $donacion: String!
    $dias: String!
  ) {
    productUpdate(
      input: {
        id: $id
        privateMetafields: [
          {
            namespace: "mandatum"
            key: "porcentaje"
            owner: $id
            valueInput: { value: $porcentaje, valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "descuento"
            owner: $id
            valueInput: { value: $descuento, valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "donacion"
            owner: $id
            valueInput: { value: $donacion, valueType: STRING }
          }
          {
            namespace: "mandatum"
            key: "dias_entrega"
            owner: $id
            valueInput: { value: $dias, valueType: INTEGER }
          }
        ]
      }
    ) {
      product {
        id
      }
    }
  }
`;

export const GET_TOKENS = gql`
  query getTokens {
    shop {
      storefrontAccessTokens(first:1) {
        edges {
          node {
            id
            accessToken
            accessScopes{
              handle
            }
            title
          }
        }
      }
    }
  }
`

export const CREATE_TOKEN = gql`
  mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
    storefrontAccessTokenCreate(input: $input) {
      shop {
        id
      }
      storefrontAccessToken {
        id
        accessToken
        accessScopes{
          handle
        }
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;
