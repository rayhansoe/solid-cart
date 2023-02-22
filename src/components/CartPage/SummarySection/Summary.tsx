/* eslint-disable solid/reactivity */
import { createComputed, createEffect, createSignal, Show } from "solid-js";
import { createServerAction$, redirect } from "solid-start/server";
import { getCartItems, removeCartItems } from "~/services/CartServices";
import { decreaseProductsStock } from "~/services/ProductServices";
import { createTransaction, createTransactionItem } from "~/services/TransactionServices";
import type { CartItemProps, ProductProps } from "~/types";
import { formatCurrency } from "~/utilities/formatCurrency";
import { prisma } from "~/server/db/client";
import { refetchRouteData } from "solid-start";
import CartContext from "~/context/CartContext";

export default function Summary(props: { cartItems: CartItemProps[]; products: ProductProps[] }) {
	const { cartItems, isLoading, setIsLoading } = CartContext;

	const [getSum, setSum] = createSignal<number>(
		props.cartItems?.reduce(
			(totalPrice, cartItem) =>
				cartItem.quantity *
					Number(props.products?.find((item) => item.id === cartItem.productId)?.price || 0) +
				totalPrice,
			0
		)
	);

	const [creating, createNewTransaction] = createServerAction$(async () => {
		try {
			const cartItems = await getCartItems(prisma);

			if (!cartItems.length) {
				throw new Error("there is no item in cart right now.");
			}

			const newTransaction = await createTransaction(prisma);

			if (!newTransaction) {
				throw new Error("failed to proceed this transaction, please try again!");
			}

			const newTransactionItems = await createTransactionItem(prisma, newTransaction.id);

			if (!newTransactionItems) {
				throw new Error("failed to create new transaction Items record, please try again!");
			}

			const products = await decreaseProductsStock(prisma);

			await removeCartItems(prisma);

			const newCartItems = await getCartItems(prisma);

			if (newCartItems.length) {
				throw new Error("failed to create new transaction Items record, please try again!");
			}
			await removeCartItems(prisma);

			// const products = await getProducts(prisma);

			if (!products.length) {
				throw new Error("failed to create new transaction Items record, please try again!");
			}

			return redirect(`/transaction/${newTransaction.id}`);
			// return {
			// 	transaction: newTransaction,
			// 	transactionItems: newTransactionItems,
			// 	cartItems: newCartItems,
			// 	products,
			// };
		} catch (error) {
			console.error(error);
		}
	});

	createComputed(() => {
		setSum(
			props.cartItems?.reduce(
				(totalPrice, cartItem) =>
					cartItem.quantity *
						Number(props.products?.find((item) => item.id === cartItem.productId)?.price || 0) +
					totalPrice,
				0
			)
		);
	});

	createComputed(() => {
		if (creating.pending) {
			setIsLoading(true);
		}
	});

	createEffect(() => {
		if (creating.error) {
			refetchRouteData();
		}
	});

	return (
		<>
			<div class='flex w-full h-min flex-col gap-3 '>
				<Show when={props.cartItems?.length || cartItems?.length}>
					<div class='parent-island flex items-center justify-between text-lg font-semibold'>
						<span class='text-lg'>Total:</span>
						<span>{formatCurrency(getSum())}</span>
					</div>
					<button
						disabled={isLoading() || creating.pending}
						onClick={() => {
							setIsLoading(true);
							createNewTransaction();
						}}
						class='w-full px-2 py-3 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-400 active:bg-blue-300 disabled:cursor-not-allowed disabled:bg-blue-100 disabled:text-gray-500'
					>
						Checkout
					</button>
				</Show>
			</div>
		</>
	);
}
