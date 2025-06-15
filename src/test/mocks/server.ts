import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Default handlers for common API endpoints
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      access: 'mock-jwt-token',
      refresh: 'mock-refresh-token',
    });
  }),

  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      message: 'User registered successfully',
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      profile: {
        dietary_preferences: [],
        allergies: [],
        cooking_expertise: 'Beginner',
        cuisine_preferences: [],
        bio: '',
        profile_picture: '',
        kitchen_equipment: [],
        notify_expiring_ingredients: true,
        notify_weekly_meal_plan: true,
        notify_new_recipes: false,
        notify_cooking_tips: true,
        meal_plan_frequency: 'weekly',
      },
    });
  }),

  // Inventory endpoints
  http.get(`${API_BASE_URL}/inventory`, () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          name: 'Tomatoes',
          quantity: 5,
          unit: 'pcs',
          category: 'Vegetables',
          expiryDate: '2024-12-25',
        },
        {
          id: '2',
          name: 'Milk',
          quantity: 1,
          unit: 'liter',
          category: 'Dairy',
          expiryDate: '2024-12-20',
        },
        {
          id: '3',
          name: 'Chicken Breast',
          quantity: 500,
          unit: 'grams',
          category: 'Protein',
          expiryDate: '2024-12-18',
        },
      ],
    });
  }),

  http.post(`${API_BASE_URL}/inventory`, () => {
    return HttpResponse.json({
      id: '4',
      name: 'Carrots',
      quantity: 10,
      unit: 'pcs',
      category: 'Vegetables',
      expiryDate: '2024-12-30',
    });
  }),
];

export const server = setupServer(...handlers);
