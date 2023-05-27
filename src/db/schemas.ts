import {
	int,
	mysqlTable,
	varchar,
	timestamp,
	boolean,
	serial,
	decimal,
} from "drizzle-orm/mysql-core";

// declaring enum in database
export const Product = mysqlTable("product", {
	id: serial("id").notNull().primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	category: varchar("category", { length: 256 }).notNull(),
	stock: int("stock").notNull(),
	price: decimal("price").notNull(),
	imgUrl: varchar("imgUrl", { length: 256 }).notNull(),
	popularity: int("popularity").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const CartItem = mysqlTable("cartItem", {
	id: serial("id").notNull().primaryKey(),
	quantity: int("quantity").notNull(),
	productId: varchar("productId", { length: 256 }).notNull(),
	isChecked: boolean("isChecked").notNull(),
	status: boolean("status").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const Transaction = mysqlTable("transaction", {
	id: serial("id").notNull().primaryKey(),
	price: decimal("price").notNull(),
	quantities: int("quantity").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const TransactionItem = mysqlTable("transactionItem", {
	id: serial("id").notNull().primaryKey(),
	transactionId: serial("transactionId").notNull(),
	quantity: int("quantity").notNull(),
	productId: serial("productId").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
