// @ts-check
import { Card, Heading, Page, TextContainer } from "@shopify/polaris";
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import LoadingPage from "../components/LoadingPage";

const MANDATE_PRODUCTS = gql`
  query MandateProducts {
    products(first: 100, query: "tag:mandatum") {
      edges {
        node {
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
          privateMetafields(namespace: "mandatum", first: 2) {
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

const Index = () => {
  const { data, loading, error } = useQuery(MANDATE_PRODUCTS);

  if (error) {
    return (
      <Page>
        <Heading>Error</Heading>
      </Page>
    );
  }

  if (loading) return <LoadingPage />;

  return (
    <Page
      title="Welcome to Mandatum"
      subtitle="Select your mandate products."
      primaryAction={{ content: "Add Product", disabled: false }}
    >
      {data.products.edges.map(prod => (
        <Card title={prod.node.title}>
          
        </Card>
      ))}
      
    </Page>
  );
};

export default Index;
