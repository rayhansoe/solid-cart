/* eslint-disable @typescript-eslint/no-explicit-any */

import { createEffect, For, Show } from "solid-js";

import autoAnimate from "@formkit/auto-animate";
import CartItem from "./CartItem";
import type { CartItemProps, ProductProps } from "~/types";

export default function CartList(props: { cartItems: CartItemProps[]; products: ProductProps[] }) {
	let animationParent: HTMLUListElement | ((el: HTMLUListElement) => void) | any;

	createEffect(() => {
		animationParent && autoAnimate(animationParent);
	});

	return (
		<Show when={props.cartItems.length}>
			<ul ref={animationParent} class='parent-island container flex flex-col w-full '>
				<For each={props.cartItems}>
					{(item) => (
						<CartItem cartItems={props.cartItems} products={props.products} cartItem={item} />
					)}
				</For>
			</ul>
		</Show>
	);
}
