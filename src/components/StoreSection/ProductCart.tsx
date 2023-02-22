/* eslint-disable solid/reactivity */
import { debounce } from "@solid-primitives/scheduled";
import { batch, createComputed, createEffect, createSignal, Match, Show, Switch } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import {
	createCartItem,
	getCartItemByProductId,
	getCartItems,
	increaseCartItem,
	removeCartItem,
	setCartItemQuantity,
} from "~/services/CartServices";
import {
	getProduct,
	getProducts,
	reStockProduct,
	updateProductPopularityLite,
} from "~/services/ProductServices";
import type { CartItemProps } from "~/types";
import { prisma } from "~/server/db/client";
import { refetchRouteData } from "solid-start";
import CartContext from "~/context/CartContext";

type ProductCartProps = {
	id: string;
	stock: number;
	cartItems: CartItemProps[];
};

export default function ProductCart(props: ProductCartProps) {
	const getCartItemQuantityByProductIdServer = () =>
		props.cartItems?.find((item) => item.productId === props.id)?.quantity || 0;

	const update = () => {
		setCartItem({ productId: props.id, newQuantity: quantity() });
	};

	const debouncedUpdate = debounce(update, 1000);

	const getLengthQuantity = () => quantity().toString().length;

	const inputWidth = () =>
		getLengthQuantity() === 1 ? "32" : getLengthQuantity() === 2 ? "42" : "52";

	const { setIsLoading } = CartContext;
	const [quantity, setQuantity] = createSignal<number>(getCartItemQuantityByProductIdServer());

	const [increasing, increase] = createServerAction$(
		async (productId: string) => {
			try {
				// Get Product & Cart Item
				const product = await getProduct(prisma, productId);
				const item = await getCartItemByProductId(prisma, productId);

				// Check Product
				if (!product?.id || typeof product?.popularity !== "number") {
					throw new Error("Failed to get Product or Product is not Found!");
				}

				// Update Product Popu
				await updateProductPopularityLite(prisma, product.id, product.popularity);

				// Check Stock
				if (product.stock === 0) {
					throw new Error("Product out of stock!");
				}

				// Check Item
				if (!item?.id) {
					await createCartItem(prisma, product.id);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				// Check if Item quantity is equal with product stock
				if (product.stock === item.quantity) {
					await setCartItemQuantity(prisma, item.id, product.stock);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				// increase item
				await increaseCartItem(prisma, item.id);
				const updatedCartItems = await getCartItems(prisma);
				// return updatedCartItems;
				return;
			} catch (error) {
				console.error(error);
			}
		},
		{ invalidate: ["cart"] }
	);

	const [removing, remove] = createServerAction$(
		async (productId: string) => {
			try {
				// Get Product & Cart Item
				const product = await getProduct(prisma, productId);
				const item = await getCartItemByProductId(prisma, productId);

				// Check Product
				if (!product?.id || typeof product?.popularity !== "number") {
					throw new Error("Failed to get Product or Product is not Found!");
				}

				// Check Item
				if (!item?.id) {
					throw new Error("Failed to get Item or Item is not Found!");
				}

				// Update Product Popu
				await updateProductPopularityLite(prisma, product.id, product.popularity);

				await removeCartItem(prisma, item.id);
				const updatedCartItems = await getCartItems(prisma);
				// return updatedCartItems;
				return;
			} catch (error) {
				console.error(error);
			}
		},
		{ invalidate: ["cart"] }
	);

	const [settingCartItem, setCartItem] = createServerAction$(
		async ({ productId, newQuantity }: { productId: string; newQuantity: number }) => {
			try {
				// Get Product & Cart Item
				const product = await getProduct(prisma, productId);
				const item = await getCartItemByProductId(prisma, productId);

				// Check Product
				if (!product?.id || typeof product?.popularity !== "number") {
					throw new Error("Failed to get Product or Product is not Found!");
				}

				// Check Item
				if (!item?.id) {
					await createCartItem(prisma, product.id);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				// Update Product Popu
				await updateProductPopularityLite(prisma, product.id, product.popularity);

				if (Number.isNaN(newQuantity)) {
					await setCartItemQuantity(prisma, item.id, item.quantity);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				if (typeof newQuantity !== "number") {
					throw new Error("Invalid New Quantity!");
				}

				if (newQuantity === 0) {
					await removeCartItem(prisma, item.id);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				if (product.stock < newQuantity) {
					await setCartItemQuantity(prisma, item.id, product.stock);
					const updatedCartItems = await getCartItems(prisma);
					// return updatedCartItems;
					return;
				}

				await setCartItemQuantity(prisma, item.id, newQuantity);
				const updatedCartItems = await getCartItems(prisma);
				// return updatedCartItems;
				return;
			} catch (error) {
				console.error(error);
			}
		},
		{ invalidate: ["cart"] }
	);

	const [restocking, restock] = createServerAction$(
		async (productId: string) => {
			try {
				const updatedProductStock = await reStockProduct(prisma, productId);

				if (!updatedProductStock) {
					throw new Error("Failed to re-stock Product.");
				}

				const updatedProducts = await getProducts(prisma);

				if (!updatedProducts) {
					throw new Error("Failed to get updated Products.");
				}

				// return updatedProducts;
				return;
			} catch (error) {
				console.log(error);
			}
		},
		{ invalidate: ["product"] }
	);

	createComputed(() => setQuantity(getCartItemQuantityByProductIdServer()));

	createComputed(() => {
		if (
			!increasing.pending ||
			!removing.pending ||
			!settingCartItem.pending ||
			!restocking.pending
		) {
			setIsLoading(false);
		}
	});

	createComputed(() => {
		if (increasing.pending || removing.pending || settingCartItem.pending || restocking.pending) {
			setIsLoading(true);
		}
	});

	createEffect(() => {
		if (restocking.error || settingCartItem.error || increasing.error || removing.error) {
			console.log("Error on Product Action");
			refetchRouteData(["cart"]);
			refetchRouteData(["product"]);
		}
	});

	return (
		<>
			<Switch>
				<Match when={!props.stock}>
					<button
						disabled={restocking.pending ? true : false}
						onClick={() => restock(props.id)}
						class='flex items-center justify-center rounded-md h-10 shadow font-semibold bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-300 py-2 px-3 disabled:bg-blue-100 disabled:text-gray-500 disabled:cursor-not-allowed'
					>
						+Restock
					</button>
				</Match>
				<Match when={props.cartItems.find((i) => i.productId === props.id)?.id}>
					<div class='flex items-center gap-2 h-10'>
						<button
							title='Remove Cart Item'
							aria-label='Remove Cart Item from Cart'
							disabled={
								increasing.pending || removing.pending || settingCartItem.pending ? true : false
							}
							onClick={() => {
								remove(props.id);
							}}
							class='flex items-center justify-center text-gray-400 hover:text-red-400 group disabled:hover:cursor-not-allowed disabled:text-gray-400 disabled:hover:text-gray-400 disabled:cursor-not-allowed'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								stroke-width='1.5'
								stroke='currentColor'
								aria-hidden='true'
								class='relative inline-flex w-6 h-6'
							>
								<path
									stroke-linecap='round'
									stroke-linejoin='round'
									d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
								/>
							</svg>
							<Show
								when={
									increasing.pending || removing.pending || settingCartItem.pending ? false : true
								}
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									stroke-width='1.5'
									stroke='currentColor'
									aria-hidden='true'
									class='hidden opacity-60 w-6 h-6 group-hover:absolute group-hover:inline-flex group-hover:animate-ping'
								>
									<path
										stroke-linecap='round'
										stroke-linejoin='round'
										d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
									/>
								</svg>
							</Show>
						</button>
						<span class='h-5 w-[1px] bg-gray-300' />
						<div class='flex items-center gap-2'>
							<button
								title='Decrease Cart Item'
								aria-label='Decrease Cart Item Quantity'
								disabled={
									quantity() === 1 ||
									increasing.pending ||
									removing.pending ||
									settingCartItem.pending
										? true
										: false
								}
								onClick={() => {
									setQuantity((prev) => prev - 1);
									debouncedUpdate();
								}}
								onKeyUp={(e) => {
									e.preventDefault();
								}}
								class='flex items-center justify-center rounded-full w-7 h-7 bg-red-300 text-xl font-bold text-white hover:bg-red-400 active:bg-red-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
									class='w-5 h-5'
									aria-hidden='true'
								>
									<path
										fill-rule='evenodd'
										d='M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z'
										clip-rule='evenodd'
									/>
								</svg>
							</button>

							<input
								class={`custom-input-number text-center flex items-center justify-center disabled:cursor-not-allowed`}
								aria-label='Cart Item Quantity'
								value={quantity()}
								disabled={
									increasing.pending || removing.pending || settingCartItem.pending ? true : false
								}
								style={{
									width: `${inputWidth()}px`,
								}}
								onInput={(e) => {
									if (parseInt(e.currentTarget.value) >= props.stock) {
										e.currentTarget.value = props.stock.toString();
									}
									batch(() => {
										setQuantity(parseInt(e.currentTarget.value));
									});
									debouncedUpdate();
								}}
								onKeyUp={(e) => {
									e.preventDefault();
								}}
								size={String(quantity()).length}
								type='number'
								min={1}
								max={props.stock}
							/>

							<button
								title='Increase Cart Item'
								aria-label='Increase Cart Item Quantity'
								disabled={
									increasing.pending ||
									removing.pending ||
									quantity() === props.stock ||
									settingCartItem.pending
										? true
										: false
								}
								onClick={() => {
									setQuantity((prev) => prev + 1);
									debouncedUpdate();
								}}
								onKeyUp={(e) => {
									e.preventDefault();
								}}
								class='flex items-center justify-center rounded-full w-7 h-7 bg-blue-500 text-xl font-bold text-white hover:bg-blue-400 active:bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 24 24'
									fill='currentColor'
									aria-hidden='true'
									class='w-5 h-5'
								>
									<path
										fill-rule='evenodd'
										d='M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z'
										clip-rule='evenodd'
									/>
								</svg>
							</button>
						</div>
					</div>
				</Match>
				<Match when={!props.cartItems.find((i) => i.productId === props.id)?.id}>
					<button
						disabled={
							increasing.pending || removing.pending || settingCartItem.pending ? true : false
						}
						onClick={() => {
							increase(props.id);
						}}
						class='flex items-center justify-center rounded-md h-10 shadow font-semibold bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-300 py-2 px-3 disabled:bg-blue-100 disabled:text-gray-500 disabled:cursor-not-allowed'
					>
						+Add to Cart
					</button>
				</Match>
			</Switch>
		</>
	);
}
