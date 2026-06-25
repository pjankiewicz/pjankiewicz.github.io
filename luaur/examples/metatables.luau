-- metatables.luau
-- Object-oriented programming in Luau is built on metatables.
-- Here we make a small Vector2 "class".

-- The class table holds the methods.
local Vector2 = {}
-- `__index = Vector2` means: when a field is missing on an instance,
-- look it up on Vector2. This is how method lookup works.
Vector2.__index = Vector2

-- Constructor. Convention is to call it `.new`.
function Vector2.new(x, y)
	local self = setmetatable({}, Vector2)
	self.x = x
	self.y = y
	return self
end

-- A method. `self` is the instance it is called on (via the `:` syntax).
function Vector2:magnitude()
	return (self.x * self.x + self.y * self.y) ^ 0.5
end

-- Operator overloading: `__add` is called for the `+` operator.
function Vector2.__add(a, b)
	return Vector2.new(a.x + b.x, a.y + b.y)
end

-- A nice string form, used by tostring / concatenation when defined.
function Vector2:toString()
	return "(" .. self.x .. ", " .. self.y .. ")"
end

-- Create two vectors and exercise the class.
local v1 = Vector2.new(3, 4)
local v2 = Vector2.new(1, 2)

print("v1:", v1:toString())
print("v2:", v2:toString())
print("v1 magnitude:", v1:magnitude())   -- 5

-- `+` dispatches to Vector2.__add.
local sum = v1 + v2
print("v1 + v2:", sum:toString())          -- (4, 6)
