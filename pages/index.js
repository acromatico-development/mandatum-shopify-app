import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  AppProvider,
  Avatar,
  ActionList,
  Card,
  TextField,
  TextContainer,
  ontextualSaveBar,
  FormLayout,
  Modal,
  Frame,
  Layout,
  Loading,
  Navigation,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Toast,
  TopBar,
  Stack,
  Subheading,
  Button,
  ButtonGroup,
  Heading,
} from "@shopify/polaris";
import {
  AddProductMajor,
  ReportMinor,
  ArrowLeftMinor,
  ConversationMinor,
  HomeMajor,
  OrdersMajor,
} from "@shopify/polaris-icons";
import LoadingPage from "../components/LoadingPage";
import Product from "../components/Product";
import CommunityImpact from "../components/CommunityImpact";
import { Redirect } from "@shopify/app-bridge/actions";

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
import { useAppBridge } from "@shopify/app-bridge-react";
import { useLazyQuery, useMutation, useQuery } from "react-apollo";

export default function FrameExample() {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // console.log("https://mandatum-app.uc.r.appspot.com");

    const head = document.querySelector("body");
    const script = document.createElement("script");
    script.setAttribute(
      "src",
      "https://assets.calendly.com/assets/external/widget.js"
    );
    head.appendChild(script);

    // setUrl("https://calendly.com/mandatum-ceo/protect-nature-improve-profitability-at-no-extra-cost");

    // setTimeout(() => {}, 3000);
  }, []);

  const handleSubscribe = useCallback(async () => {
    const installData = await appInstall({
      variables: {
        return: `${app.localOrigin}?shop=${appData.shop.url.split("//")[1]}`,
      },
    });

    const urlRedir = installData.data.appSubscriptionCreate.confirmationUrl;

    redirect.dispatch(Redirect.Action.REMOTE, urlRedir);
  }, [appData, app, redirect]);

  const [appInstall] = useMutation(APP_INSTALL, {
    fetchPolicy: "no-cache",
  });

  const defaultState = useRef({
    emailFieldValue: "dharma@jadedpixel.com",
    nameFieldValue: "Jaded Pixel",
  });
  const skipToContentRef = useRef(null);

  const [toastActive, setToastActive] = useState(false);
  const [productsActive, setProductsActive] = useState(false);
  const [communityActive, setCommunityActive] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userMenuActive, setUserMenuActive] = useState(false);
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [modalActiveWelcome, setModalActiveWelcome] = useState(false);
  const [nameFieldValue, setNameFieldValue] = useState(
    defaultState.current.nameFieldValue
  );
  const [emailFieldValue, setEmailFieldValue] = useState(
    defaultState.current.emailFieldValue
  );
  const [storeName, setStoreName] = useState(
    defaultState.current.nameFieldValue
  );
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");

  const { data: appData, loading: appLoading, error: appError } = useQuery(
    APP_DATA,
    {
      fetchPolicy: "no-cache",
    }
  );

  const handleSubjectChange = useCallback(
    (value) => setSupportSubject(value),
    []
  );
  const handleMessageChange = useCallback(
    (value) => setSupportMessage(value),
    []
  );
  const handleDiscard = useCallback(() => {
    setEmailFieldValue(defaultState.current.emailFieldValue);
    setNameFieldValue(defaultState.current.nameFieldValue);
    setIsDirty(false);
  }, []);
  const handleSave = useCallback(() => {
    defaultState.current.nameFieldValue = nameFieldValue;
    defaultState.current.emailFieldValue = emailFieldValue;

    setIsDirty(false);
    setToastActive(true);
    setStoreName(defaultState.current.nameFieldValue);
  }, [emailFieldValue, nameFieldValue]);
  const handleNameFieldChange = useCallback((value) => {
    setNameFieldValue(value);
    value && setIsDirty(true);
  }, []);
  const handleEmailFieldChange = useCallback((value) => {
    setEmailFieldValue(value);
    value && setIsDirty(true);
  }, []);
  const handleSearchResultsDismiss = useCallback(() => {
    setSearchActive(false);
    setSearchValue("");
  }, []);
  const handleSearchFieldChange = useCallback((value) => {
    setSearchValue(value);
    setSearchActive(value.length > 0);
  }, []);
  const toggleToastActive = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    []
  );
  const toggleUserMenuActive = useCallback(
    () => setUserMenuActive((userMenuActive) => !userMenuActive),
    []
  );
  const toggleMobileNavigationActive = useCallback(
    () =>
      setMobileNavigationActive(
        (mobileNavigationActive) => !mobileNavigationActive
      ),
    []
  );

  const toggleIsProducts = useCallback(() => {
    setProductsActive(true);
    setCommunityActive(false);
  }, []);

  const toggleIsCommunity = useCallback(() => {
    setCommunityActive(true);
    setProductsActive(false);
  }, []);

  const toggleModalActive = useCallback(
    () => setModalActive((modalActive) => !modalActive),
    []
  );

  const toggleModalActiveWelcome = useCallback(
    () => setModalActiveWelcome((modalActiveWelcome) => !modalActiveWelcome),
    []
  );

  const toastMarkup = toastActive ? (
    <Toast onDismiss={toggleToastActive} content="Changes saved" />
  ) : null;

  const userMenuActions = [
    {
      items: [{ content: "Community forums" }],
    },
  ];

  const contextualSaveBarMarkup = isDirty ? (
    <ContextualSaveBar
      message="Unsaved changes"
      saveAction={{
        onAction: handleSave,
      }}
      discardAction={{
        onAction: handleDiscard,
      }}
    />
  ) : null;

  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={userMenuActions}
      name="Dharma"
      detail={storeName}
      initials="D"
      open={userMenuActive}
      onToggle={toggleUserMenuActive}
    />
  );

  const searchResultsMarkup = (
    <ActionList
      items={[
        { content: "Shopify help center" },
        { content: "Community forums" },
      ]}
    />
  );

  const searchFieldMarkup = (
    <TopBar.SearchField
      onChange={handleSearchFieldChange}
      value={searchValue}
      placeholder="Search"
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      //userMenu={userMenuMarkup}
      //searchResultsVisible={searchActive}
      //searchField={searchFieldMarkup}
      //searchResults={searchResultsMarkup}
      //onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={toggleMobileNavigationActive}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      {/*<Navigation.Section
        items={[
          {
            label: 'Back to Shopify',
            icon: ArrowLeftMinor,
          },
        ]}
      />*/}
      <Navigation.Section
        // separator
        items={[
          {
            label: "Products",
            icon: AddProductMajor,
            onClick: toggleIsProducts,
          },
          {
            label: "Community Impact",
            icon: ReportMinor,
            accessibilityLabel: "Contact support",
            onClick: toggleIsCommunity,
          },
        ]}
      />
      <Navigation.Section
        title="Support"
        items={[{}]}
        action={{
          icon: ConversationMinor,
          accessibilityLabel: "Contact support",
          onClick: toggleModalActive,
        }}
        separator
      />
    </Navigation>
  );

  // const loadingMarkup = isLoading ? <Loading /> : null;

  const skipToContentTarget = (
    <a id="SkipToContentTarget" ref={skipToContentRef} tabIndex={-1} />
  );

  const loadingPageMarkup = (
    <Card title="Online store dashboard" sectioned>
      <p>View a summary of your online store’s performance.</p>
    </Card>
  );

  const pageMarkup = communityActive ? <CommunityImpact /> : <Product />;

  const modalMarkup = (
    <Modal
      open={modalActive}
      onClose={toggleModalActive}
      // title="Contact support"
      src="https://calendly.com/mandatum-ceo/protect-nature-improve-profitability-at-no-extra-cost"
      // noScroll={false}
      // small={true}
      // limitHeight={true}
      /*
      primaryAction={{
        content: 'Close',
        onAction: toggleModalActive,
      }}
      */
    >
      {/*<Modal.Section>
        <FormLayout>
          <TextField
            label="Subject"
            value={supportSubject}
            onChange={handleSubjectChange}
          />
          <TextField
            label="Message"
            value={supportMessage}
            onChange={handleMessageChange}
            multiline
          />
        </FormLayout>
      </Modal.Section>*/}
    </Modal>
  );

  const theme = {
    logo: {
      width: 124,
      topBarSource: "https://www.mandatum.co/img/logomandatum.png",
      contextualSaveBarSource: "https://www.mandatum.co/img/logomandatum.png",
      url: "http://jadedpixel.com",
      accessibilityLabel: "Jaded Pixel",
      colorScheme: "light",
    },
  };

  if (appError) {
    return (
      <Page>
        <Heading>Error</Heading>
      </Page>
    );
  }

  if (appLoading) return <LoadingPage />;

  if (appData?.app?.installation?.activeSubscriptions.length === 0) {
    const description = `
                        Great for niche and independent brands who want to promote sustainability and climate action, 
                        while gaining flexibility in their shipping. \n
                        Attract new customers by offering nature-positive donations, 
                        paid for by the savings in supply chain costs. 
                        Reach new consumer segments, by letting your cost savings fund product discounts – 
                        most shoppers can’t resist a bargain!
                        `;
    return (
      <Page title="Welcome to Mandatum">
        <Card>
          <Card.Section>
            <Stack spacing="loose" vertical>
              <p>
                Great for niche and independent brands who want to promote
                sustainability and climate action, while gaining flexibility in
                their shipping.
              </p>
              <p>
                Attract new customers by offering nature-positive donations,
                paid for by the savings in supply chain costs. Reach new
                consumer segments, by letting your cost savings fund product
                discounts – most shoppers can’t resist a bargain!
              </p>
              <Stack distribution="trailing">
                <ButtonGroup>
                  <Button primary onClick={handleSubscribe}>
                    Subscribe
                  </Button>
                  <Button onClick={toggleModalActiveWelcome} plain>
                    Learn more
                  </Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          </Card.Section>
        </Card>

        <Modal
          open={modalActiveWelcome}
          onClose={toggleModalActiveWelcome}
          src="https://calendly.com/mandatum-ceo/protect-nature-improve-profitability-at-no-extra-cost"
        ></Modal>
      </Page>
    );
  }

  return (
    <div style={{ height: "500px" }}>
      <AppProvider
        theme={theme}
        i18n={{
          Polaris: {
            Avatar: {
              label: "Avatar",
              labelWithInitials: "Avatar with initials {initials}",
            },
            ContextualSaveBar: {
              save: "Save",
              discard: "Discard",
            },
            TextField: {
              characterCount: "{count} characters",
            },
            TopBar: {
              toggleMenuLabel: "Toggle menu",

              SearchField: {
                clearButtonLabel: "Clear",
                search: "Search",
              },
            },
            Modal: {
              iFrameTitle: "body markup",
            },
            Frame: {
              skipToContent: "Skip to content",
              navigationLabel: "Navigation",
              Navigation: {
                closeMobileNavigationLabel: "Close navigation",
              },
            },
          },
        }}
      >
        <Frame
          topBar={topBarMarkup}
          navigation={navigationMarkup}
          showMobileNavigation={mobileNavigationActive}
          onNavigationDismiss={toggleMobileNavigationActive}
          skipToContentTarget={skipToContentRef.current}
        >
          {contextualSaveBarMarkup}
          {/*loadingMarkup*/}
          {pageMarkup}
          {toastMarkup}
          {modalMarkup}
        </Frame>
      </AppProvider>
    </div>
  );
}
