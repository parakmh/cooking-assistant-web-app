/**
 * Form validation schemas using Zod
 * Centralized validation rules for consistent form handling
 */
import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registrationSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(80, 'Username must be less than 80 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(120, 'Email must be less than 120 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Inventory validation schemas
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Ingredient name is required')
    .min(2, 'Ingredient name must be at least 2 characters')
    .max(100, 'Ingredient name must be less than 100 characters'),
  quantity: z
    .number({
      required_error: 'Quantity is required',
      invalid_type_error: 'Quantity must be a number',
    })
    .positive('Quantity must be greater than 0')
    .max(10000, 'Quantity seems too large'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(50, 'Unit must be less than 50 characters'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  expiryDate: z
    .date()
    .optional()
    .refine((date) => !date || date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Expiry date cannot be in the past',
    }),
});

// Profile validation schemas
export const accountInfoSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(80, 'Username must be less than 80 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(120, 'Email must be less than 120 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
});

export const preferencesSchema = z.object({
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  cuisinePreferences: z.array(z.string()).default([]),
  cookingExpertise: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  kitchenEquipment: z.array(z.string()).default([]),
});

export const notificationSettingsSchema = z.object({
  notifyExpiringIngredients: z.boolean(),
  notifyWeeklyMealPlan: z.boolean(),
  notifyNewRecipes: z.boolean(),
  notifyCookingTips: z.boolean(),
  mealPlanFrequency: z.enum(['daily', 'weekly', 'monthly']),
});

// Recipe rating validation
export const recipeRatingSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating must be at most 5 stars'),
  comment: z
    .string()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional(),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;
export type AccountInfoFormData = z.infer<typeof accountInfoSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type RecipeRatingFormData = z.infer<typeof recipeRatingSchema>;
