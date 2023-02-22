/* eslint-disable solid/reactivity */
import { batch, createComputed, useContext } from "solid-js";
import type { JSX } from "solid-js";
import { createContext } from "solid-js";
import type { CartItemProps, ProductProps } from "~/types";
import { reconcile } from "solid-js/store";
import CartContext from "./CartContext";
import ProductContext from "./ProductContext";

const AppContext = createContext();

export default function AppProvider(props: {
	children: JSX.Element;
	cartItems: CartItemProps[] | undefined;
	products?: ProductProps[] | undefined;
}) {
	const { setCartItems, setIsLoading } = CartContext;
	const { setProducts } = ProductContext;
	createComputed(() => {
		batch(() => {
			if (Array.isArray(props.cartItems) && props.cartItems && props.cartItems.length >= 0) {
				setIsLoading(false);
				setCartItems(reconcile(props.cartItems));
			}
		});
	});

	createComputed(() => {
		batch(() => {
			if (Array.isArray(props.products) && props.products && props.products.length >= 0) {
				setIsLoading(false);
				setProducts(reconcile(props.products));
			}
		});
	});
	return <AppContext.Provider value={[]}>{props.children}</AppContext.Provider>;
}

export function useApp() {
	return useContext(AppContext);
}
