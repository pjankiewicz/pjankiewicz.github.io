-- strings.luau
-- A tour of the string library.

local s = "Hello, Luau"

-- `#s` is the byte length of a string.
print("length:", #s)

-- string.upper / string.lower change case.
print("upper:", string.upper(s))
print("lower:", string.lower(s))

-- string.sub extracts a substring (1-based, inclusive indices).
print("sub(1, 5):", string.sub(s, 1, 5))   -- "Hello"
print("sub(8):", string.sub(s, 8))          -- "Luau"

-- string.rep repeats a string n times.
print("rep:", string.rep("ab", 3))          -- "ababab"

-- string.format works like C printf: %s, %d, %.2f, etc.
print(string.format("name=%s pi=%.2f count=%d", "Luau", 3.14159, 42))

-- string.find returns the start and end indices of a match (or nil).
local start, finish = string.find(s, "Luau")
print("found 'Luau' at:", start, finish)    -- 8  11

-- gsub does a global substitution and returns the result plus a count.
-- Method syntax (s:gsub) is shorthand for string.gsub(s, ...).
local replaced, count = s:gsub("l", "L")
print("gsub result:", replaced)
print("gsub count:", count)
