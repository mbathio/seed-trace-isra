// frontend/src/pages/varieties/index.tsx
const VarietiesPage = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["varieties"],
    queryFn: async () => {
      const response = await api.get("/varieties");
      console.log("API Response:", response.data); // Debug
      return response.data;
    },
    onError: (error) => {
      console.error("Query error:", error);
    },
  });

  if (error) {
    console.error("Error loading varieties:", error);
    return <div>Erreur: {error.message}</div>;
  }

  const varieties = response?.data || [];
  console.log("Varieties to display:", varieties); // Debug

  // ... reste du composant
};
