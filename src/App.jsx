import Map from './components/Map';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">TransLink Live Tracker</h1>
          <p className="text-blue-100 text-sm mt-1">
            Real-time transit tracking for Metro Vancouver
          </p>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Live Transit Map
          </h2>
          <Map />
        </div>
      </main>
    </div>
  );
}

export default App;