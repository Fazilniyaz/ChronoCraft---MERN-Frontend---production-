import { toast } from "react-toastify";
import { addCartItemRequest, addCartItemSuccess } from "../slices/cartSlice";
import axios from "axios";

export const addCartItem = (id, quantity) => async (dispatch) => {
  try {
    dispatch(addCartItemRequest());
    const { data } = await axios.get(
      `https://api.chronocrafts.xyz/api/v1/product/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch(
      addCartItemSuccess({
        product: data.product._id,
        name: data.product.name,
        image: data.product.images[0].image,
        price: data.product.price,
        stock: data.product.stock,
        quantity,
      })
    );
  } catch (error) {}
};

export const addCartItemInDB =
  (productId, quantity, userId, itemName, overallPrice) => async (dispatch) => {
    console.log("Target Triggered");
    console.log(productId, quantity, userId, itemName, overallPrice);
    try {
      dispatch(addCartItemRequest());

      const { data } = await axios.post(
        `https://api.chronocrafts.xyz/api/v1/createCartItem`,
        {
          itemName,
          userId,
          productId,
          quantity,
          overallPrice,
        },
        {
          withCredentials: true,
        }
      );

      console.log(data);

      dispatch(
        addCartItemSuccess({
          product: data.cartItem._id,
          name: data.cartItem.itemName,
          image: data.cartItem.images[0].image,
          price: data.cartItem.price,
          // price: isCouponAdded ? FinalPriceAfterCoupen : data.cartItem.price,
          stock: data.cartItem.stock,
          // quantity,
          // isCouponAdded,
        })
      );
    } catch (error) {
      console.log("ERRRRRRRRRRRRRRRRRRRRRR", error);
      toast("Error While adding the Item in the cart!");
    }
  };
