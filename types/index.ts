export interface product {
    id: string
    price: number
    description: string
    image: string[]
    category: Category
    stock: number
    rating?: number
}
export interface Category {
    id: string
    name: string
    slug: string
}