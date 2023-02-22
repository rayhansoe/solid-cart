import { Show } from "solid-js";
import type { CartItemProps, ProductProps } from "~/types";
import CartList from "./CartList";

export default function CartSection(props: {
	cartItems: CartItemProps[];
	products: ProductProps[];
}) {
	return (
		<Show when={props.cartItems.length}>
			<CartList cartItems={props.cartItems} products={props.products} />
		</Show>
	);
}
