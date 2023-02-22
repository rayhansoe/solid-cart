import type { Accessor, JSX, Setter } from "solid-js";
import { createSignal } from "solid-js";
import type { ProductProps } from "~/types";
import type { SetStoreFunction } from "solid-js/store";

import { useContext } from "solid-js";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";

type ProductContextType = [
	{
		products: ProductProps[];
		setProducts: SetStoreFunction<ProductProps[]>;
	},
	{
		isLoading: Accessor<boolean>;
		setIsLoading: Setter<boolean>;
	}
];

const ProductContext = createContext<ProductContextType>();

export default function ProductProvider(props: { children: JSX.Element }) {
	const [products, setProducts] = createStore<ProductProps[]>([]);
	const [isLoading, setIsLoading] = createSignal<boolean>(false);
	return (
		<ProductContext.Provider
			value={[
				{ products, setProducts },
				{ isLoading, setIsLoading },
			]}
		>
			{props.children}
		</ProductContext.Provider>
	);
}

export function useProduct() {
	return useContext(ProductContext) as ProductContextType;
}
