import { useLocation } from 'react-router-dom';

const RecipeResults = () => {
  const location = useLocation();
  const { queryParams, results } = location.state || { queryParams: {}, results: {} };

  return (
    <div className="kitchen-container py-8">
      <h1 className="text-3xl font-bold mb-6">Recipe Generation Query</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Query Sent to Backend:</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(queryParams, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h2 className="text-xl font-semibold mb-2">Response from Backend:</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
        {/* Later, you will map over actual recipe suggestions here */}
        {/* Example:
          {results.suggestions && results.suggestions.length > 0 ? (
            results.suggestions.map(recipe => (
              <div key={recipe.id} className="mt-4 p-4 border rounded-md">
                <h3 className="text-lg font-semibold">{recipe.name}</h3>
                <p>{recipe.description}</p>
              </div>
            ))
          ) : (
            <p className="mt-4">No recipe suggestions found based on your criteria.</p>
          )}
        */}
      </div>
    </div>
  );
};

export default RecipeResults;
