export interface Product {
    id: string
    Name: string
    Image: string
    Price: number
    Category?: string
    Description: string
    Stock?: number
    Status?: "active" | "inactive"
    Slug?: string
    created_at?: string
    updated_at?: string
    Rating?: number
}
export interface Category {
    id: string
    name: string
    slug: string
}
export interface productData {
    name: string
    price: number
    image: string
    description: string
}
