/* eslint-disable @typescript-eslint/no-explicit-any */
import autoAnimate from "@formkit/auto-animate";
import type { VoidComponent } from "solid-js";
import { createEffect } from "solid-js";
import { Show } from "solid-js";
import { Outlet, useRouteData } from "solid-start";
import NavBar from "~/components/NavBar";
import { getServerCartItemsData$ } from "~/services/services";

export function routeData() {
	const cartItems = getServerCartItemsData$();

	return cartItems;
}

const App: VoidComponent = () => {
	const cartItems = useRouteData<typeof routeData>();
	let animationParent: HTMLDivElement | ((el: HTMLDivElement) => void) | any;

	createEffect(() => {
		animationParent && autoAnimate(animationParent);
	});
	return (
		<>
			<Show when={cartItems()}>
				<div ref={animationParent}>
					<NavBar cartItems={cartItems()} />
					<Outlet />
				</div>
			</Show>
		</>
	);
};
export default App;
