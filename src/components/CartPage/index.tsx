import { Show } from "solid-js";
import type { CartItemProps, ProductProps } from "~/types";
import DynamicCart from "./DynamicCart";

export default function CartPage(props: {
	cartItems: CartItemProps[] | undefined;
	products: ProductProps[] | undefined;
}) {
	return (
		<Show when={props.cartItems && props.products} fallback={<h1>Laoding</h1>}>
			{props.cartItems && props.products ? (
				<DynamicCart cartItems={props.cartItems} products={props.products} />
			) : null}
		</Show>
	);
}
