--!strict
-- typed.luau
-- Luau is gradually typed. With `--!strict` at the top, the type checker
-- verifies annotations. This file is correct and type-checks cleanly.

-- A type alias names a shape so it can be reused.
type Point = { x: number, y: number }

-- Locals can carry explicit type annotations.
local greeting: string = "Typed Luau"
local count: number = 3

-- A function with typed parameters and a typed return value.
local function distance(a: Point, b: Point): number
	local dx: number = a.x - b.x
	local dy: number = a.y - b.y
	return (dx * dx + dy * dy) ^ 0.5
end

-- Typed table values that conform to the Point alias.
local origin: Point = { x = 0, y = 0 }
local target: Point = { x = 3, y = 4 }

print(greeting)
print("count:", count)
print("distance:", distance(origin, target))   -- 5

-- An array typed as a list of numbers.
local scores: { number } = { 10, 20, 30 }
local total: number = 0
for _, score in ipairs(scores) do
	total += score
end
print("total score:", total)   -- 60
