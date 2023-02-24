import { Show } from "solid-js";
import { Meta, Title, useRouteData } from "solid-start";

import CartPage from "~/components/CartPage";
import AppProvider from "~/context/AppProvider";
import { getServerCartItemsData$, getServerProductsData$ } from "~/services/services";

export function routeData() {
	const products = getServerProductsData$();

	const cartItems = getServerCartItemsData$();

	return { products, cartItems };
}

function cart() {
	const { cartItems, products } = useRouteData<typeof routeData>();
	return (
		<>
			<Title>Cart Page</Title>
			<Meta name='description' content='My site is even better now we are on Cart Page' />
			<Show when={cartItems() && products()}>
				<AppProvider cartItems={cartItems()}>
					<main class='container h-full mx-auto mt-4 flex flex-col px-4 gap-2 sm:max-w-[640px] md:max-w-3xl lg:max-w-5xl xl:max-w-7xl'>
						<div class='flex items-center gap-2'>
							<h1 class='text-2xl font-semibold lg:text-3xl'>Cart</h1>
						</div>
						<CartPage cartItems={cartItems()} products={products()} />
					</main>
				</AppProvider>
			</Show>
		</>
	);
}
export default cart;
