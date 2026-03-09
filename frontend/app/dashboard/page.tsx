//dash boad page with white  background and a welcome message
const DashboardPage = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md"> 
      <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-600">Here you can manage your sales and view analytics.</p>
    </div>
  );
}
export default DashboardPage;