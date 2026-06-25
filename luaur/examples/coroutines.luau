-- coroutines.luau
-- Coroutines are cooperative, resumable functions: they can pause with
-- `coroutine.yield` and be continued later with `coroutine.resume`.

-- A producer that yields three values, one per resume.
local function producer()
	coroutine.yield("first")
	coroutine.yield("second")
	coroutine.yield("third")
	return "done"
end

-- coroutine.create makes a coroutine in the "suspended" state.
local co = producer
local routine = coroutine.create(co)

-- Each resume runs until the next yield (or the function returns).
-- resume returns `true` plus whatever was yielded/returned.
print("resume 1:", coroutine.resume(routine))   -- true  first
print("resume 2:", coroutine.resume(routine))   -- true  second
print("resume 3:", coroutine.resume(routine))   -- true  third
print("resume 4:", coroutine.resume(routine))   -- true  done
print("status:", coroutine.status(routine))      -- dead

-- coroutine.wrap turns a coroutine into a plain function you just call.
-- Here it is a generator that yields squares: 1, 4, 9, 16, 25.
local function squaresUpTo(n)
	return coroutine.wrap(function()
		for i = 1, n do
			coroutine.yield(i * i)
		end
	end)
end

print("squares:")
local nextSquare = squaresUpTo(5)
for _ = 1, 5 do
	print(nextSquare())
end
