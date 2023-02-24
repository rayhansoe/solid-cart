import type { VoidComponent } from "solid-js";
import { Show } from "solid-js";
import { Outlet, useRouteData } from "solid-start";
import Counter from "~/components/Counter";
import NavBar from "~/components/NavBar";
import { getServerCartItemsData$ } from "~/services/services";

export function routeData() {
	const cartItems = getServerCartItemsData$();

	return cartItems;
}

const App: VoidComponent = () => {
	const cartItems = useRouteData<typeof routeData>();
	return (
		<>
			<Show when={cartItems()}>
				<NavBar cartItems={cartItems()} />
				<Counter />
				<Outlet />
			</Show>
		</>
	);
};
export default App;
