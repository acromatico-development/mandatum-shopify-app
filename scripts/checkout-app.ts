import { futureDay, formatMoney } from "./helpers";

type Client = {
  firstName: string;
  lastName: string;
  email: string;
};

export default class MandatumOrder {
  client: Client;
  order: string;
  shopURL: string;
  discount: number;
  price: number;
  shopName: string;
  discountCode: string;
  isCurrentBuyer: boolean;

  constructor(discountCode, discount, price, shopName) {
    this.client = {
      firstName: Shopify.checkout.shipping_address.first_name,
      lastName: Shopify.checkout.shipping_address.last_name,
      email: Shopify.checkout.email,
    };
    this.order = Shopify.checkout.order_id;
    this.shopURL = Shopify.shop;
    this.discount = discount;
    this.price = price;
    this.shopName = shopName;
    this.discountCode = discountCode;
    this.isCurrentBuyer = true;
  }

  async init(): Promise<MandatumOrder> {
    console.log(this.discountCode);
    this.addStyles();
    await this.addMandatumModal();
    return this;
  }

  hashCode = function (s) {
    return s.split("").reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  };

  addStyles(): void {
    const htmlHead: HTMLHeadElement = document.querySelector("head");
    const stylesTag: HTMLStyleElement = document.createElement("style");

    stylesTag.innerHTML = `
      .mandatum-modal .color {
        color: #541fa6;
      }
      
      .mandatum-modal li {
        list-style: disc;
      }
      
      .mandatum-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 100000;
      }
      
      .mandatum-modal.open {
        display: flex;
      }
      
      .mandatum-modal ol,
      .mandatum-modal ul {
        margin: 1rem 2rem;
        padding: 0 1rem;
      }
      
      .mandatum-modal .mandatum-info-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000000;
      }
      
      .mandatum-modal .mandatum-info-modal.open {
        display: flex;
      }
      
      .mandatum-modal .mandatum-info-modal .mandatum-info-box {
        width: 90%;
        max-width: 400px;
        max-height: 90%;
        background-color: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        overflow: hidden;
        padding: 20px 15px;
      }
      
      .mandatum-modal .mandatum-info-modal .mandatum-info-box svg {
        width: 30px;
      }
      
      .mandatum-modal
        .mandatum-info-modal
        .mandatum-info-box
        .mandatum-modal-buttons {
        justify-content: center;
        margin: 10px;
        box-sizing: border-box;
        width: 90%;
      }
      
      .mandatum-modal .mandatum-modal-box {
        width: 90%;
        max-width: 400px;
        max-height: 90%;
        background-color: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-radius: 10px;
        padding-bottom: 1rem;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-modal-head {
        width: 100%;
        height: 80%;
        background-color: #541fa6;
        color: white;
        box-sizing: border-box;
        border-radius: 10px 10px 0 0;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-modal-head svg {
        width: 200px;
        max-width: 100%;
      }
      
      .mandatum-modal-intro {
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        padding: 20px;
        margin: 0;
      }
      
      .mandatum-modal .mandatum-modal-box h3 {
        padding: 20px;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        font-size: 1.2rem;
        font-weight: bold;
      }
      
      .mandatum-modal .mandatum-modal-box p {
        padding: 0;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
      }
      
      .mandatum-modal .mandatum-modal-box h4 {
        padding: 0;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        margin: 10px;
      }
      
      .mandatum-modal .mandatum-modal-box img {
        width: 35%;
        margin-top: 10px;
        margin-bottom: -5px;
      }
      
      .mandatum-modal .selector-wrapper {
        width: 100%;
      }
      
      .mandatum-modal .product-price-mandatum {
        font-weight: bold;
      }
      
      .mandatum-modal .product-price-mandatum span {
        color: #541fa6;
      }
      
      .mandatum-modal .single-option-selector {
        opacity: 1;
        width: 90%;
        padding: 10px 15px;
        display: block;
        border: 1px solid #541fa6;
        margin: 0 auto;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons {
        width: 50%;
        box-sizing: border-box;
        margin: 2rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;
      }
      
      .buttonMandatum {
        width: 10%;
        height: 15%;
        padding: 10px 10px;
        border-radius: 10px;
        cursor: pointer;
        background-color: #ffffff;
        align-items: center;
        color: white;
        border: none;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons button[disabled] {
        background-color: grey;
        cursor: auto;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        margin-top: 10px;
        position: relative;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .info-icon {
        position: absolute;
        right: 10px;
        top: 0px;
        width: 20px;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .info-icon:hover {
        cursor: pointer;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge {
        width: 35%;
        position: relative;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge p {
        width: 100%;
        margin: 0;
        padding: 0;
        position: absolute;
        text-align: center;
        bottom: 17%;
        font-weight: bold;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge svg {
        width: 100%;
      }
      
      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge svg {
        width: 100%;
      }
      
      @media (max-width: 600px) {
        .mandatum-modal .mandatum-modal-box img {
          width: 40%;
          margin: 1rem auto 0;
        }
      
        .mandatum-modal .mandatum-modal-box {
          width: 100%;
          max-width: 100%;
          min-height: 100%;
          background-color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 0px;
          padding: 0 1rem;
        }
      
        .mandatum-button {
          padding: 0;
        }
      
        .mandatum-button h3 {
          display: none;
        }
      }
      .mandatum-card {
        background-color: #4910a0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 30px;
        min-height: 14rem;
      }

      .mandatum-modal-head {
        width: 216px;
        margin: 0 0 0 -19px;
        height: 64px;
      }
      
      .svg-1 {
        margin: 0 auto;
        display: block;
        width: 30px;
        max-width: 10%;
        width: 30px;
      }
      .card {
        margin: 0 0 10px; /* Added */
        float: none; /* Added */
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
      }
      .card-body {
        align-items: center;
        padding-top: 0px;
        padding-bottom: 0px;
        justify-content: center;
        width: 100%;
      }
      .card-text {
        color: #ffffff;
        margin: 0 0 1rem;
        width: 100%;
      }
      
      .card-text gr {
        color: #00ff6c;
        font-weight: bold;
      }
      
      input[type="text"] {
        margin: 0px;
        padding: 0px;
        width: 80%;
        outline: none;
        height: 30px;
        border-radius: 10px;
        text-align: center;
        border: none;
        top: 0;
      }
      
      input[type="text"] .some {
        background-color: #d1d1d1;
      }
      
      .buttonIn {
        width: 300px;
        position: relative;
        background-color: #ffffff;
        border-radius: 10px;
        width: 100%;
      }
      
      button.white {
        color: #4910a0;
        position: absolute;
        font-weight: bold;
        top: 0;
        border-radius: 10px;
        right: 15px;
        z-index: 2;
        border: none;
        top: 0px;
        height: 30px;
        width: 80px;
        cursor: pointer;
        background-color: white;
        transform: translateX(2px);
      }

      button.color {
        color: #4910a0;
        font-weight: bold;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        background-color: white;
        padding: 15px;
      }
      
      ::placeholder {
        /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: #5e6366;
        opacity: 1; /* Firefox */
      }    
    `;

    htmlHead.appendChild(stylesTag);
  }

  async addMandatumModal() {
    const container: HTMLBodyElement = document.querySelector("body");
    let t: HTMLDivElement = document.createElement("div");
    let modal: HTMLDivElement = document.createElement("div");
    t.classList.add("mandatum-card");
    modal.classList.add("mandatum-modal");
    if (this.isCurrentBuyer){
      modal.innerHTML = `
        <div class="mandatum-modal-box">
          <h3>
            Congrats ${this.client.firstName}!!<br>
            You are officially a <span style="color:green">#SaveNature</span> fighter.
          </h3>
          <p>
            Your free Planet Account is open and waiting for you. <br> Go to 
            <a href="https://www.mandatum.co/admin/#/" target="_blank">mandatum.co</a> to get the recognition
            you deserve:
          </p>
          <ul>
            <li> Access your personalized impact dashboard. </li>
            <li> Calculate your carbon footprint. </li>
            <li> Set weekly goals easy to attain. </li>
            <li> Track your "Lifetime Impact" with all your contributions. </li>
            <li> Pay to protect forests and oceans at no cost to you. </li>
          </ul> 
          <p> email: <strong>${this.client.email}</strong></p>
          <p> <br> </p>
          <button class="color" id="mandatum_modal_close">Close</button>
        </div>
      `;
    }else{
      modal.innerHTML = `
        <div class="mandatum-modal-box">
          <h3>
            Congrats ${this.client.firstName}!!<br>
            You are officially a <span style="color:green">#SaveNature</span> fighter.
          </h3>
          <p>
            Your free Planet Account is open and waiting for you. <br> Go to 
            <a href="https://www.mandatum.co/admin/#/" target="_blank">mandatum.co</a> to get the recognition
            you deserve:
          </p>
          <ul>
            <li> Access your personalized impact dashboard. </li>
            <li> Calculate your carbon footprint. </li>
            <li> Set weekly goals easy to attain. </li>
            <li> Track your "Lifetime Impact" with all your contributions. </li>
            <li> Pay to protect forests and oceans at no cost to you. </li>
          </ul> 
          <p> email: <strong>${this.client.email}</strong></p>
          <p> password: <strong>${this.hashCode(this.client.email)}</strong></p>
          <button class="color" id="mandatum_modal_close">Close</button>
        </div>
      `;
    }
    t.innerHTML = `
      <div class="card" style="width: 90%;">
        <div class="mandatum-modal-head">
          <svg id="svg-1" viewBox="0 0 720 216">
            <style type="text/css">
                .st0{fill:#FFFFFF;}
            </style>
            <g id="Layer_1_1_">
            </g>
            <g id="Layer_2">
                <g>
                <g id="Layer_2_1_">
                    <g>
                    <g>
                        <g>
                        <path class="st0" d="M68.3,145.7c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v43
                            C74.8,142.8,71.9,145.7,68.3,145.7z"/>
                        </g>
                    </g>
                    <g>
                        <g>
                        <path class="st0" d="M89.4,145.7c-3.6,0-6.5-2.9-6.5-6.5v-29.8c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v29.7
                            C95.9,142.8,93,145.7,89.4,145.7z"/>
                        </g>
                    </g>
                    <g>
                        <g>
                        <g>
                            <path class="st0" d="M110.5,145.7c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5s6.5,2.9,6.5,6.5v43
                            C117,142.8,114.1,145.7,110.5,145.7z"/>
                        </g>
                        </g>
                    </g>
                    <circle class="st0" cx="110.5" cy="76.8" r="6.5"/>
                    <circle class="st0" cx="89.4" cy="89.7" r="6.5"/>
                    <circle class="st0" cx="68.1" cy="76.8" r="6.5"/>
                    </g>
                </g>
                <g>
                    <g>
                    <path class="st0" d="M164.2,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.5c3.4-4.7,8-9.1,16-9.1c7.6,0,12.9,3.7,15.7,9.3
                        c4.2-5.6,9.8-9.3,17.7-9.3c11.4,0,18.4,7.3,18.4,20.1v28.1c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.4-3.9-12.8-10.7-12.8
                        c-6.6,0-11.2,4.6-11.2,13v24.2c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-24.5c0-8.2-4-12.7-10.7-12.7s-11.2,5-11.2,13v24.2
                        c0,3.4-2.7,6-6.1,6c-3.3,0-6-2.6-6-6V97H164.2z"/>
                    <path class="st0" d="M251.3,128.9v-0.2c0-11.3,8.9-16.9,21.7-16.9c5.9,0,10.1,0.9,14.1,2.2v-1.3c0-7.5-4.6-11.4-13-11.4
                        c-4.6,0-8.4,0.8-11.6,2.1c-0.7,0.2-1.3,0.3-1.9,0.3c-2.8,0-5.1-2.2-5.1-5c0-2.2,1.5-4.1,3.3-4.8c5-1.9,10.1-3.1,16.9-3.1
                        c7.9,0,13.7,2.1,17.4,5.9c3.9,3.8,5.7,9.4,5.7,16.2v25.9c0,3.3-2.6,5.8-5.9,5.8c-3.5,0-5.9-2.4-5.9-5.1v-2
                        c-3.6,4.3-9.1,7.7-17.1,7.7C260.1,145.1,251.3,139.5,251.3,128.9z M287.4,125.1v-3.6c-3.1-1.2-7.2-2.1-11.9-2.1
                        c-7.8,0-12.3,3.3-12.3,8.8v0.2c0,5.1,4.5,8,10.3,8C281.3,136.4,287.4,131.8,287.4,125.1z"/>
                    <path class="st0" d="M309.3,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.6c3.4-4.9,8.3-9.2,16.4-9.2c11.8,0,18.7,8,18.7,20.1v28.1
                        c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.2-4.1-12.8-11.2-12.8c-7,0-11.8,4.9-11.8,13v24.2c0,3.4-2.7,6-6.1,6
                        c-3.3,0-6-2.6-6-6V97z"/>
                    <path class="st0" d="M418.7,138.6c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-3.3c-3.9,5.5-9.4,9.9-17.9,9.9
                        c-12.3,0-24.4-9.9-24.4-27.3v-0.2c0-17.4,11.8-27.3,24.4-27.3c8.7,0,14.1,4.3,17.9,9.3V76.8c0-3.4,2.7-6,6-6
                        c3.4,0,6.1,2.6,6.1,6V138.6z M376.5,117.7v0.2c0,10.2,7,16.8,15.1,16.8s15.2-6.8,15.2-16.8v-0.2c0-10.2-7.2-16.8-15.2-16.8
                        C383.3,100.8,376.5,107.2,376.5,117.7z"/>
                    <path class="st0" d="M426.3,128.9v-0.2c0-11.3,8.9-16.9,21.7-16.9c5.9,0,10.1,0.9,14.1,2.2v-1.3c0-7.5-4.6-11.4-13-11.4
                        c-4.6,0-8.4,0.8-11.6,2.1c-0.7,0.2-1.3,0.3-1.9,0.3c-2.8,0-5.1-2.2-5.1-5c0-2.2,1.5-4.1,3.3-4.8c5-1.9,10.1-3.1,16.9-3.1
                        c7.9,0,13.7,2.1,17.4,5.9c3.9,3.8,5.7,9.4,5.7,16.2v25.9c0,3.3-2.6,5.8-5.9,5.8c-3.5,0-5.9-2.4-5.9-5.1v-2
                        c-3.6,4.3-9.1,7.7-17.1,7.7C435.1,145.1,426.3,139.5,426.3,128.9z M462.4,125.1v-3.6c-3.1-1.2-7.2-2.1-11.9-2.1
                        c-7.8,0-12.3,3.3-12.3,8.8v0.2c0,5.1,4.5,8,10.3,8C456.3,136.4,462.4,131.8,462.4,125.1z"/>
                    <path class="st0" d="M486.2,129.5v-27.7h-2c-2.9,0-5.2-2.3-5.2-5.2c0-2.9,2.3-5.2,5.2-5.2h2v-9c0-3.3,2.7-6,6.1-6
                        c3.3,0,6,2.7,6,6v9h9.5c2.9,0,5.3,2.3,5.3,5.2c0,2.9-2.4,5.2-5.3,5.2h-9.5v25.8c0,4.7,2.4,6.6,6.5,6.6c1.4,0,2.6-0.3,3-0.3
                        c2.7,0,5.1,2.2,5.1,5c0,2.2-1.5,4-3.2,4.7c-2.6,0.9-5.1,1.4-8.3,1.4C492.5,144.9,486.2,141,486.2,129.5z"/>
                    <path class="st0" d="M567.4,138.6c0,3.3-2.7,6-6.1,6c-3.3,0-6.1-2.6-6.1-6v-2.7c-3.4,5-8.3,9.3-16.4,9.3
                        c-11.8,0-18.7-8-18.7-20.2V97c0-3.4,2.7-6.1,6-6.1c3.4,0,6.1,2.7,6.1,6.1v24.4c0,8.2,4.1,12.7,11.2,12.7c7,0,11.8-4.8,11.8-12.9
                        V97c0-3.4,2.7-6.1,6.1-6.1c3.3,0,6.1,2.7,6.1,6.1L567.4,138.6L567.4,138.6z"/>
                    <path class="st0" d="M578.4,97c0-3.4,2.6-6.1,6-6.1s6.1,2.7,6.1,6.1v2.5c3.4-4.7,8-9.1,16-9.1c7.6,0,12.9,3.7,15.7,9.3
                        c4.2-5.6,9.8-9.3,17.7-9.3c11.4,0,18.4,7.3,18.4,20.1v28.1c0,3.4-2.6,6-6,6s-6.1-2.6-6.1-6v-24.4c0-8.4-3.9-12.8-10.7-12.8
                        c-6.6,0-11.2,4.6-11.2,13v24.2c0,3.4-2.7,6-6,6c-3.4,0-6.1-2.6-6.1-6v-24.5c0-8.2-4-12.7-10.6-12.7c-6.7,0-11.2,5-11.2,13v24.2
                        c0,3.4-2.7,6-6.1,6c-3.3,0-6-2.6-6-6L578.4,97L578.4,97z"/>
                    </g>
                </g>
                </g>
            </g>
          </svg>
        </div>
        <div class="card-body">
          <p class="card-text">
            <gr>${this.shopName}</gr> will donate <gr>${formatMoney(this.price * this.discount, Shopify.checkout.currency)}</gr> to protect Nature. Get recognition for the impact you just made. <gr>Redeem</gr> your impact and brag about it!!!
          </p>
          <div class="buttonIn">
            <input type="text" id="fname" name="fname" value="${
              this.client.email
              //this.discountCode
            }">
            <button id="go_to_mandatum" class="white">REDEEM</button>
          </div>
        </div>
      </div>
    `;

    // console.log(Shopify.checkout);
    // console.log(this.discountCode);
    Shopify.Checkout.OrderStatus.addContentBox(t);
    container.appendChild(modal);

    document.getElementById("go_to_mandatum").addEventListener("click", () => {
      const bodyPost = {
        full_name: this.client.firstName,
        email: this.client.email, 
        password: this.hashCode(this.client.email).toString(),
    };
    console.log(bodyPost);

    fetch(`https://mandatum-api.uc.r.appspot.com/ecommerce/v1/buyers`,
    {   
        method: 'POST', 
        credentials: 'same-origin',
        headers: { 
            'Content-Type': 'application/json',
            "x-mandatum-key": '7e516728-d04a-11e8-aabb-02d8633d3428'
        },
        body: JSON.stringify(bodyPost)
    })
    .then((resp) => {
        console.log(resp);
        if (resp == "OK"){
          this.isCurrentBuyer = false;
        }
        fetch(`https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons/${this.discountCode}/apply_buyer`,{
            method : "PATCH",
            headers: {
                "Content-Type": "application/json", 
                "x-mandatum-key": '7e516728-d04a-11e8-aabb-02d8633d3428',
                },
                body: JSON.stringify({
                    buyer_ID: this.client.email
                })
        })
        .then((resp) => {
            return resp.text()
        })
        .then(out => {
            const result = JSON.parse(out);
            console.log(result);
            modal.classList.add("open");
            return result;
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
    });

    document.getElementById("mandatum_modal_close").addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }
}
