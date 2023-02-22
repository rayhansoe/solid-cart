import type { Accessor, JSX, Setter } from "solid-js";
import { createSignal } from "solid-js";
import type { CartItemProps } from "~/types";
import type { SetStoreFunction } from "solid-js/store";

import { useContext } from "solid-js";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";

type CartContextType = [
	{
		cartItems: CartItemProps[];
		setCartItems: SetStoreFunction<CartItemProps[]>;
	},
	{
		isLoading: Accessor<boolean>;
		setIsLoading: Setter<boolean>;
	}
];

const CartContext = createContext<CartContextType>();

export default function CartProvider(props: { children: JSX.Element }) {
	const [cartItems, setCartItems] = createStore<CartItemProps[]>([]);
	const [isLoading, setIsLoading] = createSignal<boolean>(false);
	return (
		<CartContext.Provider
			value={[
				{ cartItems, setCartItems },
				{ isLoading, setIsLoading },
			]}
		>
			{props.children}
		</CartContext.Provider>
	);
}

export function useCartItem() {
	return useContext(CartContext) as CartContextType;
}
