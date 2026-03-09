"use client";

// Importing required components from Recharts for the chart
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';

// Define TypeScript interface for chart props
interface SalesChartProps {
    // data is an array of objects with 'name' (category) and 'amount' (value)
    data: { name: string; amount: number }[];
}

// Functional component to render the sales bar chart
export default function Chart({ data }: SalesChartProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-12">
            {/* Header section: Title and subtitle */}
            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Sales Performance
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                    Recent Revenue Flow
                </p>
            </div>

            {/* Responsive container ensures chart adjusts to parent width */}
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    {/* Grid lines (horizontal only) for better readability */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                    {/* X Axis configuration */}
                    <XAxis
                        dataKey="name" // maps to the 'name' property of data
                        axisLine={false} // hide axis line for cleaner look
                        tickLine={false} // hide tick lines
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} // style of ticks
                        dy={10} // vertical offset for tick labels
                    />

                    {/* Y Axis configuration */}
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />

                    {/* Tooltip configuration */}
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }} // hover effect on bars
                        contentStyle={{
                            borderRadius: '20px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                            padding: '15px'
                        }}
                    />

                    {/* Bars configuration */}
                    <Bar
                        dataKey="amount" // maps to 'amount' property
                        fill="#4f46e5" // bar color
                        radius={[10, 10, 0, 0]} // rounded top corners
                        barSize={40} // width of bars
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}