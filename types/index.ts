export interface Product {
    id: string
    Name: string
    Image: string
    Price: number
    Category: string
    Description: string
    Stock: number
    Rating?: number
}
export interface Category {
    id: string
    name: string
    slug: string
}