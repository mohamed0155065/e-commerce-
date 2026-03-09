export default function Loading() {
    return (
        <div className="container mx-auto px-6 py-10">

            {/* Skeleton Header */}
            <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-lg mb-10" />

            {/* Grid of Skeleton Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-4 space-y-4">

                        {/* Image Placeholder */}
                        <div className="aspect-square bg-slate-100 animate-pulse rounded-[1.5rem]" />

                        {/* Text Placeholders */}
                        <div className="space-y-2 px-2">
                            <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                            <div className="h-6 w-1/3 bg-slate-100 animate-pulse rounded" />
                        </div>

                        {/* Button Placeholder */}
                        <div className="h-12 w-full bg-slate-50 animate-pulse rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}