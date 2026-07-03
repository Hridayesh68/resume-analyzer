const apiBaseUrl = import.meta.env.VITE_API_URL || "https://resume-analyzer-g4sr.onrender.com";
axios.get(`${apiBaseUrl}/results`)
