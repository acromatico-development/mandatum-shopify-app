import {
  Page,
  Stack,
  Thumbnail,
  Avatar,
  Icon,
  Card,
  DataTable,
  Loading,
  TextContainer,
  Heading,
  Scrollable,
  Subheading,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-apollo";

import { APP_DATA } from "../helpers/queries";
import mandatumAPI from "../helpers/mandatumAPI";

const CommunityImpact = () => {
  const app = useAppBridge();
  const [couponsApplied, setCouponsApplied] = useState({});
  const [rows, setRows] = useState([]);
  const [couponsNonApplied, setCouponsNonApplied] = useState([]);
  const [currency, setCurrecy] = useState("USD");
  const [totalOrders, setTotalOrders] = useState(0);
  const [donations, setDonations] = useState(0);
  const [carbonCredits, setCarbonCredits] = useState(0);
  const [protectedArea, setProtectedArea] = useState(0);
  const [generalLoading, setGeneralLoading] = useState(false);

  const { data: appData, loading: appLoading, error: appError } = useQuery(
    APP_DATA,
    {
      fetchPolicy: "no-cache",
    }
  );

  const formatCurrency = (n, t) => {
    var e = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: t,
    });
    return e.format(n);
  };
  useEffect(
    () => {
      console.log(app);
      if (!appLoading && !appError && appData) {
        const instanceID = appData.shop.url.split("//")[1];
        console.log("STORE_ID", instanceID);

        mandatumAPI
          .getCouponsStoreMANDATUM(instanceID)
          .then((res) => {
            console.log(res);
            const outProducts = res;
            const appliedCoupons = outProducts.filter((e) => {
              return e.store_status_applied === 1;
            });
            const nonAppliedCoupons = outProducts.filter((e) => {
              return e.store_status_applied === 0;
            });

            let tO = 0;
            let d = 0;
            let c = "USD";

            let rowsTMP = [];
            appliedCoupons.forEach((element) => {
              let donation_coupon =
                element.product_price * (element.discount_percentage / 100);
              tO += 1;
              d += element.product_price * (element.discount_percentage / 100);
              c = element.product_currency;
              rowsTMP.push([
                element.product_name,
                element.order_ID,
                element.store_date_applied.split("T")[0],
                donation_coupon,
                (donation_coupon / 10).toFixed(2),
                ((donation_coupon / 10) * 0.25).toFixed(2),
              ]);
            });

            setRows(rowsTMP);
            setCouponsApplied(appliedCoupons);
            setCouponsNonApplied(nonAppliedCoupons);
            setTotalOrders(tO);
            setDonations(d);
            setCarbonCredits(d / 10);
            setProtectedArea((d / 10) * 0.25);
            setCurrecy(c);
          })
          .catch((e) => console.log(e));

        setTimeout(() => {
          setGeneralLoading(false);
        }, 2000);
      }
    },
    appData,
    appLoading,
    appError
  );

  if (generalLoading || appLoading) return <Loading />;

  return (
    <Page title="Community Impact">
      <Stack distribution="equalSpacing">
        <Page>
          <Avatar
            customer={false}
            source="https://mandatum-app-bigcommerce.uc.r.appspot.com/orders.svg"
            alt="orders"
            size="large"
          />
          <TextContainer>
            <Heading element="h4">Total Orders</Heading>
          </TextContainer>
          <p>{totalOrders}</p>
        </Page>
        <Page>
          <Avatar
            source="https://mandatum-app-bigcommerce.uc.r.appspot.com/donations.svg"
            alt="donations"
            size="large"
          />
          <TextContainer>
            <Heading element="h4">Donations</Heading>
          </TextContainer>
          <p>{donations}</p>
        </Page>
        <Page>
          <Avatar
            source="https://mandatum-app-bigcommerce.uc.r.appspot.com/carbon_credits.svg"
            alt="carbon_credits"
            size="large"
          />
          <TextContainer>
            <Heading element="h4">Carbon Credits</Heading>
          </TextContainer>
          <p>{carbonCredits}</p>
        </Page>
        <Page>
          <Avatar
            source="https://mandatum-app-bigcommerce.uc.r.appspot.com/area.svg"
            alt="area"
            size="large"
          />
          <TextContainer element="h4">
            <Heading>Protected Area</Heading>
          </TextContainer>
          <p>{protectedArea}</p>
        </Page>
      </Stack>

      <Scrollable shadow style={{ height: "200px" }} focusable>
        <Card>
          <DataTable
            columnContentTypes={[
              "text",
              "numeric",
              "text",
              "numeric",
              "numeric",
              "numeric",
            ]}
            headings={[
              "Product",
              "Order ID",
              "Date",
              "Donation",
              "Potential CO2 impact",
              "Protected Area",
            ]}
            rows={rows}
          />
        </Card>
      </Scrollable>
    </Page>
  );
};

export default CommunityImpact;
