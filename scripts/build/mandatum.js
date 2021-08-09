var h="02ca7d37990e.ngrok.io";function v(c){var t=new Date;return t.setDate(t.getDate()+c),t.toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"2-digit"})}function i(c,t){var d=new Intl.NumberFormat("en-US",{style:"currency",currency:t});return d.format(c)}var w=class{constructor(t,d,n,a,o,e){this.container=t,this.loading=!0,this.shop=d,this.discount=n,this.days=a,this.productId=o,this.shopifyProduct=e.product,this.currency=e.shop.currencyCode}async init(){return this.addStyles(),this.addMandatumButton(),await this.addMandatumModal(),this.loading=!1,this.loading}async addCartMandate(){let t=`gid://shopify/Product/${this.productId}`;console.log("Shopify Variant",this.shopifyVariant);try{let n=(await fetch(`https://${h}/getDiscountCode?shop=${this.shop}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:t})}).then(l=>l.json())).codeDiscountNode.codeDiscount.codes.edges[0].node.code;console.log("Shopify Product",this.shopifyProduct);let o=[{variantId:this.shopifyProduct.variants.edges.find(l=>l.node.title===this.shopifyVariant.title).node.id,quantity:1,customAttributes:[{key:"Mandatum Discount",value:`${this.discount}%`},{key:"Mandatum Delivery Days",value:`${this.days} days`}],appliedDiscount:{title:n,description:n,value:this.discount,valueType:"PERCENTAGE"}}],e=[{key:"Mandatum Order",value:"true"}],r={price:"10.00",shippingRateHandle:"mandatum-shipping",title:"Mandatum Shipping"};console.log("LineItems: ",o);let m=await fetch(`https://${h}/pay?shop=${this.shop}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lineItems:o,customAttributes:e,shippingLine:r})}).then(l=>l.json());console.log(m);let u=m.draftOrder.invoiceUrl;console.log(u),location.assign(u)}catch(d){console.log(d)}}toggleModal(){this.modalContainer.classList.toggle("open")}addStyles(){let t=document.querySelector("head"),d=document.createElement("style");d.innerHTML=`
      .mandatum-button {
        position: fixed;
        left: 50%;
        bottom: 2rem;
        transform: translate3d(-50%, 0, 0);
        background-color: #541FA6;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 30px;
        color: white;
        padding-right: 15px;
      }

      .mandatum-button:hover {
        cursor: pointer;
      }

      .mandatum-button h3 {
        color: white;
        text-align: center;
        margin: 0;
        font-size: 20px;
      }

      #mandatum_logo {
        width: 50px;
      }

      .mandatum-modal .color {
        color: #541FA6;
      }

      .mandatum-modal li {
        list-style: inherit;
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

      .mandatum-modal ol, .mandatum-modal ul {
        margin: revert;
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
      
      .mandatum-modal .mandatum-info-modal .mandatum-info-box .mandatum-modal-buttons {
        justify-content: center;
        margin: 20px;
        padding: 0;
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
        overflow-y: scroll;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-head {
        width: 100%;
        background-color: #541FA6;
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
      }
      
      .mandatum-modal .mandatum-modal-box .selector-wrapper {
        width: 90%;
        max-width: 500px;
      }
      
      .mandatum-modal .mandatum-modal-box .selector-wrapper label {
        font-size: 1.2rem;
        font-weight: 700;
      }
      
      .mandatum-modal .mandatum-modal-box .selector-wrapper select {
        width: 100%;
        margin-bottom: 1rem;
      }

      .mandatum-modal .mandatum-modal-box p {
        padding: 0;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
      }

      .mandatum-modal .mandatum-modal-box img {
        width: 60%;
        margin: 1rem auto;
      }

      .mandatum-modal .selector-wrapper {
        width: 100%;
      }

      .mandatum-modal .product-price-mandatum {
        font-weight: bold;
      }

      .mandatum-modal .product-price-mandatum span {
        color: #541FA6;
      }

      .mandatum-modal .single-option-selector {
        opacity: 1;
        width: 90%;
        padding: 10px 15px;
        display: block;
        border: 1px solid #541FA6;
        margin: 0 auto;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons {
        width: 100%;
        box-sizing: border-box;
        margin: 2rem 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-modal-buttons button {
        width: 45%;
        padding: 20px 15px;
        border-radius: 10px;
        cursor: pointer;
        background-color: #541FA6;
        color: white;
        border: none;
      }

      .mandatum-modal
        .mandatum-modal-box
        .mandatum-modal-buttons
        button[disabled] {
        background-color: grey;
        cursor: auto;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-badges {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        margin-top: 20px;
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
        bottom: 15%;
        font-weight: bold;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge svg{
        width: 100%;
      }

      .mandatum-modal .mandatum-modal-box .mandatum-badges .svg-badge svg{
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
          justify-content: space-between;
          align-items: center;
          border-radius: 0px;
          overflow-y: scroll;
        }

        .mandatum-button {
          padding: 0;
        }

        .mandatum-button h3 {
          display: none;
        }
      }
    `,t.appendChild(d)}async addMandatumModal(){let t=document.createElement("div"),d=await fetch(`${location.href.split("?")[0]}.json`).then(a=>a.json());t.classList.add("mandatum-modal"),t.innerHTML=`
      <div class="mandatum-modal-box">
        <div class="mandatum-modal-head">
        <svg id="Layer_1" viewBox="0 0 720 216">
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
        <img src="${this.shopifyProduct.images.edges[0].node.src}" alt="${this.shopifyProduct.title}"/>
        <h3>${this.shopifyProduct.title}</h3>
        <select id="product-select-mandatum" name="product-select-mandatum">
          ${this.shopifyProduct.variants.edges.reduce((a,o)=>{let e=`<option value="${o.node.id}">${o.node.title} - ${i(o.node.price,this.currency)}</option>`;return a+e},"")}
        </select>
        <p id="product-price-mandatum" class="product-price-mandatum">
          Price | <s>${i(this.shopifyProduct.variants.edges[0].node.price,this.currency)}</s> <span>${i(this.shopifyProduct.variants.edges[0].node.price*(1-this.discount/100),this.currency)}</span>
        </p>
        <p class="product-price-mandatum">Delivery Date: ${v(this.days)}</p>
        <div class="mandatum-badges">
          <div class="svg-badge">
            <svg viewBox="0 0 510 509">
              <defs>
                <clipPath id="clip0">
                  <rect x="1081" y="592" width="510" height="509" />
                </clipPath>
              </defs>
              <g clip-path="url(#clip0)" transform="translate(-1081 -592)">
                <path
                  d="M1084 846C1084 706.824 1196.82 594 1336 594 1475.18 594 1588 706.824 1588 846 1588 985.176 1475.18 1098 1336 1098 1196.82 1098 1084 985.176 1084 846Z"
                  stroke="#767171"
                  stroke-width="4"
                  stroke-miterlimit="8"
                  fill="#F5F5F5"
                  fill-rule="evenodd"
                />
                <path
                  d="M1103 846C1103 717.318 1207.32 613 1336 613 1464.68 613 1569 717.318 1569 846 1569 974.682 1464.68 1079 1336 1079 1207.32 1079 1103 974.682 1103 846Z"
                  stroke="#767171"
                  stroke-width="4"
                  stroke-miterlimit="8"
                  fill="#F5F5F5"
                  fill-rule="evenodd"
                />
                <path
                  d="M1338.29 771.437C1337.9 771.351 1337.49 771.336 1337.09 771.396 1333.07 770.927 1330.03 767.517 1330.03 763.461 1330.03 761.517 1328.45 759.941 1326.51 759.941 1324.57 759.941 1323 761.517 1323 763.461 1323.01 770.234 1327.53 776.167 1334.05 777.96L1334.05 781.48C1334.05 783.424 1335.62 785 1337.56 785 1339.5 785 1341.07 783.424 1341.07 781.48L1341.07 778.173C1348.6 776.595 1353.71 769.574 1352.92 761.914 1352.13 754.253 1345.69 748.432 1338 748.43 1333.6 748.43 1330.03 744.852 1330.03 740.438 1330.03 736.024 1333.6 732.446 1338 732.446 1342.4 732.446 1345.98 736.024 1345.98 740.438 1345.98 742.382 1347.55 743.958 1349.49 743.958 1351.43 743.958 1353 742.382 1353 740.438 1352.99 733.326 1348.02 727.191 1341.07 725.724L1341.07 722.52C1341.07 720.576 1339.5 719 1337.56 719 1335.62 719 1334.05 720.576 1334.05 722.52L1334.05 725.939C1326.8 727.922 1322.14 734.974 1323.13 742.437 1324.13 749.9 1330.49 755.47 1338 755.469 1342.35 755.469 1345.89 758.956 1345.97 763.309 1346.05 767.663 1342.63 771.279 1338.29 771.437Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
                <path
                  d="M1287 752.5C1287 780.943 1310.06 804 1338.5 804 1366.94 804 1390 780.943 1390 752.5 1390 724.057 1366.94 701 1338.5 701 1310.07 701.031 1287.03 724.071 1287 752.5ZM1338.5 708.103C1363.02 708.103 1382.9 727.98 1382.9 752.5 1382.9 777.02 1363.02 796.897 1338.5 796.897 1313.98 796.897 1294.1 777.02 1294.1 752.5 1294.13 727.992 1313.99 708.131 1338.5 708.103Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
                <path
                  d="M1406.94 812.222 1379.23 825.434C1375.41 818.253 1368.07 813.683 1359.99 813.453L1334.41 812.743C1330.36 812.627 1326.39 811.591 1322.79 809.714L1320.18 808.353C1306.85 801.343 1290.97 801.36 1277.66 808.398L1277.82 802.448C1277.87 800.476 1276.33 798.835 1274.38 798.78L1246.33 798.001C1244.37 797.947 1242.75 799.501 1242.7 801.472L1241 863.588C1240.95 865.559 1242.49 867.201 1244.44 867.255L1272.49 868.034 1272.59 868.034C1274.51 868.034 1276.07 866.495 1276.13 864.562L1276.21 861.59 1283.49 857.653C1286.35 856.1 1289.7 855.73 1292.82 856.622L1336.34 868.947C1336.42 868.97 1336.49 868.987 1336.57 869.005 1339.71 869.669 1342.92 870.002 1346.13 870 1352.94 870.004 1359.66 868.524 1365.85 865.658 1366 865.588 1366.15 865.506 1366.29 865.414L1429.38 824.232C1430.95 823.205 1431.46 821.122 1430.54 819.476 1425.86 811.089 1415.47 807.894 1406.94 812.222ZM1248.17 860.217 1249.67 805.237 1270.65 805.819 1269.15 860.801ZM1362.66 859.282C1354.98 862.782 1346.4 863.748 1338.14 862.045L1294.74 849.752C1289.85 848.359 1284.62 848.936 1280.15 851.361L1276.43 853.374 1277.43 816.818C1289.23 808.898 1304.36 808.085 1316.93 814.692L1319.53 816.053C1324.08 818.424 1329.1 819.731 1334.22 819.881L1359.8 820.59C1366.99 820.799 1373.09 825.962 1374.55 833.066L1336.44 832.005C1334.49 831.951 1332.86 833.506 1332.81 835.475 1332.75 837.447 1334.29 839.088 1336.25 839.142L1378.3 840.31 1378.4 840.31C1380.31 840.309 1381.88 838.77 1381.93 836.838 1381.97 835.287 1381.86 833.734 1381.59 832.207L1410.01 818.655C1410.04 818.643 1410.07 818.63 1410.09 818.616 1414.12 816.557 1419 817.245 1422.31 820.343Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
                <path
                  d="M1342 690.522 1342 657.478C1342 655.557 1340.43 654 1338.5 654 1336.57 654 1335 655.557 1335 657.478L1335 690.522C1335 692.443 1336.57 694 1338.5 694 1340.43 694 1342 692.443 1342 690.522Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
                <path
                  d="M1368 690.462 1368 674.538C1368 672.584 1366.43 671 1364.5 671 1362.57 671 1361 672.584 1361 674.538L1361 690.462C1361 692.416 1362.57 694 1364.5 694 1366.43 694 1368 692.416 1368 690.462Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
                <path
                  d="M1315 690.462 1315 674.538C1315 672.584 1313.43 671 1311.5 671 1309.57 671 1308 672.584 1308 674.538L1308 690.462C1308 692.416 1309.57 694 1311.5 694 1313.43 694 1315 692.416 1315 690.462Z"
                  fill="#767171"
                  fill-rule="evenodd"
                />
              </g>
            </svg>
            <p style="color: #767171" id="discount_circle">Discount:<br/><span>${i(this.shopifyProduct.variants.edges[0].node.price*(this.discount/100),this.currency)}</span></p>
          </div>
          <div class="svg-badge">
            <svg class="svg-badge" viewBox="0 0 509 509">
              <defs>
                <clipPath id="clip1">
                  <rect x="224" y="602" width="509" height="509" />
                </clipPath>
              </defs>
              <g clip-path="url(#clip1)" transform="translate(-224 -602)">
                <path
                  d="M227 856C227 716.824 339.824 604 479 604 618.176 604 731 716.824 731 856 731 995.176 618.176 1108 479 1108 339.824 1108 227 995.176 227 856Z"
                  stroke="#548235"
                  stroke-width="4"
                  stroke-miterlimit="8"
                  fill="#F4F9F1"
                  fill-rule="evenodd"
                />
                <path
                  d="M246 856.5C246 728.094 350.094 624 478.5 624 606.906 624 711 728.094 711 856.5 711 984.906 606.906 1089 478.5 1089 350.094 1089 246 984.906 246 856.5Z"
                  stroke="#4A8522"
                  stroke-width="4"
                  stroke-miterlimit="8"
                  fill="#F4F9F1"
                  fill-rule="evenodd"
                />
                <path
                  d="M583.751 679.174C580.628 669.36 576.395 662.333 576.216 662.038 575.522 660.895 574.093 660.3 572.798 660.597 572.463 660.673 564.47 662.538 555.25 667.139 542.803 673.348 534.108 681.638 530.102 691.108 526.768 698.994 526.289 708.635 528.655 719.286 523.616 713.664 517.948 708.745 511.769 704.604 509.882 700.879 504.893 691.71 497.094 682.127 494.526 678.972 489.584 682.931 492.18 686.118 497.435 692.577 501.39 698.928 503.864 703.292L475.018 697.673 447.611 660.32C450.272 660.357 452.943 660.614 455.6 661.135 464.025 662.783 472.346 667.07 480.338 673.875 483.469 676.543 487.535 671.688 484.445 669.058 475.617 661.541 466.322 656.784 456.816 654.924 442.307 652.087 425.384 655.811 407.873 665.699 394.821 673.069 386.093 681.163 385.729 681.504 384.562 682.594 384.375 684.574 385.353 685.848 386.633 688.471 391.483 697.936 399.557 708.125 404.316 714.133 409.335 719.274 414.527 723.5 413.052 724.735 411.616 726.027 410.227 727.386 402.806 734.639 397.125 743.193 393.395 752.546 390.098 760.81 388.324 769.699 388.225 778.862 388.062 793.845 392.407 808.296 400.793 820.654 408.985 832.725 420.438 841.993 433.912 847.455 437.682 848.98 440.066 843.12 436.293 841.591 431.411 839.612 426.825 837.077 422.595 834.062 423.136 831.064 424.391 820.274 417.218 809.105 416.214 807.543 419.216 801.407 421.008 797.742 422.857 793.965 424.767 790.06 425.659 786.383 426.606 782.477 425.54 779.198 422.578 776.898 420.404 775.209 417.557 774.335 415.049 773.563 413.42 773.062 411.573 772.496 410.913 771.946 409.554 770.808 407.334 766.604 405.551 763.227 403.572 759.482 401.688 755.917 399.764 753.722 404.093 743.449 411.046 734.359 419.754 727.405 427.709 732.819 436.788 736.556 446.438 737.313 435.247 745.976 431.626 757.042 436.801 767.67 442.844 780.081 455.282 778.098 466.256 776.352 468.154 776.048 470.119 775.736 472 775.501 472.706 775.413 472.919 775.605 473.061 775.731 475.464 777.867 475.392 788.066 475.341 795.515 475.271 805.818 475.205 815.55 479.046 820.547 481.006 823.094 483.764 824.397 486.998 824.397 488.936 824.397 491.042 823.93 493.251 822.983 502.802 818.896 512.731 806.596 511.216 796.864 509.893 788.355 509.017 782.734 511.082 778.203 512.991 774.009 517.606 770.126 526.695 765.172 527.784 770.07 528.333 775.165 528.276 780.392 528.082 798.235 520.944 814.935 508.179 827.413 493.912 841.359 473.861 848.246 454.026 846.061 449.985 845.623 449.287 851.907 453.333 852.352 475.044 854.741 496.995 847.2 512.607 831.938 526.583 818.275 534.397 799.995 534.609 780.46 534.892 754.558 521.591 731.61 501.343 718.391 505.527 715.41 508.643 712.833 510.372 711.337 517.754 716.628 524.302 723.148 529.75 730.743 542.828 748.98 548.014 771.211 544.357 793.347 536.803 839.04 493.457 870.078 447.719 862.527 425.565 858.872 406.163 846.817 393.085 828.58 380.006 810.344 374.819 788.11 378.478 765.976 379.135 761.993 372.89 760.948 372.23 764.945 368.294 788.748 373.874 812.657 387.935 832.267 401.999 851.875 422.866 864.84 446.687 868.773 451.67 869.594 456.657 870 461.61 870 480.332 870 498.546 864.191 514.066 853.079 533.695 839.027 546.671 818.181 550.604 794.378 553.487 776.936 551.256 759.437 544.327 743.614 547.525 742.671 552.967 740.842 558.929 737.867 571.374 731.658 580.07 723.368 584.074 713.898 588.082 704.426 587.97 692.418 583.751 679.174ZM399.949 766.181C402.305 770.644 404.534 774.863 406.849 776.799 408.489 778.168 410.772 778.87 413.187 779.612 419.377 781.513 420.096 782.446 419.502 784.892 418.774 787.899 417.016 791.49 415.318 794.962 412.047 801.648 408.959 807.961 411.887 812.522 416.039 818.988 416.75 825.352 416.679 829.311 397.816 812.317 390.136 785.473 397.162 761.076 398.093 762.671 399.072 764.524 399.949 766.181ZM553.165 703.998 544.166 682.205C548.545 678.113 553.626 675.033 557.954 672.864 561.64 671.016 565.147 669.634 567.96 668.655ZM573.798 671.108C575.056 673.808 576.514 677.29 577.76 681.225 579.125 685.544 580.379 690.897 580.628 696.48L559.537 705.175ZM535.935 693.572C536.869 691.365 538.077 689.319 539.471 687.43L549.716 712.235 540.523 734.201C539.231 731.463 537.71 727.866 536.419 723.781 533.829 715.6 531.645 703.717 535.935 693.572ZM556.224 732.142C552.676 733.922 549.291 735.269 546.533 736.241L556.074 713.45 580.359 703.437C580.006 706.156 579.335 708.85 578.241 711.434 573.951 721.579 563.9 728.296 556.224 732.142ZM442.033 730.341C440.914 730.122 439.809 729.854 438.721 729.55L473.77 703.879 502.629 709.499C492.116 717.776 466.531 735.137 442.033 730.341ZM410.001 710.543C402.506 702.471 397.012 693.839 393.857 688.313L430.583 695.468ZM416.487 668.325 431.853 689.267 394.89 682.068C399.543 678.396 407.225 672.884 416.487 668.325ZM441.015 691.052 422.387 665.662C427.963 663.372 433.95 661.57 440.086 660.768L465.857 695.889ZM439.044 697.116 465.31 702.231 431.6 726.92C425.243 723.986 419.522 719.769 414.516 715.081ZM524.975 758.907C513.558 764.985 507.968 769.758 505.316 775.582 502.467 781.835 503.511 788.546 504.956 797.836 505.809 803.313 499.294 813.514 490.757 817.167 487.599 818.518 485.349 818.358 484.068 816.691 481.552 813.419 481.62 803.515 481.674 795.559 481.75 784.55 481.816 775.044 477.27 771.003 475.635 769.55 473.544 768.936 471.221 769.221 469.23 769.469 467.21 769.79 465.258 770.101 453.617 771.955 446.292 772.697 442.497 764.902 436.349 752.276 448.794 742.923 454.431 739.489 455.579 738.79 456.644 737.966 457.633 737.049 471.256 735.422 484.129 729.581 495.6 722.266 509.353 730.477 519.911 743.471 524.975 758.907Z"
                  fill="#548235"
                  fill-rule="evenodd"
                />
              </g>
            </svg>
            <p style="color: #548235" id="donation_circle">Donation:<br/><span>${i(this.shopifyProduct.variants.edges[0].node.price*(this.discount/100),this.currency)}</span></p>
          </div>
          <svg class="info-icon" id="mandate_info" viewBox="0 0 20 20" fill="none">
            <path d="M10.0001 18.3334C14.6025 18.3334 18.3334 14.6024 18.3334 10C18.3334 5.39765 14.6025 1.66669 10.0001 1.66669C5.39771 1.66669 1.66675 5.39765 1.66675 10C1.66675 14.6024 5.39771 18.3334 10.0001 18.3334Z" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 13.3333V10" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 6.66669H10.0083" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="mandatum-modal-buttons">
          <button id="mandate_cancel">Cancel</button>
          <button id="mandate_mandate">Mandate</button>
        </div>
        <div id="mandate_info_box" class="mandatum-info-modal">
          <div class="mandatum-info-box">
            <svg class="info-icon" viewBox="0 0 20 20" fill="none">
              <path d="M10.0001 18.3334C14.6025 18.3334 18.3334 14.6024 18.3334 10C18.3334 5.39765 14.6025 1.66669 10.0001 1.66669C5.39771 1.66669 1.66675 5.39765 1.66675 10C1.66675 14.6024 5.39771 18.3334 10.0001 18.3334Z" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 13.3333V10" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 6.66669H10.0083" stroke="#541FA6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <ol>
              <li>To be delivered by <span class="color">${v(this.days)}</span></li>
              <li>
                Just click and make a <span class="color">mandate</span>
                <ul>
                  <li>We apply a <span class="color">${i(this.shopifyProduct.variants.edges[0].node.price*(this.discount/100),this.currency)} private discount</span> in the checkout process.</li>
                  <li>We <span class="color">donate ${i(this.shopifyProduct.variants.edges[0].node.price*(this.discount/100),this.currency)}</span> to protect forests and oceans at no cost for you.</li>
                </ul>
              </li>
            </ol>
            <div class="mandatum-modal-buttons">
              <button id="mandate_gotit">Got it</button>
            </div>
          </div>
        </div>
      </div>
    `,this.modalContainer=t,this.container.appendChild(t),document.getElementById("mandate_cancel").addEventListener("click",()=>{this.toggleModal()}),document.getElementById("mandate_mandate").addEventListener("click",()=>{this.addCartMandate()}),document.getElementById("mandate_info").addEventListener("click",()=>{document.getElementById("mandate_info_box").classList.add("open")}),document.getElementById("mandate_gotit").addEventListener("click",()=>{document.getElementById("mandate_info_box").classList.remove("open")});let n={...d.product,options:[...d.product.options.map(a=>a.name)],variants:[...d.product.variants.map(a=>{console.log("front: ",a);let o=this.shopifyProduct.variants.edges.find(e=>(console.log("back: ",e),e.node.title===a.title));return console.log("found: ",o),{...a,available:o.node.availableForSale}})]};console.log(n),new Shopify.OptionSelectors("product-select-mandatum",{product:n,onVariantSelected:(a,o)=>{let e=document.getElementById("discount_circle"),r=document.getElementById("donation_circle"),m=e.querySelector("span"),u=r.querySelector("span");console.log(a),console.log(o),o.selectors[0].values[0]==="Default Title"&&o.selectors.forEach(g=>{g.element.style.display="none"});let l=document.querySelector("#product-price-mandatum"),p=document.querySelector("#mandate_mandate");l.innerHTML=`Price | <s>${i(a.price,this.currency)}</s> <span>${i(a.price*(1-this.discount/100),this.currency)}</span>`,m.innerText=`${i(a.price*(this.discount/100),this.currency)}`,u.innerText=`${i(a.price*(this.discount/100),this.currency)}`,this.shopifyVariant=a,a.available?p.disabled=!1:p.disabled=!0}})}addMandatumButton(){let t=document.createElement("div");t.classList.add("mandatum-button"),t.innerHTML=`
      <svg id="mandatum_logo" viewBox="0 0 216 216">
        <style type="text/css">
          .st0{fill:#FFFFFF;}
        </style>
        <g id="Layer_1_1_">
        </g>
        <g id="Layer_2">
          <g>
            <g>
              <g>
                <path class="st0" d="M87,139.9c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v43
                  C93.5,137,90.6,139.9,87,139.9z"/>
              </g>
            </g>
            <g>
              <g>
                <path class="st0" d="M108.1,139.9c-3.6,0-6.5-2.9-6.5-6.5v-29.8c0-3.6,2.9-6.5,6.5-6.5c3.6,0,6.5,2.9,6.5,6.5v29.7
                  C114.6,137,111.7,139.9,108.1,139.9z"/>
              </g>
            </g>
            <g>
              <g>
                <g>
                  <path class="st0" d="M129.2,139.9c-3.6,0-6.5-2.9-6.5-6.5v-43c0-3.6,2.9-6.5,6.5-6.5s6.5,2.9,6.5,6.5v43
                    C135.7,137,132.8,139.9,129.2,139.9z"/>
                </g>
              </g>
            </g>
            <circle class="st0" cx="129.2" cy="71.1" r="6.5"/>
            <circle class="st0" cx="108.1" cy="83.9" r="6.5"/>
            <circle class="st0" cx="86.8" cy="71.1" r="6.5"/>
          </g>
        </g>
      </svg>
      <h3>Save the planet & get a discount at no cost to you</h3>
    `,this.container.appendChild(t),t.addEventListener("click",()=>{this.toggleModal()})}},L=w;var C=class{constructor(t,d,n,a){this.hashCode=function(o){return o.split("").reduce(function(e,r){return e=(e<<5)-e+r.charCodeAt(0),e&e},0)},this.client={firstName:Shopify.checkout.shipping_address.first_name,lastName:Shopify.checkout.shipping_address.last_name,email:Shopify.checkout.email},this.order=Shopify.checkout.order_id,this.shopURL=Shopify.shop,this.discount=d,this.price=n,this.shopName=a,this.discountCode=t,this.isCurrentBuyer=!0}async init(){return console.log(this.discountCode),this.addStyles(),await this.addMandatumModal(),this}addStyles(){let t=document.querySelector("head"),d=document.createElement("style");d.innerHTML=`
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
    `,t.appendChild(d)}async addMandatumModal(){let t=document.querySelector("body"),d=document.createElement("div"),n=document.createElement("div");d.classList.add("mandatum-card"),n.classList.add("mandatum-modal"),this.isCurrentBuyer?n.innerHTML=`
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
      `:n.innerHTML=`
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
      `,d.innerHTML=`
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
            <gr>${this.shopName}</gr> will donate <gr>${i(this.price*this.discount,Shopify.checkout.currency)}</gr> to protect Nature. Get recognition for the impact you just made. <gr>Redeem</gr> your impact and brag about it!!!
          </p>
          <div class="buttonIn">
            <input type="text" id="fname" name="fname" value="${this.client.email}">
            <button id="go_to_mandatum" class="white">REDEEM</button>
          </div>
        </div>
      </div>
    `,Shopify.Checkout.OrderStatus.addContentBox(d),t.appendChild(n),document.getElementById("go_to_mandatum").addEventListener("click",()=>{let a={full_name:this.client.firstName,email:this.client.email,password:this.hashCode(this.client.email).toString()};console.log(a),fetch("https://mandatum-api.uc.r.appspot.com/ecommerce/v1/buyers",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","x-mandatum-key":"7e516728-d04a-11e8-aabb-02d8633d3428"},body:JSON.stringify(a)}).then(o=>{console.log(o),o=="OK"&&(this.isCurrentBuyer=!1),fetch(`https://mandatum-api.uc.r.appspot.com/ecommerce/v1/coupons/${this.discountCode}/apply_buyer`,{method:"PATCH",headers:{"Content-Type":"application/json","x-mandatum-key":"7e516728-d04a-11e8-aabb-02d8633d3428"},body:JSON.stringify({buyer_ID:this.client.email})}).then(e=>e.text()).then(e=>{let r=JSON.parse(e);return console.log(r),n.classList.add("open"),r}).catch(e=>console.log(e))}).catch(o=>console.log(o))}),document.getElementById("mandatum_modal_close").addEventListener("click",()=>{n.classList.remove("open")})}},_=C;async function F(){let c,t,d,n,a,o,e,r,m,u,l,p,g,M,b=location.pathname.includes("products"),x=location.pathname.includes("orders"),z=location.pathname.includes("checkouts"),S=document.querySelector("script[src*='mandatum']"),y=new URLSearchParams(S.src.split("?")[1]).get("shop");if(b&&(console.log("Is Product"),d=document.querySelector("body"),n=await fetch(`${location.href.split("?")[0]}.json`).then(s=>s.json()),a=n.product.id,o=await fetch(`https://${h}/isMandatum?shop=${y}&product=${"gid://shopify/Product/"+a}`).then(s=>s.json()),e=o.isMandatum,r=parseFloat(o.descuento),m=parseInt(o.dias),u=!0),console.log("------------------"),console.log(e),console.log(b),console.log("------------------"),e&&b){let s=o.newProduct;console.log("product",s),c=new L(d,y,r,m,a,s),c.init()}if(x||z){console.log("Is Order");let s=Shopify.checkout.line_items.find(f=>!!f.properties["Mandatum Discount"]),k=s.discount_allocations.find(f=>(M=f.description,f.description.includes("mandatum")));l=!!s,p=parseFloat(s.properties["Mandatum Discount"].split("%")[0])/100,g=parseFloat(s.line_price)}if(console.log("********************"),console.log(x),console.log(l),console.log("********************"),x&&l){console.log("Is mandatum Order",p),console.log(g);let s=await fetch(`https://${h}/checkoutData?shop=${y}`).then(k=>k.json());t=new _(M,p,g,s.name),await t.init()}return{product:c,order:t}}F().then(c=>{window.mandatum=c});
//# sourceMappingURL=mandatum.js.map
