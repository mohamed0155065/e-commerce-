export interface product {
    id: string
    Name: string
    Image: string
    Price: number
    Description: string
    Stock: number
    Rating?: number
}
export interface Category {
    id: string
    name: string
    slug: string
}