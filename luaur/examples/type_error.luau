--!strict
-- type_error.luau
-- This file is DELIBERATELY wrong: it demonstrates the type checker catching
-- a mistake. The syntax is valid (it parses), but the types do not line up.

-- A function that expects a number and returns a number.
local function double(n: number): number
	return n * 2
end

-- ERROR: `count` is declared as a number but assigned a string literal.
-- The type checker should report a type mismatch here
-- (string is not a subtype of number).
local count: number = "not a number"

-- ERROR: `double` expects a number argument, but we pass a string.
-- The type checker should report an argument-type mismatch here.
print(double("ten"))

print(count)
