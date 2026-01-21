'use client';

import { useState, useEffect } from 'react';

// データ型の定義
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

// カテゴリの定義
const INCOME_CATEGORIES = ['給与', 'ボーナス', '副業', 'その他収入'];
const EXPENSE_CATEGORIES = ['食費', '住居費', '交通費', '娯楽', '医療', '通信費', 'その他支出'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'breakdown'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-01');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('household-transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // ローカルストレージに保存
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('household-transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // 選択された月の取引をフィルタリング
  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  // 合計計算
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // カテゴリ別集計
  const categoryTotals = filteredTransactions.reduce((acc, t) => {
    const key = `${t.type}-${t.category}`;
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // 取引の追加・編集
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setTransactions(transactions.map(t =>
        t.id === editingId
          ? { ...formData, id: editingId }
          : t
      ));
      setEditingId(null);
    } else {
      const newTransaction: Transaction = {
        ...formData,
        id: Date.now().toString()
      };
      setTransactions([...transactions, newTransaction]);
    }

    setShowAddForm(false);
    setFormData({
      type: 'expense',
      amount: 0,
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // 取引の削除
  const handleDelete = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // 取引の編集開始
  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-xl font-semibold">家計簿アプリ</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">収入と支出を記録して、家計を管理しましょう</p>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              概要
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              取引履歴
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'breakdown'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              カテゴリ内訳
            </button>
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 月選択 */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            {new Date(selectedMonth + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}の収支
          </h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* サマリーカード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">収入</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-green-600">¥{totalIncome.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">{filteredTransactions.filter(t => t.type === 'income').length}件の取引</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">支出</span>
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-red-600">¥{totalExpense.toLocaleString()}</div>
                <div className="text-sm text-gray-500 mt-1">{filteredTransactions.filter(t => t.type === 'expense').length}件の取引</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">収支</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {balance >= 0 ? '' : '-'}¥{Math.abs(balance).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">前月</div>
              </div>
            </div>

            {/* 取引追加フォーム */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingId(null);
                  setFormData({
                    type: 'expense',
                    amount: 0,
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新しい取引を追加
              </button>

              {showAddForm && (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">取引種類</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="income"
                          checked={formData.type === 'income'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income', category: '' })}
                          className="mr-2"
                        />
                        <span className="text-green-600 font-medium">収入</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="expense"
                          checked={formData.type === 'expense'}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense', category: '' })}
                          className="mr-2"
                        />
                        <span className="text-red-600 font-medium">支出</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">¥</span>
                        <input
                          type="number"
                          value={formData.amount || ''}
                          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    >
                      <option value="">カテゴリを選択してください</option>
                      {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">摘要 (任意)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="詳細を入力してください"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      {editingId ? '更新' : '追加'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingId(null);
                      }}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* 履歴タブ */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">取引履歴</h3>
              {filteredTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">取引履歴がありません</p>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(transaction => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          {transaction.description && (
                            <p className="text-sm text-gray-600">{transaction.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}¥{transaction.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="編集"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="削除"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 内訳タブ */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            {/* 収入の内訳 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">収入の内訳</h3>
              {totalIncome === 0 ? (
                <p className="text-gray-500 text-center py-8">収入のデータがありません</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center">
                    <PieChart
                      data={INCOME_CATEGORIES.map(cat => ({
                        label: cat,
                        value: categoryTotals[`income-${cat}`] || 0,
                        color: getColor(INCOME_CATEGORIES.indexOf(cat))
                      })).filter(d => d.value > 0)}
                    />
                  </div>
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">カテゴリ</th>
                          <th className="text-right py-2">金額</th>
                          <th className="text-right py-2">割合</th>
                        </tr>
                      </thead>
                      <tbody>
                        {INCOME_CATEGORIES.map(cat => {
                          const amount = categoryTotals[`income-${cat}`] || 0;
                          const percentage = totalIncome > 0 ? (amount / totalIncome * 100) : 0;
                          if (amount === 0) return null;
                          return (
                            <tr key={cat} className="border-b">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: getColor(INCOME_CATEGORIES.indexOf(cat)) }}
                                  />
                                  {cat}
                                </div>
                              </td>
                              <td className="text-right font-medium">¥{amount.toLocaleString()}</td>
                              <td className="text-right text-gray-600">{percentage.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* 支出の内訳 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">支出の内訳</h3>
              {totalExpense === 0 ? (
                <p className="text-gray-500 text-center py-8">支出のデータがありません</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex items-center justify-center">
                    <PieChart
                      data={EXPENSE_CATEGORIES.map(cat => ({
                        label: cat,
                        value: categoryTotals[`expense-${cat}`] || 0,
                        color: getColor(EXPENSE_CATEGORIES.indexOf(cat))
                      })).filter(d => d.value > 0)}
                    />
                  </div>
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">カテゴリ</th>
                          <th className="text-right py-2">金額</th>
                          <th className="text-right py-2">割合</th>
                        </tr>
                      </thead>
                      <tbody>
                        {EXPENSE_CATEGORIES.map(cat => {
                          const amount = categoryTotals[`expense-${cat}`] || 0;
                          const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0;
                          if (amount === 0) return null;
                          return (
                            <tr key={cat} className="border-b">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: getColor(EXPENSE_CATEGORIES.indexOf(cat)) }}
                                  />
                                  {cat}
                                </div>
                              </td>
                              <td className="text-right font-medium">¥{amount.toLocaleString()}</td>
                              <td className="text-right text-gray-600">{percentage.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 円グラフコンポーネント
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return <div className="w-64 h-64 flex items-center justify-center text-gray-400">データなし</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  return (
    <svg width="256" height="256" viewBox="0 0 256 256" className="transform -rotate-0">
      {data.map((item, index) => {
        const percentage = item.value / total;
        const angle = percentage * 360;
        const endAngle = currentAngle + angle;

        const startX = 128 + 100 * Math.cos((currentAngle * Math.PI) / 180);
        const startY = 128 + 100 * Math.sin((currentAngle * Math.PI) / 180);
        const endX = 128 + 100 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 128 + 100 * Math.sin((endAngle * Math.PI) / 180);

        const largeArcFlag = angle > 180 ? 1 : 0;

        const path = [
          `M 128 128`,
          `L ${startX} ${startY}`,
          `A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`
        ].join(' ');

        currentAngle = endAngle;

        return (
          <g key={index}>
            <path d={path} fill={item.color} stroke="white" strokeWidth="2" />
          </g>
        );
      })}
      <circle cx="128" cy="128" r="60" fill="white" />
    </svg>
  );
}

// カラーパレット
function getColor(index: number): string {
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];
  return colors[index % colors.length];
}
