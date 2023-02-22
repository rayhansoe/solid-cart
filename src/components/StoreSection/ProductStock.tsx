export default function ProductStock(props: { id: string; stock: number }) {
	return (
		<span class='text-lg text-gray-700'>
			stock: <span class='text-base font-semibold'>{props.stock}</span>
		</span>
	);
}
