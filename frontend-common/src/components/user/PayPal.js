import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../cart/CheckoutSteps";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { orderCompleted } from "../../slices/cartSlice";
import { createOrder } from "../../actions/orderActions";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function Paypal() {
  const navigate = useNavigate();
  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  const [cartItemsFromDB, setCartItemsFromDB] = useState([]);
  const [boolean, setBoolean] = useState(false);
  const { user = "" } = useSelector((state) => state.authState);
  const userId = user._id;
  const { shippingInfo } = useSelector((state) => state.cartState);

  const dispatch = useDispatch();

  function generateObjectId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16); // 4 bytes for the timestamp
    const randomBytes = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ) // 8 random bytes
      .join("")
      .slice(0, 16);
    return timestamp + randomBytes;
  }

  const validOrderItemsFromDB = cartItemsFromDB.map((item, i) => {
    return {
      name: item.itemName,
      quantity: item.quantity,
      stock: item.stock,
      image: item.productId.images[0].image,
      price: item.productId.price,
      product: item.productId._id,
    };
  });

  console.log(validOrderItemsFromDB);

  const order = {
    orderItems: validOrderItemsFromDB,
    shippingInfo,
  };

  if (orderInfo) {
    order.itemsPrice = orderInfo?.itemsPrice;
    order.shippingPrice = orderInfo?.shippingPrice;
    order.taxPrice = orderInfo?.taxPrice;
    order.totalPrice = orderInfo?.totalPrice;
  }

  order.paymentInfo = {
    id: generateObjectId(),
    status: "succeeded",
  };

  console.log(order);

  useEffect(() => {
    async function getItemsFromDB() {
      const { data } = await axios.get(
        `https://api.chronocrafts.xyz/api/v1/CartProductsOfSingleUser/${userId}`,
        {
          withCredentials: true,
        }
      );
      setCartItemsFromDB(data.cartItems);
      setBoolean(true);
    }
    getItemsFromDB();
  }, [boolean]);

  const initialOptions = {
    clientId:
      "AYv3poJq2TuQ1mMNx5QcwvFEwJQpEv1PG-jTHMOgi4j176ZsdkRDaGLX4arSoBL88pMQo7srGw9msLxk",
  };

  const styles = {
    shape: "rect",
    layout: "vertical",
  };

  const onCreateOrder = async () => {
    try {
      const response = await fetch(
        "https://api.chronocrafts.xyz/paypal/createorder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      throw error;
    }
  };

  const onApprove = async (data) => {
    try {
      async function paypal() {
        const { data } = await axios.post(
          `https://api.chronocrafts.xyz/api/v1/paymentViaPaypal`,
          {
            amount: order.totalPrice,
            shipping: order.shippingInfo,
          },
          {
            withCredentials: true,
          }
        );
        console.log(data);
      }
      paypal();

      dispatch(orderCompleted());
      dispatch(createOrder(order));

      navigate("/order/success");
      toast("Payment Success!", {
        type: "success",
        position: "bottom-center",
      });
    } catch (err) {
      toast(err, {
        type: "error",
        position: "bottom-center",
      });
    }
    try {
      if (!data?.orderID) throw new Error("Invalid order ID");

      const response = await fetch(
        `https://api.chronocrafts.xyz/paypal/capturepayment/${data.orderID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      window.location.href = "https://api.chronocrafts.xyz/order/success";
    } catch (error) {
      toast(error, {
        type: "error",
        position: "bottom-center",
      });
    }
  };

  const onError = (error) => {
    console.error("PayPal error", error);
    window.location.href = "/";
    window.alert(error);
  };

  // const handlePayment = () => {
  //   // Logic to handle order confirmation

  //   try {
  //     async function paypal() {
  //       const { data } = await axios.post(
  //         `https://api.chronocrafts.xyz/api/v1/paymentViaPaypal`,
  //         {
  //           amount: order.totalPrice,
  //           shipping: order.shippingInfo,
  //         },
  //         {
  //           withCredentials: true,
  //         }
  //       );
  //       console.log(data);
  //     }
  //     paypal();

  //     dispatch(orderCompleted());
  //     dispatch(createOrder(order));

  //     navigate("/order/success");
  //     toast("Payment Success!", {
  //       type: "success",
  //       position: "bottom-center",
  //     });
  //   } catch (err) {
  //     toast(err, {
  //       type: "error",
  //       position: "bottom-center",
  //     });
  //   }

  //   // alert("Your order has been placed successfully!");
  //   // navigate("/order-success"); // Redirect to success page
  // };

  return (
    <Fragment>
      <CheckoutSteps shipping confirmOrder payment />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",

          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            width: "400px",
            textAlign: "center",
          }}
        >
          <h2
            style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}
          >
            Cash On Delivery
          </h2>
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <h4
              style={{
                fontSize: "1.2rem",
                color: "#444",
                marginBottom: "10px",
              }}
            >
              Order Summary
            </h4>
            <p style={{ margin: "5px 0", fontSize: "1rem", color: "#555" }}>
              <b>Items:</b> ${orderInfo?.itemsPrice}
            </p>
            <p style={{ margin: "5px 0", fontSize: "1rem", color: "#555" }}>
              <b>Shipping:</b> ${orderInfo?.shippingPrice}
            </p>
            <p style={{ margin: "5px 0", fontSize: "1rem", color: "#555" }}>
              <b>Tax:</b> ${orderInfo?.taxPrice}
            </p>
            <hr />
            <p
              style={{
                fontSize: "1.2rem",
                color: "#000",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Total: $
              {Number(orderInfo?.itemsPrice) +
                Number(orderInfo?.shippingPrice) +
                Number(orderInfo?.taxPrice)}
            </p>
          </div>
          {/* <button
            onClick={handlePayment}
            style={{
              background: "#ff7e5f",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              fontSize: "1.2rem",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.background = "#feb47b")}
            onMouseOut={(e) => (e.target.style.background = "#ff7e5f")}
          >
            Pay Now
          </button> */}
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={styles}
              createOrder={onCreateOrder}
              onApprove={onApprove}
              onError={onError}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </Fragment>
  );
}

export default Paypal;
