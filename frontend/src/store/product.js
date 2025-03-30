import { create } from "zustand";

export const useProductStore = create((set) => ({
	products: [],
	setProducts: (products) => set({ products }),

	// Create a new product
	createProduct: async (newProduct) => {
		if (!newProduct.name || !newProduct.image || !newProduct.price) {
			return { success: false, message: "Please fill in all fields." };
		}

		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newProduct),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Failed to create product.");
			}

			const data = await res.json();
			set((state) => ({ products: [...state.products, data.data] }));

			return { success: true, message: "Product created successfully" };
		} catch (error) {
			console.error("Create Product Error:", error);
			return { success: false, message: error.message };
		}
	},

	// Fetch all products
	fetchProducts: async () => {
		try {
			const res = await fetch("/api/products");
			if (!res.ok) {
				throw new Error("Failed to fetch products.");
			}
			const data = await res.json();
			set({ products: data.data });
		} catch (error) {
			console.error("Fetch Products Error:", error);
		}
	},

	// Delete a product
	deleteProduct: async (pid) => {
		try {
			const res = await fetch(`/api/products/${pid}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Failed to delete product.");
			}

			const data = await res.json();
			if (!data.success) return { success: false, message: data.message };

			// Update UI immediately
			set((state) => ({
				products: state.products.filter((product) => product._id !== pid),
			}));

			return { success: true, message: "Product deleted successfully." };
		} catch (error) {
			console.error("Delete Product Error:", error);
			return { success: false, message: error.message };
		}
	},

	// Update a product
	updateProduct: async (pid, updatedProduct) => {
		try {
			const res = await fetch(`/api/products/${pid}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updatedProduct),
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || "Failed to update product.");
			}

			const data = await res.json();
			if (!data.success) return { success: false, message: data.message };

			// Update UI immediately
			set((state) => ({
				products: state.products.map((product) => (product._id === pid ? data.data : product)),
			}));

			return { success: true, message: "Product updated successfully." };
		} catch (error) {
			console.error("Update Product Error:", error);
			return { success: false, message: error.message };
		}
	},
}));

export default useProductStore;