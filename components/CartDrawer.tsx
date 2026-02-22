"use client";
import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus } from "lucide-react";

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {

    const { items, addItem, removeItem, getTotalPrice } = useCartStore()
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" onClick={onClose} />
            )}
            l

            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-xl font-bold">Shopping Cart</h2>
                        <button onClick={onClose} aria-label="Close modal" className="p-2 hover:bg-gray-100 rounded-full transition" >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        {items.length === 0 ? (
                            <p className="text-center text-gray-500 mt-10">Your cart is empty</p>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4 mb-4 border-b pb-4">
                                    <img src={item.Image} className="w-20 h-20 object-cover rounded" alt={item.Name} />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{item.Name}</h3>
                                        <p className="text-orange-600">${item.Price}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center  border rounded-md px-2 py-1 gap-3">
                                                <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-600">
                                                    {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => addItem(item)} className="text-gray-500 hover:text-orange-600">

                                                    < Plus size={16} />
                                                </button>
                                            </div>
                                            <span className="text-sm font-medium">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t pt-4">
                            <div className="flex justify-between font-bold text-lg mb-4">
                                <span>Total:</span>
                                <span>${getTotalPrice()}</span>
                            </div>
                            <button className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition">
                                Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};




