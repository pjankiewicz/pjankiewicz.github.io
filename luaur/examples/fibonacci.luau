-- fibonacci.luau
-- Two ways to compute Fibonacci numbers: recursion and iteration.

-- Recursive definition: fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2).
-- Simple and direct, but recomputes the same values many times.
local function fibRecursive(n)
	if n < 2 then
		return n
	end
	return fibRecursive(n - 1) + fibRecursive(n - 2)
end

-- Iterative definition: keep the last two values and step forward.
-- Runs in linear time with no repeated work.
local function fibIterative(n)
	local prev, curr = 0, 1
	for _ = 1, n do
		prev, curr = curr, prev + curr
	end
	return prev
end

-- Print the first 10 Fibonacci numbers from each implementation.
print("Recursive:")
for i = 0, 9 do
	print(i, fibRecursive(i))
end

print("Iterative:")
for i = 0, 9 do
	print(i, fibIterative(i))
end
