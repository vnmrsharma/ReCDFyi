#!/bin/bash

# Security verification script for ReCd(fyi)
# Run this before pushing to GitHub to ensure no credentials are exposed

echo "🔒 ReCd(fyi) Security Verification"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify .env.local is not tracked
echo "📋 Check 1: Verifying .env.local is not tracked..."
if git ls-files 2>/dev/null | grep -q ".env.local"; then
    echo -e "${RED}❌ FAIL: .env.local is tracked by git!${NC}"
    echo "   Run: git rm --cached .env.local"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: .env.local is not tracked${NC}"
fi
echo ""

# Check 2: Scan for Firebase API keys
echo "📋 Check 2: Scanning for Firebase API keys..."
if grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md" | grep -v "PRE_PUSH_CHECKLIST.md" | grep -q .; then
    echo -e "${RED}❌ FAIL: Firebase API key found in tracked files!${NC}"
    grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md" | grep -v "PRE_PUSH_CHECKLIST.md"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No Firebase API keys found${NC}"
fi
echo ""

# Check 3: Scan for EmailJS credentials
echo "📋 Check 3: Scanning for EmailJS credentials..."
if grep -r "service_6qd1h4g\|template_2tfjvhg\|kbKrqC16KLjXJxUcH" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md" | grep -q .; then
    echo -e "${RED}❌ FAIL: EmailJS credentials found in tracked files!${NC}"
    grep -r "service_6qd1h4g\|template_2tfjvhg\|kbKrqC16KLjXJxUcH" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No EmailJS credentials found${NC}"
fi
echo ""

# Check 4: Scan for Firebase project ID
echo "📋 Check 4: Scanning for Firebase project ID..."
if grep -r "kiroween-7d6bb" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md" | grep -q .; then
    echo -e "${RED}❌ FAIL: Firebase project ID found in tracked files!${NC}"
    grep -r "kiroween-7d6bb" . --exclude-dir=node_modules --exclude-dir=.git --exclude=.env.local --exclude=verify-no-secrets.sh 2>/dev/null | grep -v "SECURITY_AUDIT_REPORT.md"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: No Firebase project ID found${NC}"
fi
echo ""

# Check 5: Verify .gitignore exists and contains *.local
echo "📋 Check 5: Verifying .gitignore configuration..."
if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ FAIL: .gitignore file not found!${NC}"
    ERRORS=$((ERRORS + 1))
elif ! grep -q "*.local" .gitignore; then
    echo -e "${RED}❌ FAIL: .gitignore doesn't contain *.local pattern!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ PASS: .gitignore properly configured${NC}"
fi
echo ""

# Check 6: Verify .env.example exists
echo "📋 Check 6: Verifying .env.example exists..."
if [ ! -f .env.example ]; then
    echo -e "${YELLOW}⚠️  WARNING: .env.example file not found${NC}"
    echo "   Consider creating one for other developers"
else
    echo -e "${GREEN}✅ PASS: .env.example exists${NC}"
fi
echo ""

# Check 7: Scan for common secret patterns
echo "📋 Check 7: Scanning for common secret patterns..."
if grep -r "password.*=.*['\"][^'\"]*['\"]" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "useState\|setPassword\|password:" | grep -q .; then
    echo -e "${YELLOW}⚠️  WARNING: Potential hardcoded password found${NC}"
    grep -r "password.*=.*['\"][^'\"]*['\"]" src/ --exclude-dir=node_modules 2>/dev/null | grep -v "useState\|setPassword\|password:"
else
    echo -e "${GREEN}✅ PASS: No hardcoded passwords found${NC}"
fi
echo ""

# Summary
echo "=================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your codebase is safe to push to GitHub."
    echo ""
    echo "Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m \"Initial commit: ReCd(fyi) v1.0.0\""
    echo "  3. git push -u origin main"
    exit 0
else
    echo -e "${RED}❌ $ERRORS CHECK(S) FAILED!${NC}"
    echo ""
    echo "Please fix the issues above before pushing to GitHub."
    echo "DO NOT push until all checks pass."
    exit 1
fi
