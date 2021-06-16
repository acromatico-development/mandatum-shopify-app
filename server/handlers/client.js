import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context"

export const createClient = (shop, accessToken) => {

  const httpLink = createHttpLink({
    uri: `https://${shop}/admin/api/2021-01/graphql.json`,
    
  });

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        "X-Shopify-Access-Token": accessToken,
        "User-Agent": `shopify-app-node ${
          process.env.npm_package_version
        } | Shopify Mandatum App`
      }
    }
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
  });

  // return new ApolloClient({
  //   uri: `https://${shop}/admin/api/2019-10/graphql.json`,
  //   request: operation => {
  //     operation.setContext({
  //       headers: {
  //         "X-Shopify-Access-Token": accessToken,
  //         "User-Agent": `shopify-app-node ${
  //           process.env.npm_package_version
  //         } | Shopify App CLI`
  //       }
  //     });
  //   }
  // });
};
