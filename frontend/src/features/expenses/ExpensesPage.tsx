import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Search, Filter, Calendar, Tag } from 'lucide-react'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'

type TransactionType = 'income' | 'expense'
type Category = 'food' | 'transport' | 'shopping' | 'health' | 'entertainment' | 'utilities' | 'salary' | 'freelance' | 'other'

interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: Category
  date: string
  note?: string
}

const CATEGORY_CONFIG: Record<Category, { icon: string; color: string; bg: string }> = {
  food: { icon: '🍔', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  transport: { icon: '🚗', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  shopping: { icon: '🛍️', color: 'text-pink-400', bg: 'bg-pink-500/15' },
  health: { icon: '💊', color: 'text-success-400', bg: 'bg-success-500/15' },
  entertainment: { icon: '🎬', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  utilities: { icon: '⚡', color: 'text-warning-400', bg: 'bg-warning-500/15' },
  salary: { icon: '💼', color: 'text-success-400', bg: 'bg-success-500/15' },
  freelance: { icon: '💻', color: 'text-primary-400', bg: 'bg-primary-500/15' },
  other: { icon: '📦', color: 'text-[color:var(--text-tertiary)]', bg: 'bg-white/10' },
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Monthly Salary', amount: 85000, type: 'income', category: 'salary', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', title: 'Freelance Project', amount: 25000, type: 'income', category: 'freelance', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '3', title: 'Lunch at Zomato', amount: 450, type: 'expense', category: 'food', date: new Date().toISOString(), note: 'Biryani' },
  { id: '4', title: 'Uber ride', amount: 180, type: 'expense', category: 'transport', date: new Date().toISOString() },
  { id: '5', title: 'Netflix subscription', amount: 649, type: 'expense', category: 'entertainment', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '6', title: 'Grocery shopping', amount: 2300, type: 'expense', category: 'shopping', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '7', title: 'Gym membership', amount: 2500, type: 'expense', category: 'health', date: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '8', title: 'Electricity bill', amount: 1200, type: 'expense', category: 'utilities', date: new Date(Date.now() - 7 * 86400000).toISOString() },
]

const SPENDING_BY_CATEGORY = Object.entries(
  MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)
).sort((a, b) => b[1] - a[1])

const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
const totalExpense = MOCK_TRANSACTIONS.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
const balance = totalIncome - totalExpense
const maxSpend = SPENDING_BY_CATEGORY[0]?.[1] || 1

export default function ExpensesPage() {
  const [transactions] = useState(MOCK_TRANSACTIONS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  const filtered = transactions.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || t.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
          Expenses <Wallet className="w-5 h-5 text-warning-400" />
        </h1>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Balance', value: balance, icon: Wallet, color: balance >= 0 ? 'text-success-400' : 'text-error-400', bg: 'bg-primary-500/10', trend: balance >= 0 },
          { label: 'Income', value: totalIncome, icon: TrendingUp, color: 'text-success-400', bg: 'bg-success-500/10', trend: true },
          { label: 'Expenses', value: totalExpense, icon: TrendingDown, color: 'text-error-400', bg: 'bg-error-500/10', trend: false },
        ].map(stat => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="card p-5 relative overflow-hidden">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                <StatIcon className={cn('w-5 h-5', stat.color)} />
              </div>
              <p className={cn('text-2xl font-bold', stat.color)}>{formatCurrency(stat.value)}</p>
              <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{stat.label} this month</p>
              <div className={cn('absolute top-4 right-4', stat.trend ? 'text-success-400' : 'text-error-400')}>
                {stat.trend ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Transaction list */}
        <div className="col-span-12 lg:col-span-7 card">
          <div className="section-header mb-4">
            <h3 className="section-title">Recent Transactions</h3>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={cn('px-2.5 py-1 rounded-lg text-[10px] font-medium capitalize transition-all', typeFilter === t ? 'bg-primary-600/20 text-primary-300' : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)]">
            <Search className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none" />
          </div>

          <div className="space-y-1.5">
            {filtered.map(tx => {
              const cc = CATEGORY_CONFIG[tx.category]
              return (
                <motion.div key={tx.id} layout className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0', cc.bg)}>
                    {cc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--text-primary)] truncate">{tx.title}</p>
                    <p className="text-[10px] text-[color:var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(parseISO(tx.date), 'MMM d, h:mm a')}
                      <span className="capitalize px-1.5 py-0.5 rounded-full bg-white/5">{tx.category}</span>
                    </p>
                  </div>
                  <span className={cn('text-sm font-bold flex-shrink-0', tx.type === 'income' ? 'text-success-400' : 'text-error-400')}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Spending breakdown */}
        <div className="col-span-12 lg:col-span-5 card">
          <h3 className="section-title mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {SPENDING_BY_CATEGORY.map(([cat, amount]) => {
              const cc = CATEGORY_CONFIG[cat as Category]
              const pct = Math.round((amount / maxSpend) * 100)
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[color:var(--text-secondary)] flex items-center gap-1.5">
                      <span>{cc.icon}</span>
                      <span className="capitalize">{cat}</span>
                    </span>
                    <span className="text-xs font-semibold text-[color:var(--text-primary)]">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', cc.bg.replace('/15', '/60'))}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Budget gauge */}
          <div className="mt-5 pt-4 border-t border-[color:var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[color:var(--text-tertiary)]">Budget Used</p>
              <p className="text-xs font-semibold text-warning-400">{Math.round((totalExpense / (totalIncome || 1)) * 100)}%</p>
            </div>
            <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalExpense / (totalIncome || 1)) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-success-500 to-warning-500"
              />
            </div>
            <p className="text-[10px] text-[color:var(--text-muted)] mt-1.5">
              {formatCurrency(totalExpense)} spent of {formatCurrency(totalIncome)} earned
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
