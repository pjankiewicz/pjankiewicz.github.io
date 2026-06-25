-- hello.luau
-- The classic first program: print a greeting, then show a few basics.

-- `print` accepts multiple arguments, separated by tabs in the output.
print("Hello, world!")

-- Numbers are double-precision; arithmetic works as expected.
local a = 7
local b = 5
print("sum:", a + b)          -- 12
print("product:", a * b)      -- 35
print("power:", a ^ 2)        -- 49 (^ is exponentiation)
print("remainder:", a % b)    -- 2  (% is modulo)

-- Strings are joined with the `..` concatenation operator.
local name = "Luau"
print("Welcome to " .. name .. "!")

-- Numbers are coerced to strings inside concatenation.
print("a + b = " .. (a + b))

-- `print` with several values of mixed types on one line.
print("mixed:", 42, true, "text", nil)
