/* eslint-disable solid/reactivity */
import { createComputed, createSignal, Show } from "solid-js";
import { useIsRouting } from "solid-start";
import CartContext from "~/context/CartContext";
import type { CartItemProps } from "~/types";

const CartQuantity = (props: { cartItems: CartItemProps[] }) => {
	const { cartItems } = CartContext;
	const isRouting = useIsRouting();
	const [quantity, setQuantity] = createSignal<number>(
		props.cartItems?.reduce((quantity, item) => item.quantity + quantity, 0)
	);

	createComputed(() => {
		if (Array.isArray(props.cartItems)) {
			setQuantity(props.cartItems?.reduce((quantity, item) => item.quantity + quantity, 0));
		}
	});

	createComputed(() => {
		if (isRouting() && Array.isArray(cartItems)) {
			setQuantity(cartItems?.reduce((quantity, item) => item.quantity + quantity, 0));
		}
	});

	return (
		<Show when={quantity()}>
			<div class='absolute flex justify-center items-center rounded-3xl px-2 bg-red-600 text-white text-xs font-extrabold min-w-[1.5rem] min-h-[1.5rem] -top-1 -right-1 translate-x-1/3 -translate-y-[8%]'>
				{quantity()}
				<span class='animate-ping absolute inline-flex h-full w-full rounded-3xl bg-red-600 opacity-25' />
			</div>
		</Show>
	);
};
export default CartQuantity;
