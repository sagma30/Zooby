import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  INITIAL_VERIFICATIONS,
  INITIAL_ADMIN_BOOKINGS,
  REVENUE_CHART_DATA_MONTHLY,
  REVENUE_CHART_DATA_WEEKLY
} from '../../data/adminMockData';
import { ProviderVerification } from '../../types';

interface AdminDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenVerificationReview: (v: ProviderVerification) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigateTab,
  onOpenVerificationReview
}) => {
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);

  const chartData =
    chartPeriod === 'monthly' ? REVENUE_CHART_DATA_MONTHLY : REVENUE_CHART_DATA_WEEKLY;

  const handleReviewClick = (item: ProviderVerification) => {
    onOpenVerificationReview(item);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-jakarta">
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1b1c1a]">Overview</h2>
        <p className="text-sm text-[#705e4f] mt-1">
          Here's what's happening across the platform today.
        </p>
      </div>

      {/* 6 High-Level Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#e3edff] text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
              +5%
            </span>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Total Users</div>
            <div className="text-2xl font-extrabold text-[#1b1c1a] tracking-tight mt-0.5">
              12.4k
            </div>
          </div>
        </div>

        {/* Card 2: Total Pets */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] filled-icon">pets</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
              +8%
            </span>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Total Pets</div>
            <div className="text-2xl font-extrabold text-[#1b1c1a] tracking-tight mt-0.5">
              15.8k
            </div>
          </div>
        </div>

        {/* Card 3: Active Providers */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#15803d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">medical_services</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569]">
              Active
            </span>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Active Providers</div>
            <div className="text-2xl font-extrabold text-[#1b1c1a] tracking-tight mt-0.5">
              842
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Bookings */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">calendar_month</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
              +12%
            </span>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Monthly Bookings</div>
            <div className="text-2xl font-extrabold text-[#1b1c1a] tracking-tight mt-0.5">
              3.2k
            </div>
          </div>
        </div>

        {/* Card 5: Total Revenue */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#efeeea] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
              +15%
            </span>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Total Revenue</div>
            <div className="text-2xl font-extrabold text-[#1b1c1a] tracking-tight mt-0.5">
              $124k
            </div>
          </div>
        </div>

        {/* Card 6: Pending Approvals */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#ffdad6]/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#fee2e2] text-[#b91c1c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px] font-bold">priority_high</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#877462] font-semibold">Pending Approvals</div>
            <div className="text-2xl font-extrabold text-[#b91c1c] tracking-tight mt-0.5">
              45
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Booking & Revenue Overview Chart + Requires Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart Box (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-[#1b1c1a]">Booking &amp; Revenue Overview</h3>
              <p className="text-xs text-[#877462]">Performance metrics over time</p>
            </div>
            <div className="flex items-center bg-[#f5f2ec] p-1 rounded-xl self-start sm:self-auto border border-[#e5dfd5]">
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartPeriod === 'monthly'
                    ? 'bg-white text-[#1b1c1a] shadow-xs'
                    : 'text-[#877462] hover:text-[#1b1c1a]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartPeriod === 'weekly'
                    ? 'bg-white text-[#1b1c1a] shadow-xs'
                    : 'text-[#877462] hover:text-[#1b1c1a]'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          {/* Render Area Chart */}
          <div className="w-full h-64 sm:h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ebe3" />
                <XAxis
                  dataKey="name"
                  stroke="#a39688"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e8e2d8' }}
                />
                <YAxis
                  stroke="#a39688"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e8e2d8' }}
                  tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #efeeea',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? `$${Number(value).toLocaleString()}` : `${value} bookings`,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#f5f2ec] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="font-semibold text-[#544434]">Gross Revenue ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span className="font-semibold text-[#544434]">Completed Bookings</span>
            </div>
          </div>
        </div>

        {/* Right Card: Requires Attention */}
        <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#b91c1c]">
              <span className="material-symbols-outlined text-xl font-bold">error</span>
              <h3 className="font-bold text-lg text-[#1b1c1a]">Requires Attention</h3>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div
                onClick={() => onNavigateTab('providers')}
                className="p-4 rounded-xl border border-[#fee2e2] bg-[#fff5f5] hover:bg-[#ffebeb] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#b91c1c] flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c1a]">Provider Verifications</h4>
                    <p className="text-[11px] text-[#877462]">Pending documents</p>
                  </div>
                </div>
                <span className="w-7 h-7 rounded-full bg-[#b91c1c] text-white text-xs font-bold flex items-center justify-center">
                  5
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => onNavigateTab('complaints')}
                className="p-4 rounded-xl border border-[#fef3c7] bg-[#fffbeb] hover:bg-[#fef9c3] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#b45309] flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c1a]">New Complaints</h4>
                    <p className="text-[11px] text-[#877462]">Unresolved tickets</p>
                  </div>
                </div>
                <span className="w-7 h-7 rounded-full bg-[#b45309] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => onNavigateTab('payments')}
                className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white text-[#475569] flex items-center justify-center shadow-2xs">
                    <span className="material-symbols-outlined text-[20px]">credit_card_off</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1b1c1a]">Payment Issues</h4>
                    <p className="text-[11px] text-[#877462]">Flagged transactions</p>
                  </div>
                </div>
                <span className="w-7 h-7 rounded-full bg-[#475569] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('providers')}
            className="w-full py-2.5 px-4 rounded-xl border border-[#d8d1c7] hover:bg-[#f5f2ec] text-[#1b1c1a] text-xs font-bold transition-all cursor-pointer"
          >
            View All Tasks
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Verifications & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Verifications */}
        <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1b1c1a]">Recent Verifications</h3>
            <button
              onClick={() => onNavigateTab('providers')}
              className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#877462] border-b border-[#efeeea]">
                  <th className="pb-3 font-bold">Name</th>
                  <th className="pb-3 font-bold">Service</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f2ec]">
                {verifications.slice(0, 3).map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full ${item.avatarBg} font-bold flex items-center justify-center text-xs shrink-0`}
                        >
                          {item.initials}
                        </div>
                        <span className="font-bold text-[#1b1c1a]">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#544434] font-medium">{item.service}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'Pending'
                            ? 'bg-[#f1f5f9] text-[#475569]'
                            : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleReviewClick(item)}
                        className="py-1 px-3.5 rounded-lg bg-[#f59e0b] hover:bg-[#ea580c] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-[#efeeea] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1b1c1a]">Recent Bookings</h3>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-[#895100] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#877462] border-b border-[#efeeea]">
                  <th className="pb-3 font-bold">ID</th>
                  <th className="pb-3 font-bold">Pet</th>
                  <th className="pb-3 font-bold">Service</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f2ec]">
                {INITIAL_ADMIN_BOOKINGS.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#877462]">{booking.id}</td>
                    <td className="py-3 font-bold text-[#1b1c1a]">{booking.pet}</td>
                    <td className="py-3 text-[#544434] font-medium">{booking.service}</td>
                    <td className="py-3 font-bold text-[#1b1c1a]">
                      ${booking.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          booking.status === 'Confirmed'
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : booking.status === 'Completed'
                            ? 'bg-[#f1f5f9] text-[#475569]'
                            : 'bg-[#fef3c7] text-[#92400e]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            booking.status === 'Confirmed'
                              ? 'bg-[#15803d]'
                              : booking.status === 'Completed'
                              ? 'bg-[#475569]'
                              : 'bg-[#92400e]'
                          }`}
                        />
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
