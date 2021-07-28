import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/es.json";
import { useEffect, useState } from "react";

import "../styles/main.css";

function userLoggedInFetch(app) {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);

    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
      return null;
    }

    return response;
  };
}

function MyProvider(props) {
  const app = useAppBridge();

  const client = new ApolloClient({
    fetch: userLoggedInFetch(app),
    fetchOptions: {
      credentials: "include",
    },
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

function MyApp(props){
  const [context, setContexto] = useState();

  useEffect(() => {
    setContexto(props);
  }, []);

  if(!context){
    return <p>Loading...</p>
  }

  return (
    <AppProvider
      theme={{
        colors: {
          critical: "#cc0e3a",
          highlight: "#492fb1",
          primary: "#492fb1",
        },
      }}
      i18n={translations}
    >
      <Provider
        config={{
          apiKey: API_KEY,
          host: Buffer.from(`${context.shopOrigin}/admin`).toString("base64"),
          forceRedirect:true
        }}
      >
        <MyProvider Component={context.Component} {...context.pageProps} />
      </Provider>
    </AppProvider>
  );
};

MyApp.getInitialProps = async ({ ctx, ...data }) => {
  // console.log("Final context", data)
  return {
    shopOrigin: ctx.query.shop,
    shopifyHost: ctx.query.host
  };
};

export default MyApp;
