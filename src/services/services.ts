import { createServerData$ } from "solid-start/server";
import { prisma } from "~/server/db/client";
import type { RouteDataArgs } from "solid-start";
import type { prismaType } from "~/types";

type Params = RouteDataArgs["params"];

// get CartItems with Server Data Server Function
export const getServerCartItemsData$ = () =>
	createServerData$(
		async () => {
			const cartItems = await prisma.cartItem.findMany({
				select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
			});

			return cartItems;
		},
		{
			deferStream: true,
			key: () => "cart",
		}
	);

// get Products server data
export const getServerProductsData$ = () =>
	createServerData$(
		async () => {
			return await prisma.product.findMany({
				orderBy: {
					popularity: "desc",
				},
				select: {
					id: true,
					name: true,
					category: true,
					stock: true,
					price: true,
					imgUrl: true,
					popularity: true,
				},
			});
		},
		{
			deferStream: true,
			key: "product",
		}
	);

// get Transactions Server Resource
export const getServerTransactionsData$ = () =>
	createServerData$(
		async () => {
			return await prisma.transaction.findMany();
		},
		{
			deferStream: true,
		}
	);

// get Transaction Items Server Resource
export const getServerTransactionsItemsData$ = () =>
	createServerData$(
		async () => {
			return await prisma.transactionItem.findMany();
		},
		{ deferStream: true }
	);

// get Transaction Server Resource
export const getServerTransactionData$ = (params: Params) =>
	createServerData$(
		async ([, id]) => {
			const response = await prisma.transaction.findUnique({ where: { id } });

			return response;
		},
		{ key: () => ["transaction", params.id], deferStream: true }
	);

// get Transaction Items Server Resource
export const getServerTransactionItemsData$ = (params: Params) =>
	createServerData$(
		async ([, id]) => {
			return await prisma.transactionItem.findMany({ where: { transactionId: id } });
		},
		{ key: () => ["transaction", params.id], deferStream: true }
	);

// get Product
export const getProduct = async (prisma: prismaType, productId: string) => {
	return await prisma.product.findUnique({
		where: { id: productId },
		select: {
			id: true,
			name: true,
			category: true,
			stock: true,
			price: true,
			imgUrl: true,
			popularity: true,
		},
	});
};

// get Products
export const getProducts = async (prisma: prismaType) => {
	return await prisma.product.findMany({
		orderBy: {
			popularity: "desc",
		},
		select: {
			id: true,
			name: true,
			category: true,
			stock: true,
			price: true,
			imgUrl: true,
			popularity: true,
		},
	});
};

// get Products
export const getProductsRaw = async (prisma: prismaType) => {
	return await prisma.product.findMany({
		orderBy: {
			popularity: "desc",
		},
	});
};

// Product re-Stock
export const reStockProduct = async (prisma: prismaType, productId: string) => {
	return await prisma.product.update({
		where: { id: productId },
		data: {
			stock: 9999,
			updatedAt: new Date(),
		},
		select: {
			id: true,
			name: true,
			category: true,
			stock: true,
			price: true,
			imgUrl: true,
			popularity: true,
		},
	});
};

// Update Product Popularity Lite
export const updateProductPopularityLite = async (
	prisma: prismaType,
	productId: string,
	prevPopularity: number
) => {
	return await prisma.product.update({
		where: { id: productId },
		data: {
			popularity: prevPopularity + 1,
			updatedAt: new Date(),
		},
		select: {
			id: true,
			name: true,
			category: true,
			stock: true,
			price: true,
			imgUrl: true,
			popularity: true,
		},
	});
};

// Create Cart Item
export const createCartItem = async (prisma: prismaType, productId: string) => {
	return await prisma.cartItem.create({
		data: {
			quantity: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
			productId,
			isChecked: true,
			status: true,
		},
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});
};

// get CartItem by Product Id
export const getCartItemByProductId = async (prisma: prismaType, productId: string) => {
	const cartItem = await prisma.cartItem.findFirst({
		where: { productId },
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});

	return cartItem;
};

// Increase Cart Item Quantity
export const increaseCartItem = async (prisma: prismaType, cartId: string) => {
	return await prisma.cartItem.update({
		where: { id: cartId },
		data: {
			quantity: {
				increment: 1,
			},
			updatedAt: new Date(),
		},
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});
};

// delete Cart Item
export const removeCartItem = async (prisma: prismaType, cartId: string) => {
	return await prisma.cartItem.delete({
		where: { id: cartId },
	});
};

// set Cart Item Quantity
export const setCartItemQuantity = async (
	prisma: prismaType,
	cartId: string,
	newQuantity: number
) => {
	return await prisma.cartItem.update({
		where: { id: cartId },
		data: { quantity: newQuantity, updatedAt: new Date() },
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});
};

// get CartItems
export const getCartItems = async (prisma: prismaType) => {
	const cartItems = await prisma.cartItem.findMany({
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});

	return cartItems;
};

// get CartItem
export const getCartItem = async (prisma: prismaType, cartId: string) => {
	const cartItem = await prisma.cartItem.findUnique({
		where: { id: cartId },
		select: { id: true, isChecked: true, productId: true, quantity: true, status: true },
	});

	return cartItem;
};

// delete Cart Item
export const removeCartItems = async (prisma: prismaType) => {
	await prisma.cartItem.deleteMany();
};

// Decrease Products Stock
export const decreaseProductsStock = async (prisma: prismaType) => {
	return await prisma.$transaction(
		async (ctx) => {
			const cartItems = await ctx.cartItem.findMany();

			cartItems.forEach(async (item) => {
				await ctx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							decrement: item.quantity,
						},
					},
				});
			});

			return await ctx.product.findMany({
				orderBy: {
					popularity: "desc",
				},
				select: {
					id: true,
					name: true,
					category: true,
					stock: true,
					price: true,
					imgUrl: true,
					popularity: true,
				},
			});
		},
		{
			maxWait: 20000, // default: 2000
			timeout: 30000, // default: 5000
		}
	);
};

// get Cart Total Price
export const getTotalPrice = async (prisma: prismaType) => {
	const products = await getProducts(prisma);
	const cartItems = await getCartItems(prisma);

	return (
		cartItems?.reduce(
			(totalPrice, cartItem) =>
				cartItem.quantity *
					Number(products?.find((item) => item.id === cartItem.productId)?.price || 0) +
				totalPrice,
			0
		) || 0
	);
};

// Create Transaction
export const createTransaction = async (prisma: prismaType) => {
	const cartItems = await getCartItems(prisma);
	const totalPrice = await getTotalPrice(prisma);
	return await prisma.transaction.create({
		data: {
			quantities: cartItems.length,
			totalPrice,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	});
};

// Create Transaction Item
export const createTransactionItem = async (prisma: prismaType, transactionId: string) => {
	const cartItems = await getCartItems(prisma);

	const arrQuery = cartItems.map((item) =>
		prisma.transactionItem.create({
			data: {
				createdAt: new Date(),
				updatedAt: new Date(),
				quantity: item.quantity,
				productId: item.productId,
				transactionId,
			},
		})
	);

	return await prisma.$transaction(arrQuery);
};
