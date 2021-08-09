// @ts-check
import {
  Card,
  Heading,
  Page,
  TextStyle,
  Modal,
  Filters,
  ResourceList,
  ResourceItem,
  TextField,
  TextContainer,
  Thumbnail,
  Stack,
  Button,
  Subheading,
  Layout,
  Scrollable,
  Loading,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "react-apollo";
// import { useQuery as useQueryRest } from "react-query";

import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import LoadingPage from "../components/LoadingPage";
import {
  ADD_METAFIELDS,
  ADD_TAGS,
  DELETE_META,
  DELETE_TAGS,
  MANDATE_PRODUCTS,
  QUERY_PRODUCTS,
  UPDATE_METAFIELDS,
  APP_DATA,
  APP_INSTALL,
  DELETE_APP,
  JS_INSTALL,
  JS_QUERY,
  DELETE_JS,
  WEBHOOK_QUERY,
  DELETE_WEBHOOK,
  WEBHOOK_INSTALL,
  INITIAL_PRODUCTS,
  WIDGET_UPDATE,
} from "../helpers/queries";

import mandatumAPI from "../helpers/mandatumAPI";

const Product = () => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [productIds, setProductIds] = useState([]);

  const { data, loading, error, refetch } = useQuery(MANDATE_PRODUCTS, {
    fetchPolicy: "no-cache",
    variables: { ids: productIds },
  });

  const [url, setUrl] = useState("");

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(INITIAL_PRODUCTS, {
    fetchPolicy: "no-cache",
  });
  const { data: appData, loading: appLoading, error: appError } = useQuery(
    APP_DATA,
    {
      fetchPolicy: "no-cache",
    }
  );
  const {
    data: jsData,
    loading: jsLoading,
    error: jsError,
    refetch: jsRefetch,
  } = useQuery(JS_QUERY, {
    fetchPolicy: "no-cache",
  });
  const { data: whData, loading: whLoading, error: whError } = useQuery(
    WEBHOOK_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );
  const [queryProducts, qResults] = useLazyQuery(QUERY_PRODUCTS, {
    fetchPolicy: "no-cache",
  });
  const [appInstall] = useMutation(APP_INSTALL, {
    fetchPolicy: "no-cache",
  });
  const [jsInstall] = useMutation(JS_INSTALL, {
    fetchPolicy: "no-cache",
  });
  const [whInstall] = useMutation(WEBHOOK_INSTALL, {
    fetchPolicy: "no-cache",
  });
  const [jsDelete] = useMutation(DELETE_JS, {
    fetchPolicy: "no-cache",
  });
  const [whDelete] = useMutation(DELETE_WEBHOOK, {
    fetchPolicy: "no-cache",
  });
  const [addMeta] = useMutation(ADD_METAFIELDS, {
    fetchPolicy: "no-cache",
  });
  const [addTags] = useMutation(ADD_TAGS, {
    fetchPolicy: "no-cache",
  });
  const [deleteMeta] = useMutation(DELETE_META, {
    fetchPolicy: "no-cache",
  });
  const [deleteTags] = useMutation(DELETE_TAGS, {
    fetchPolicy: "no-cache",
  });
  const [updateMeta] = useMutation(UPDATE_METAFIELDS, {
    fetchPolicy: "no-cache",
  });
  const [activeModal, setActiveModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [queryData, setQueryData] = useState();
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [modalProduct, setModalProduct] = useState({
    active: false,
    id: undefined,
  });
  const [generalLoading, setGeneralLoading] = useState(false);
  const [modalEdit, setModalEdit] = useState({
    active: false,
    id: undefined,
    title: "",
    image: "",
    price: "",
    discount: "",
    delivery: "",
  });
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    console.log("");

    const head = document.querySelector("body");
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://assets.calendly.com/assets/external/widget.js"
    );
    head.appendChild(script);

    setUrl(
      "https://calendly.com/mandatum-ceo/protect-nature-improve-profitability-at-no-extra-cost"
    );
  }, [productLoading, productError, productData, queryData, appData]);

  useEffect(() => {
    if (!appLoading && !appError && appData) {
      const instanceID = appData.shop.url.split("//")[1];
      console.log("STORE_ID", instanceID);

      mandatumAPI
        .getProductsMANDATUM(instanceID)
        .then((resp) => {
          const out = resp;
          const productsIDs = Object.keys(out).map(
            (e) => `gid://shopify/Product/${e}`
          );
          console.log(productsIDs);
          setProductIds(productsIDs);

          const newData = [];
          productData.products.edges.forEach((element) => {
            if (!productsIDs.includes(element.node.id)) {
              newData.push(element.node);
            }
          });
          setQueryData(newData);
        })
        .catch((e) => console.log(e));
    }

    if (
      !whLoading &&
      !whError &&
      whData &&
      (whData.webhookSubscriptions.edges.length === 0 ||
        whData.webhookSubscriptions.edges.length > 1)
    ) {
      console.log("webhook");

      whData.webhookSubscriptions.edges.forEach((who) => {
        whDelete({
          variables: {
            id: who.node.id,
          },
        });
      });

      whInstall({
        variables: {
          webhookSubscription: {
            callbackUrl: `https://mandatum-app.uc.r.appspot.com/sale`,
            // callbackUrl: "https://mandatum-app.uc.r.appspot.com/sale",
            // callbackUrl: "https://stage-dot-mandatum-app.uc.r.appspot.com/sale"
          },
        },
      }).then((resp) => console.log(resp));
    }

    if (
      !installing &&
      !jsLoading &&
      !jsError &&
      jsData &&
      (jsData.scriptTags.edges.length === 0 ||
        jsData.scriptTags.edges.length > 2)
    ) {
      console.log("js");
      handleInstall();
    }

    setTimeout(() => {
      setGeneralLoading(false);
    }, 3000);
  }, [
    qResults.loading,
    qResults.error,
    qResults.data,
    appLoading,
    appError,
    appData,
    jsData,
    jsError,
    jsLoading,
    whLoading,
    whError,
    whData,
    installing,
    data,
    loading,
    error,
  ]);

  const handleRefetch = useCallback(async () => {
    setGeneralLoading(true);
    await refetch();
    setGeneralLoading(false);
  }, [refetch]);

  const handleSelectProduct = useCallback(async () => {
    setGeneralLoading(true);
    const addMetaArray = [];
    const addTagArray = [];
    let productsToAdd = [];

    // @ts-ignore
    selectedProduct.forEach((prod) => {
      addMetaArray.push(
        addMeta({
          variables: {
            id: prod,
          },
        })
      );
      addTagArray.push(
        addTags({
          variables: {
            id: prod,
          },
        })
      );

      // MANDATUM ADD PRODUCTS
      productsToAdd.push({
        product_ID: prod.split("/")[prod.split("/").length - 1],
        percentage: 15,
        waiting_days: 45,
      });
    });

    try {
      await Promise.all(addMetaArray);
      await Promise.all(addTagArray);

      setActiveModal(false);
      setSearchValue("");
      // setQueryData(undefined);
      setSelectedProduct([]);

      const instanceID = appData.shop.url.split("//")[1];
      console.log("STORE_ID", instanceID);
      const responseInsertionDB = await mandatumAPI.addProductsMANDATUM(
        instanceID,
        { products: productsToAdd }
      );
      console.log(responseInsertionDB);

      const responseProductsDB = await mandatumAPI.getProductsMANDATUM(
        instanceID
      );
      const productsIDs = Object.keys(responseProductsDB).map(
        (e) => `gid://shopify/Product/${e}`
      );
      console.log(productsIDs);
      setProductIds(productsIDs);

      setTimeout(() => {
        refetch();
        setGeneralLoading(false);
      }, 2000);
    } catch (err) {
      console.log(err);
    }
  }, [selectedProduct, refetch]);

  const handleDeleteProduct = useCallback(
    async (id, appData) => {
      console.log(appData);
      const instanceID = appData.shop.url.split("//")[1];

      setGeneralLoading(true);
      setModalProduct({ active: false, id: undefined });
      try {
        await deleteMeta({
          variables: {
            id,
            key: "porcentaje",
          },
        });
        await deleteMeta({
          variables: {
            id,
            key: "descuento",
          },
        });
        await deleteMeta({
          variables: {
            id,
            key: "donacion",
          },
        });
        await deleteMeta({
          variables: {
            id,
            key: "dias_entrega",
          },
        });
        await deleteTags({
          variables: {
            id,
          },
        });

        console.log("STORE_ID", instanceID);
        console.log("PRODUCT_ID", id.split("/")[id.split("/").length - 1]);
        const responseDeletionDB = await mandatumAPI.deleteProductsMANDATUM(
          instanceID,
          id.split("/")[id.split("/").length - 1]
        );

        console.log(responseDeletionDB);

        const responseProductsDB = await mandatumAPI.getProductsMANDATUM(
          instanceID
        );
        const productsIDs = Object.keys(responseProductsDB).map(
          (e) => `gid://shopify/Product/${e}`
        );
        console.log(productsIDs);
        setProductIds(productsIDs);

        const newData = [];
        productData.products.edges.forEach((element) => {
          if (!productsIDs.includes(element.node.id)) {
            newData.push(element.node);
          }
        });
        setQueryData(newData);

        await refetch();
      } catch (err) {
        console.log(err);
      }
      setGeneralLoading(false);
    },
    [refetch]
  );

  const handleUpdateProducts = useCallback(
    async (appData, id, discount, days) => {
      setGeneralLoading(true);
      setModalEdit({
        active: false,
        id: undefined,
        title: "",
        image: "",
        price: "",
        discount: "",
        delivery: "",
      });

      try {
        await updateMeta({
          variables: {
            id: id,
            porcentaje: `${parseFloat(discount) / 2}`,
            donacion: `${parseFloat(discount) / 2}`,
            descuento: discount,
            dias: days,
          },
        });

        const instanceID = appData.shop.url.split("//")[1];

        await mandatumAPI.updateProductsMANDATUM(instanceID, {
          id: id.split("/")[id.split("/").length - 1],
          percentage: discount,
          waiting_days: days,
        });

        setTimeout(() => {
          refetch();
          setGeneralLoading(false);
        }, 2000);
      } catch (err) {
        console.log(err);
      }

      // setGeneralLoading(false);
    },
    [refetch]
  );

  const onQueryChange = useCallback(
    async (value) => {
      setSearchValue(value);
      setSelectedProduct([]);

      if (value.length >= 4) {
        queryProducts({
          variables: {
            query: value,
          },
        });
      }
    },
    [searchValue]
  );

  const onQueryClear = useCallback(async () => {
    setSearchValue("");
    setSelectedProduct([]);
    // setQueryData(undefined);
  }, [searchValue]);

  const handleProductClick = useCallback(
    (id) => {
      setSelectedProduct(id);
    },
    [selectedProduct]
  );

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    for (let i = 0; i <= jsData.scriptTags.edges.length - 1; i++) {
      await jsDelete({
        variables: {
          id: jsData.scriptTags.edges[i].node.id,
        },
      });
    }

    await jsInstall({
      variables: {
        input: {
          src: `https://mandatum-app.uc.r.appspot.com/api/scripts?filename=mandatum.js`,
          displayScope: "ALL",
        },
      },
    });

    await jsInstall({
      variables: {
        input: {
          src:
            "https://cdn.shopify.com/s/shopify/option_selection.js?20cf2ffc74856c1f49a46f6e0abc4acf6ae5bb34",
          displayScope: "ONLINE_STORE",
        },
      },
    });

    await jsRefetch();

    setInstalling(false);
  }, [jsData]);

  if (error || appError) {
    console.log(error);
    console.log(appError);
    return (
      <Page>
        <Heading>Some</Heading>
      </Page>
    );
  }

  if (generalLoading || loading || appLoading) return <Loading />;

  return (
    <Page
      title="Mandate Products"
      subtitle="Edit your mandate products."
      primaryAction={{
        content: "Add Product",
        disabled: false,
        onAction: () => setActiveModal(true),
      }}
      secondaryActions={[
        {
          content: "Reload Products",
          disabled: false,
          onAction: handleRefetch,
        },
      ]}
    >
      <Scrollable shadow style={{ height: "300px" }} focusable>
        <Card sectioned>
          <Card.Section>
            {data.nodes.filter(
              (prod) =>
                prod.privateMetafields.edges.find(
                  (met) => met.node.key === "descuento"
                )?.node
            ).length === 0 ? (
              <TextContainer>
                {loading || generalLoading ? (
                  <Stack alignment="center" vertical={true}>
                    <Subheading element="h3">Loading...</Subheading>
                  </Stack>
                ) : (
                  <Stack alignment="center" vertical={true}>
                    <Subheading element="h3">No Products</Subheading>
                  </Stack>
                )}
              </TextContainer>
            ) : (
              <ResourceList
                loading={loading || generalLoading}
                resourceName={{ singular: "product", plural: "products" }}
                items={data.nodes
                  .filter((prod) =>
                    prod.privateMetafields.edges.find(
                      (met) => met.node.key === "descuento"
                    )
                  )
                  .map((prod) => {
                    return {
                      id: prod.id,
                      title: prod.title,
                      description: prod.description,
                      featuredImage: prod.featuredImage?.transformedSrc,
                      price: `${prod.priceRangeV2.maxVariantPrice.amount} ${prod.priceRangeV2.maxVariantPrice.currencyCode}`,
                      discount: prod.privateMetafields.edges.find(
                        (met) => met.node.key === "descuento"
                      )?.node.value,
                      days: prod.privateMetafields.edges.find(
                        (met) => met.node.key === "dias_entrega"
                      )?.node.value,
                    };
                  })}
                renderItem={(item) => {
                  const {
                    title,
                    description,
                    featuredImage,
                    id,
                    price,
                    discount,
                    days,
                  } = item;

                  return (
                    <ResourceItem
                      id={id}
                      media={
                        <Thumbnail
                          size="large"
                          alt={title}
                          source={
                            featuredImage ||
                            "https://cdn2.iconfinder.com/data/icons/e-commerce-line-4-1/1024/open_box4-512.png"
                          }
                        />
                      }
                      accessibilityLabel={`View details for ${title}`}
                      onClick={() => console.log(id)}
                      shortcutActions={[
                        {
                          content: "Edit",
                          onAction: () =>
                            setModalEdit({
                              active: true,
                              id,
                              title,
                              image: featuredImage,
                              price,
                              discount,
                              delivery: days,
                            }),
                        },
                        {
                          content: "Delete",
                          onAction: () => setModalProduct({ active: true, id }),
                        },
                      ]}
                    >
                      <TextContainer>
                        <Heading>{title}</Heading>
                        <p>
                          <TextStyle variation="strong">{price}</TextStyle>
                        </p>
                        <p>
                          {description.length > 200
                            ? description.substr(0, 200) + "..."
                            : description}
                        </p>
                        <p>Allowed Discount: {discount}%</p>
                      </TextContainer>
                      <p>Delivery Time: {days} Days</p>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card.Section>
        </Card>
      </Scrollable>

      <Modal
        open={activeModal}
        onClose={() => setActiveModal(false)}
        title="Search for a product to add"
        primaryAction={{
          content: "Add Product",
          onAction: handleSelectProduct,
        }}
      >
        <Modal.Section>
          <Filters
            queryValue={searchValue}
            onQueryChange={onQueryChange}
            onQueryClear={onQueryClear}
            onClearAll={onQueryClear}
            filters={[]}
            queryPlaceholder="Search Products"
          />
        </Modal.Section>
        <Modal.Section>
          {searchValue.length >= 4 &&
            (!queryData || queryData?.length === 0) &&
            !qResults.loading && <p>Products not found</p>}
          {queryData && queryData.length > 0 && (
            <ResourceList
              showHeader
              loading={qResults.loading}
              resourceName={{ singular: "product", plural: "products" }}
              items={queryData}
              selectable={true}
              selectedItems={selectedProduct ? selectedProduct : undefined}
              onSelectionChange={handleProductClick}
              renderItem={(item) => {
                const {
                  title,
                  description,
                  featuredImage,
                  id,
                  priceRangeV2,
                } = item;
                const media = (
                  <Thumbnail
                    size="large"
                    alt={title}
                    source={
                      featuredImage?.transformedSrc ||
                      "https://cdn2.iconfinder.com/data/icons/e-commerce-line-4-1/1024/open_box4-512.png"
                    }
                  />
                );

                return (
                  <ResourceItem
                    id={id}
                    media={media}
                    accessibilityLabel={`View details for ${title}`}
                    onClick={() => console.log("click")}
                  >
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                    <p>
                      {description.length > 50
                        ? description.substr(0, 50) + "..."
                        : description}
                    </p>
                    <p>
                      {priceRangeV2.maxVariantPrice.amount}{" "}
                      {priceRangeV2.maxVariantPrice.currencyCode}
                    </p>
                  </ResourceItem>
                );
              }}
            />
          )}
        </Modal.Section>
      </Modal>
      <Modal
        open={modalProduct.active}
        onClose={() => setModalProduct({ active: false, id: undefined })}
        title="Are you sure?"
        primaryAction={{
          content: "Delete Product",
          onAction: () => handleDeleteProduct(modalProduct.id, appData),
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalProduct({ active: false, id: undefined }),
          },
        ]}
      ></Modal>
      <Modal
        open={modalEdit.active}
        title={modalEdit.title}
        onClose={() => setModalEdit((prev) => ({ ...prev, active: false }))}
        primaryAction={{
          content: "Update",
          onAction: () =>
            handleUpdateProducts(
              appData,
              modalEdit.id,
              modalEdit.discount,
              modalEdit.delivery
            ),
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () =>
              setModalEdit((prev) => ({ ...prev, active: false })),
          },
        ]}
      >
        <Modal.Section>
          <Stack vertical alignment="center">
            <Thumbnail
              source={
                modalEdit.image ||
                "https://cdn2.iconfinder.com/data/icons/e-commerce-line-4-1/1024/open_box4-512.png"
              }
              size="large"
              alt={modalEdit.title}
            />
            <Heading>{modalEdit.title}</Heading>
            <p>
              <TextStyle variation="strong">{modalEdit.price}</TextStyle>
            </p>
            <Stack.Item>
              <Stack alignment="leading">
                <TextField
                  label="Discount"
                  value={modalEdit.discount}
                  onChange={(value) =>
                    setModalEdit((prev) => ({ ...prev, discount: value }))
                  }
                  suffix="%"
                />
                <TextField
                  label="Delivery Time"
                  value={modalEdit.delivery}
                  onChange={(value) =>
                    setModalEdit((prev) => ({ ...prev, delivery: value }))
                  }
                  suffix="day(s)"
                />
              </Stack>
            </Stack.Item>
          </Stack>
        </Modal.Section>
      </Modal>
    </Page>
  );
};

export default Product;
