# Code Quality Standards

## Core Principles

### Modularity
- Each file should have a single, clear purpose
- Maximum file size: 250 lines (excluding tests)
- Extract complex logic into separate utility functions
- Reusable logic must be in shared utilities, not duplicated

### Component Design
- Components are UI-only: render, handle events, manage local UI state
- No direct Firebase SDK imports in components
- No business logic in components
- Props should be explicitly typed interfaces
- Use composition over inheritance

### Service Layer
- Services are stateless and export pure functions
- All Firebase operations go through services
- Services return typed results or throw typed errors
- Each service handles one domain (auth, CD, file, share, email)
- Services must be independently testable

### Type Safety
- TypeScript strict mode enabled
- No `any` types unless absolutely necessary (document why)
- All function parameters and returns must be typed
- Use interfaces for object shapes
- Export types from dedicated type files

### Error Handling
- All async operations must have try-catch blocks
- Errors should be typed and descriptive
- User-facing errors must be friendly and actionable
- Log errors for debugging but don't expose internals to users
- Network errors should offer retry options

### Naming Conventions
- **Components**: PascalCase (e.g., `CDCard`, `FileUploader`)
- **Services**: camelCase with Service suffix (e.g., `authService`, `emailService`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useCDs`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `CD`, `EmailLog`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_STORAGE_BYTES`, `ALLOWED_FILE_TYPES`)
- **Functions**: camelCase, verb-first (e.g., `validateEmail`, `generateToken`)
- **Files**: Match primary export name

## Documentation

### When to Document
- All public service functions must have JSDoc comments
- Complex algorithms or business logic need explanatory comments
- Non-obvious code patterns should be explained
- Type definitions for complex structures

### JSDoc Format
```typescript
/**
 * Uploads a file to Firebase Storage and creates metadata in Firestore
 * @param cdId - The CD to upload to
 * @param userId - The user performing the upload
 * @param file - The file to upload
 * @param onProgress - Callback for upload progress updates
 * @returns Promise resolving to the created MediaFile metadata
 * @throws {Error} If file validation fails or upload errors occur
 */
export async function uploadFile(
  cdId: string,
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<MediaFile> {
  // Implementation
}
```

## Testing Requirements

### Coverage
- All services must have unit tests
- Critical flows must have integration tests
- Property-based tests for validation and business logic
- Minimum 80% coverage for services

### Test Organization
- Test files mirror source structure
- Property tests reference design document properties
- Use descriptive test names: `should reject invalid file types`
- Mock Firebase in unit tests, use emulator for integration

## Code Review Checklist

Before committing code, verify:
- [ ] No business logic in components
- [ ] All async operations have error handling
- [ ] Types are explicit (no `any`)
- [ ] Functions are small and focused (< 50 lines)
- [ ] No code duplication
- [ ] Complex logic has comments
- [ ] Tests pass and cover new code
- [ ] No console.logs in production code
- [ ] Environment variables used for config (no hardcoded values)

## Anti-Patterns to Avoid

### Don't
- ❌ Put Firebase SDK calls in components
- ❌ Use `any` type without documentation
- ❌ Duplicate validation logic across files
- ❌ Silent error handling (empty catch blocks)
- ❌ Large monolithic components (> 250 lines)
- ❌ Mixing concerns (e.g., UI + business logic)
- ❌ Hardcode configuration values

### Do
- ✅ Use service layer for all data operations
- ✅ Explicit types everywhere
- ✅ Centralize validation in ValidationService
- ✅ Log and handle all errors appropriately
- ✅ Break down large components into smaller ones
- ✅ Separate UI from business logic
- ✅ Use environment variables for configuration
