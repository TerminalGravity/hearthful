export async function createMeal(familyId: string, data: {
  name: string;
  description?: string;
  ingredients: string[];
  instructions?: string;
  category?: string;
}) {
  try {
    const response = await fetch(`/api/families/${familyId}/meals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create meal");
    }

    return response.json();
  } catch (error) {
    console.error("[CREATE_MEAL_ERROR]", error);
    throw error;
  }
}

export async function getMeals(familyId: string, params?: {
  search?: string;
  category?: string;
}) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);

    const response = await fetch(
      `/api/families/${familyId}/meals?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_MEALS_ERROR]", error);
    throw error;
  }
}

export async function createGame(familyId: string, data: {
  name: string;
  description?: string;
  instructions?: string;
  minPlayers?: number;
  maxPlayers?: number;
  ageRange?: string;
  category?: string;
}) {
  try {
    const response = await fetch(`/api/families/${familyId}/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create game");
    }

    return response.json();
  } catch (error) {
    console.error("[CREATE_GAME_ERROR]", error);
    throw error;
  }
}

export async function getGames(familyId: string, params?: {
  search?: string;
  category?: string;
  minPlayers?: number;
  maxPlayers?: number;
}) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.minPlayers) searchParams.set("minPlayers", params.minPlayers.toString());
    if (params?.maxPlayers) searchParams.set("maxPlayers", params.maxPlayers.toString());

    const response = await fetch(
      `/api/families/${familyId}/games?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch games");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_GAMES_ERROR]", error);
    throw error;
  }
}

export async function getRecommendations(familyId: string, type: "meal" | "game") {
  try {
    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ familyId, type }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    return response.json();
  } catch (error) {
    console.error("[GET_RECOMMENDATIONS_ERROR]", error);
    throw error;
  }
} 