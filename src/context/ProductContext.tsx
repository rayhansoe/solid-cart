/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoot } from "solid-js";
import { createStore } from "solid-js/store";
import type { ProductProps } from "~/types";

function createProductContext() {
	const [products, setProducts] = createStore<ProductProps[]>([]);

	return {
		products,
		setProducts,
	};
}
export default createRoot(createProductContext);
