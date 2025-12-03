# Property-Based Tests

This directory contains property-based tests using fast-check library.

## Running Property Tests

```bash
# Install dependencies first
npm install

# Run all property tests
npm test -- tests/property

# Run specific property test file
npm test -- tests/property/validation.property.test.ts
```

## Test Coverage

### validation.property.test.ts

**Property 11: File type validation is correct** (Validates: Requirements 4.1)
- Tests that validation accepts only allowed formats (jpg, png, mp3, wav, mp4)
- Tests that validation rejects all other file types
- Runs 100 iterations with random file types and extensions

**Property 12: Storage capacity is enforced** (Validates: Requirements 4.2)
- Tests that uploads are accepted only when within remaining capacity
- Tests that uploads are rejected when exceeding capacity
- Tests correct calculation of total file sizes
- Tests video file size limits (5 MB)
- Tests non-video file size limits (20 MB)
- Runs 100 iterations with random file sizes and storage states

## Property-Based Testing Approach

Each property test:
1. Generates random inputs using fast-check arbitraries
2. Runs the validation function with those inputs
3. Asserts that the expected property holds
4. Repeats for minimum 100 iterations

This approach provides much broader test coverage than example-based unit tests by exploring the input space systematically.
