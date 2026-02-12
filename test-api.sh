#!/bin/bash

# API Test Script für RateLimit API
# Testet alle wichtigen Endpoints

# Konfiguration
API_URL="${1:-http://localhost:8787}"
EMAIL="test@example.com"
PASSWORD="test123456"
NAME="Test User"

echo "🧪 RateLimit API Test Suite"
echo "============================"
echo "API URL: $API_URL"
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function für Tests
run_test() {
    local test_name=$1
    local endpoint=$2
    local method=$3
    local data=$4
    local headers=$5
    
    echo -n "Testing: $test_name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" $headers "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" $headers -d "$data" "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "$body"
    fi
    echo ""
}

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /" "/" "GET"

# Test 2: Registrierung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. User Registration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REGISTER_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}"
register_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$REGISTER_DATA" "$API_URL/auth/register")
echo "$register_response" | jq '.'

# Token extrahieren
TOKEN=$(echo "$register_response" | jq -r '.token')
echo "Token: $TOKEN"
echo ""

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Registration failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. User Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
run_test "POST /auth/login" "/auth/login" "POST" "$LOGIN_DATA"

# Test 4: Get Profile (benötigt Token)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Get User Profile"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /auth/profile" "/auth/profile" "GET" "" "-H \"Authorization: Bearer $TOKEN\""

# Test 5: API Key erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Create API Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
API_KEY_DATA="{\"keyName\":\"Test API Key\"}"
api_key_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$API_KEY_DATA" "$API_URL/api/keys")
echo "$api_key_response" | jq '.'

# API Key extrahieren
API_KEY=$(echo "$api_key_response" | jq -r '.apiKey.apiKey')
API_KEY_ID=$(echo "$api_key_response" | jq -r '.apiKey.id')
echo "API Key: $API_KEY"
echo "API Key ID: $API_KEY_ID"
echo ""

if [ "$API_KEY" != "null" ] && [ -n "$API_KEY" ]; then
    echo -e "${GREEN}✓ API Key creation successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ API Key creation failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: Liste API Keys
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. List API Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /api/keys" "/api/keys" "GET" "" "-H \"Authorization: Bearer $TOKEN\""

# Test 7: RateLimit Config erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Create RateLimit Config"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CONFIG_DATA="{\"apiKeyId\":$API_KEY_ID,\"name\":\"Test Config\",\"maxRequests\":10,\"windowSeconds\":60}"
config_response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "$CONFIG_DATA" "$API_URL/api/configs")
echo "$config_response" | jq '.'

CONFIG_ID=$(echo "$config_response" | jq -r '.config.id')
echo "Config ID: $CONFIG_ID"
echo ""

if [ "$CONFIG_ID" != "null" ] && [ -n "$CONFIG_ID" ]; then
    echo -e "${GREEN}✓ Config creation successful${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ Config creation failed${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 8: Filter Rule erstellen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. Create Filter Rule"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FILTER_DATA="{\"configId\":$CONFIG_ID,\"ruleType\":\"ip_blacklist\",\"ruleValue\":\"192.168.1.1\",\"action\":\"block\"}"
run_test "POST /api/filters" "/api/filters" "POST" "$FILTER_DATA" "-H \"Authorization: Bearer $TOKEN\""

# Test 9: RateLimit Check (ohne RateLimit)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. RateLimit Check (sollte erlaubt sein)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /check" "/check?endpoint=/test&method=GET" "GET" "" "-H \"X-API-Key: $API_KEY\""

# Test 10: Mehrere Requests (RateLimit testen)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "10. Multiple Requests (RateLimit Test)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Sending 12 requests (limit is 10)..."
echo ""

for i in {1..12}; do
    echo -n "Request $i: "
    response=$(curl -s -H "X-API-Key: $API_KEY" "$API_URL/check?endpoint=/test&method=GET")
    allowed=$(echo "$response" | jq -r '.allowed')
    remaining=$(echo "$response" | jq -r '.remaining')
    
    if [ "$allowed" = "true" ]; then
        echo -e "${GREEN}✓ Allowed${NC} (Remaining: $remaining)"
    else
        echo -e "${RED}✗ Blocked${NC} (Rate limit exceeded)"
    fi
    sleep 0.5
done
echo ""

# Test 11: Analytics abrufen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "11. Get Analytics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /api/analytics" "/api/analytics/$API_KEY_ID?range=24h" "GET" "" "-H \"Authorization: Bearer $TOKEN\""

# Test 12: Recent Logs abrufen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "12. Get Recent Logs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_test "GET /api/logs" "/api/logs/$API_KEY_ID?limit=5" "GET" "" "-H \"Authorization: Bearer $TOKEN\""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
