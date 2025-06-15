import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import RecipesHistory from '@/pages/Recipes';
import { renderWithProviders } from '../utils';

// No MSW needed: Recipes page uses local mock data

describe('Recipes Page', () => {
  beforeAll(() => {})
  afterEach(() => {})
  afterAll(() => {})

  it('renders the recipes page and shows all generated recipes', async () => {
    renderWithProviders(<RecipesHistory />);
    expect(await screen.findByText(/recipes history/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated chicken & rice stir-fry/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated creamy spinach pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated greek yogurt breakfast bowl/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated tomato egg scramble/i)).toBeInTheDocument();
  });

  it.skip('can filter recipes by difficulty', async () => {
    renderWithProviders(<RecipesHistory />);
    // Open difficulty select
    const select = screen.getByText(/select difficulty/i);
    await userEvent.click(select);
    const easyOption = await screen.findByText(/easy/i);
    await userEvent.click(easyOption);
    // All recipes are easy, so all should still be visible
    expect(screen.getByText(/chicken & rice/i)).toBeInTheDocument();
  });

  it.skip('shows empty state when filters exclude all recipes', async () => {
    renderWithProviders(<RecipesHistory />);
    // Open difficulty select
    const select = screen.getByText(/select difficulty/i);
    await userEvent.click(select);
    const hardOption = await screen.findByText(/hard/i);
    await userEvent.click(hardOption);
    expect(await screen.findByText(/no generated recipes match your filters/i)).toBeInTheDocument();
  });

  it('can switch to favorites tab and see only favorite recipes', async () => {
    renderWithProviders(<RecipesHistory />);
    const favoritesTab = screen.getByRole('tab', { name: /favorites/i });
    await userEvent.click(favoritesTab);
    // Only favorite recipes should be visible
    expect(screen.getByText(/ai-generated creamy spinach pasta/i)).toBeInTheDocument();
    expect(screen.getByText(/ai-generated tomato egg scramble/i)).toBeInTheDocument();
    // Non-favorites should not be visible
    expect(screen.queryByText(/chicken & rice/i)).not.toBeInTheDocument();
  });

  it('shows empty state when no favorite recipes', async () => {
    renderWithProviders(<RecipesHistory />);
    // Remove all favorites by clicking heart buttons in favorites tab
    const favoritesTab = screen.getByRole('tab', { name: /favorites/i });
    await userEvent.click(favoritesTab);
    // Click all heart buttons to unfavorite
    const heartButtons = screen.getAllByRole('button', { name: '' });
    for (const btn of heartButtons) {
      await userEvent.click(btn);
    }
    // Should show empty state
    expect(await screen.findByText(/no favorite recipes yet/i)).toBeInTheDocument();
  });

  it.skip('can open and close the recipe view dialog', async () => {
    renderWithProviders(<RecipesHistory />);
    // Click on a recipe card's title to open dialog
    const recipeTitle = screen.getByText(/chicken & rice stir-fry/i);
    await userEvent.click(recipeTitle);
    expect(await screen.findByText(/ingredients/i)).toBeInTheDocument();
    // Close dialog (click outside or press escape)
    // Simulate pressing Escape
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText(/ingredients/i)).not.toBeInTheDocument();
  });
});
