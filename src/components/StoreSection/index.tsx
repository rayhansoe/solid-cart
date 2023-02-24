/* eslint-disable @typescript-eslint/no-explicit-any */
import autoAnimate from "@formkit/auto-animate";
import { createEffect, For, Show } from "solid-js";
import type { CartItemProps, ProductProps } from "~/types";
import ProductCard from "./ProductCard";

const StoreSection = (props: {
	cartItems: CartItemProps[] | undefined;
	products: ProductProps[] | undefined;
}) => {
	let animationParent: HTMLUListElement | ((el: HTMLUListElement) => void) | any;

	createEffect(() => {
		animationParent && autoAnimate(animationParent);
	});
	return (
		<>
			<ul ref={animationParent} class='flex items-center justify-center flex-wrap w-full'>
				<Show when={props.products}>
					{props.products ? (
						<For each={props.products}>
							{(product) =>
								props.cartItems ? (
									<ProductCard cartItems={props.cartItems} product={product} />
								) : null
							}
						</For>
					) : null}
				</Show>
			</ul>
		</>
	);
};
export default StoreSection;
