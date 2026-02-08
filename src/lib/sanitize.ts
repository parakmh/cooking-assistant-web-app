/**
 * Content Sanitization Utility
 * 
 * Production-ready XSS protection for user-generated and LLM-generated content.
 * Uses DOMPurify to sanitize HTML and prevent malicious script injection.
 * 
 * @module sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for different sanitization levels
 */
const SANITIZE_CONFIGS = {
  /**
   * Strict mode: Allows only plain text, strips all HTML
   * Use for: Recipe names, ingredient names, user input that should be text-only
   */
  STRICT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  },
  
  /**
   * Basic mode: Allows basic formatting (bold, italic, line breaks)
   * Use for: Recipe descriptions, user bios
   */
  BASIC: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
    ALLOWED_ATTR: [],
  },
  
  /**
   * Rich mode: Allows lists and basic structure
   * Use for: Recipe instructions, cooking tips
   */
  RICH: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: [],
  },
} as const;

/**
 * Sanitize text content (strict mode - no HTML allowed)
 * 
 * @param content - The content to sanitize
 * @returns Sanitized plain text with all HTML removed
 * 
 * @example
 * ```ts
 * const recipeName = sanitizeText('<script>alert("xss")</script>Pasta');
 * // Returns: "Pasta"
 * ```
 */
export function sanitizeText(content: string | null | undefined): string {
  if (!content) return '';
  
  // Remove all HTML tags and scripts
  const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIGS.STRICT);
  
  // Trim whitespace and return
  return sanitized.trim();
}

/**
 * Sanitize content with basic HTML formatting allowed
 * 
 * @param content - The content to sanitize
 * @returns Sanitized HTML string with basic formatting tags
 * 
 * @example
 * ```ts
 * const description = sanitizeBasicHTML('<p>Delicious <script>alert("xss")</script> pasta</p>');
 * // Returns: "<p>Delicious  pasta</p>"
 * ```
 */
export function sanitizeBasicHTML(content: string | null | undefined): string {
  if (!content) return '';
  
  const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIGS.BASIC);
  return sanitized.trim();
}

/**
 * Sanitize content with rich HTML formatting allowed (lists, headings, etc.)
 * 
 * @param content - The content to sanitize
 * @returns Sanitized HTML string with rich formatting tags
 * 
 * @example
 * ```ts
 * const instructions = sanitizeRichHTML('<ol><li>Mix ingredients</li></ol>');
 * // Returns: "<ol><li>Mix ingredients</li></ol>"
 * ```
 */
export function sanitizeRichHTML(content: string | null | undefined): string {
  if (!content) return '';
  
  const sanitized = DOMPurify.sanitize(content, SANITIZE_CONFIGS.RICH);
  return sanitized.trim();
}

/**
 * Sanitize an array of strings (e.g., ingredient list, instructions)
 * 
 * @param items - Array of strings to sanitize
 * @param mode - Sanitization mode ('strict' | 'basic' | 'rich')
 * @returns Array of sanitized strings
 * 
 * @example
 * ```ts
 * const ingredients = sanitizeArray(['<script>alert("xss")</script>Flour', 'Sugar']);
 * // Returns: ['Flour', 'Sugar']
 * ```
 */
export function sanitizeArray(
  items: string[] | null | undefined,
  mode: 'strict' | 'basic' | 'rich' = 'strict'
): string[] {
  if (!items || !Array.isArray(items)) return [];
  
  const sanitizeFunc = mode === 'strict' ? sanitizeText : 
                       mode === 'basic' ? sanitizeBasicHTML : 
                       sanitizeRichHTML;
  
  return items.map(item => sanitizeFunc(item)).filter(item => item.length > 0);
}

/**
 * Sanitize a recipe object from backend/LLM
 * Applies appropriate sanitization to each field
 * 
 * @param recipe - Recipe object with potentially unsafe content
 * @returns Recipe object with all fields sanitized
 */
export function sanitizeRecipe<T extends Record<string, any>>(recipe: T): T {
  if (!recipe) return recipe;
  
  const sanitized = { ...recipe };
  
  // Sanitize recipe title (strict - no HTML)
  if (sanitized.title) {
    sanitized.title = sanitizeText(sanitized.title);
  }
  
  // Sanitize description (basic HTML allowed)
  if (sanitized.description) {
    sanitized.description = sanitizeBasicHTML(sanitized.description);
  }
  
  // Sanitize cuisine (strict)
  if (sanitized.cuisine) {
    sanitized.cuisine = sanitizeText(sanitized.cuisine);
  }
  
  // Sanitize tags array
  if (sanitized.tags) {
    sanitized.tags = sanitizeArray(sanitized.tags, 'strict');
  }
  
  // Sanitize meal types
  if (sanitized.mealType) {
    sanitized.mealType = sanitizeArray(sanitized.mealType, 'strict');
  }
  
  // Sanitize instructions (rich HTML for formatting)
  if (sanitized.instructions) {
    sanitized.instructions = sanitizeArray(sanitized.instructions, 'rich');
  }
  
  // Sanitize ingredients
  if (sanitized.ingredients && Array.isArray(sanitized.ingredients)) {
    sanitized.ingredients = sanitized.ingredients.map((ing: any) => {
      if (typeof ing === 'string') {
        return sanitizeText(ing);
      }
      return {
        name: sanitizeText(ing.name),
        quantity: sanitizeText(String(ing.quantity)),
        unit: sanitizeText(ing.unit),
      };
    });
  }
  
  // Sanitize equipment needed
  if (sanitized.kitchenEquipmentNeeded) {
    sanitized.kitchenEquipmentNeeded = sanitizeArray(sanitized.kitchenEquipmentNeeded, 'strict');
  }
  
  return sanitized;
}

/**
 * Sanitize inventory item from backend
 * 
 * @param item - Inventory item with potentially unsafe content
 * @returns Sanitized inventory item
 */
export function sanitizeInventoryItem<T extends Record<string, any>>(item: T): T {
  if (!item) return item;
  
  return {
    ...item,
    name: sanitizeText(item.name),
    unit: sanitizeText(item.unit),
    category: sanitizeText(item.category),
  };
}

/**
 * Sanitize user profile data
 * 
 * @param profile - User profile with potentially unsafe content
 * @returns Sanitized user profile
 */
export function sanitizeUserProfile<T extends Record<string, any>>(profile: T): T {
  if (!profile) return profile;
  
  const sanitized = { ...profile };
  
  // Sanitize bio (basic HTML allowed for formatting)
  if (sanitized.bio) {
    sanitized.bio = sanitizeBasicHTML(sanitized.bio);
  }
  
  // Sanitize username (strict)
  if (sanitized.username) {
    sanitized.username = sanitizeText(sanitized.username);
  }
  
  // Sanitize arrays
  if (sanitized.dietaryPreferences) {
    sanitized.dietaryPreferences = sanitizeArray(sanitized.dietaryPreferences, 'strict');
  }
  
  if (sanitized.allergies) {
    sanitized.allergies = sanitizeArray(sanitized.allergies, 'strict');
  }
  
  if (sanitized.cuisinePreferences) {
    sanitized.cuisinePreferences = sanitizeArray(sanitized.cuisinePreferences, 'strict');
  }
  
  if (sanitized.kitchenEquipment) {
    sanitized.kitchenEquipment = sanitizeArray(sanitized.kitchenEquipment, 'strict');
  }
  
  return sanitized;
}

/**
 * React component helper: Sanitize HTML for dangerouslySetInnerHTML
 * 
 * @param html - HTML string to sanitize
 * @param mode - Sanitization mode
 * @returns Object ready for dangerouslySetInnerHTML prop
 * 
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={createSafeHTML(content, 'rich')} />
 * ```
 */
export function createSafeHTML(
  html: string | null | undefined,
  mode: 'basic' | 'rich' = 'basic'
): { __html: string } {
  const sanitizeFunc = mode === 'basic' ? sanitizeBasicHTML : sanitizeRichHTML;
  return { __html: sanitizeFunc(html || '') };
}

/**
 * Configure DOMPurify hooks for additional security
 * Call this once at app initialization
 */
export function initializeSanitization(): void {
  // Add hook to ensure all URLs are safe
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Ensure all links open in new tab and have noopener
    if ('target' in node) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Remove any data: or javascript: URLs
    if (node.hasAttribute('href')) {
      const href = node.getAttribute('href') || '';
      if (href.startsWith('javascript:') || href.startsWith('data:')) {
        node.removeAttribute('href');
      }
    }
    
    if (node.hasAttribute('src')) {
      const src = node.getAttribute('src') || '';
      if (src.startsWith('javascript:') || src.startsWith('data:')) {
        node.removeAttribute('src');
      }
    }
  });
}

export default {
  sanitizeText,
  sanitizeBasicHTML,
  sanitizeRichHTML,
  sanitizeArray,
  sanitizeRecipe,
  sanitizeInventoryItem,
  sanitizeUserProfile,
  createSafeHTML,
  initializeSanitization,
};
