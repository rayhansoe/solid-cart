import type { CartItemProps, ProductProps } from "~/types";
import { formatCurrency } from "~/utilities/formatCurrency";
import ProductCart from "./ProductCart";
import ProductStock from "./ProductStock";

const ProductCard = (props: { cartItems: CartItemProps[]; product: ProductProps }) => {
	return (
		<li class='relative flex flex-shrink-0 flex-grow-0 flex-col items-center w-full h-full min-w-0 p-3 sm:w-1/2 sm:max-w-sm lg:w-1/3 lg:max-w-none xl:w-1/4'>
			<div class='relative flex flex-shrink-0 flex-grow-0 flex-col items-center w-full h-full min-w-0 shadow bg-white rounded border border-gray-300 overflow-hidden transition-all hover:shadow-lg sm:hover:scale-103 md:hover:scale-105'>
				<img
					class='w-full h-52 object-cover'
					src={props?.product?.imgUrl}
					alt={props?.product?.name}
					loading='lazy'
				/>
				<div class='flex flex-col w-full p-4 h-auto gap-6'>
					<div class='flex justify-between items-center gap-2'>
						<span class='text-2xl truncate w-2/3'>{props?.product?.name}</span>
						<span class='text-lg text-right text-gray-600 w-1/3'>
							{formatCurrency(props?.product?.price)}
						</span>
					</div>
					<div class='flex justify-between items-center'>
						<ProductStock id={props?.product?.id} stock={props.product.stock} />
						<ProductCart
							id={props?.product?.id}
							stock={props?.product?.stock}
							cartItems={props.cartItems}
						/>
					</div>
				</div>
			</div>
		</li>
	);
};
export default ProductCard;
