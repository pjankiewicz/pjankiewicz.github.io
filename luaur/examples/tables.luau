-- tables.luau
-- Tables are Luau's single data structure: they act as arrays AND dictionaries.

-- An array-like table: consecutive integer keys starting at 1.
local fruits = { "apple", "banana", "cherry" }

-- `#t` gives the length (number of array entries).
print("number of fruits:", #fruits)

-- `ipairs` walks array entries in order (1, 2, 3, ...).
print("fruits in order:")
for index, fruit in ipairs(fruits) do
	print(index, fruit)
end

-- `table.insert` appends to the end of the array part.
table.insert(fruits, "date")
print("after insert, length:", #fruits)

-- A dictionary-like table: arbitrary string keys mapping to values.
local ages = {
	alice = 30,
	bob = 25,
	carol = 41,
}

-- `pairs` walks every key/value pair (order is not guaranteed for dictionaries).
print("ages:")
for name, age in pairs(ages) do
	print(name, age)
end

-- Tables can mix and nest freely.
local person = {
	name = "Dave",
	hobbies = { "chess", "cycling" },
}
print(person.name .. " enjoys " .. person.hobbies[1] .. " and " .. person.hobbies[2])
