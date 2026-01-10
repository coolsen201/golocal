import { useState } from 'react'
import AddProduct from './components/AddProduct'
import BuyerMap from './components/BuyerMap'
import { Map, Store } from 'lucide-react'

function App() {
  const [view, setView] = useState('seller'); // 'seller' | 'buyer'

  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">
      {/* View Switcher (Floating) */}
      <div className="fixed bottom-6 right-6 z-[2000] flex gap-2 bg-white p-1 rounded-full shadow-2xl border border-gray-200">
        <button
          onClick={() => setView('seller')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === 'seller' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
        >
          <Store className="w-4 h-4" /> Seller
        </button>
        <button
          onClick={() => setView('buyer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${view === 'buyer' ? 'bg-green-600 text-white shadow' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
        >
          <Map className="w-4 h-4" /> Buyer
        </button>
      </div>

      {view === 'seller' ? (
        <>
          <header className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Scan<span className="text-blue-600">Kalambu</span>
            </h1>
            <p className="text-gray-500 mt-1">Hyperlocal Inventory Management</p>
          </header>
          <main>
            <AddProduct />
          </main>
        </>
      ) : (
        <BuyerMap />
      )}
    </div>
  )
}

export default App
