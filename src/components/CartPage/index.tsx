import type { CartItemProps, ProductProps } from "~/types";
import DynamicCart from "./DynamicCart";

export default function CartPage(props: { cartItems: CartItemProps[]; products: ProductProps[] }) {
	return <DynamicCart cartItems={props.cartItems} products={props.products} />;
}
