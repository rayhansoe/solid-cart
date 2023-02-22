import { createRoot, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { CartItemProps } from "~/types";

function createCartContext() {
	const [cartItems, setCartItems] = createStore<CartItemProps[]>([]);
	const [isLoading, setIsLoading] = createSignal<boolean>(false);

	return {
		cartItems,
		setCartItems,
		isLoading,
		setIsLoading,
	};
}
export default createRoot(createCartContext);
