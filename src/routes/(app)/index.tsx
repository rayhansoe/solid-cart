import { Meta, Title, useRouteData } from "solid-start";
import type { VoidComponent } from "solid-js";
import { Show } from "solid-js";

import StoreSection from "~/components/StoreSection";
import AppProvider from "~/context/AppProvider";
import { getServerCartItemsData$, getServerProductsData$ } from "~/services/services";

export function routeData() {
	const products = getServerProductsData$();

	const cartItems = getServerCartItemsData$();

	return { products, cartItems };
}

const App: VoidComponent = () => {
	const { cartItems, products } = useRouteData<typeof routeData>();
	return (
		<>
			<Title>Store Page</Title>
			<Meta name='description' content='My site is even better now we are on Store Page' />
			<Show when={cartItems() && products()}>
				<AppProvider cartItems={cartItems()}>
					<main class='container mx-auto mt-4 flex flex-col gap-2'>
						<div class='flex items-center gap-2'>
							<h1 class='text-3xl font-semibold p-3'>Store</h1>
						</div>
						<StoreSection cartItems={cartItems()} products={products()} />
					</main>
				</AppProvider>
			</Show>
		</>
	);
};

export default App;
