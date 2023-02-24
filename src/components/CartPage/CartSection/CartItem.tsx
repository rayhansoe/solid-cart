/* eslint-disable solid/reactivity */
import { debounce } from "@solid-primitives/scheduled";
import { batch, createEffect, createSignal, Show } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import {
	getCartItem,
	getCartItemByProductId,
	getCartItems,
	removeCartItem,
	setCartItemQuantity,
	getProduct,
	updateProductPopularityLite,
} from "~/services/services";
import type { CartItemProps, ProductProps } from "~/types";
import { formatCurrency } from "~/utilities/formatCurrency";
import { prisma } from "~/server/db/client";
import { refetchRouteData } from "solid-start";
import CartContext from "~/context/CartContext";
import { createComputed } from "solid-js";

export default function CartItem(props: {
	cartItem: CartItemProps;
	cartItems: CartItemProps[];
	products: ProductProps[];
}) {
	const [quantity, setQuantity] = createSignal<number>(props?.cartItem.quantity || 0);
	const [stock, setStock] = createSignal<number>(0);
	const { setIsLoading } = CartContext;

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
				return updatedCartItems;
			} catch (error) {
				console.error(error);
			}
		},
		{ invalidate: ["cart"] }
	);

	const [settingCartItem, setCartItem] = createServerAction$(
		async ({ cartId, newQuantity }: { cartId: string; newQuantity: number }) => {
			try {
				// Get Product & Cart Item
				const item = await getCartItem(prisma, cartId);

				// Check Item
				if (!item?.id) {
					throw new Error("Failed to get Cart Item or Cart Item is not Found!");
				}

				const product = await getProduct(prisma, item.productId);

				// Check Product
				if (!product?.id || typeof product?.popularity !== "number") {
					throw new Error("Failed to get Product or Product is not Found!");
				}

				// Update Product Popu
				await updateProductPopularityLite(prisma, product.id, product.popularity);

				if (Number.isNaN(newQuantity)) {
					await setCartItemQuantity(prisma, item.id, item.quantity);
					const updatedCartItems = await getCartItems(prisma);
					return updatedCartItems;
				}

				if (typeof newQuantity !== "number") {
					throw new Error("Invalid New Quantity!");
				}

				if (newQuantity === 0) {
					await removeCartItem(prisma, item.id);
					const updatedCartItems = await getCartItems(prisma);
					return updatedCartItems;
				}

				if (product.stock < newQuantity) {
					await setCartItemQuantity(prisma, item.id, product.stock);
					const updatedCartItems = await getCartItems(prisma);
					return updatedCartItems;
				}

				await setCartItemQuantity(prisma, item.id, newQuantity);
				const updatedCartItems = await getCartItems(prisma);
				return updatedCartItems;
			} catch (error) {
				console.error(error);
			}
		},
		{ invalidate: ["cart"] }
	);

	const update = () => {
		setCartItem({ cartId: props?.cartItem.id, newQuantity: quantity() });
	};

	const debouncedUpdate = debounce(update, 1000);

	const getLengthQuantity = () => quantity().toString().length;

	const inputWidth = () =>
		getLengthQuantity() === 1 ? "32" : getLengthQuantity() === 2 ? "42" : "52";

	createComputed(() => setQuantity(props.cartItem.quantity));

	createComputed(() =>
		setStock(props.products.find((p) => p.id === props.cartItem.productId)?.stock || 0)
	);

	createComputed(() => {
		if (removing.pending || settingCartItem.pending) {
			setIsLoading(true);
		}
	});

	createComputed(() => {
		if (settingCartItem.result) {
			setIsLoading(false);
		}
	});

	createComputed(() => {
		if (removing.result) {
			setIsLoading(false);
		}
	});

	createEffect(() => {
		if (settingCartItem.error || removing.error) {
			console.log("Success || Error on Product Action");
			refetchRouteData(["cart"]);
			refetchRouteData(["product"]);
		}
	});

	return (
		<>
			<li class='flex justify-between gap-2 py-3 w-full sm:gap-4'>
				{/* Product Image */}
				<img
					class='w-2/5 h-28 object-cover rounded sm:h-32'
					loading='lazy'
					src={props.products?.find((product) => product.id === props?.cartItem.productId)?.imgUrl}
					alt={props.products?.find((product) => product.id === props?.cartItem.productId)?.name}
				/>
				<div class='flex flex-col w-3/5 justify-between items-end'>
					{/* top side */}
					<div class='flex w-full h-min justify-between'>
						{/* Left Side */}
						<div class='flex flex-col w-1/2 sm:gap-3 lg:w-2/3'>
							<span class='flex items-center gap-1 font-medium sm:text-xl'>
								{/* Product Name */}
								<p class='truncate'>
									{
										props.products?.find((product) => product.id === props?.cartItem.productId)
											?.name
									}
								</p>
							</span>
							{/* Product Price */}
							<span class='text-sm text-gray-600 sm:text-base'>
								{formatCurrency(
									props.products?.find((product) => product.id === props?.cartItem.productId)
										?.price || 0
								)}
							</span>
						</div>

						{/* Right Side && Total Price / Product */}
						<span class='font-medium h-min sm:text-xl'>
							{formatCurrency(
								(props.products?.find((product) => product.id === props?.cartItem.productId)
									?.price || 0) * quantity()
							)}
						</span>
					</div>

					{/* bottom side */}
					<div class='flex'>
						<Show when={props?.cartItem.quantity}>
							<div class='flex items-center gap-2 mb-2'>
								{/* Remove Button */}
								<button
									title='Remove Cart Item'
									aria-label='Remove Cart Item from Cart'
									disabled={removing.pending || settingCartItem.pending}
									onClick={() => {
										remove(props?.cartItem.productId);
									}}
									class='flex items-center justify-center text-gray-400 hover:text-red-400 group disabled:hover:cursor-not-allowed disabled:hover:text-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
										stroke-width='1.5'
										stroke='currentColor'
										aria-hidden='true'
										class='relative inline-flex w-5 h-5 sm:w-6 sm:h-6'
									>
										<path
											stroke-linecap='round'
											stroke-linejoin='round'
											d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
										/>
									</svg>
									<Show when={removing.pending || settingCartItem.pending ? false : true}>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'
											stroke-width='1.5'
											stroke='currentColor'
											aria-hidden='true'
											class='hidden opacity-60 w-5 h-5 group-hover:absolute group-hover:inline-flex group-hover:animate-ping sm:w-6 sm:h-6'
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
									{/* Decrease Button */}
									<button
										title='Decrease Cart Item'
										aria-label='Decrease Cart Item Quantity'
										disabled={quantity() === 1 || removing.pending || settingCartItem.pending}
										onClick={() => {
											batch(() => {
												setQuantity((q) => q - 1);
												setIsLoading(true);
											});
											debouncedUpdate();
										}}
										onKeyUp={(e) => {
											e.preventDefault();
										}}
										class='flex items-center justify-center rounded-full w-6 h-6 bg-red-300 text-xl font-bold text-white hover:bg-red-400 active:bg-red-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed sm:w-7 sm:h-7'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											fill='currentColor'
											aria-hidden='true'
											class='w-3 h-3 sm:w-5 sm:h-5'
										>
											<path
												fill-rule='evenodd'
												d='M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z'
												clip-rule='evenodd'
											/>
										</svg>
									</button>

									{/* Input Quantity */}
									<input
										disabled={removing.pending || settingCartItem.pending}
										aria-label='Cart Item Quantity'
										class='custom-input-number text-sm text-center flex items-center justify-center disabled:cursor-not-allowed sm:text-lg'
										style={{
											width: `${inputWidth()}px`,
										}}
										value={quantity()}
										onInput={(e) => {
											if (parseInt(e.currentTarget.value) >= stock()) {
												e.currentTarget.value = stock().toString();
											}
											batch(() => {
												setQuantity(parseInt(e.currentTarget.value));
												setIsLoading(true);
											});
											debouncedUpdate();
										}}
										onKeyUp={(e) => {
											e.preventDefault();
										}}
										size={String(props?.cartItem.quantity || 0).length}
										type='number'
										min={1}
										max={stock()}
									/>

									{/* Increase Button */}
									<button
										title='Increase Cart Item'
										aria-label='Increase Cart Item Quantity'
										disabled={
											quantity() ===
												props.products?.find((product) => product.id === props?.cartItem.productId)
													?.stock ||
											removing.pending ||
											settingCartItem.pending
												? true
												: false
										}
										onClick={() => {
											batch(() => {
												setQuantity((q) => q + 1);
												setIsLoading(true);
											});
											debouncedUpdate();
										}}
										onKeyUp={(e) => {
											e.preventDefault();
										}}
										class='flex items-center justify-center rounded-full w-6 h-6 bg-blue-500 text-xl font-bold text-white hover:bg-blue-400 active:bg-blue-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed sm:w-7 sm:h-7'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 24 24'
											aria-hidden='true'
											fill='currentColor'
											class='w-3 h-3 sm:w-5 sm:h-5'
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
						</Show>
					</div>
				</div>
			</li>
		</>
	);
}
